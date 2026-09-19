-- =====================================================================
-- TÌMĐỒ.VN - PHẦN C: TỰ ĐỘNG XÓA TIN ĐỒ VẬT QUÁ 30 NGÀY CHƯA TÌM ĐƯỢC CHỦ
--
-- Trước khi chạy: bật extension pg_cron
--   Supabase > Database > Extensions > tìm "pg_cron" > bật (Enable).
--
-- Quy tắc:
--   - Chỉ xóa bảng items (đồ vật/giấy tờ), status = 'open' và tạo quá 30 ngày.
--   - Tin đã đánh dấu 'resolved' (đã trả) KHÔNG bị xóa.
--   - Bảng missing_persons (người mất tích) KHÔNG bị tự xóa.
--   - Các dòng trong matches liên quan tự xóa theo.
--   - Chạy mỗi ngày lúc 03:00 giờ Việt Nam (= 20:00 UTC).
--   - XÓA LÀ VĨNH VIỄN, không có thùng rác.
-- =====================================================================

-- 1) XEM TRƯỚC: bao nhiêu tin sẽ bị xóa nếu chạy ngay bây giờ? (chỉ đếm, không xóa)
select count(*) as so_tin_se_bi_xoa
from public.items
where status = 'open' and created_at < now() - interval '30 days';

-- 2) Hàm dọn dẹp
create or replace function public.cleanup_old_items()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  n integer;
begin
  delete from public.items
  where status = 'open'
    and created_at < now() - interval '30 days';
  get diagnostics n = row_count;
  return n;
end $$;

-- chỉ cron/postgres được gọi hàm này, người dùng web thì không
revoke all on function public.cleanup_old_items() from public, anon, authenticated;

-- 3) Đặt lịch chạy mỗi ngày (chạy lại file này sẽ ghi đè lịch cũ, không bị trùng)
do $$
begin
  if exists (select 1 from cron.job where jobname = 'timdovn-cleanup-30-ngay') then
    perform cron.unschedule('timdovn-cleanup-30-ngay');
  end if;
  perform cron.schedule('timdovn-cleanup-30-ngay', '0 20 * * *', 'select public.cleanup_old_items()');
end $$;

-- 4) Kiểm tra lịch đã có chưa
select jobid, jobname, schedule, active from cron.job where jobname = 'timdovn-cleanup-30-ngay';

-- Xem lịch sử các lần chạy (sau ngày đầu tiên):
--   select * from cron.job_run_details order by start_time desc limit 10;
-- Muốn tắt tự xóa:
--   select cron.unschedule('timdovn-cleanup-30-ngay');
