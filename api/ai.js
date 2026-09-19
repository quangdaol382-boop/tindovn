// Proxy an toàn để website gọi Claude (giữ khóa ANTHROPIC_API_KEY ở phía máy chủ Vercel).
// Chống lạm dụng (tránh bị người lạ "đốt" tiền API):
//   - Chỉ nhận yêu cầu từ chính website của bạn (kiểm tra Origin).
//   - Chỉ nhận đúng dạng dữ liệu website gửi: 1 ảnh + 1 đoạn chữ ngắn.
//   - Giới hạn kích thước và số lần gọi theo từng IP (giới hạn tạm trong bộ nhớ;
//     giới hạn chắc chắn hơn: bật Vercel Firewall Rate Limit, xem hướng dẫn).
export const config = { runtime: "edge" };

// Thêm tên miền khác vào đây nếu sau này bạn dùng thêm.
const ALLOWED_ORIGINS = [
  "https://timdovn.vn",
  "https://www.timdovn.vn",
  "https://tindovn.vercel.app",
];
const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/tindovn[a-z0-9-]*\.vercel\.app$/,   // các bản xem thử của Vercel
  /^http:\/\/localhost:\d+$/,                     // chạy thử trên máy
];

const MAX_BODY_CHARS = 3_800_000;      // Vercel Edge nhận tối đa ~4MB
const MAX_IMAGE_B64_CHARS = 3_500_000; // ~2.6MB ảnh sau khi mã hóa
const MAX_TEXT_CHARS = 3_000;
const MAX_CALLS = 15;                  // số lần gọi AI tối đa ...
const WINDOW_MS = 10 * 60 * 1000;      // ... trong 10 phút, cho mỗi IP
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const hits = new Map();
function tooMany(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_CALLS) { hits.set(ip, arr); return true; }
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();  // tránh đầy bộ nhớ
  return false;
}

function originAllowed(origin) {
  return !!origin && (ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGIN_PATTERNS.some((re) => re.test(origin)));
}

// Chỉ chấp nhận: [ {type:"image", source:{type:"base64", media_type, data}}, {type:"text", text} ]
function validContent(content) {
  if (!Array.isArray(content) || content.length < 1 || content.length > 2) return false;
  let images = 0;
  for (const c of content) {
    if (!c || typeof c !== "object") return false;
    if (c.type === "image") {
      const s = c.source;
      if (!s || s.type !== "base64" || !IMAGE_TYPES.includes(s.media_type)) return false;
      if (typeof s.data !== "string" || s.data.length < 100 || s.data.length > MAX_IMAGE_B64_CHARS) return false;
      if (!/^[A-Za-z0-9+/=]+$/.test(s.data.slice(0, 200))) return false;
      images++;
    } else if (c.type === "text") {
      if (typeof c.text !== "string" || c.text.length > MAX_TEXT_CHARS) return false;
    } else {
      return false;
    }
  }
  return images === 1;   // website luôn gửi kèm đúng 1 ảnh
}

export default async function handler(req) {
  const origin = req.headers.get("origin");
  const allowed = originAllowed(origin);
  const CORS = {
    "Access-Control-Allow-Origin": allowed ? origin : "https://timdovn.vn",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
  const fail = (status, message) => Response.json({ error: message }, { status, headers: CORS });

  if (req.method === "OPTIONS") return new Response(null, { status: allowed ? 204 : 403, headers: CORS });
  if (req.method !== "POST") return fail(405, "Phương thức không được hỗ trợ");
  if (!allowed) return fail(403, "Yêu cầu không hợp lệ");

  const ip = req.headers.get("x-real-ip") || (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  if (tooMany(ip)) return fail(429, "Bạn dùng AI quá nhiều lần. Vui lòng thử lại sau vài phút.");

  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_CHARS) return fail(413, "Ảnh quá lớn, vui lòng chọn ảnh nhỏ hơn.");
    let body;
    try { body = JSON.parse(raw); } catch { return fail(400, "Dữ liệu không hợp lệ"); }
    if (!validContent(body?.content)) return fail(400, "Dữ liệu không hợp lệ");
    if (!process.env.ANTHROPIC_API_KEY) return fail(500, "Máy chủ chưa được cấu hình");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        messages: [{ role: "user", content: body.content }],
      }),
    });

    const data = await res.json();
    if (data.error) return fail(400, String(data.error.message || "AI lỗi").slice(0, 200));

    const text = data.content?.[0]?.text || "";
    return Response.json({ text }, { headers: CORS });
  } catch (e) {
    console.error("ai proxy error:", e);
    return fail(500, "Có lỗi xảy ra, vui lòng thử lại.");
  }
}
