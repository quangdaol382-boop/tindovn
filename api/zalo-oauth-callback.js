// Trang này KHÔNG dành cho người dùng web bình thường — chỉ dùng 1 lần
// khi bạn (chủ OA) bấm vào đường link cấp quyền do Claude gửi, để lấy
// OA Access Token + Refresh Token và lưu vào Supabase.
//
// Luồng: Zalo chuyển hướng trình duyệt của bạn về đây kèm ?code=...&oa_id=...
// -> mình đổi "code" đó lấy access_token/refresh_token thật (gọi API Zalo)
// -> lưu vào bảng zalo_oa_config -> hiện trang "Đã liên kết thành công".

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

const ZALO_APP_ID = "824115373376391030";

function htmlPage(title, message, ok) {
  return `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"/>
<title>${title}</title>
<style>body{font-family:system-ui,sans-serif;background:#0A1A0F;color:#fff;display:flex;
align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;padding:20px}
.box{max-width:420px}.icon{font-size:48px;margin-bottom:12px}
h1{font-size:20px;color:${ok ? "#27AE60" : "#FF4F7B"}}
p{color:#D1D5DB;line-height:1.6}</style></head>
<body><div class="box"><div class="icon">${ok ? "✅" : "⚠️"}</div>
<h1>${title}</h1><p>${message}</p></div></body></html>`;
}

export default async function handler(req, res) {
  const { code, oa_id, error, error_description } = req.query;

  if (error) {
    res.status(400).send(
      htmlPage("Không thể liên kết", `Zalo báo lỗi: ${error_description || error}. Bạn đóng trang này và báo lại cho người hỗ trợ.`, false)
    );
    return;
  }
  if (!code) {
    res.status(400).send(htmlPage("Thiếu thông tin", "Không nhận được mã xác thực từ Zalo. Vui lòng thử lại từ đầu.", false));
    return;
  }
  if (!process.env.ZALO_APP_SECRET) {
    res.status(500).send(htmlPage("Máy chủ chưa sẵn sàng", "Chưa cấu hình ZALO_APP_SECRET trên Vercel. Báo lại cho người hỗ trợ.", false));
    return;
  }
  if (!supabaseAdmin) {
    res.status(500).send(htmlPage("Máy chủ chưa sẵn sàng", "Chưa cấu hình SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY trên Vercel.", false));
    return;
  }

  try {
    const tokenRes = await fetch("https://oauth.zaloapp.com/v4/oa/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        secret_key: process.env.ZALO_APP_SECRET,
      },
      body: new URLSearchParams({
        app_id: ZALO_APP_ID,
        code: String(code),
        grant_type: "authorization_code",
      }),
    });
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error("zalo-oauth-callback: Zalo trả về lỗi", tokenData);
      res.status(400).send(
        htmlPage("Không lấy được Access Token", `Zalo phản hồi: ${tokenData.error_description || JSON.stringify(tokenData)}`, false)
      );
      return;
    }

    const expiresInSec = Number(tokenData.expires_in) || 0;
    const expiresAt = new Date(Date.now() + expiresInSec * 1000).toISOString();

    const { error: dbError } = await supabaseAdmin
      .from("zalo_oa_config")
      .update({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (dbError) {
      console.error("zalo-oauth-callback: lỗi lưu Supabase", dbError);
      res.status(500).send(htmlPage("Lỗi lưu dữ liệu", "Lấy Access Token thành công nhưng lưu vào Supabase bị lỗi. Báo lại cho người hỗ trợ.", false));
      return;
    }

    res.status(200).send(
      htmlPage("Đã liên kết thành công!", `OA (mã ${oa_id || ""}) đã được cấp quyền cho website TìmĐồ.vn. Bạn có thể đóng trang này.`, true)
    );
  } catch (e) {
    console.error("zalo-oauth-callback: lỗi", e);
    res.status(500).send(htmlPage("Có lỗi xảy ra", "Vui lòng thử lại hoặc báo cho người hỗ trợ.", false));
  }
}
