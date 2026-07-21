"use client";

import { useEffect, useState } from "react";

// A single shared 1s ticker for ALL countdowns on the page (instead of one
// interval per card). Pauses while the tab is hidden; stops entirely when no
// component is subscribed.

type Sub = (now: number) => void;
const subs = new Set<Sub>();
let interval: ReturnType<typeof setInterval> | null = null;
let current = Date.now();

function tick() {
  current = Date.now();
  subs.forEach((fn) => fn(current));
}
function onVis() {
  if (!document.hidden) tick();
}
function ensure() {
  if (interval || typeof document === "undefined") return;
  interval = setInterval(() => {
    if (!document.hidden) tick();
  }, 1000);
  document.addEventListener("visibilitychange", onVis);
}
function teardown() {
  if (subs.size === 0 && interval) {
    clearInterval(interval);
    interval = null;
    document.removeEventListener("visibilitychange", onVis);
  }
}

/** Returns a `now` timestamp that updates once per second, shared globally. */
export function useNow(): number {
  const [now, setNow] = useState<number>(() => current);
  useEffect(() => {
    subs.add(setNow);
    ensure();
    setNow(Date.now());
    return () => {
      subs.delete(setNow);
      teardown();
    };
  }, []);
  return now;
}
