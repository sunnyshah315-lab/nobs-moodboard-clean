// pages/index.js
import Header from "../components/Header";
import Footer from "../components/Footer";
import MoodboardCanvas from "../components/MoodboardCanvas";
import AdvancedForm from "../components/AdvancedForm";
import { useCallback, useState } from "react";

const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL || "/logo.png";
const primaryColor = process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#0f172a";
const textColor = process.env.NEXT_PUBLIC_TEXT_COLOR || "#111827";

let navLinks = [];
try {
  navLinks = JSON.parse(process.env.NEXT_PUBLIC_NAV_LINKS || '[]');
} catch (e) { navLinks = [{ label: "Home", href: "/" }]; }

export default function Home() {
  const [latestResult, setLatestResult] = useState(null);

  const onGenerate = useCallback(async (form) => {
    const resp = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(txt || "API error");
    }
    const json = await resp.json();
    setLatestResult(json);
    return json;
  }, []);

  const initialForm = {
    target_market: "EU",
    category: "Table & Kitchen Linen",
    subcategories: ["Napkins"],
    materials: ["Linen"],
    notes: ""
  };

  return (
    <div style={{ fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
      <Header logoUrl={logoUrl} primaryColor={primaryColor} textColor={textColor} navLinks={navLinks} />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-4">AI Moodboard Creator</h1>
        <p className="text-sm text-gray-600 mb-6">Use detailed inputs to generate buyer-ready moodboards.</p>

        <div className="grid md:grid-cols-2 gap-6">
          <AdvancedForm onSubmit={onGenerate} initial={initialForm} />
          <div>
            <MoodboardCanvas result={latestResult} initialItems={[]} />
            {latestResult && (
              <div className="mt-4 bg-white p-4 rounded shadow-sm">
                <h3 className="font-semibold">Latest generated output</h3>
                <div className="mt-2"><strong>Palette:</strong> {(latestResult.palette||[]).join(", ")}</div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer textColor={textColor} />
    </div>
  );
}