export default async (req) => {
  const { panel, stil } = await req.json();

  const r = await fetch(`https://api.replicate.com/v1/models/${process.env.REPLICATE_MODEL}/predictions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.REPLICATE_TOKEN}`,
      "Content-Type": "application/json",
      "Prefer": "wait",
    },
    body: JSON.stringify({
      input: {
        prompt: `${panel}. Art style: ${stil}. manga panel, comic illustration`,
        aspect_ratio: "3:2",
      },
    }),
  });

  const d = await r.json();
  return Response.json({ url: d.output?.[0] });
};