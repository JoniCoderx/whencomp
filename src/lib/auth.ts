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
      },
      async authorize(credentials) {
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
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
        (session.user as any).role = token.role;
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
