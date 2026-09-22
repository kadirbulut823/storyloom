export default async (req) => {
  const { panel, stil, refImage } = await req.json();

  // No reference image -> plain generation (same model as before).
  // Reference image given -> PuLID, so the SAME face/character is reused.
  const modelPath = refImage ? "bytedance/flux-pulid" : process.env.REPLICATE_MODEL;

  const input = refImage
    ? {
        prompt: `${panel}. Art style: ${stil}. manga panel, comic illustration`,
        main_face_image: refImage,
        width: 1024,
        height: 683,
        num_steps: 20,
        start_step: 0,
        guidance_scale: 4,
        id_weight: 1,
        true_cfg: 1,
        num_outputs: 1,
        output_format: "webp",
      }
    : {
        prompt: `${panel}. Art style: ${stil}. manga panel, comic illustration`,
        aspect_ratio: "3:2",
      };

  // IMPORTANT: no "Prefer: wait" here. We return immediately with the prediction id,
  // and the browser polls netlify/functions/cizim-durum until it's ready. This avoids
  // Netlify's ~30s function timeout, since real image generation can take longer than that.
  const r = await fetch(`https://api.replicate.com/v1/models/${modelPath}/predictions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.REPLICATE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input }),
  });

  const d = await r.json();
  console.log("cizim: created prediction, model", modelPath, "status", r.status, d.id || "");

  if (!r.ok) {
    console.error("cizim: replicate error", r.status, JSON.stringify(d));
    return Response.json({ error: d.detail || d.error || "Replicate error" }, { status: r.status });
  }

  return Response.json({ id: d.id, status: d.status });
};
