// Simple, non-punitive reliability meter derived from attendance history.

export interface AttendanceStats {
  arrived: number;
  cancelledOnTime: number;
  cancelledLate: number;
  noShow: number;
  total: number;
}

export interface Reliability {
  level: "high" | "medium" | "low" | "new";
  label: string;
  color: string;
  score: number; // 0-100
}

export function computeReliability(s: AttendanceStats): Reliability {
  const graded = s.arrived + s.cancelledOnTime + s.cancelledLate + s.noShow;
  if (graded < 3) {
    return { level: "new", label: "חדש", color: "#94a3b8", score: 100 };
  }
  // Weighted: arrived + on-time cancels are fine; late cancels/no-shows hurt.
  const good = s.arrived + s.cancelledOnTime * 0.85;
  const score = Math.round(
    Math.max(0, Math.min(100, (good / graded) * 100 - s.noShow * 4))
  );
  if (score >= 80) return { level: "high", label: "אמינות גבוהה", color: "#22c55e", score };
  if (score >= 55) return { level: "medium", label: "אמינות בינונית", color: "#f59e0b", score };
  return { level: "low", label: "אמינות נמוכה", color: "#ef4444", score };
}

export function attendanceFromParticipations(
  parts: { status: string; outLate: boolean; attendance: string | null; match: { status: string } }[]
): AttendanceStats {
  const s: AttendanceStats = { arrived: 0, cancelledOnTime: 0, cancelledLate: 0, noShow: 0, total: parts.length };
  for (const p of parts) {
    if (p.status === "OUT") {
      if (p.outLate) s.cancelledLate++;
      else s.cancelledOnTime++;
    } else if (p.match.status === "COMPLETED") {
      if (p.attendance === "NOSHOW") s.noShow++;
      else s.arrived++; // confirmed + completed defaults to arrived
    }
  }
  return s;
}
