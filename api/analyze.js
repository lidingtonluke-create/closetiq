import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(200).json({ message: "Analyze API works" });
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
    const base64Image = imageBuffer.toString("base64");
    const mimeType = uploadedFile.mimetype || "image/jpeg";

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a clothing analyzer. Always return valid JSON only. No markdown. No extra text.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `
Analyze the clothing item in this image.

Return this exact JSON shape:
{
  "name": "",
  "category": "",
  "color": "",
  "style": "",
  "occasion": "",
  "tags": []
}

Allowed categories:
Shirt, Sweatshirt, Hoodie, Pants, Shorts, Shoes, Activity Clothes, Jacket, Hat, Accessory

Rules:
- If it has a hood, category is Hoodie.
- If it has no hood but is thick like a crewneck, category is Sweatshirt.
- If it is a t-shirt, long sleeve, polo, or tank top, category is Shirt.
- If it is footwear, category is Shoes.
- Identify the real visible colors.
- If multiple colors, use formats like Red/Black, White/Blue, Gray/Camo.
- Do not default to black.
- Name should be short, like "Gray Camo Hoodie" or "Red Nike Shirt".
                `,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
      }),
    });

    const result = await openaiRes.json();

    if (!openaiRes.ok) {
      return res.status(500).json({
        error: result.error?.message || "OpenAI request failed.",
      });
    }

    const text = result.choices?.[0]?.message?.content || "{}";
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
      error: error.message || "AI analyzer crashed.",
    });
  }
}
