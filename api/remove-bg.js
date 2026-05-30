export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ message: "Remove BG API is working" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    if (!body?.image) {
      return res.status(400).json({ error: "No image received." });
    }

    const base64Image = body.image.split(",")[1];

    const formData = new FormData();
    formData.append("image_file_b64", base64Image);
    formData.append("size", "auto");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": process.env.REMOVE_BG_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      return res.status(500).json({ error: "remove.bg failed." });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const outputBase64 = buffer.toString("base64");

    return res.status(200).json({
      image: `data:image/png;base64,${outputBase64}`,
    });
  } catch (error) {
    return res.status(500).json({ error: "Background removal crashed." });
  }
}
