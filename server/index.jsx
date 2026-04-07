import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🔥 AI Help Route
app.post("/ai-help", async (req, res) => {
  try {
    const { command, state, alertName } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a senior NOC engineer.
Guide the user step by step.
Do NOT give full solution directly.
Explain reasoning simply.`,
        },
        {
          role: "user",
          content: `
Alert: ${alertName}
User Command: ${command}
Current State: ${JSON.stringify(state)}

What should be the next step?
          `,
        },
      ],
    });

    res.json({
      reply: response.choices[0].message.content,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI failed" });
  }
});

app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});