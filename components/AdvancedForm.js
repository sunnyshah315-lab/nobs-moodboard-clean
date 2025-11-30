// components/AdvancedForm.js
import { useState, useRef } from "react";
import { CATEGORY_MAP } from "../lib/categoryMap";

const DEFAULTS = {
  target_market: "EU",
  // (visual/moodboard inputs removed: design_style, color_personality, season)
  category: Object.keys(CATEGORY_MAP)[0] || "Table & Kitchen Linen",
  subcategories: CATEGORY_MAP[Object.keys(CATEGORY_MAP)[0]]?.subcategories?.slice(0,1) || ["Napkins"],
  materials: CATEGORY_MAP[Object.keys(CATEGORY_MAP)[0]]?.materials?.slice(0,1) || ["Linen"],
  // business fields commented out
  // moq: "Medium",
  // lead_time: "60-75 days",
  // sustainability: [],
  // target_price_min: "",
  // target_price_max: "",
  notes: ""
};

const MARKETS = ["EU", "US", "UK", "Australia", "Middle East"];

export default function AdvancedForm({ onSubmit, initial = {} }) {
  const init = { ...DEFAULTS, ...initial };
  const [form, setForm] = useState(init);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileRef = useRef();

  // Helper: get allowed lists based on selected category
  const currentMap = CATEGORY_MAP[form.category] || { subcategories: [], materials: [] };
  const availableSubcats = currentMap.subcategories || [];
  const availableMaterials = currentMap.materials || [];

  function toggleArrayField(key, value) {
    setForm(f => {
      const arr = Array.isArray(f[key]) ? [...f[key]] : [];
      const idx = arr.indexOf(value);
      if (idx === -1) arr.push(value);
      else arr.splice(idx,1);
      return { ...f, [key]: arr };
    });
  }

  function setSingle(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function handleAddTag(key, value) {
    if (!value) return;
    setForm(f => {
      const arr = Array.isArray(f[key]) ? [...f[key]] : [];
      if (!arr.includes(value)) arr.push(value);
      return { ...f, [key]: arr };
    });
  }

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    const previews = [];
    for (let i=0;i<Math.min(files.length,4);i++) {
      const file = files[i];
      if (file.size > 1.5 * 1024 * 1024) {
        previews.push({ name: file.name, warning: "File too large (>1.5MB). Skipped." });
        continue;
      }
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      previews.push({ name: file.name, dataUrl });
    }
    setImagePreviews(previews);
    setForm(f => ({ ...f, uploads: previews }));
    if (fileRef.current) fileRef.current.value = "";
  }

  function onCategoryChange(value) {
    setForm(prev => {
      const map = CATEGORY_MAP[value] || { subcategories: [], materials: [] };
      const allowedSubcats = map.subcategories || [];
      const allowedMaterials = map.materials || [];

      const currentSubs = Array.isArray(prev.subcategories) ? prev.subcategories : [];
      const currentMats = Array.isArray(prev.materials) ? prev.materials : [];

      const intersectionSubs = currentSubs.filter(s => allowedSubcats.includes(s));
      const intersectionMats = currentMats.filter(m => allowedMaterials.includes(m));

      const next = {
        ...prev,
        category: value,
        subcategories: intersectionSubs.length ? intersectionSubs : (allowedSubcats.length ? [allowedSubcats[0]] : []),
        materials: intersectionMats.length ? intersectionMats : (allowedMaterials.length ? [allowedMaterials[0]] : [])
      };

      // Removed alert/pop-up — selections that are invalid are silently adjusted
      return next;
    });
  }

  function handleSubmit(e) {
    e?.preventDefault();
    if (!form.category || !form.materials || form.materials.length === 0) {
      alert("Please choose at least one material.");
      return;
    }
    const payload = { ...form };
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow-sm space-y-4">
      <h3 className="font-semibold text-lg">Detailed Buyer Inputs</h3>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs">Target Market</label>
          <select value={form.target_market} onChange={e=>setSingle("target_market", e.target.value)} className="mt-1 w-full border p-2 rounded">
            {MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Visual/moodboard inputs removed here intentionally */}
      </div>

      {/* Category (dynamic) */}
      <div>
        <label className="block text-xs">Category</label>
        <select value={form.category} onChange={e=>onCategoryChange(e.target.value)} className="mt-1 w-full border p-2 rounded">
          {Object.keys(CATEGORY_MAP).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Subcategories (dynamic) */}
      <div>
        <label className="block text-xs">Sub-categories (click to toggle)</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {availableSubcats.map(s => {
            const active = form.subcategories.includes(s);
            return (
              <button type="button" key={s}
                onClick={() => toggleArrayField("subcategories", s)}
                className={`px-3 py-1 rounded text-sm ${active ? "bg-slate-800 text-white" : "border"}`}>
                {s}
              </button>
            );
          })}
          <button type="button" onClick={() => {
            const custom = prompt("Add custom subcategory:");
            if (custom) handleAddTag("subcategories", custom);
          }} className="px-3 py-1 border rounded text-sm">+ Add</button>
        </div>
      </div>

      {/* Materials (dynamic) */}
      <div>
        <label className="block text-xs">Materials (select multiple)</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {availableMaterials.map(m => {
            const active = (form.materials || []).includes(m);
            return (
              <button type="button" key={m}
                onClick={() => toggleArrayField("materials", m)}
                className={`px-3 py-1 rounded text-sm ${active ? "bg-slate-800 text-white" : "border"}`}>
                {m}
              </button>
            );
          })}
          <button type="button" onClick={() => {
            const custom = prompt("Add custom material:");
            if (custom) handleAddTag("materials", custom);
          }} className="px-3 py-1 border rounded text-sm">+ Add</button>
        </div>
      </div>

      {/* business fields remain commented out for now */}

      <div>
        <label className="block text-xs">Notes / Inspiration</label>
        <textarea value={form.notes} onChange={e=>setSingle("notes", e.target.value)} rows={4} className="mt-1 w-full border p-2 rounded" placeholder="Describe the buyer intent, references, must-haves, avoid..."/>
      </div>

      <div>
        <label className="block text-xs">Upload up to 4 reference images (small, ≤1.5MB each)</label>
        <input ref={fileRef} onChange={handleFiles} type="file" accept="image/*" multiple className="mt-1" />
        <div className="mt-2 flex gap-2 flex-wrap">
          {imagePreviews.map((p,i)=>(
            <div key={i} className="w-28 text-xs">
              {p.dataUrl ? <img src={p.dataUrl} alt={p.name} className="w-28 h-20 object-cover rounded border" /> : <div className="h-20 w-28 rounded border bg-gray-100 flex items-center justify-center text-xs p-2">{p.warning || p.name}</div>}
              <div className="truncate">{p.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button className="px-4 py-2 bg-slate-800 text-white rounded" type="submit">Generate Moodboard</button>
        <button type="button" onClick={() => { setForm(DEFAULTS); setImagePreviews([]); }} className="px-3 py-2 border rounded">Reset</button>
      </div>
    </form>
  );
}