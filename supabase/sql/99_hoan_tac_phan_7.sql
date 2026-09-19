-- =====================================================================
-- HOÀN TÁC PHẦN 7 (chỉ dùng khi website báo lỗi sau khi chạy file 07)
-- Trả 3 hàm về tên và cách hoạt động như trước (không còn giới hạn tần suất / chặn link).
-- Bảng rate_events được giữ lại (vô hại). Chạy được nhiều lần.
-- =====================================================================

do $$
begin
  if exists (select 1 from pg_proc where proname = 'post_item_core' and pronamespace = 'public'::regnamespace) then
    drop function if exists public.post_item(jsonb);
    alter function public.post_item_core(jsonb) rename to post_item;
  end if;
  if exists (select 1 from pg_proc where proname = 'post_missing_core' and pronamespace = 'public'::regnamespace) then
    drop function if exists public.post_missing(jsonb);
    alter function public.post_missing_core(jsonb) rename to post_missing;
  end if;
  if exists (select 1 from pg_proc where proname = 'search_face_core' and pronamespace = 'public'::regnamespace) then
    drop function if exists public.search_face(jsonb, text, text);
    alter function public.search_face_core(jsonb, text, text) rename to search_face;
  end if;
end $$;

grant execute on function public.post_item(jsonb)                 to anon, authenticated;
grant execute on function public.post_missing(jsonb)              to anon, authenticated;
grant execute on function public.search_face(jsonb, text, text)   to anon, authenticated;

select 'Đã hoàn tác Phần 7' as ket_qua;
