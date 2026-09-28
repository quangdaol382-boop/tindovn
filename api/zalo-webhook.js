// Webhook nhận sự kiện từ Zalo OA (khi người dùng nhắn tin cho OA "TìmĐồ.vn").
// Đăng ký đường dẫn này tại Zalo Developers > mục "Webhook":
//   https://timdovn.vn/api/zalo-webhook
//
// Việc chính: khi ai đó nhắn đúng mã xác nhận (vd "TD-8X2K") cho OA,
// mình lưu lại Zalo User ID của họ, gắn với tin đăng tương ứng trong bảng zalo_links.
// Sau này khi có tin trùng khớp, code khác (chưa viết ở bước này) sẽ dùng
// Zalo User ID đó để gửi thông báo qua Zalo OA Message API.

import { createClient } from "@supabase/supabase-js";

// Dùng Service Role Key (không phải khóa công khai) vì bảng zalo_links
// đã khóa hoàn toàn với khóa công khai (xem file SQL 08_zalo_ket_noi.sql).
const supabaseAdmin =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

const ZALO_APP_ID = "824115373376391030";
// Mã xác nhận web tạo ra có dạng TD-XXXX (chữ hoa/số, 4-8 ký tự)
const CODE_PATTERN = /TD-[A-Z0-9]{4,8}/;

export default async function handler(req, res) {
  // Zalo có thể gọi thử bằng GET khi đăng ký -> trả 200 luôn cho qua.
  if (req.method !== "POST") {
    res.status(200).json({ ok: true });
    return;
  }

  try {
    const body = req.body || {};

    // Chỉ xử lý đúng sự kiện "người dùng gửi tin nhắn văn bản cho OA".
    // (Ghi log sự kiện lạ để sau này xem lại nếu Zalo gửi tên sự kiện khác.)
    const eventName = body.event_name || "";
    const senderId = body.sender?.id || body.sender_id || null;
    const text = body.message?.text || "";

    if (eventName !== "user_send_text" || !senderId || !text) {
      console.log("zalo-webhook: bỏ qua sự kiện", eventName);
      res.status(200).json({ ok: true });
      return;
    }

    const match = text.toUpperCase().match(CODE_PATTERN);
    if (!match) {
      res.status(200).json({ ok: true });
      return;
    }
    const code = match[0];

    if (!supabaseAdmin) {
      console.error("zalo-webhook: chưa cấu hình SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
      res.status(200).json({ ok: true }); // vẫn trả 200 cho Zalo, lỗi đã ghi log riêng
      return;
    }

    const { data, error } = await supabaseAdmin
      .from("zalo_links")
      .update({ zalo_user_id: String(senderId), linked_at: new Date().toISOString() })
      .eq("code", code)
      .select();

    if (error) {
      console.error("zalo-webhook: lỗi lưu Supabase", error);
    } else if (!data || data.length === 0) {
      console.log("zalo-webhook: không tìm thấy mã", code);
    } else {
      console.log("zalo-webhook: đã liên kết mã", code, "với user", senderId);
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error("zalo-webhook: lỗi", e);
    res.status(200).json({ ok: true }); // luôn trả 200 để Zalo không thử gửi lại liên tục
  }
}

export const config = { api: { bodyParser: true } };
