import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_KEY) throw new Error("Chua cau hinh GEMINI_API_KEY");

    const body = await req.json();

    // Key AQ. dung Bearer token, key AIzaSy dung ?key=
    const isBearer = GEMINI_KEY.startsWith("AQ.");
    const url = isBearer
      ? "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
      : `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (isBearer) headers["Authorization"] = `Bearer ${GEMINI_KEY}`;

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log(`status=${res.status} resp=${JSON.stringify(data).slice(0, 200)}`);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error(`Loi: ${e.message}`);
    return new Response(
      JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ loi: e.message }) }] } }] }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});