// components/MoodboardCanvas.js
import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";

/**
 * MoodboardCanvas (visual-only)
 *
 * Props:
 *  - result: the latest AI output { palette, rationale, products }
 *  - initialItems (optional): seed items
 *
 * The component does NOT accept onGenerate or show any input controls.
 */
export default function MoodboardCanvas({ result, initialItems = [] }) {
  const [items, setItems] = useState(initialItems || []);
  const [dragging, setDragging] = useState(null);
  const boardRef = useRef();

  useEffect(() => {
    // When a new AI result arrives, seed the canvas with product cards
    if (result && Array.isArray(result.products)) {
      const newItems = result.products.slice(0, 6).map((p, i) => ({
        id: `p-${Date.now()}-${i}`,
        x: 20 + i * 30,
        y: 40 + (i % 3) * 60,
        w: 220,
        h: 90,
        title: p
      }));
      setItems(newItems);
    }
  }, [result]);

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
      w: 240,
      h: 80,
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
    <div onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
      <div className="p-4 bg-white rounded shadow-sm mb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-semibold">Moodboard Preview</div>
            <div className="text-xs text-gray-500">Drag cards to arrange. Use Export to download PNG.</div>
          </div>
          <div className="flex gap-2">
            <button onClick={addTextCard} className="px-3 py-2 border rounded">Add note</button>
            <button onClick={exportPNG} className="px-3 py-2 border rounded">Export PNG</button>
          </div>
        </div>

        <div ref={boardRef} className="relative bg-gray-50 rounded p-4" style={{ minHeight: 520 }}>
          {/* Palette preview */}
          <div className="flex gap-3 items-center mb-4">
            {(result?.palette||[]).map((c,i)=>(
              <div key={i} style={{ background:c }} className="w-14 h-14 rounded border"></div>
            ))}
            <div className="ml-4 text-sm">Palette</div>
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

          {items.length === 0 && (
            <div className="text-gray-400">No items yet — generate a moodboard from the buyer inputs to populate product ideas.</div>
          )}
        </div>
      </div>

      {/* Rationale preview (collapsed) */}
      {result?.rationale && (
        <div className="bg-white p-4 rounded shadow-sm text-sm">
          <div className="font-semibold mb-2">Rationale</div>
          <div className="whitespace-pre-wrap text-gray-700">{result.rationale}</div>
        </div>
      )}
    </div>
  );
}