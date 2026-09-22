// netlify/functions/generate-image.js
//
// Real image generation via Replicate. The browser never sees the Replicate
// API token — it lives only here, as a Netlify environment variable
// (REPLICATE_API_TOKEN).
//
// Two modes, chosen automatically by the caller:
//  - No referenceImageUrl  -> plain FLUX text-to-image (used the FIRST time a
//    character is drawn; that first image becomes their permanent reference).
//  - referenceImageUrl set -> FLUX + PuLID, which locks the generated face to
//    the reference image so the SAME character looks the same in every panel.

const NO_REF_MODEL = "black-forest-labs/flux-schnell";
const REF_MODEL = "bytedance/flux-pulid";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
  if (!REPLICATE_API_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "REPLICATE_API_TOKEN is not set in Netlify environment variables" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { prompt, referenceImageUrl } = body;
  if (!prompt || typeof prompt !== "string") {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing 'prompt' string" }) };
  }

  const modelPath = referenceImageUrl ? REF_MODEL : NO_REF_MODEL;
  const input = referenceImageUrl
    ? {
        prompt,
        main_face_image: referenceImageUrl,
        width: 768,
        height: 1024,
        num_steps: 20,
        start_step: 0,
        guidance_scale: 4,
        id_weight: 1,
        true_cfg: 1,
        num_outputs: 1,
        output_format: "webp",
      }
    : {
        prompt,
        aspect_ratio: "3:4",
        num_outputs: 1,
        output_format: "webp",
      };

  try {
    const createRes = await fetch(`https://api.replicate.com/v1/models/${modelPath}/predictions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
        Prefer: "wait=55",
      },
      body: JSON.stringify({ input }),
    });

    if (!createRes.ok) {
      const detail = await createRes.text();
      return { statusCode: createRes.status, body: JSON.stringify({ error: "Replicate error", detail }) };
    }

    let prediction = await createRes.json();

    // "Prefer: wait" usually finishes the job inline, but if Replicate is busy
    // it can still come back "processing" — poll politely until done.
    const pollUrl = prediction?.urls?.get;
    let attempts = 0;
    while (
      pollUrl &&
      prediction.status !== "succeeded" &&
      prediction.status !== "failed" &&
      prediction.status !== "canceled" &&
      attempts < 30
    ) {
      await new Promise((r) => setTimeout(r, 1500));
      const pollRes = await fetch(pollUrl, { headers: { Authorization: `Bearer ${REPLICATE_API_TOKEN}` } });
      prediction = await pollRes.json();
      attempts++;
    }

    if (prediction.status !== "succeeded") {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "Generation did not succeed", detail: prediction.error || prediction.status }),
      };
    }

    const output = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
    if (!output) {
      return { statusCode: 502, body: JSON.stringify({ error: "No image in Replicate response" }) };
    }

    return { statusCode: 200, body: JSON.stringify({ url: output }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: "Server error", detail: String(err) }) };
  }
};
