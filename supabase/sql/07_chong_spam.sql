-- =====================================================================
-- TÌMĐỒ.VN - PHẦN 7: CHỐNG SPAM Ở DATABASE
--
-- Chạy SAU file 05 (và 06 nếu đã chạy). Có thể chạy lại nhiều lần không hỏng.
-- Website KHÔNG cần đổi code để file này hoạt động (tên hàm giữ nguyên).
--
-- Việc file này làm:
--   1. Ghi lại mỗi lần đăng tin / tìm bằng ảnh (bảng rate_events: thời gian + địa chỉ IP + số điện thoại).
--   2. Giới hạn số lần theo IP, theo số điện thoại và toàn hệ thống (xem con số ở PHẦN 5).
--   3. Chặn tin chứa đường link / quảng cáo (www, http, .com, t.me, zalo.me...).
--   4. Đổi tên 3 hàm cũ thành *_core và KHÓA không cho người ngoài gọi trực tiếp,
--      để không ai đi vòng qua bước kiểm tra. Hàm công khai cùng tên cũ sẽ kiểm tra rồi mới gọi hàm lõi.
--
-- Nếu có sự cố: chạy file 99_hoan_tac_phan_7.sql.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Bảng ghi sự kiện (chỉ admin xem được)
-- ---------------------------------------------------------------------
create table if not exists public.rate_events (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  action     text not null,      -- 'post_item' | 'post_missing' | 'search_face'
  ip         text,               -- địa chỉ IP người gọi (có thể null nếu không đọc được)
  phone      text                -- chỉ các chữ số của số điện thoại liên hệ
);
create index if not exists rate_events_ip_idx    on public.rate_events (action, ip, created_at);
create index if not exists rate_events_phone_idx on public.rate_events (phone, created_at) where phone is not null;
create index if not exists rate_events_time_idx  on public.rate_events (created_at);

alter table public.rate_events enable row level security;
revoke all on public.rate_events from anon, authenticated;
grant select on public.rate_events to authenticated;
drop policy if exists re_admin_select on public.rate_events;
create policy re_admin_select on public.rate_events
  for select to authenticated using (public.is_admin());


-- ---------------------------------------------------------------------
-- 2. Đọc địa chỉ IP của người gọi
--    Ưu tiên cf-connecting-ip (do Cloudflare đặt, người dùng không giả mạo được),
--    rồi x-real-ip, rồi phần tử đầu của x-forwarded-for. Không đọc được -> NULL.
-- ---------------------------------------------------------------------
create or replace function public.client_ip()
returns text
language plpgsql
stable
set search_path = public, pg_temp
as $$
declare
  h jsonb;
  v text;
begin
  begin
    h := nullif(current_setting('request.headers', true), '')::jsonb;
  exception when others then
    h := null;
  end;
  if h is null then return null; end if;

  v := coalesce(
    nullif(btrim(h->>'cf-connecting-ip'), ''),
    nullif(btrim(h->>'x-real-ip'), ''),
    nullif(btrim(split_part(coalesce(h->>'x-forwarded-for', ''), ',', 1)), '')
  );
  if v is null or length(v) > 64 or v !~ '^[0-9a-fA-F:.]+$' then return null; end if;
  return v;
end $$;


-- ---------------------------------------------------------------------
-- 3. Kiểm tra giới hạn tần suất (và ghi lại lần gọi này)
--    Nếu không đọc được IP thì bỏ qua giới hạn theo IP (chỉ áp giới hạn toàn hệ thống),
--    để tránh chặn nhầm tất cả mọi người dùng chung một "IP rỗng".
-- ---------------------------------------------------------------------
create or replace function public.rate_check(
  p_action      text,
  p_ip_hour     int,
  p_ip_day      int,
  p_global_hour int,
  p_phone       text default null,
  p_phone_day   int  default null
) returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_ip text := public.client_ip();
  n    int;
begin
  -- dọn dữ liệu cũ (thỉnh thoảng, không cần lịch riêng)
  if random() < 0.02 then
    delete from public.rate_events where created_at < now() - interval '3 days';
  end if;

  select count(*) into n from public.rate_events
   where action = p_action and created_at > now() - interval '1 hour';
  if n >= p_global_hour then
    raise exception 'Hệ thống đang nhận quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.'
      using errcode = 'P0001', hint = 'rate_limit_global';
  end if;

  if v_ip is not null then
    select count(*) into n from public.rate_events
     where action = p_action and ip = v_ip and created_at > now() - interval '1 hour';
    if n >= p_ip_hour then
      raise exception 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.'
        using errcode = 'P0001', hint = 'rate_limit_ip_hour';
    end if;

    select count(*) into n from public.rate_events
     where action = p_action and ip = v_ip and created_at > now() - interval '1 day';
    if n >= p_ip_day then
      raise exception 'Hôm nay bạn đã thực hiện quá nhiều lần. Vui lòng quay lại vào ngày mai.'
        using errcode = 'P0001', hint = 'rate_limit_ip_day';
    end if;
  end if;

  if p_phone is not null and p_phone_day is not null then
    select count(*) into n from public.rate_events
     where phone = p_phone and created_at > now() - interval '1 day';
    if n >= p_phone_day then
      raise exception 'Số điện thoại này đã đăng quá nhiều tin trong hôm nay. Vui lòng thử lại vào ngày mai.'
        using errcode = 'P0001', hint = 'rate_limit_phone';
    end if;
  end if;

  insert into public.rate_events (action, ip, phone) values (p_action, v_ip, p_phone);
