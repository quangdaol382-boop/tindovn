import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")?.trim()
    const body = await req.json()

    // Chuyển đổi dữ liệu sang định dạng Google API
    const contents = body.contents.map((c: any) => ({
      role: "user",
      parts: c.parts.map((p: any) => {
        if (p.text) return { text: p.text }
        const data = p.inline_data || p.inlineData
        return {
          inlineData: {
            mimeType: "image/jpeg",
            data: data.data
          }
        }
      })
    }))

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents })
      }
    )

    const result = await response.json()

    // Kiểm tra cấu trúc phản hồi một cách an toàn
    const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text || 
                   JSON.stringify(result.error?.message) || 
                   "AI không trả về kết quả cụ thể";

    // Trả về đúng định dạng JSON mà Frontend mong đợi
    return new Response(JSON.stringify({ 
      candidates: [{ content: { parts: [{ text: aiText }] } }] 
    }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    })

  } catch (e: any) {
    return new Response(JSON.stringify({ 
      candidates: [{ content: { parts: [{ text: "Lỗi kết nối: " + e.message }] } }] 
    }), { status: 200, headers: corsHeaders })
  }
})