-- =====================================================================
-- TÌMĐỒ.VN - PHẦN 6: KHÓA BẢNG missing_persons (vector khuôn mặt không ai đọc trực tiếp được)
--
-- !!! CHỈ CHẠY SAU KHI:
--     (1) đã chạy file 05, và
--     (2) đã push code mới và Vercel đã cập nhật xong (website dùng missing_public + post_missing).
--     Nếu chạy trước, website cũ sẽ không đọc/ghi được danh sách người mất tích.
--
-- Sau khi chạy: người ngoài chỉ đọc qua view missing_public (không có vector) và chỉ đăng qua
-- post_missing. Admin (đã đăng nhập, có trong bảng admins) vẫn xem/sửa/xóa được mọi thứ.
-- Nếu có sự cố: chạy file 99_hoan_tac_phan_6.sql.
-- =====================================================================

alter table public.missing_persons enable row level security;

drop policy if exists mp_public_select on public.missing_persons;
drop policy if exists mp_public_insert on public.missing_persons;

revoke all on public.missing_persons from anon;
grant select, insert, update, delete on public.missing_persons to authenticated;  -- RLS giới hạn: chỉ admin

drop policy if exists mp_admin_all on public.missing_persons;
create policy mp_admin_all on public.missing_persons
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

select 'Phần 6 chạy xong' as ket_qua;
