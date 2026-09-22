export default async (req) => {
  const { panel, stil, refImage } = await req.json();

  const positive = `${panel}. ${stil}. Korean webtoon / manhwa art style, clean anime linework, cel shading, vibrant colors, detailed illustration, masterpiece, best quality.`;
  const negative = "western comic, marvel style, dc comics, superhero comic, photorealistic, photo, 3d render, western cartoon, low quality, worst quality, blurry, bad anatomy, watermark, text, signature, jpeg artifacts";

  // No reference image -> a real anime/manhwa-trained model (not general-purpose FLUX),
  // so the base look is authentically webtoon/manga instead of drifting Western-comic.
  // Reference image given -> PuLID (FLUX-based) so the SAME face/character is reused;
  // PuLID can lock identity from a reference photo regardless of which model made it.
  // animagine-xl-3.1 is a community model, so it's called with a pinned version hash via
  // /v1/predictions (the /v1/models/.../predictions name-only shortcut is only reliable
  // for official Replicate/Black-Forest-Labs models like flux-pulid).
  const ANIMAGINE_VERSION = "47b1d36d3ce66d22fc7ac0cd68b7bc8c9d9956c76b2d255d8eca4266291a5f37";

  const input = refImage
    ? {
        prompt: positive,
        main_face_image: refImage,
        width: 800,
        height: 1200,
        num_steps: 20,
        start_step: 0,
        guidance_scale: 4,
        id_weight: 1,
        true_cfg: 1,
        num_outputs: 1,
        output_format: "webp",
      }
    : {
        prompt: positive,
        negative_prompt: negative,
        width: 896,
        height: 1152,
        num_inference_steps: 30,
        guidance_scale: 7,
      };

  // IMPORTANT: no "Prefer: wait" here. We return immediately with the prediction id,
  // and the browser polls netlify/functions/cizim-durum until it's ready. This avoids
  // Netlify's ~30s function timeout, since real image generation can take longer than that.
  const r = refImage
    ? await fetch(`https://api.replicate.com/v1/models/bytedance/flux-pulid/predictions`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.REPLICATE_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      })
    : await fetch(`https://api.replicate.com/v1/predictions`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.REPLICATE_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ version: ANIMAGINE_VERSION, input }),
      });

  const d = await r.json();
  console.log("cizim: created prediction, model", refImage ? "flux-pulid" : "animagine-xl-3.1", "status", r.status, d.id || "");

  if (!r.ok) {
    console.error("cizim: replicate error", r.status, JSON.stringify(d));
    return Response.json({ error: d.detail || d.error || "Replicate error" }, { status: r.status });
  }

  return Response.json({ id: d.id, status: d.status });
};
