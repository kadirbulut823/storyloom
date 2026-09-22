export default async (req) => {
  if (req.method !== "POST") return new Response("Sadece POST", { status: 405 });

  const body = await req.json();

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: body.max_tokens || 4096,
      messages: body.messages,
      stream: true,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    console.error("ai: anthropic error", upstream.status, detail);
    return Response.json({ error: "Anthropic API error", detail }, { status: upstream.status || 502 });
  }

  // Re-stream: parse Anthropic's server-sent events and forward ONLY the plain text
  // deltas, so the browser just reads the body as plain text (no SSE parsing needed).
  // Streaming starts sending bytes immediately, which avoids the "long silent wait"
  // timeout a single big blocking response can hit on a long chapter.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) { controller.close(); return; }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const evt = JSON.parse(payload);
          if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
            controller.enqueue(new TextEncoder().encode(evt.delta.text));
          }
        } catch { /* ignore a malformed/partial SSE line */ }
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
