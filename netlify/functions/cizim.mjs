export default async (req) => {
  const { panel, stil, refImage } = await req.json();

  // No reference image -> exactly the same call as before (unchanged behavior).
  // Reference image given -> use PuLID so the SAME face/character is reused.
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

  const r = await fetch(`https://api.replicate.com/v1/models/${modelPath}/predictions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.REPLICATE_TOKEN}`,
      "Content-Type": "application/json",
      "Prefer": "wait",
    },
    body: JSON.stringify({ input }),
  });

  const d = await r.json();

  if (!r.ok) {
    return Response.json({ error: d.detail || d.error || "Replicate error", raw: d }, { status: r.status });
  }

  // "Prefer: wait" can still come back "processing" if the model is slow to start — poll briefly.
  let prediction = d;
  let attempts = 0;
  while (
    prediction?.urls?.get &&
    prediction.status !== "succeeded" &&
    prediction.status !== "failed" &&
    prediction.status !== "canceled" &&
    attempts < 30
  ) {
    await new Promise((res) => setTimeout(res, 1500));
    const poll = await fetch(prediction.urls.get, {
      headers: { "Authorization": `Bearer ${process.env.REPLICATE_TOKEN}` },
    });
    prediction = await poll.json();
    attempts++;
  }

  const output = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
  if (!output) {
    return Response.json({ error: "no_output", raw: prediction }, { status: 502 });
  }

  return Response.json({ url: output });
};
