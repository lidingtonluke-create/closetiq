import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ message: "remove-bg route works" });
  }

  try {
    const form = formidable({ multiples: false });

    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const uploadedFile = Array.isArray(files.image)
      ? files.image[0]
      : files.image;

    if (!uploadedFile) {
      return res.status(400).json({ error: "No image sent to server." });
    }

    const imageBuffer = fs.readFileSync(uploadedFile.filepath);

    const removeForm = new FormData();
    removeForm.append(
      "image_file",
      new Blob([imageBuffer], { type: uploadedFile.mimetype || "image/jpeg" }),
      uploadedFile.originalFilename || "image.jpg"
    );
    removeForm.append("size", "auto");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": process.env.REMOVE_BG_API_KEY,
      },
      body: removeForm,
    });

    if (!response.ok) {
      const details = await response.text();
      return res.status(500).json({
        error: "remove.bg could not remove this image.",
        details,
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
      error: "Background removal crashed.",
      details: error.message,
    });
  }
}
