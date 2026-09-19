-- =====================================================================
-- TÌMĐỒ.VN - PHẦN A: THÊM MỚI  (an toàn - KHÔNG làm hỏng website đang chạy)
-- Chạy trong Supabase > SQL Editor > New query > dán toàn bộ > Run.
-- Có thể chạy lại nhiều lần mà không lỗi.
--
-- Phần A tạo:
--   1. Cột status (open/resolved) cho bảng items
--   2. Hàm chuẩn hóa dữ liệu (số giấy tờ, họ tên, biển số xe, loại giấy tờ)
--   3. Bảng matches  (ghi lại các cặp tin trùng khớp -> dùng cho SMS ESMS sau này)
--   4. Hàm post_item (lưu tin + dò tin trùng khớp ngay lúc đăng)
--   5. View items_public (danh sách công khai, đã che sẵn thông tin giấy tờ)
--   6. Bảng admins + hàm is_admin() (phân quyền quản trị)
-- =====================================================================

create extension if not exists pg_trgm;   -- so sánh tiêu đề gần giống nhau


-- ---------------------------------------------------------------------
-- 1. Cột trạng thái cho tin đồ vật
--    open     = đang chờ tìm chủ
--    resolved = đã trả xong (admin đánh dấu) -> không hiện công khai, không bị tự xóa
-- ---------------------------------------------------------------------
alter table public.items add column if not exists created_at  timestamptz not null default now();
alter table public.items add column if not exists status      text        not null default 'open';
alter table public.items add column if not exists resolved_at timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'items_status_check') then
    alter table public.items
      add constraint items_status_check check (status in ('open', 'resolved'));
  end if;
end $$;

create index if not exists items_status_created_idx on public.items (status, created_at);


-- ---------------------------------------------------------------------
-- 2. Hàm chuẩn hóa
-- ---------------------------------------------------------------------

-- "079 091-031.561" -> "079091031561"
create or replace function public.normalize_doc_number(t text)
returns text language sql immutable as $$
  select nullif(upper(regexp_replace(coalesce(t, ''), '[^0-9A-Za-z]', '', 'g')), '')
$$;

-- "  Dương  Đức Trí " -> "dương đức trí"
create or replace function public.normalize_name(t text)
returns text language sql immutable as $$
  select nullif(lower(regexp_replace(btrim(coalesce(t, '')), '\s+', ' ', 'g')), '')
$$;

-- "CCCD", "Căn cước công dân", "GPLX" -> đúng danh mục của website
create or replace function public.normalize_category(t text)
returns text language sql immutable as $$
  select case
    when btrim(coalesce(t, '')) = ''                                             then ''
    when lower(t) ~ 'cccd|cmnd|cmt|căn cước|chứng minh'                          then 'CMND/CCCD'
    when lower(t) ~ 'bằng lái|gplx|giấy phép lái'                                then 'Bằng lái xe'
    when lower(t) ~ 'hộ chiếu|passport'                                          then 'Hộ chiếu'
    else btrim(t)
  end
$$;

-- Tin có thông tin giấy tờ nhạy cảm? (loại giấy tờ HOẶC có số giấy tờ)
create or replace function public.is_sensitive_item(cat text, num text)
returns boolean language sql immutable as $$
  select public.normalize_category(cat) in ('CMND/CCCD', 'Bằng lái xe', 'Hộ chiếu')
         or btrim(coalesce(num, '')) <> ''
$$;

-- Tìm biển số xe máy/ô tô trong đoạn văn: "59-A1 123.45", "51F-123.45", "59A1-1234"
-- Trả về dạng chuẩn hóa: "59A112345". Không thấy thì trả về NULL.
create or replace function public.extract_plate(t text)
returns text language sql immutable as $$
  select nullif(
    regexp_replace(
      (regexp_match(
        upper(coalesce(t, '')),
        '(?<![0-9A-Z])[0-9]{2}[- ]?[A-Z][0-9A-Z]?[- ]?(?:[0-9]{3}[. ]?[0-9]{2}|[0-9]{4,5})(?![0-9A-Z])'
      ))[1],
      '[^0-9A-Z]', '', 'g'),
    '')
$$;


