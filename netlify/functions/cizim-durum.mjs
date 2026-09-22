export default async (req) => {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return Response.json({ error: "missing id" }, { status: 400 });

  const r = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
    headers: { "Authorization": `Bearer ${process.env.REPLICATE_TOKEN}` },
  });
  const d = await r.json();

  if (!r.ok) {
    console.error("cizim-durum: replicate error", r.status, JSON.stringify(d));
    return Response.json({ error: d.detail || d.error || "Replicate error" }, { status: r.status });
  }

  const output = Array.isArray(d.output) ? d.output[0] : d.output;
  return Response.json({ status: d.status, url: output || null, error: d.error || null });
};
