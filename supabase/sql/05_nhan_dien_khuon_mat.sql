-- =====================================================================
-- TÌMĐỒ.VN - PHẦN 5: NHẬN DIỆN KHUÔN MẶT CHO TIN NGƯỜI THÂN / NGƯỜI LẠC
-- Chạy trong Supabase > SQL Editor > New query > dán toàn bộ > Run.
-- An toàn: chỉ THÊM MỚI, website đang chạy vẫn hoạt động. Chạy lại nhiều lần không lỗi.
--
-- Cách hoạt động:
--   - Trình duyệt của người dùng tính ra "vector khuôn mặt" (128 số) từ ảnh. Ảnh KHÔNG gửi đi
--     để nhận diện. Chỉ 128 số này được gửi lên và lưu vào cột face_embedding.
--   - Database so vector mới với vector các tin đối ứng (tôi đang tìm <-> tôi gặp người lạc)
--     rồi trả về danh sách người có khuôn mặt giống, KHÔNG phụ thuộc quần áo.
--   - Vector khuôn mặt KHÔNG bao giờ trả ra ngoài: website đọc qua view missing_public.
--
-- Phần này tạo:
--   1. Cột mới cho bảng missing_persons (vector, ảnh, trạng thái...)
--   2. Hàm so khớp khuôn mặt + hàm post_missing (lưu tin và dò khớp ngay khi đăng)
--   3. Hàm search_face (tìm bằng ảnh)
--   4. View missing_public (danh sách công khai, không có vector)
--   5. Bảng person_matches (ghi lại các cặp khớp, dùng cho SMS sau này)
--   6. Kho ảnh Storage "missing-photos"
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Cột mới. Đồng thời đảm bảo các cột cũ tồn tại và là kiểu text
--    (nếu trước đây tạo sai kiểu, việc lưu tin có thể đã lỗi âm thầm)
-- ---------------------------------------------------------------------
do $$
declare
  c text;
  cols text[] := array['type','ho_ten','tuoi','gioi_tinh','danh_tich','trang_phuc',
                       'lan_cuoi_thay','thoi_gian','contact','reward','urgency','avatar','date'];
  dt text;
begin
  foreach c in array cols loop
    execute format('alter table public.missing_persons add column if not exists %I text', c);
    select data_type into dt from information_schema.columns
      where table_schema = 'public' and table_name = 'missing_persons' and column_name = c;
    if dt is distinct from 'text' then
      execute format('alter table public.missing_persons alter column %I type text using %I::text', c, c);
    end if;
  end loop;
end $$;

alter table public.missing_persons add column if not exists created_at    timestamptz not null default now();
alter table public.missing_persons add column if not exists face_embedding float8[];
alter table public.missing_persons add column if not exists photo_path    text;
alter table public.missing_persons add column if not exists photo_public  boolean not null default false;
alter table public.missing_persons add column if not exists status        text not null default 'open';
alter table public.missing_persons add column if not exists resolved_at   timestamptz;

