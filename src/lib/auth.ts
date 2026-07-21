import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const COLORS = ["#f59e0b", "#ff4655", "#84cc16", "#22d3ee", "#fbbf24", "#8b5cf6"];

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        register: { label: "Register", type: "text" },
        guest: { label: "Guest", type: "text" },
        guestName: { label: "GuestName", type: "text" },
      },
      async authorize(credentials) {
        // ---- Anonymous guest sign-in ----
        if (credentials?.guest === "true") {
          const n = 100 + Math.floor(Math.random() * 900);
          const display = (credentials?.guestName?.trim() || `אורח ${n}`).slice(0, 24);
          const guest = await prisma.user.create({
            data: {
              username: `guest_${randomId()}`, // internal, never shown
              displayName: display,
              passwordHash: "-", // no password login for guests
              role: "USER", // guests are never admins
              isGuest: true,
              avatarColor: COLORS[n % COLORS.length],
            },
          });
          return {
            id: guest.id,
            name: guest.displayName,
            username: guest.username,
            role: "USER",
            isGuest: true,
            avatarColor: guest.avatarColor,
            avatarUrl: null,
          } as any;
        }

        const username = credentials?.username?.trim();
        const password = credentials?.password ?? "";
        const isRegister = credentials?.register === "true";
        if (!username || !password) return null;

        let user = await prisma.user.findUnique({ where: { username } });

        if (isRegister) {
          if (user) throw new Error("שם המשתמש כבר תפוס");
          if (password.length < 4)
            throw new Error("הסיסמה חייבת להיות לפחות 4 תווים");
          const passwordHash = await bcrypt.hash(password, 10);
          // Bootstrap: the very first user to register becomes ADMIN.
          const userCount = await prisma.user.count();
          user = await prisma.user.create({
            data: {
              username,
              displayName: username,
              passwordHash,
              role: userCount === 0 ? "ADMIN" : "USER",
              avatarColor: COLORS[Math.floor(Math.abs(hashCode(username)) % COLORS.length)],
            },
          });
        } else {
          if (!user) throw new Error("לא נמצא חשבון — נסו להירשם");
          const ok = await bcrypt.compare(password, user.passwordHash);
          if (!ok) throw new Error("סיסמה שגויה");
        }

        if (user.status === "BANNED") throw new Error("החשבון חסום");

        return {
          id: user.id,
          name: user.displayName ?? user.username,
          username: user.username,
          role: user.role,
          isGuest: user.isGuest,
          avatarColor: user.avatarColor,
          avatarUrl: user.avatarUrl ?? null,
        } as any;
      },
    }),
    // Placeholder for Steam OAuth. Steam uses OpenID 2.0 which needs a custom
    // provider adapter; wire STEAM_API_KEY and a provider here when ready.
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.username = (user as any).username;
        token.role = (user as any).role;
        token.isGuest = (user as any).isGuest ?? false;
        token.avatarColor = (user as any).avatarColor;
        token.avatarUrl = (user as any).avatarUrl ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
        (session.user as any).role = token.role;
        (session.user as any).isGuest = token.isGuest ?? false;
        (session.user as any).avatarColor = token.avatarColor;
        (session.user as any).avatarUrl = token.avatarUrl ?? null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET ?? "when-comp-dev-secret-change-me",
};

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h;
}

function randomId(): string {
  // 12 hex chars, unique enough for a guest username.
  let s = "";
  for (let i = 0; i < 12; i++) s += Math.floor(Math.random() * 16).toString(16);
  return s + Date.now().toString(36);
}
