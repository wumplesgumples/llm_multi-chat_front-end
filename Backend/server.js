import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config({ path: "./server.env" });

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/chat/gpt5", async (req, res) => {
try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing or invalid 'messages' array." });
    }

    const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages,
    });

    const reply = completion.choices[0].message;
    res.json({ reply });
} catch (err) {
    console.error("Error in /api/chat/gpt5:", err);
    res.status(500).json({ error: "Error talking to OpenAI" });
}
});

app.post("/api/chat/quote", async (req, res) => {
try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing or invalid 'messages' array." });
    }

    const systemPrompt = `
You are QuoteGPT, a quoting assistant for commercial cleaning services.

Your job:
- Help the user (a salesperson) calculate cleaning quotes based on room/area dimensions.
- Work in a single unit system (feet, unless the user clearly uses meters). State the unit you are using.
- Ask for each area's length and width if they are not provided.
- For each area, calculate square footage (length × width).
- Sum all areas to get total square footage.
- Ask the user for the price per square foot if they have not provided it. Do NOT invent a rate.
- Once you have total square footage and the rate, calculate:
- total_price = total_sq_ft × rate
- Round:
- square footage to the nearest whole number
- prices to 2 decimal places
- Show the math step by step:
- per-room calculations
- total square footage
- rate
- final price
- Then provide a short, salesperson-friendly summary they can read to the customer.

If the user is vague or missing data, ask clear follow-up questions instead of guessing.
Keep answers focused and practical for on-the-spot quoting.
    `.trim();

    const userMessages = messages.filter((m) => m.role !== "system");
    const messagesWithSystem = [
    { role: "system", content: systemPrompt },
    ...userMessages,
    ];

    const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: messagesWithSystem,
    });

    const reply = completion.choices[0].message;
    res.json({ reply });
} catch (err) {
    console.error("Error in /api/chat/quote:", err);
    res.status(500).json({ error: "Error generating quote" });
}
});

const PORT = 3000;
app.listen(PORT, () => {
console.log(`Backend running at http://localhost:${PORT}`);
});
