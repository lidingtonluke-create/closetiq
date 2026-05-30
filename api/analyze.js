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

    const uploadedFile = Array.isArray(files.image) ? files.image[0] : files.image;

    if (!uploadedFile) {
      return res.status(400).json({ error: "No image received." });
    }

    const imageBuffer = fs.readFileSync(uploadedFile.filepath);
    const base64 = imageBuffer.toString("base64");
    const mimeType = uploadedFile.mimetype || "image/jpeg";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You only return valid JSON. Do not include markdown, explanations, comments, or extra text.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
Look at this clothing item and identify it.

Return exactly this JSON shape:
{
  "name": "short clothing name",
  "category": "one category",
  "color": "real visible color or color combo",
  "style": "style",
  "occasion": "occasion",
  "tags": ["tag1", "tag2"]
}

Allowed categories:
Shirt, Sweatshirt, Hoodie, Pants, Shorts, Shoes, Activity Clothes, Jacket, Hat, Accessory

Rules:
- If it has a hood, category must be Hoodie.
- If it is a crewneck with
