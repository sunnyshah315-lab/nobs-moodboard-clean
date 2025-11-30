// components/Header.js (fixed for Next.js Link)
import Link from "next/link";

export default function Header({ logoUrl, primaryColor, textColor, navLinks = [] }) {
  return (
    <header style={{ borderBottom: `1px solid rgba(0,0,0,0.06)` }} className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/">
            {/* Use Link directly (no inner <a>) */}
            <img src={logoUrl} alt="logo" style={{ height: 36, cursor: "pointer" }} />
          </Link>

          <nav className="hidden md:flex gap-4 text-sm" style={{ color: textColor }}>
            {navLinks.map((l, i) => (
              <Link key={i} href={l.href} className="hover:underline">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/account" className="text-sm" style={{ color: textColor }}>Sign in</Link>
          <Link href="/cart" className="px-3 py-1 border rounded text-sm" style={{ borderColor: primaryColor, color: primaryColor }}>
            Cart
          </Link>
        </div>
      </div>
    </header>
  );
}