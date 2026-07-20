import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-display text-6xl font-bold text-neon-purple text-glow">404</p>
      <p className="mt-3 text-slate-400">This lobby doesn&apos;t exist — or the match already ended.</p>
      <Link href="/" className="btn-primary mt-6">
        Back to base
      </Link>
    </div>
  );
}
