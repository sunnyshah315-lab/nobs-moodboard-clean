// components/MoodboardCanvas.js
import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";

/**
 * Lightweight moodboard canvas:
 * - left: inputs + generate button
 * - right: moodboard preview canvas (palette + draggable cards)
 * - export PNG
 *
 * Props:
 * - onGenerate(form) -> calls parent to call API and return { palette, rationale, products }
 */
export default function MoodboardCanvas({ onGenerate, initialForm }) {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // draggable items state
  const [items, setItems] = useState([]);
  const [dragging, setDragging] = useState(null);
  const boardRef = useRef();

  useEffect(() => {
    // seed an empty base item
    setItems([]);
  }, []);

  async function handleGenerate(e) {
    e?.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await onGenerate(form);
      setResult(res);
      // create initial cards from products
      const newItems = (res.products || []).slice(0,6).map((p, i) => ({
        id: `p-${i}`,
        x: 20 + i*30,
        y: 40 + (i%3)*40,
        w: 200,
        h: 80,
        title: p
      }));
      setItems(newItems);
    } catch (err) {
      console.error(err);
      alert("Failed to generate — check console.");
    } finally {
      setLoading(false);
    }
  }

  function onMouseDown(e, id) {
    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDragging({ id, offsetX: x, offsetY: y });
  }

  function onMouseMove(e) {
    if (!dragging) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setItems(prev => prev.map(it => it.id === dragging.id ? { ...it, x: x - 20, y: y - 20 } : it));
  }

  function onMouseUp() {
    setDragging(null);
  }

  function addTextCard() {
    setItems(prev => [...prev, {
      id: `t-${Date.now()}`,
      x: 30,
      y: 30,
      w: 220,
      h: 70,
      title: "New note"
    }]);
  }

  async function exportPNG() {
    if (!boardRef.current) return;
    const canvas = await html2canvas(boardRef.current, { scale: 2, useCORS: true });
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `moodboard-${Date.now()}.png`;
    a.click();
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <form onSubmit={handleGenerate} className="p-4 bg-white rounded shadow-sm">
        <h3 className="font-semibold text-lg mb-3">Moodboard Inputs</h3>

        <label className="block text-sm">Target market</label>
        <select value={form.target_market} onChange={(e)=>setForm({...form,target_market:e.target.value})} className="mt-1 mb-3 w-full border p-2 rounded">
          <option>EU</option><option>US</option><option>UK</option><option>Australia</option>
        </select>

        <label className="block text-sm">Aesthetic</label>
        <select value={form.aesthetic} onChange={(e)=>setForm({...form,aesthetic:e.target.value})} className="mt-1 mb-3 w-full border p-2 rounded">
          <option>Scandinavian</option><option>Minimalist</option><option>Boho</option><option>Rustic</option>
        </select>

        <label className="block text-sm">Category</label>
        <input value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} className="mt-1 mb-3 w-full border p-2 rounded" />

        <label className="block text-sm">Materials</label>
        <input value={form.materials} onChange={(e)=>setForm({...form,materials:e.target.value})} className="mt-1 mb-3 w-full border p-2 rounded" />

        <label className="block text-sm">Price tier</label>
        <select value={form.price_tier} onChange={(e)=>setForm({...form,price_tier:e.target.value})} className="mt-1 mb-3 w-full border p-2 rounded">
          <option>Mid</option><option>Highstreet</option><option>Premium</option>
        </select>

        <label className="block text-sm">Notes</label>
        <textarea value={form.prompt} onChange={(e)=>setForm({...form,prompt:e.target.value})} className="mt-1 mb-3 w-full border p-2 rounded" rows={3} />

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-slate-800 text-white rounded">
            {loading ? "Generating..." : "Generate Moodboard"}
          </button>
          <button type="button" onClick={addTextCard} className="px-3 py-2 border rounded">Add note</button>
          <button type="button" onClick={exportPNG} className="px-3 py-2 border rounded">Export PNG</button>
        </div>

        {result && (
          <div className="mt-4 text-sm">
            <div className="font-semibold">Rationale</div>
            <div className="mt-2 whitespace-pre-wrap">{result.rationale}</div>
            <div className="font-semibold mt-3">Palette</div>
            <div className="flex gap-2 mt-2">
              {(result.palette||[]).map((c,i)=>(
                <div key={i} className="flex items-center gap-2">
                  <div style={{ background: c }} className="w-10 h-10 rounded border"></div>
                  <div className="text-xs">{c}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>

      <div
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        className="p-4 bg-white rounded shadow-sm"
      >
        <div ref={boardRef} className="relative bg-gray-50 rounded p-4" style={{ minHeight: 520 }}>
          {/* Palette */}
          <div className="flex gap-3 items-center mb-4">
            {(result?.palette||[]).map((c,i)=>(
              <div key={i} style={{ background:c }} className="w-14 h-14 rounded border"></div>
            ))}
            <div className="ml-4 text-sm">Preview</div>
          </div>

          {/* Draggable items */}
          {items.map(it => (
            <div
              key={it.id}
              onMouseDown={(e)=>onMouseDown(e,it.id)}
              style={{
                position: "absolute",
                left: it.x,
                top: it.y,
                width: it.w,
                minHeight: it.h,
                background: "white",
                boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
                padding: 12,
                borderRadius: 8,
                cursor: "grab"
              }}
            >
              <div className="font-semibold text-sm">{it.title}</div>
            </div>
          ))}

          {/* If no items show placeholder */}
          {items.length === 0 && (
            <div className="text-gray-400">No items yet — generate a moodboard to populate product ideas.</div>
          )}
        </div>

        {/* Small tips */}
        <div className="mt-3 text-xs text-gray-500">
          Drag cards to arrange. Export PNG to download the current canvas.
        </div>
      </div>
    </div>
  );
}