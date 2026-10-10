-- =====================================================================
-- TÌMĐỒ.VN - PHẦN 9: KHÓA ĐƯỜNG GỌI THẲNG, THÊM CAPTCHA (Cloudflare Turnstile)
--
-- QUAN TRỌNG: chỉ chạy file này SAU KHI code mới (api/post-item.js,
-- api/post-missing.js, api/search-face.js và src/App.jsx bản mới) đã được
-- deploy lên Vercel VÀ đã thử đăng tin/tìm khuôn mặt thành công trên site
-- thật. Nếu chạy file này trước, người dùng sẽ tạm thời KHÔNG đăng tin
-- được cho tới khi code mới lên xong.
--
-- Việc file này làm:
--   1. Khóa 3 hàm post_item / post_missing / search_face — từ nay CHỈ
--      máy chủ (Vercel) gọi được, trình duyệt không gọi thẳng được nữa.
--      => Bắt buộc phải qua bước xác minh CAPTCHA ở máy chủ trước.
--   2. Sửa cách đọc địa chỉ IP: vì request giờ luôn đi qua máy chủ Vercel
--      trước, nên ưu tiên đọc "x-real-ip" (do chính máy chủ mình gắn vào,
--      là IP thật của người dùng) thay vì "cf-connecting-ip" (giờ sẽ là
--      IP của máy chủ Vercel, không còn đúng nữa).
--
-- Muốn hoàn tác (mở lại đường gọi thẳng): xem cuối file.
-- =====================================================================

revoke execute on function public.post_item(jsonb)               from anon, authenticated;
revoke execute on function public.post_missing(jsonb)             from anon, authenticated;
revoke execute on function public.search_face(jsonb, text, text)  from anon, authenticated;

-- QUAN TRỌNG: Postgres tự động cấp EXECUTE cho PUBLIC (= mọi vai trò, kể cả
-- anon/authenticated) khi tạo hàm, nên chỉ revoke từ anon/authenticated thôi
-- là CHƯA ĐỦ — phải revoke từ PUBLIC nữa thì mới thực sự khoá được.
revoke execute on function public.post_item(jsonb)               from PUBLIC;
revoke execute on function public.post_missing(jsonb)             from PUBLIC;
revoke execute on function public.search_face(jsonb, text, text)  from PUBLIC;

-- Cấp lại riêng cho service_role (máy chủ Vercel dùng Service Role Key gọi
-- hàm) để không bị khoá nhầm luôn cả đường gọi hợp lệ từ server.
grant execute on function public.post_item(jsonb)               to service_role;
grant execute on function public.post_missing(jsonb)             to service_role;
grant execute on function public.search_face(jsonb, text, text)  to service_role;

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
    nullif(btrim(h->>'x-real-ip'), ''),
    nullif(btrim(h->>'cf-connecting-ip'), ''),
    nullif(btrim(split_part(coalesce(h->>'x-forwarded-for', ''), ',', 1)), '')
  );
  if v is null or length(v) > 64 or v !~ '^[0-9a-fA-F:.]+$' then return null; end if;
  return v;
end $$;

select 'Phần 9 (khóa CAPTCHA) chạy xong' as ket_qua;

-- ---------------------------------------------------------------------
-- KIỂM TRA SAU KHI CHẠY:
--   Đăng thử 1 tin trên site thật, rồi chạy:
--     select created_at, action, ip, phone from public.rate_events order by id desc limit 5;
--   Cột ip phải là IP THẬT của bạn (tra "what is my ip" trên Google để so sánh),
--   không phải một địa chỉ IP lạ lặp lại cho mọi người.
--
-- HOÀN TÁC (nếu cần mở lại đường gọi thẳng, KHÔNG khuyến khích):
--   grant execute on function public.post_item(jsonb)                 to anon, authenticated, PUBLIC;
--   grant execute on function public.post_missing(jsonb)              to anon, authenticated, PUBLIC;
--   grant execute on function public.search_face(jsonb, text, text)   to anon, authenticated, PUBLIC;
-- ---------------------------------------------------------------------
