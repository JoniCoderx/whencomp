"use client";

import { useEffect, useState } from "react";
import { sfx, soundEnabled, setMuted } from "@/lib/sound";

export function SoundToggle() {
  const [muted, setMutedState] = useState(false);
  useEffect(() => setMutedState(!soundEnabled()), []);
  return (
    <button
      aria-label="קול"
      className="btn-ghost !px-3 !py-2 no-tap"
      onClick={() => {
        const next = !muted;
        setMuted(next);
        setMutedState(next);
        if (!next) sfx.success();
      }}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
