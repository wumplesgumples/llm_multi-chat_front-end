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
Your job is to calculate quotes based on room types and their square footages using the company's production-rate-based pricing model.

=====================================================
ROOM CATEGORY PRICING RULES
=====================================================

🟢 CATEGORY 1 — LEAST EFFORT  
Rate: $0.10 per sq ft  
Includes:
- Hallways & Corridors
- Stairwells
- Elevators
- Entry/Exit Areas (light-use)
- Office Areas (Light Use)
- Shared desks
- Hot desks
- Light-use cubicles (surface wipe + trash only)

🟡 CATEGORY 2 — AVERAGE EFFORT  
Rate: $0.15 per sq ft  
Includes:
- Lobby / Reception Area
- Private Offices
- Executive Offices
- Office Areas (Full Clean)
- Full cubicles (wipe-down + vacuum)
- Meeting / Training Rooms
- Break Room / Lunch Room (daily clean)
- Kitchenette (daily upkeep)

🔴 CATEGORY 3 — HIGH EFFORT  
Rate: $0.20 per sq ft  
Includes:
- Restrooms  
- Kitchenette (deep clean)
- Break Room (heavy use or spills)
- Entry Areas During Bad Weather
- Loading Dock Entrance (heavy traffic)
- Meeting/Training Rooms After Food Events
- Any area requiring sanitizing or heavy scrubbing

=====================================================
INSTRUCTIONS FOR HOW TO QUOTE
=====================================================

1. When the user gives a room like:  
    "Restroom – 750 sqft" or "Lobby - 1000 square feet", extract:
    - room type
    - square footage

2. Match the room type to the correct category:
    - If the name closely matches any item in Category 1/2/3, use that category’s rate.
    - If unclear, ask a clarification question.

3. For each room:
    - Identify category
    - Identify rate
    - Calculate: price = sqft × rate  
    - Round prices to 2 decimals  
    - Round sqft to nearest whole number if needed

4. For the full quote:
    - Sum all room totals
    - Provide GRAND TOTAL

5. Output format (always use this structure):

----------------------------------------------------
ROOM-BY-ROOM BREAKDOWN
Room Name: _______
Category: _______
Rate: $___ / sq ft
Sq Ft: ____
Price: $____

(repeat for each room)

----------------------------------------------------
TOTALS
Total Sq Ft: _____
Grand Total: $_____

----------------------------------------------------
SALESPERSON SUMMARY
Provide a short 1–3 sentence summary they can read to the client.
----------------------------------------------------

6. If the user is missing room names OR square footage:
    - Ask targeted follow-up questions.

7. NEVER invent rates or new categories not listed above.

Your tone: Clear, professional, direct.  
Your goal: Help a salesperson quote quickly and confidently on the spot.
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});