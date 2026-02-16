import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  const start = Date.now();

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { input, stage } = req.body;

    if (!input || input.length < 5) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const systemPrompt =
      stage === 2
        ? "You are a brutally honest business analyst. Destroy weak logic. Expose unrealistic assumptions. No sugarcoating."
        : "You are a realistic business analyst. Evaluate ideas critically but constructively.";

    let response;

    try {
      response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.4,
        max_tokens: 1500,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input },
        ],
      });
    } catch (err) {
      response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.4,
        max_tokens: 1500,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input },
        ],
      });
    }

    const output = response.choices[0].message.content;

    if (!output) {
      return res.status(500).json({ error: "Empty model response" });
    }

    const duration = Date.now() - start;

    console.log({
      timestamp: new Date().toISOString(),
      stage,
      inputLength: input.length,
      outputLength: output.length,
      tokens: response.usage?.total_tokens,
      duration,
    });

    return res.status(200).json({ result: output });
  } catch (error) {
    console.error("Analyze error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

