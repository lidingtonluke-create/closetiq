import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import OpenAI from "openai";
import axios from "axios";
import FormData from "form-data";

/*
  ClosetIQ Backend
  1. Put your API keys in the .env file.
  2. Run: npm install
  3. Run: npm run start
*/

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json({ limit: "20mb" }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, app: "ClosetIQ" });
});

app.post("/api/analyze", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded." });
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("your_")) {
      return res.status(400).json({ error: "Missing OPENAI_API_KEY in .env file." });
    }

    const imageBase64 = req.file.buffer.toString("base64");

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Analyze this clothing item. Return ONLY valid JSON with no markdown.
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

Make the name simple, like "Black Hoodie" or "White Sneakers".`,
            },
            {
              type: "input_image",
              image_url: `data:${req.file.mimetype};base64,${imageBase64}`,
            },
          ],
        },
      ],
    });

    const text = response.output_text.trim();
    const cleaned = text.replace(/^```json/i, "").replace(/^```/i, "").replace(/```$/i, "").trim();
    const data = JSON.parse(cleaned);

    res.json(data);
  } catch (error) {
    console.error("AI analysis error:", error);
    res.status(500).json({ error: "AI analysis failed." });
  }
});

app.post("/api/remove-bg", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded." });
    }

    if (!process.env.REMOVE_BG_API_KEY || process.env.REMOVE_BG_API_KEY.includes("your_")) {
      return res.status(400).json({ error: "Missing REMOVE_BG_API_KEY in .env file." });
    }

    const formData = new FormData();

    formData.append("image_file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    formData.append("size", "auto");

    const response = await axios.post(
      "https://api.remove.bg/v1.0/removebg",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "X-Api-Key": process.env.REMOVE_BG_API_KEY,
        },
        responseType: "arraybuffer",
      }
    );

    const base64 = Buffer.from(response.data, "binary").toString("base64");

    res.json({
      image: `data:image/png;base64,${base64}`,
    });
  } catch (error) {
    console.error("Background removal error:", error.response?.data || error.message);
    res.status(500).json({ error: "Background removal failed." });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`ClosetIQ server running on http://localhost:${PORT}`);
});
