-- =====================================================================
-- PHẦN 8: Chuẩn bị dữ liệu cho việc kết nối Zalo OA (báo tin trùng khớp)
--
-- Tạo 2 bảng:
--   1. zalo_oa_config : lưu Access Token / Refresh Token của OA (chỉ 1 dòng)
--   2. zalo_links     : nối "mã xác nhận" (vd TD-8X2K) của mỗi tin đăng
--                       với Zalo User ID của người đã nhắn mã đó cho OA
--
-- QUAN TRỌNG VỀ BẢO MẬT:
--   Cả 2 bảng đều bật RLS (Row Level Security) và KHÔNG có policy nào,
--   nghĩa là bị khóa hoàn toàn với khóa công khai (anon key) mà website
--   đang dùng ở trình duyệt. Chỉ đoạn code chạy trên máy chủ Vercel
--   (dùng Service Role Key, không hiện ra ngoài) mới đọc/ghi được.
--   -> Access Token sẽ không bao giờ lộ ra trình duyệt của người dùng.
-- =====================================================================

create table if not exists public.zalo_oa_config (
  id            int primary key default 1,
  access_token  text,
  refresh_token text,
  expires_at    timestamptz,
  updated_at    timestamptz not null default now(),
  constraint zalo_oa_config_single_row check (id = 1)
);
alter table public.zalo_oa_config enable row level security;

create table if not exists public.zalo_links (
  code         text primary key,           -- vd 'TD-8X2K'
  target_table text not null check (target_table in ('items', 'missing_persons')),
  target_id    text not null,              -- id của tin đăng (lưu dạng text cho chắc, dù cột id gốc là bigint hay uuid)
  zalo_user_id text,                       -- null = chưa ai nhắn mã này cho OA
  created_at   timestamptz not null default now(),
  linked_at    timestamptz                 -- lúc webhook nhận được mã khớp
);
alter table public.zalo_links enable row level security;
create index if not exists zalo_links_target_idx on public.zalo_links (target_table, target_id);

-- Dòng cấu hình mặc định (rỗng), để sau này webhook chỉ cần UPDATE thay vì INSERT
insert into public.zalo_oa_config (id) values (1) on conflict (id) do nothing;