end $$;

revoke all on function public.rate_check(text, int, int, int, text, int) from public, anon, authenticated;


-- ---------------------------------------------------------------------
-- 4. Chặn nội dung quảng cáo / đường link trong mọi ô chữ của tin đăng
-- ---------------------------------------------------------------------
create or replace function public.spam_text_check(p jsonb)
returns void
language plpgsql
stable
set search_path = public, pg_temp
as $$
declare
  t text;
begin
  if p is null or jsonb_typeof(p) <> 'object' then
    raise exception 'Dữ liệu không hợp lệ' using errcode = '22023';
  end if;
  select string_agg(value, ' ') into t
  from jsonb_each_text(p - 'face' - 'img' - 'avatar' - 'photo_path');
  if t ~* '(https?://|www\.|\m[a-z0-9-]+\.(com|net|org|info|xyz|top|club|vip|cc|biz|ru|cn|shop|site|online|link|click)\M|t\.me/|bit\.ly|zalo\.me|wa\.me)' then
    raise exception 'Nội dung không được chứa đường link hoặc quảng cáo.' using errcode = '22023';
  end if;
end $$;

revoke all on function public.spam_text_check(jsonb) from public, anon, authenticated;


-- ---------------------------------------------------------------------
-- 5. Đổi tên 3 hàm cũ thành *_core (chỉ đổi một lần) rồi tạo hàm công khai kiểm tra trước
--    CON SỐ GIỚI HẠN (muốn nới/thắt thì sửa số rồi chạy lại file này):
--      post_item    : 10 tin/giờ/IP, 30 tin/ngày/IP, 10 tin/ngày/số điện thoại, 300 tin/giờ toàn hệ thống
--      post_missing :  6 tin/giờ/IP, 15 tin/ngày/IP,  6 tin/ngày/số điện thoại, 150 tin/giờ toàn hệ thống
--      search_face  : 30 lượt/giờ/IP, 100 lượt/ngày/IP, 1500 lượt/giờ toàn hệ thống
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_proc where proname = 'post_item_core' and pronamespace = 'public'::regnamespace) then
    alter function public.post_item(jsonb) rename to post_item_core;
  end if;
  if not exists (select 1 from pg_proc where proname = 'post_missing_core' and pronamespace = 'public'::regnamespace) then
    alter function public.post_missing(jsonb) rename to post_missing_core;
  end if;
  if not exists (select 1 from pg_proc where proname = 'search_face_core' and pronamespace = 'public'::regnamespace) then
    alter function public.search_face(jsonb, text, text) rename to search_face_core;
  end if;
end $$;

-- hàm lõi: chỉ hàm công khai (cùng chủ sở hữu) gọi được, người dùng web thì không
revoke all on function public.post_item_core(jsonb)                 from public, anon, authenticated;
revoke all on function public.post_missing_core(jsonb)              from public, anon, authenticated;
revoke all on function public.search_face_core(jsonb, text, text)   from public, anon, authenticated;

create or replace function public.post_item(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_phone text;
begin
  perform public.spam_text_check(p);
  v_phone := nullif(regexp_replace(coalesce(p->>'contact', ''), '\D', '', 'g'), '');
  perform public.rate_check('post_item', 10, 30, 300, v_phone, 10);
  return public.post_item_core(p);
end $$;

create or replace function public.post_missing(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_phone text;
begin
  perform public.spam_text_check(p);
  v_phone := nullif(regexp_replace(coalesce(p->>'contact', ''), '\D', '', 'g'), '');
  perform public.rate_check('post_missing', 6, 15, 150, v_phone, 6);
  return public.post_missing_core(p);
end $$;

create or replace function public.search_face(p_face jsonb, p_type text default null, p_gender text default null)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, extensions, pg_temp
as $$
begin
  perform public.rate_check('search_face', 30, 100, 1500, null, null);
  return public.search_face_core(p_face, p_type, p_gender);
end $$;

grant execute on function public.post_item(jsonb)                  to anon, authenticated;
grant execute on function public.post_missing(jsonb)               to anon, authenticated;
grant execute on function public.search_face(jsonb, text, text)    to anon, authenticated;

select 'Phần 7 chạy xong' as ket_qua;

-- ---------------------------------------------------------------------
-- KIỂM TRA SAU KHI DÙNG THỬ (chạy riêng trong SQL Editor):
--   Xem các lần gọi gần nhất và địa chỉ IP được ghi:
--     select created_at, action, ip, phone from public.rate_events order by id desc limit 20;
--   Cột ip phải là địa chỉ IP của bạn (tra "what is my ip" trên Google để đối chiếu).
--   Nếu cột ip trống hoặc mọi người đều cùng một IP lạ -> báo lại để chỉnh cách đọc IP.
-- ---------------------------------------------------------------------
