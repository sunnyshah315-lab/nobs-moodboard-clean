// pages/index.js
import Header from "../components/Header";
import Footer from "../components/Footer";
import MoodboardCanvas from "../components/MoodboardCanvas";
import { useCallback } from "react";

const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL || "/logo.png";
const primaryColor = process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#0f172a";
const textColor = process.env.NEXT_PUBLIC_TEXT_COLOR || "#111827";

// parse nav links env if present
let navLinks = [];
try {
  navLinks = JSON.parse(process.env.NEXT_PUBLIC_NAV_LINKS || '[]');
} catch (e) {
  navLinks = [{ label: "Home", href: "/" }];
}

export default function Home() {
  // the onGenerate callback calls API route
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
    return json;
  }, []);

  const initialForm = {
    target_market: "EU",
    aesthetic: "Scandinavian",
    category: "Table & Kitchen Linen",
    materials: "Linen, Linen-cotton",
    season: "SS 2026",
    price_tier: "Mid",
    prompt: ""
  };

  return (
    <div style={{ fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
      <Header logoUrl={logoUrl} primaryColor={primaryColor} textColor={textColor} navLinks={navLinks} />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-4">AI Moodboard Creator</h1>
        <p className="text-sm text-gray-600 mb-6">Generate trend-led moodboards and produce product directions, palettes and quick previews — all in one place.</p>

        <MoodboardCanvas onGenerate={onGenerate} initialForm={initialForm} />
      </main>

      <Footer textColor={textColor} />
    </div>
  );
}