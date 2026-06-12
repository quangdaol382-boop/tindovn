import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type",
  }
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  const HF_TOKEN = Deno.env.get("HF_TOKEN")
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

  const res = await fetch(
    "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-VL-7B-Instruct/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ model: "Qwen/Qwen2.5-VL-7B-Instruct", messages, max_tokens: 1000 })
    }
  )

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || ""

  // Trả về format Gemini để App.jsx không cần sửa
  return new Response(JSON.stringify({
    candidates: [{ content: { parts: [{ text }] } }]
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
})