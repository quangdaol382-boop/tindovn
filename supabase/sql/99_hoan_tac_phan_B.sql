-- =====================================================================
-- HOÀN TÁC PHẦN B (chỉ dùng khi website báo lỗi sau khi chạy Phần B)
-- Trả quyền đọc/ghi trực tiếp cho người dùng như trước. Website cũ và mới đều chạy lại được.
-- Lưu ý: cách này lại để lộ dữ liệu giấy tờ đầy đủ - chỉ là giải pháp tạm.
-- =====================================================================

alter table public.items           disable row level security;
alter table public.missing_persons disable row level security;

grant select, insert on public.items to anon;
grant select, insert on public.missing_persons to anon;

select 'Đã hoàn tác Phần B' as ket_qua;
