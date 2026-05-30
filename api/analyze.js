import OpenAI from "openai";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(200).json({ message: "Analyze route works" });
    }

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
      return res.status(400).json({ error: "No image received." });
    }

    const imageBuffer = fs.readFileSync(uploadedFile.filepath);
    const base64 = imageBuffer.toString("base64");
    const mimeType = uploadedFile.mimetype || "image/jpeg";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                'Analyze this clothing item. Return ONLY JSON with this shape: {"name":"","category":"","color":"","style":"","occasion":"","tags":[]} Category must be one of: Shirt, Sweatshirt, Hoodie, Pants, Shorts, Shoes, Activity Clothes, Jacket, Hat, Accessory. Identify the real clothing type and real colors.',
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
              },
            },
          ],
        },
      ],
    });

    const raw = completion.choices[0].message.content || "{}";

    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    const jsonText = raw.slice(start, end + 1);

    const data = JSON.parse(jsonText);

    return res.status(200).json({
      name: data.name || "Clothing Item",
      category: data.category || "Shirt",
      color: data.color || "",
      style: data.style || "",
      occasion: data.occasion || "",
      tags: Array.isArray(data.tags) ? data.tags : [],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error:
        error?.message ||
        error?.toString() ||
        "Unknown AI error",
    });
  }
