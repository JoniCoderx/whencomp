import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-display text-6xl font-black text-brand-500 text-brand-glow">404</p>
      <p className="mt-3 text-slate-400">הקומפ הזה לא קיים — או שכבר הסתיים.</p>
      <Link href="/" className="btn-primary mt-6">חזרה לבית</Link>
    </div>
  );
}
