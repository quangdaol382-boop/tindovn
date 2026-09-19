-- =====================================================================
-- TÌMĐỒ.VN - PHẦN B: KHÓA QUYỀN TRUY CẬP DATABASE (RLS)
--
-- !!! CHỈ CHẠY SAU KHI:
--     (1) đã chạy Phần A, và
--     (2) đã push code mới lên GitHub và Vercel đã cập nhật xong (website dùng items_public + post_item).
--     Nếu chạy trước, website cũ sẽ không đọc/ghi được dữ liệu.
--
-- Sau khi chạy:
--   - Người ngoài KHÔNG còn đọc/ghi thẳng bảng items (chỉ qua items_public và post_item)
--     => số CCCD, họ tên, ngày sinh đầy đủ không còn truy cập được bằng khóa công khai.
--   - Admin (đã đăng nhập + có trong bảng admins) xem/sửa/xóa được mọi thứ.
--   - missing_persons: ai cũng xem và đăng được (như hiện tại), chỉ admin sửa/xóa.
--   - Nếu có sự cố: chạy file 99_hoan_tac_phan_B.sql.
-- =====================================================================

-- Xóa các policy cũ trên những bảng này (để không còn cửa hở do policy cũ)
do $$
declare
  pol record;
begin
  for pol in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('items', 'missing_persons', 'matches', 'admins')
  loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

-- ---------- items: chỉ admin ----------
alter table public.items enable row level security;
revoke all on public.items from anon;
grant select, insert, update, delete on public.items to authenticated;   -- RLS bên dưới giới hạn chỉ admin

create policy items_admin_all on public.items
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- matches: chỉ admin được xem ----------
alter table public.matches enable row level security;
revoke all on public.matches from anon;
grant select on public.matches to authenticated;

create policy matches_admin_select on public.matches
  for select to authenticated
  using (public.is_admin());

-- ---------- admins: không ai đọc trực tiếp, chỉ hàm is_admin() ----------
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

-- ---------- missing_persons: công khai xem + đăng, admin quản lý ----------
alter table public.missing_persons enable row level security;
grant select, insert on public.missing_persons to anon;
grant select, insert, update, delete on public.missing_persons to authenticated;

create policy mp_public_select on public.missing_persons
  for select to anon, authenticated using (true);

create policy mp_public_insert on public.missing_persons
  for insert to anon, authenticated with check (true);

create policy mp_admin_all on public.missing_persons
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

select 'Phần B chạy xong' as ket_qua;
