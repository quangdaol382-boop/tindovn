import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type",
  }
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  try {
    const HF_TOKEN = Deno.env.get("HF_TOKEN")
    if (!HF_TOKEN) {
      return new Response(JSON.stringify({
        candidates: [{ content: { parts: [{ text: JSON.stringify({ loi: "Chưa cấu hình HF_TOKEN trên server" }) }] } }]
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    const body = await req.json()
    const parts = body.contents?.[0]?.parts || []

    let prompt = ""
    let imageBase64 = ""

    for (const part of parts) {
      if (part.text) prompt = part.text
      if (part.inline_data) imageBase64 = part.inline_data.data
    }

    const messages = [{
      role: "user",
      content: imageBase64
        ? [
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
            { type: "text", text: prompt }
          ]
        : [{ type: "text", text: prompt }]
    }]

    // Dùng router endpoint mới của Hugging Face (Inference Providers)
    const res = await fetch(
      "https://router.huggingface.co/hf-inference/models/Qwen/Qwen2.5-VL-7B-Instruct/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "Qwen/Qwen2.5-VL-7B-Instruct",
          messages,
          max_tokens: 1000,
          temperature: 0.1
        })
      }
    )

    const data = await res.json()

    // Nếu HF trả lỗi, đóng gói lỗi để App.jsx hiển thị rõ
    if (!res.ok || data.error) {
      const errMsg = data.error?.message || data.error || `HTTP ${res.status}: ${JSON.stringify(data).slice(0, 200)}`
      return new Response(JSON.stringify({
        candidates: [{ content: { parts: [{ text: JSON.stringify({ loi: `Lỗi từ Hugging Face: ${errMsg}` }) }] } }]
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    const text = data.choices?.[0]?.message?.content || ""

    if (!text) {
      return new Response(JSON.stringify({
        candidates: [{ content: { parts: [{ text: JSON.stringify({ loi: "AI không trả về nội dung. Thử ảnh khác hoặc thử lại sau." }) }] } }]
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    // Trả về format Gemini để App.jsx không cần sửa
    return new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text }] } }]
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })

  } catch (e) {
    return new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: JSON.stringify({ loi: `Lỗi server: ${e.message}` }) }] } }]
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
  }
})