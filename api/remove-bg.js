export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(200).json({ message: "remove-bg route works" });
    }

    const { image } = req.body || {};

    if (!image) {
      return res.status(400).json({ error: "No image sent to server." });
    }

    const base64Image = image.replace(/^data:image\/\w+;base64,/, "");

    const params = new URLSearchParams();
    params.append("image_file_b64", base64Image);
    params.append("size", "auto");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": process.env.REMOVE_BG_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({
        error: "remove.bg failed",
        details: errorText,
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const outputBase64 = buffer.toString("base64");

    return res.status(200).json({
      image: `data:image/png;base64,${outputBase64}`,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Background removal crashed",
      details: error.message,
    });
  }
}
