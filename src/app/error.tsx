"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("App error boundary:", error);
  }, [error]);
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="font-display text-4xl font-black text-brand-500 text-brand-glow">אופס</p>
      <p className="max-w-xs text-slate-400">משהו השתבש לרגע. נסו שוב.</p>
      <button onClick={() => reset()} className="btn-primary">נסו שוב</button>
    </div>
  );
}
