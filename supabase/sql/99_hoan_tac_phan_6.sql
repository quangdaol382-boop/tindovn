-- =====================================================================
-- HOÀN TÁC PHẦN 6 (chỉ dùng khi website báo lỗi sau khi chạy file 06)
-- Trả quyền đọc/ghi trực tiếp bảng missing_persons cho người dùng như trước.
-- Lưu ý: cách này lại cho phép đọc cả vector khuôn mặt - chỉ là giải pháp tạm.
-- =====================================================================

grant select, insert on public.missing_persons to anon;

drop policy if exists mp_public_select on public.missing_persons;
create policy mp_public_select on public.missing_persons
  for select to anon, authenticated using (true);

drop policy if exists mp_public_insert on public.missing_persons;
create policy mp_public_insert on public.missing_persons
  for insert to anon, authenticated with check (true);

select 'Đã hoàn tác Phần 6' as ket_qua;