-- ---------------------------------------------------------------------
-- 3. Bảng matches: mỗi dòng = 1 cặp tin (mới đăng <-> tin đã có) trùng khớp
--    (tự đọc kiểu dữ liệu của items.id nên chạy được dù id là bigint hay uuid)
-- ---------------------------------------------------------------------
do $$
declare
  id_type text;
begin
  select format_type(a.atttypid, a.atttypmod) into id_type
  from pg_attribute a
  where a.attrelid = 'public.items'::regclass and a.attname = 'id' and not a.attisdropped;

  if id_type is null then
    raise exception 'Bảng public.items không có cột id';
  end if;

  execute format($f$
    create table if not exists public.matches (
      id           bigint generated always as identity primary key,
      new_item_id  %1$s not null references public.items(id) on delete cascade,
      old_item_id  %1$s not null references public.items(id) on delete cascade,
      reason       text        not null,
      score        int         not null,
      created_at   timestamptz not null default now(),
      notified_at  timestamptz,               -- bước ESMS sau này: đã gửi SMS lúc nào
      unique (new_item_id, old_item_id)
    )$f$, id_type);
end $$;

alter table public.matches enable row level security;   -- không policy = người ngoài không đọc được


-- ---------------------------------------------------------------------
-- 4. post_item: lưu tin + dò tin trùng khớp NGAY KHI ĐĂNG
--    Website gọi:  supabase.rpc('post_item', { p: {...} })
--    Trả về: { "id": ..., "matches": [ {id,type,category,location,date,contact,reason,score,title}, ... ] }
--
--    Quy tắc dò (chỉ so với tin ĐỐI ỨNG: mất <-> nhặt, còn status='open'):
--      100  Trùng số giấy tờ (CCCD/GPLX/hộ chiếu, bỏ khoảng trắng và dấu gạch)
--       90  Trùng biển số xe trong tiêu đề/ghi chú
--       70  Trùng họ tên + cùng loại giấy tờ
--       50  Tiêu đề gần giống (pg_trgm >= 0.45) + cùng loại đồ vật (không áp dụng cho giấy tờ)
-- ---------------------------------------------------------------------
create or replace function public.post_item(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  r        public.items%rowtype;
  m        record;
  arr      jsonb := '[]'::jsonb;
  v_type   text  := p->>'type';
  v_cat    text  := public.normalize_category(p->>'category');
  v_num    text  := public.normalize_doc_number(p->>'so_giay_to');
  v_name   text  := public.normalize_name(p->>'ho_ten');
  v_plate  text;
  v_sens   boolean;
begin
  -- kiểm tra dữ liệu đầu vào
  if v_type is null or v_type not in ('lost', 'found') then
    raise exception 'Loại tin không hợp lệ' using errcode = '22023';
  end if;
  if btrim(coalesce(p->>'title', ''))    = ''
     or btrim(coalesce(p->>'location', '')) = ''
     or btrim(coalesce(p->>'contact', ''))  = '' then
    raise exception 'Thiếu thông tin bắt buộc' using errcode = '22023';
  end if;
  if length(regexp_replace(p->>'contact', '\D', '', 'g')) < 8 then
    raise exception 'Số điện thoại không hợp lệ' using errcode = '22023';
  end if;

  insert into public.items
    (type, category, title, ho_ten, so_giay_to, ngay_sinh, location, contact, reward, note, img, "date")
  values (
    v_type,
    left(v_cat, 50),
    left(btrim(p->>'title'), 200),
    left(coalesce(p->>'ho_ten', ''), 100),
    left(coalesce(p->>'so_giay_to', ''), 30),
    left(coalesce(p->>'ngay_sinh', ''), 20),
    left(btrim(p->>'location'), 200),
    left(btrim(p->>'contact'), 30),
    left(coalesce(p->>'reward', ''), 50),
    left(coalesce(p->>'note', ''), 1000),
    left(coalesce(p->>'img', ''), 20),
    left(coalesce(p->>'date', ''), 20)
  )
  returning * into r;

  v_sens  := public.is_sensitive_item(r.category, r.so_giay_to);
  v_plate := public.extract_plate(r.title || ' ' || coalesce(r.note, ''));

  for m in
    select o.id, o.type, o.category, o.title, o.location, o."date" as d, o.contact,
           o.so_giay_to, x.reason, x.score
    from public.items o
    cross join lateral (
      select v.reason, v.score
      from (values
        (v_num is not null
           and public.normalize_doc_number(o.so_giay_to) = v_num,
         'Trùng số giấy tờ', 100),
        (v_plate is not null
           and public.extract_plate(o.title || ' ' || coalesce(o.note, '')) = v_plate,
         'Trùng biển số xe', 90),
        (v_name is not null and v_sens
           and public.normalize_name(o.ho_ten) = v_name
           and public.normalize_category(o.category) = public.normalize_category(r.category),
         'Trùng họ tên trên giấy tờ', 70),
        (not v_sens
           and not public.is_sensitive_item(o.category, o.so_giay_to)
           and public.normalize_category(o.category) = public.normalize_category(r.category)
           and similarity(o.title, r.title) >= 0.45,
         'Tiêu đề tương tự', 50)
      ) as v(ok, reason, score)
      where v.ok
      order by v.score desc
      limit 1
    ) x
    where o.id <> r.id
      and o.type <> r.type
      and o.status = 'open'
    order by x.score desc, o.created_at desc
    limit 10
  loop
    insert into public.matches (new_item_id, old_item_id, reason, score)
    values (r.id, m.id, m.reason, m.score)
    on conflict do nothing;

    arr := arr || jsonb_build_object(
      'id',       m.id,
      'type',     m.type,
      'category', public.normalize_category(m.category),
      'location', m.location,
      'date',     m.d,
      'contact',  m.contact,
      'reason',   m.reason,
      'score',    m.score,
      -- tin giấy tờ: không trả tiêu đề (có thể chứa họ tên)
      'title',    case when public.is_sensitive_item(m.category, m.so_giay_to) then null else m.title end
    );
  end loop;

  return jsonb_build_object('id', r.id, 'matches', arr);
end $$;

grant execute on function public.post_item(jsonb) to anon, authenticated;


-- ---------------------------------------------------------------------
-- 5. View items_public: danh sách công khai, THÔNG TIN GIẤY TỜ ĐÃ CHE SẴN TRONG DATABASE
--    Website đọc view này thay vì đọc thẳng bảng items.
--    Chỉ hiện tin status = 'open'.
--    (Supabase có thể cảnh báo "Security Definer View" - đây là chủ ý.)
-- ---------------------------------------------------------------------
drop view if exists public.items_public;
create view public.items_public as
select
  i.id,
  i.created_at,
  i.type,
  public.normalize_category(i.category) as category,
  case when s.sens
       then coalesce(nullif(public.normalize_category(i.category), ''), 'Giấy tờ')
            || ' — ' || case when i.type = 'found' then 'Đã nhặt được' else 'Đang tìm' end
       else i.title end                                          as title,
  case when s.sens then case when btrim(coalesce(i.ho_ten, '')) = '' then '' else '***' end
       else i.ho_ten end                                         as ho_ten,
  case when s.sens then
         case when btrim(coalesce(i.so_giay_to, '')) = '' then ''
              else left(btrim(i.so_giay_to), 3)
                   || repeat('*', greatest(length(btrim(i.so_giay_to)) - 3, 0)) end
       else i.so_giay_to end                                     as so_giay_to,
  case when s.sens then
         case when coalesce(i.ngay_sinh, '') = '' then ''
              when i.ngay_sinh ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$'
                then '**/' || split_part(i.ngay_sinh, '/', 2) || '/' || split_part(i.ngay_sinh, '/', 3)
              else '**/**/****' end
       else i.ngay_sinh end                                      as ngay_sinh,
  i.location,
  i.contact,
  i.reward,
  case when s.sens then '' else i.note end                       as note,
  i.img,
  i."date"                                                       as "date",
  i.status
from public.items i
cross join lateral (select public.is_sensitive_item(i.category, i.so_giay_to) as sens) s
where i.status = 'open';

grant select on public.items_public to anon, authenticated;


-- ---------------------------------------------------------------------
-- 6. Quản trị viên
--    Tài khoản đăng nhập do Supabase Auth quản lý (mật khẩu được mã hóa, KHÔNG lưu trong bảng của bạn).
--    Bảng admins chỉ ghi "tài khoản nào là admin".
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;    -- không policy: chỉ hàm is_admin() đọc được

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- HẾT PHẦN A
select 'Phần A chạy xong' as ket_qua;
