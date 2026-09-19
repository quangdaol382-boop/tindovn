-- =====================================================================
-- TÌMĐỒ.VN - CẤP QUYỀN ADMIN CHO MỘT TÀI KHOẢN
--
-- Làm theo thứ tự:
--   1. Supabase > Authentication > Users > "Add user" > "Create new user"
--      Nhập email + mật khẩu mạnh của bạn, TICK "Auto Confirm User", bấm Create.
--   2. Sửa dòng email bên dưới thành đúng email vừa tạo, rồi bấm Run.
--   3. Kết quả phải hiện 1 dòng. Nếu 0 dòng = email chưa đúng.
--
-- Muốn thêm người kiểm duyệt khác: tạo user cho họ rồi chạy lại với email của họ.
-- Muốn gỡ quyền:  delete from public.admins where user_id = (select id from auth.users where email = '...');
-- =====================================================================

insert into public.admins (user_id)
select id from auth.users
where email = 'THAY-EMAIL-ADMIN-VAO-DAY@gmail.com'
on conflict do nothing
returning user_id;
