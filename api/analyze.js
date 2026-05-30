import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(200).json({ message: "analyze route works" });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    if (!body?.image) {
      return res.status(400).json({ error: "No image received." });
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
You are analyzing a clothing item for a digital closet app.

Look carefully at the image and identify:
- the clothing category
- the main color or color combo
- the style
- the occasion
- useful tags

Return ONLY valid JSON. No markdown. No explanation.

Use this exact JSON format:
{
  "name": "",
  "category": "",
  "color": "",
  "style": "",
  "occasion": "",
  "tags": []
}

Rules:
- Category must be exactly one of:
Shirt, Sweatshirt, Hoodie, Pants, Shorts, Shoes, Activity Clothes, Jacket, Hat, Accessory
- If it has a hood, use Hoodie.
- If it is long pants, use Pants.
- If it is athletic shorts, use Shorts.
- If it is footwear, use Shoes.
- If it is a T-shirt, polo, tank top, or long sleeve shirt without a hood, use Shirt.
- If it is a crewneck sweatshirt with no hood, use Sweatshirt.
- If multiple colors are visible, use format like "Black/Red", "White/Blue", or "Orange/Navy".
- Do not default to black unless the item is clearly mostly black.
- The name should be short, like "Red Nike Hoodie" or "Blue Athletic Shorts".
              `,
            },
            {
              type: "input_image",
              image_url: body.image,
            },
          ],
        },
      ],
    });

    const text = response.output_text.trim();
    const cleaned = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleaned);

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
      details: error.message,
    });
  }
}
