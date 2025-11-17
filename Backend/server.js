import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/chat/gpt5", async (req, res) => {
try {
    const { messages } = req.body;

    const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages,
    });

    const reply = completion.choices[0].message;
    res.json({ reply });
} catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Error talking to OpenAI" });
}
});

const PORT = 3000;
app.listen(PORT, () => {
console.log(`Backend running at http://localhost:${PORT}`);
});