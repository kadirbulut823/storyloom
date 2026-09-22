export default async (req) => {
  const { baseImageUrl, styleRefImage, prompt } = await req.json();
  if (!baseImageUrl || !styleRefImage) {
    return Response.json({ error: "missing baseImageUrl or styleRefImage" }, { status: 400 });
  }

  // fermatresearch/magic-style-transfer: SDXL + IP-Adapter + ControlNet(depth/canny).
  // "image" keeps the CONTENT/composition (our freshly drawn panel), "ip_image" supplies
  // the LOOK (the uploaded original art) — the model repaints the panel to match that look.
  const MAGIC_STYLE_VERSION = "3b5fa5d360c361090f11164292e45cc5d14cea8d089591d47c580cac9ec1c7ca";

  const input = {
    prompt: prompt || "",
    image: baseImageUrl,
    ip_image: styleRefImage,
    ip_scale: 0.6,
    strength: 0.85,
    condition_depth_scale: 0.4,
    condition_canny_scale: 0.2,
    num_inference_steps: 30,
    guidance_scale: 5,
    apply_watermark: false,
  };

  const r = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.REPLICATE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ version: MAGIC_STYLE_VERSION, input }),
  });

  const d = await r.json();
  console.log("restyle: created prediction, status", r.status, d.id || "");

  if (!r.ok) {
    console.error("restyle: replicate error", r.status, JSON.stringify(d));
    return Response.json({ error: d.detail || d.error || "Replicate error" }, { status: r.status });
  }

  return Response.json({ id: d.id, status: d.status });
};
