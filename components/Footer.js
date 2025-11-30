// components/Footer.js
export default function Footer({ textColor }) {
  return (
    <footer className="bg-gray-50 border-t" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
      <div className="max-w-7xl mx-auto px-6 py-8 text-sm" style={{ color: textColor }}>
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <div className="font-semibold mb-2">NO BS</div>
            <div>AI-powered sourcing for home & living buyers.</div>
          </div>
          <div className="flex gap-6">
            <div>
              <div className="font-semibold">Company</div>
              <div>About · Contact</div>
            </div>
            <div>
              <div className="font-semibold">Help</div>
              <div>Terms · Privacy</div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500">© {new Date().getFullYear()} NO BS — All rights reserved.</div>
      </div>
    </footer>
  );
}