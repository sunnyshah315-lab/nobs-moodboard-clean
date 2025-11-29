import { useState, useRef } from "react";
import html2canvas from "html2canvas";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    target_market: "EU",
    aesthetic: "Scandinavian",
    category: "Table & Kitchen Linen",
    materials: "Linen, Linen-cotton",
    season: "SS 2026",
    price_tier: "Mid",
    prompt: ""
  });
  const boardRef = useRef();

  async function handleGenerate(e) {
    e?.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await resp.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error calling API. Check console.");
    } finally {
      setLoading(false);
    }
  }

  async function exportPNG() {
    if (!boardRef.current) return;
    const canvas = await html2canvas(boardRef.current, { scale: 2 });
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `moodboard-${Date.now()}.png`;
    a.click();
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-4">NO BS — AI Moodboard Creator</h1>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">Target Market</label>
            <select value={form.target_market}
              onChange={(e)=>setForm({...form, target_market:e.target.value})}
              className="mt-1 w-full border p-2 rounded">
              <option>EU</option>
              <option>US</option>
              <option>UK</option>
              <option>Australia</option>
            </select>
          </div>

          <div>
            <label className="block text-sm">Aesthetic</label>
            <select value={form.aesthetic}
              onChange={(e)=>setForm({...form, aesthetic:e.target.value})}
              className="mt-1 w-full border p-2 rounded">
              <option>Scandinavian</option>
              <option>Minimalist</option>
              <option>Boho</option>
              <option>Rustic</option>
            </select>
          </div>

          <div>
            <label className="block text-sm">Category</label>
            <input className="mt-1 w-full border p-2 rounded" value={form.category}
              onChange={(e)=>setForm({...form, category:e.target.value})}/>
          </div>

          <div>
            <label className="block text-sm">Materials</label>
            <input className="mt-1 w-full border p-2 rounded" value={form.materials}
              onChange={(e)=>setForm({...form, materials:e.target.value})}/>
          </div>

          <div>
            <label className="block text-sm">Season</label>
            <select value={form.season}
              onChange={(e)=>setForm({...form, season:e.target.value})}
              className="mt-1 w-full border p-2 rounded">
              <option>SS 2026</option>
              <option>AW 2026</option>
              <option>Evergreen</option>
            </select>
          </div>

          <div>
            <label className="block text-sm">Price Tier</label>
            <select value={form.price_tier}
              onChange={(e)=>setForm({...form, price_tier:e.target.value})}
              className="mt-1 w-full border p-2 rounded">
              <option>Highstreet</option>
              <option>Mid</option>
              <option>Premium</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm">Optional prompt (mood / notes)</label>
            <textarea className="mt-1 w-full border p-2 rounded" rows={3}
              value={form.prompt}
              onChange={(e)=>setForm({...form, prompt:e.target.value})}/>
          </div>

          <div className="md:col-span-2 flex gap-3">
            <button type="submit" disabled={loading}
              className="px-4 py-2 bg-slate-800 text-white rounded">
              {loading ? "Generating..." : "Generate Moodboard"}
            </button>
            <button type="button" onClick={()=>setResult(null)} className="px-4 py-2 border rounded">Reset</button>
          </div>
        </form>

        <div className="mt-6">
          {result && (
            <div>
              <div className="flex justify-between items-start gap-4">
                <h2 className="text-xl font-semibold">Generated Moodboard</h2>
                <div className="flex gap-2">
                  <button className="px-3 py-1 border rounded" onClick={exportPNG}>Export PNG</button>
                </div>
              </div>

              <div ref={boardRef} className="mt-4 bg-gray-50 p-6 rounded">
                {/* Palette */}
                <div className="flex gap-4 items-center">
                  {result.palette?.map((c, i)=>(
                    <div key={i} className="flex items-center gap-2">
                      <div style={{background:c}} className="w-16 h-16 rounded border"></div>
                      <div className="text-sm">{c}</div>
                    </div>
                  ))}
                </div>

                {/* Rationale and product ideas */}
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold">Rationale</h3>
                    <div className="mt-2 text-sm whitespace-pre-wrap">{result.rationale}</div>
                  </div>

                  <div>
                    <h3 className="font-semibold">Suggested Product Directions</h3>
                    <ul className="mt-2 list-disc ml-5 text-sm">
                      {result.products?.map((p,i)=> <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}