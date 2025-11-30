// pages/api/generate.js
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function safeParseJSON(text) {
  try { return JSON.parse(text); } catch (e) {
    const m = text.match(/\{[\s\S]*\}$/);
    if (m) {
      try { return JSON.parse(m[0]); } catch (e2) { /* fallthrough */ }
    }
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });
  const input = req.body || {};

  // Build a strict prompt that asks for JSON-only output
  const prompt = `
You are a senior product & design analyst for home textiles. Receive the buyer inputs and produce a JSON response ONLY.

Input:
${JSON.stringify(input, null, 2)}

Produce ONLY valid JSON with keys:
- "rationale": string (3-6 short paragraphs, market-specific reasoning)
- "palette": array of 4 hex color strings (primary, neutral, accent, accent2)
- "products": array of 8 short product-direction strings (SKU ideas)
Example output:
{
  "rationale":"...text...",
  "palette":["#F7F5F2","#D9D6D1","#9AA6A3","#C4A69F"],
  "products":["Linen napkin - oatmeal stripe","Herringbone placemat - natural", "..."]
}

Return only this JSON and nothing else.
`;

  try {
    const resp = await client.chat.completions.create({
      model: "gpt-4o-mini",      // change to a model you have access to, e.g., "gpt-4" or "gpt-3.5-turbo"
      messages: [
        { role: "system", content: "You are an expert home-textiles trend analyst. Answer concisely and in JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.15,
      max_tokens: 700
    });

    const text = resp.choices?.[0]?.message?.content ?? "";
    const parsed = safeParseJSON(text);

    if (parsed) {
      // Basic validation / defaults if missing keys
      parsed.rationale = parsed.rationale || "No rationale generated.";
      parsed.palette = Array.isArray(parsed.palette) && parsed.palette.length ? parsed.palette.slice(0,4) : ["#F7F5F2","#D9D6D1","#9AA6A3","#C4A69F"];
      parsed.products = Array.isArray(parsed.products) ? parsed.products.slice(0,8) : [];
      return res.status(200).json(parsed);
    } else {
      // Fallback: return raw text in rationale and default palette
      return res.status(200).json({
        rationale: text,
        palette: ["#F7F5F2","#D9D6D1","#9AA6A3","#C4A69F"],
        products: []
      });
    }
  } catch (err) {
    console.error("OpenAI error:", err);
    const message = err?.message || String(err);
    return res.status(500).json({ error: "OpenAI request failed", details: message });
  }
}