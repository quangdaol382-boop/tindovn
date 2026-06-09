import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type",
  }
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  const body = await req.json()
  const GEMINI_KEY = Deno.env.get("GEMINI_KEY")

  const isBearer = GEMINI_KEY?.startsWith("AQ.")
  const url = isBearer
    ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
    : `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`

  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (isBearer) headers["Authorization"] = `Bearer ${GEMINI_KEY}`

  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) })
  const data = await res.json()

  return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
})