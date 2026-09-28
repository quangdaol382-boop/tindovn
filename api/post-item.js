import { getClientIp, verifyTurnstile, envReady, supabaseAsUser } from "./_captcha.js";

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }
  try {
    const { p, captchaToken } = req.body || {};
    if (!p || typeof p !== "object") { res.status(400).json({ error: "Dữ liệu không hợp lệ." }); return; }
    if (!envReady()) {
      console.error("post-item: thiếu biến môi trường (TURNSTILE_SECRET_KEY / SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
      res.status(500).json({ error: "Máy chủ chưa sẵn sàng, vui lòng thử lại sau." });
      return;
    }
    const ip = getClientIp(req);
    const ok = await verifyTurnstile(captchaToken, ip);
    if (!ok) { res.status(400).json({ error: "Xác minh CAPTCHA không hợp lệ hoặc đã hết hạn, vui lòng tích lại rồi thử lại." }); return; }

    const { data, error } = await supabaseAsUser(ip).rpc("post_item", { p });
    if (error) { res.status(400).json({ error: error.message || "Không lưu được tin, vui lòng thử lại." }); return; }
    res.status(200).json({ data });
  } catch (e) {
    console.error("post-item lỗi:", e);
    res.status(500).json({ error: "Có lỗi xảy ra, vui lòng thử lại." });
  }
}

export const config = { api: { bodyParser: true } };
