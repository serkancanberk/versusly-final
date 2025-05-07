import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import OpenAI from 'openai';
import authenticateUser from '../middleware/authMiddleware.js';
import { sanitizeInput, formatGPTResponse, generatePromptFromForm } from '../utils/gptUtils.js';

console.log("API Key exists:", Boolean(process.env.OPENAI_API_KEY));

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/generate", authenticateUser, async (req, res) => {
  try {
    const { title, statement, tags, prompt: userPrompt } = req.body;

    // Validate inputs only if no custom prompt provided
    if (!userPrompt && (!title || !statement || typeof title !== "string" || typeof statement !== "string")) {
      return res.status(400).json({ error: "Title and statement are required and must be strings." });
    }

    // Use custom userPrompt if provided, otherwise build default prompt
    const finalPrompt = userPrompt || `
Given the following debate input:
Title: ${title}
Statement: ${statement}
Tags: ${tags.join(", ")}

Please provide a balanced and insightful analysis in markdown format.
`;

    // GPT API call
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: finalPrompt }],
      temperature: 0.7,
    });

    // Extract and clean the generated text
    const raw = completion.choices[0]?.message?.content;
    const generated = raw && raw.startsWith('"') && raw.endsWith('"')
      ? raw.slice(1, -1)
      : raw;
    return res.status(200).json({ generated });
  } catch (error) {
    console.error("Error during GPT generation:", error);
    res.status(500).json({ error: "An error occurred while generating content." });
  }
});

export default router;