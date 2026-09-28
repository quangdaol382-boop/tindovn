// Tiện ích dùng chung: xác minh Cloudflare Turnstile + đọc IP thật của người dùng
// khi request đi qua máy chủ Vercel (thay vì trình duyệt gọi thẳng Supabase).
import { createClient } from "@supabase/supabase-js";

export function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (xff) return String(xff).split(",")[0].trim();
  return req.socket?.remoteAddress || "";
}

export async function verifyTurnstile(token, ip) {
  if (!token || !process.env.TURNSTILE_SECRET_KEY) return false;
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: ip || "",
      }),
    });
    const d = await r.json();
    return !!d.success;
  } catch (e) {
    console.error("verifyTurnstile lỗi:", e);
    return false;
  }
}

export function envReady() {
  return !!(process.env.TURNSTILE_SECRET_KEY && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// Client Supabase dùng Service Role Key, gắn sẵn IP thật của người dùng vào header
// x-real-ip để public.client_ip() phía database đọc đúng (xem supabase/sql/09_khoa_captcha.sql)
export function supabaseAsUser(ip) {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    global: { headers: { "x-real-ip": ip || "" } },
  });
}
