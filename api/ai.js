 
export const config = { runtime: "edge" };

export default async function handler(req) {
  const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  try {
    const { content } = await req.json();

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        messages: [{ role: "user", content }]
      })
    });

    const data = await res.json();

    if (data.error) {
      return Response.json(
        { error: data.error.message },
        { status: 400, headers: CORS }
      );
    }

    const text = data.content?.[0]?.text || "";
    return Response.json({ text }, { headers: CORS });

  } catch (e) {
    return Response.json(
      { error: e.message },
      { status: 500, headers: CORS }
    );
  }
}