export default async (req) => {
  if (req.method !== "POST") return new Response("Sadece POST", { status: 405 });

  const body = await req.json();

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: body.messages,
    }),
  });

  const data = await r.json();
  return Response.json(data);
};