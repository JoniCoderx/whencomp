# WHEN COMP 🎯

לוח קומפים ל-Counter-Strike. קובעים קומפ, מאשרים הגעה, יודעים מי מגיע — הכל
מהטלפון, מהיר ואמין. אפליקציית מובייל (PWA) בעברית מלאה עם תצוגת RTL.

> A Hebrew-first, mobile-first PWA for scheduling Counter-Strike 5-stacks:
> see open comps, confirm attendance, manage a waitlist, chat per comp, and
> track reliability. **No paid APIs.**

---

## ✨ פיצ׳רים

- **לוח קומפים** — כרטיסים עם תאריך, שעה (שעון ישראל), ספירה לאחור חיה,
  מספר מקומות (X/5), נרשמים וסטטוס (פתוח / מלא / מתחיל בקרוב / הסתיים / בוטל).
- **הרשמה חכמה** — עד 5 שחקנים לקומפ, **רשימת המתנה** אוטומטית, קידום
  אוטומטי כשמתפנה מקום, מניעת הרשמה כפולה ומניעת חפיפה בין שני קומפים.
- **ביטול עם סיבה** — עד שעה לפני הקומפ; פחות משעה מסומן כ"ביטול מאוחר".
- **מדד אמינות** — לפי היסטוריית הגעה (הגיע / ביטל בזמן / ביטל מאוחר / לא הגיע).
- **עמוד קומפ** — משתתפים, רשימת המתנה, ספירה לאחור, **צ׳אט בזמן אמת** עם
  הודעות מערכת אוטומטיות (הצטרפות, ביטול, נשאר מקום אחד…).
- **שיתוף** — כפתור WhatsApp עם טקסט מוכן שמתעדכן לבד, קובץ ICS ליומן
  (אייפון / Google / Outlook) עם התראה שעה לפני, ו-Web Share.
- **דיסקורד** — כפתור קבוע לשרת, וכפתור בקומפ רק אם היוצר הוסיף קישור.
- **התראות** — מרכז התראות פנימי + בקשת הרשאת התראות מהמכשיר.
- **פרופיל** — קומפים קרובים, היסטוריה, סטטיסטיקת הגעה, Steam/Discord,
  עריכה ומחיקת חשבון.
- **אחרי הקומפ** — שאלון קצר (דירוג, MVP, הערה) + סיכום.
- **פאנל אדמין** — ניהול משתמשים (הרשאות, חסימה, השתקה, השעיה, מחיקה),
  ניהול קומפים, צפייה בביטולים, הודעת מערכת לכולם, ו-Audit Log.
- **PWA** — התקנה למסך הבית, Bottom Navigation, מצב offline בסיסי.

## 🧱 Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion ·
Prisma + PostgreSQL (Neon) · NextAuth (Credentials). ללא שירותים בתשלום.

## 🚀 התקנה מקומית

```bash
npm install
cp .env.example .env          # ערכו את DATABASE_URL ו-NEXTAUTH_SECRET
npm run db:push               # יצירת הטבלאות
npm run db:seed               # נתוני דמו (רק לפיתוח!)
npm run dev                   # http://localhost:3000
```

**כניסת אדמין לדמו:** `Neo` / `password123`
בפרודקשן, **המשתמש הראשון שנרשם הופך אוטומטית לאדמין** (אין seed בפרודקשן).

## 🌍 משתני סביבה

ראו [`.env.example`](./.env.example). הנדרשים:

| Key | תיאור |
| --- | --- |
| `DATABASE_URL` | מחרוזת חיבור ל-Neon (Postgres). השתמשו ב-**direct** (לא pooled). |
| `NEXTAUTH_SECRET` | מחרוזת אקראית ארוכה |
| `NEXTAUTH_URL` | כתובת ה-deploy, למשל `https://whencomp.onrender.com` |
| `NEXT_PUBLIC_DISCORD_URL` | (אופציונלי) קישור לשרת הדיסקורד שלכם |

**אין מפתחות AI / OpenAI.**

## ☁️ Deploy (Render + Neon)

- מסד נתונים חינמי ב-[Neon](https://neon.tech) (Postgres) — הנתונים נשמרים בין
  deploys. הדביקו את מחרוזת החיבור ל-`DATABASE_URL`.
- הפרויקט כולל [`Dockerfile`](./Dockerfile). ה-container מריץ `prisma db push`
  באתחול (יוצר טבלאות, לא מוחק נתונים) ואז `next start`.
- ה-seed **אינו** רץ אוטומטית — נתוני דמו רק לפיתוח.

## 🔒 אבטחה ואיכות

ולידציה בצד לקוח ובצד שרת (zod) · עמודי אדמין מוגנים ברמת השרת ·
Transaction בהצטרפות לקומפ (מונע Race על המקום החמישי) · Rate limiting
(כניסה / צ׳אט / יצירה) · הודעות צ׳אט מוצגות כטקסט בלבד (הגנת XSS) ·
תאריכים נשמרים ב-UTC ומוצגים לפי Asia/Jerusalem · מצבי Loading / Empty /
Error / Success בכל עמוד.

## 📁 מבנה

```
prisma/schema.prisma   User / Match / Participant / Message / Notification / AuditLog / Rating
src/app/               עמודים ו-API routes (matches, join, cancel, messages, notifications, admin, profile)
src/components/        Navbar, BottomNav, Hero, MatchCard, LobbyView, ChatBox, CompActions, AdminPanel, ...
src/lib/               prisma, auth, admin, notify, ratelimit, reliability, share, format, sound
```
