"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="he" dir="rtl">
      <body style={{ background: "#0b0d10", color: "#e2e8f0", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: "#f59e0b" }}>WHEN COMP</h1>
          <p style={{ color: "#94a3b8", maxWidth: 320 }}>משהו השתבש לרגע. נסו לרענן.</p>
          <button onClick={() => reset()} style={{ background: "#f59e0b", color: "#0b0d10", border: 0, borderRadius: 12, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}>
            רענון
          </button>
        </div>
      </body>
    </html>
  );
}
