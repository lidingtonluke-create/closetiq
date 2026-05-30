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
      return res.status(200).json({ message: "analyze route works" });
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
    const imageBase64 = imageBuffer.toString("base64");
    const mimeType = uploadedFile.mimetype || "image/jpeg";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
Analyze this clothing item for a closet app.

Return JSON only.

Use this format:
{
  "name": "",
  "category": "",
  "color": "",
  "style": "",
  "occasion": "",
  "tags": []
}

Category must be exactly one of:
Shirt, Sweatshirt, Hoodie, Pants, Shorts, Shoes, Activity Clothes, Jacket, Hat, Accessory.

Rules:
- If it has a hood, category is Hoodie.
- Crewneck with no hood is Sweatshirt.
- T-shirt, polo, tank top, or long sleeve without hood is Shirt.
- Long bottoms are Pants.
- Short bottoms are Shorts.
- Footwear is Shoes.
- Identify actual visible colors.
- Do not default to black.
- If multiple colors, use formats like Black/Red, White/Blue, Orange/Navy.
- Name should be short like "Red Hoodie" or "Blue Athletic Shorts".
              `,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
    });

    const text = response.choices[0].message.content;
    const data = JSON.parse(text);

    return res.status(200).json({
      name: data.name || "Clothing Item",
      category: data.category || "Shirt",
      color: data.color || "",
      style: data.style || "",
      occasion: data.occasion || "",
      tags: Array.isArray(data.tags) ? data.tags : [],
    });
  } catch (error) {
    return res.status(500).json({
      error: "AI analysis failed.",
      details: error.message || "Unknown error",
    });
  }
}