-- Xóa ràng buộc kiểm tra cũ trên cột "type" (nếu có) rồi đặt lại đúng 2 giá trị website dùng
do $$
declare r record;
begin
  for r in
    select conname from pg_constraint
    where conrelid = 'public.missing_persons'::regclass and contype = 'c'
      and pg_get_constraintdef(oid) ~* '\mtype\M'
  loop
    execute format('alter table public.missing_persons drop constraint %I', r.conname);
  end loop;

  -- (luôn đặt lại, vì ràng buộc cũ có thể trùng tên missing_persons_type_check nhưng cho phép giá trị khác)
  alter table public.missing_persons
    add constraint missing_persons_type_check check (type in ('missing', 'found_person'));
  if not exists (select 1 from pg_constraint where conname = 'missing_persons_status_check') then
    alter table public.missing_persons
      add constraint missing_persons_status_check check (status in ('open', 'resolved'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'missing_persons_face_len_check') then
    alter table public.missing_persons
      add constraint missing_persons_face_len_check
      check (face_embedding is null or array_length(face_embedding, 1) = 128);
  end if;
end $$;

create index if not exists missing_persons_status_type_idx on public.missing_persons (status, type);


-- ---------------------------------------------------------------------
-- 2. Hàm so khớp khuôn mặt
-- ---------------------------------------------------------------------

-- Ngưỡng khoảng cách tối đa để coi là "có thể giống" (càng nhỏ càng nghiêm).
-- Muốn chỉnh: sửa số 0.55 rồi chạy lại đúng hàm này. Gợi ý: 0.50 (ít nhầm) ... 0.60 (nhiều gợi ý hơn)
create or replace function public.face_match_threshold()
returns float8 language sql immutable as $$ select 0.55::float8 $$;

-- Khoảng cách Euclid giữa 2 vector 128 số (nhỏ = giống)
create or replace function public.face_distance(a float8[], b float8[])
returns float8 language sql immutable as $$
  select case
    when a is null or b is null then null
    when array_length(a, 1) is distinct from array_length(b, 1) then null
    else (select sqrt(sum((x - y) * (x - y))) from unnest(a, b) as t(x, y))
  end
$$;

create or replace function public.face_level(d float8)
returns text language sql immutable as $$
  select case
    when d is null then null
    when d < 0.40 then 'rat_giong'
    when d < 0.50 then 'kha_giong'
    else 'co_the'
  end
$$;

-- Đọc mảng 128 số từ JSON do trình duyệt gửi lên. Sai định dạng -> NULL.
create or replace function public.parse_face(j jsonb)
returns float8[] language plpgsql immutable as $$
declare arr float8[];
begin
  if j is null or jsonb_typeof(j) <> 'array' or jsonb_array_length(j) <> 128 then
    return null;
  end if;
  select array_agg(x::float8 order by ord) into arr
  from jsonb_array_elements_text(j) with ordinality as t(x, ord);
  if arr is null or exists (select 1 from unnest(arr) v where v is null or v <> v or abs(v) > 10) then
    return null;
  end if;
  return arr;
exception when others then
  return null;
end $$;

-- Nam khác Nữ (cả hai đều đã biết) -> loại, giảm nhầm lẫn
create or replace function public.gender_conflict(a text, b text)
returns boolean language sql immutable as $$
  select coalesce(a in ('Nam', 'Nữ') and b in ('Nam', 'Nữ') and a <> b, false)
$$;


-- ---------------------------------------------------------------------
-- 3. Bảng person_matches: mỗi dòng = 1 cặp tin khớp (mới đăng <-> đã có)
-- ---------------------------------------------------------------------
do $$
declare id_type text;
begin
  select format_type(a.atttypid, a.atttypmod) into id_type
  from pg_attribute a
  where a.attrelid = 'public.missing_persons'::regclass and a.attname = 'id' and not a.attisdropped;
  if id_type is null then
    raise exception 'Bảng public.missing_persons không có cột id';
  end if;

  execute format($f$
    create table if not exists public.person_matches (
      id           bigint generated always as identity primary key,
      new_id       %1$s not null references public.missing_persons(id) on delete cascade,
      old_id       %1$s not null references public.missing_persons(id) on delete cascade,
      reason       text        not null,
      distance     float8,
      created_at   timestamptz not null default now(),
      notified_at  timestamptz,
      unique (new_id, old_id)
    )$f$, id_type);
end $$;

alter table public.person_matches enable row level security;
revoke all on public.person_matches from anon;
grant select on public.person_matches to authenticated;
drop policy if exists person_matches_admin_select on public.person_matches;
create policy person_matches_admin_select on public.person_matches
  for select to authenticated using (public.is_admin());


-- ---------------------------------------------------------------------
-- 4. JSON trả về cho một người khớp (KHÔNG gồm vector; ảnh chỉ khi được phép công khai)
-- ---------------------------------------------------------------------
create or replace function public.person_match_json(o public.missing_persons, d float8, why text)
returns jsonb language sql stable as $$
  select jsonb_build_object(
    'id',            o.id,
    'type',          o.type,
    'ho_ten',        o.ho_ten,
    'tuoi',          o.tuoi,
    'gioi_tinh',     o.gioi_tinh,
    'lan_cuoi_thay', o.lan_cuoi_thay,
    'thoi_gian',     o.thoi_gian,
    'date',          o."date",
    'contact',       o.contact,
    'reward',        o.reward,
    'reason',        why,
    'level',         case when why = 'face' then public.face_level(d) else 'trung_ten' end,
    'distance',      case when d is null then null else round(d::numeric, 3) end,
    'photo_path',    case when o.photo_public then o.photo_path else null end
  )
$$;


-- ---------------------------------------------------------------------
-- 5. post_missing: lưu tin + dò người khớp NGAY KHI ĐĂNG
--    Website gọi: supabase.rpc('post_missing', { p: {...} })
--    Trả về: { "id": ..., "matches": [ ... tối đa 5 người ... ] }
--    Quy tắc dò (chỉ với tin ĐỐI ỨNG còn 'open': tìm người <-> gặp người lạc):
--      - Khuôn mặt giống (khoảng cách <= ngưỡng)   -> reason 'face'
--      - Trùng họ tên (và khuôn mặt không quá khác) -> reason 'ten'
--      - Bỏ qua nếu giới tính Nam/Nữ đối nghịch
-- ---------------------------------------------------------------------
create or replace function public.post_missing(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  r        public.missing_persons%rowtype;
  m        record;
  arr      jsonb := '[]'::jsonb;
  v_type   text  := p->>'type';
  v_face   float8[] := public.parse_face(p->'face');
  v_photo  text  := nullif(p->>'photo_path', '');
  v_name   text  := public.normalize_name(p->>'ho_ten');
  v_public boolean := false;
begin
  if v_type is null or v_type not in ('missing', 'found_person') then
    raise exception 'Loại tin không hợp lệ' using errcode = '22023';
  end if;
  if btrim(coalesce(p->>'ho_ten', '')) = '' or btrim(coalesce(p->>'lan_cuoi_thay', '')) = ''
     or btrim(coalesce(p->>'contact', '')) = '' then
    raise exception 'Thiếu thông tin bắt buộc' using errcode = '22023';
  end if;
  if length(regexp_replace(p->>'contact', '\D', '', 'g')) < 8 then
    raise exception 'Số điện thoại không hợp lệ' using errcode = '22023';
  end if;
  if v_photo is not null and v_photo !~ '^[0-9a-f-]{36}\.jpg$' then
    raise exception 'Đường dẫn ảnh không hợp lệ' using errcode = '22023';
  end if;
  if v_photo is not null then
    v_public := coalesce((p->>'photo_public')::boolean, false);
  end if;

  insert into public.missing_persons
    (type, ho_ten, tuoi, gioi_tinh, danh_tich, trang_phuc, lan_cuoi_thay, thoi_gian,
     contact, reward, urgency, avatar, "date", face_embedding, photo_path, photo_public)
  values (
    v_type,
    left(btrim(p->>'ho_ten'), 100),
    left(coalesce(p->>'tuoi', ''), 30),
    left(coalesce(p->>'gioi_tinh', ''), 20),
    left(coalesce(p->>'danh_tich', ''), 1000),
    left(coalesce(p->>'trang_phuc', ''), 300),
    left(btrim(p->>'lan_cuoi_thay'), 200),
    left(coalesce(p->>'thoi_gian', ''), 60),
    left(btrim(p->>'contact'), 30),
    left(coalesce(p->>'reward', ''), 50),
    case when p->>'urgency' in ('high', 'medium') then p->>'urgency' else 'medium' end,
    left(coalesce(p->>'avatar', ''), 20),
    left(coalesce(p->>'date', ''), 20),
    v_face,
    v_photo,
    v_public
  )
  returning * into r;

  for m in
    select o as orow, fd.d as dist, x.why
    from public.missing_persons o
    cross join lateral (select public.face_distance(v_face, o.face_embedding) as d) fd
    cross join lateral (
      select v.why
      from (values
        (fd.d is not null and fd.d <= public.face_match_threshold(), 'face', 1),
        (v_name is not null and v_name not like 'không rõ%'
           and public.normalize_name(o.ho_ten) = v_name
           and (fd.d is null or fd.d <= 0.7), 'ten', 2)
      ) as v(ok, why, rank)
      where v.ok
      order by v.rank
      limit 1
    ) x
    where o.id <> r.id
      and o.type <> r.type
      and o.status = 'open'
      and not public.gender_conflict(r.gioi_tinh, o.gioi_tinh)
    order by fd.d nulls last, o.created_at desc
    limit 5
  loop
    insert into public.person_matches (new_id, old_id, reason, distance)
    values (r.id, (m.orow).id, m.why, m.dist)
    on conflict do nothing;

    arr := arr || public.person_match_json(m.orow, m.dist, m.why);
  end loop;

  return jsonb_build_object('id', r.id, 'matches', arr);
end $$;

grant execute on function public.post_missing(jsonb) to anon, authenticated;


-- ---------------------------------------------------------------------
-- 6. search_face: tìm bằng ảnh (không lưu gì)
--    p_type: 'missing' (tìm trong người đang mất tích), 'found_person' (tìm trong người đã gặp),
--            NULL (cả hai)
-- ---------------------------------------------------------------------
create or replace function public.search_face(p_face jsonb, p_type text default null, p_gender text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_face float8[] := public.parse_face(p_face);
  arr    jsonb;
begin
  if v_face is null then
    raise exception 'Dữ liệu khuôn mặt không hợp lệ' using errcode = '22023';
  end if;
  if p_type is not null and p_type not in ('missing', 'found_person') then
    raise exception 'Loại tìm kiếm không hợp lệ' using errcode = '22023';
  end if;

  select coalesce(jsonb_agg(public.person_match_json(t.o, t.d, 'face') order by t.d), '[]'::jsonb)
  into arr
  from (
    select o, public.face_distance(v_face, o.face_embedding) as d
    from public.missing_persons o
    where o.status = 'open'
      and o.face_embedding is not null
      and (p_type is null or o.type = p_type)
      and not public.gender_conflict(p_gender, o.gioi_tinh)
      and public.face_distance(v_face, o.face_embedding) <= public.face_match_threshold()
    order by public.face_distance(v_face, o.face_embedding)
    limit 5
  ) t;

  return arr;
end $$;

grant execute on function public.search_face(jsonb, text, text) to anon, authenticated;


-- ---------------------------------------------------------------------
-- 7. View missing_public: danh sách công khai. KHÔNG có vector khuôn mặt.
--    Ảnh chỉ hiện khi người đăng cho phép công khai. Chỉ tin 'open'.
--    (Supabase có thể cảnh báo "Security Definer View" - đây là chủ ý.)
-- ---------------------------------------------------------------------
drop view if exists public.missing_public;
create view public.missing_public as
select
  m.id, m.created_at, m.type, m.ho_ten, m.tuoi, m.gioi_tinh, m.danh_tich, m.trang_phuc,
  m.lan_cuoi_thay, m.thoi_gian, m.contact, m.reward, m.urgency, m.avatar,
  m."date" as "date",
  m.status,
  case when m.photo_public then m.photo_path else null end as photo_path
from public.missing_persons m
where m.status = 'open';

grant select on public.missing_public to anon, authenticated;


-- ---------------------------------------------------------------------
-- 8. Kho ảnh công khai "missing-photos" (chỉ JPEG, tối đa 1MB/ảnh)
--    - Ai cũng đọc được ảnh nếu biết đường dẫn (ảnh chỉ được tải lên khi người đăng cho phép công khai)
--    - Ai cũng tải lên được (giống việc đăng tin), NHƯNG không liệt kê được toàn bộ ảnh
--    - Chỉ admin xóa được ảnh
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('missing-photos', 'missing-photos', true, 1048576, array['image/jpeg'])
on conflict (id) do update
  set public = true,
      file_size_limit = 1048576,
      allowed_mime_types = array['image/jpeg'];

drop policy if exists missing_photos_upload on storage.objects;
create policy missing_photos_upload on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'missing-photos');

-- Admin cần cả quyền xem (SELECT) thì lệnh xóa mới tìm thấy file để xóa
drop policy if exists missing_photos_admin_select on storage.objects;
create policy missing_photos_admin_select on storage.objects
  for select to authenticated
  using (bucket_id = 'missing-photos' and public.is_admin());

drop policy if exists missing_photos_admin_delete on storage.objects;
create policy missing_photos_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'missing-photos' and public.is_admin());

select 'Phần 5 (nhận diện khuôn mặt) chạy xong' as ket_qua;
