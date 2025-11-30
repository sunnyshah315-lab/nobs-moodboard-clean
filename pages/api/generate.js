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

function buildPrompt(input) {
  // Input is the structured form from AdvancedForm
  // We'll give the model clear instructions and include constraints
  return `
You are a senior home-textiles product & trend analyst writing for B2B buyers. You will receive a structured buyer brief (JSON). Produce ONLY valid JSON with keys:

- "rationale": a 3-6 paragraph market-specific explanation (use retail language, mention price-fit, materials, and manufacturability)
- "palette": array of 4 hex color strings (primary, neutral, accent, accent2)
- "products": array of 8 SKU-level product directions (short: "Product - material - finish - feature - target price")
- "manufacturing_notes": short bullet list of manufacturing considerations (MOQ, lead time, finishing, print/loom notes)

Here is the buyer brief:
${JSON.stringify(input, null, 2)}

Additional rules:
- Respect the buyer's materials and sustainability constraints.
- Keep product price guidance aligned to target_price_min/max if provided.
- If reference images are provided (uploads), mention "visual cues from uploads" in the rationale.
- Return only valid JSON, nothing else.
`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });
  const input = req.body || {};

  const prompt = buildPrompt(input);

  try {
    const resp = await client.chat.completions.create({
      model: "gpt-4o-mini", // change if you don't have access
      messages: [
        { role: "system", content: "You are an expert home-textiles trend analyst. Answer concisely and in JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.15,
      max_tokens: 900
    });

    const text = resp.choices?.[0]?.message?.content ?? "";
    const parsed = safeParseJSON(text);

    if (parsed) {
      // Normalize keys & limits
      parsed.rationale = parsed.rationale || "No rationale generated.";
      parsed.palette = Array.isArray(parsed.palette) && parsed.palette.length ? parsed.palette.slice(0,4) : ["#F7F5F2","#D9D6D1","#9AA6A3","#C4A69F"];
      parsed.products = Array.isArray(parsed.products) ? parsed.products.slice(0,8) : [];
      parsed.manufacturing_notes = parsed.manufacturing_notes || [];
      return res.status(200).json(parsed);
    } else {
      return res.status(200).json({
        rationale: text,
        palette: ["#F7F5F2","#D9D6D1","#9AA6A3","#C4A69F"],
        products: [],
        manufacturing_notes: []
      });
    }
  } catch (err) {
    console.error("OpenAI error:", err);
    return res.status(500).json({ error: "OpenAI request failed", details: err?.message || String(err) });
  }
}