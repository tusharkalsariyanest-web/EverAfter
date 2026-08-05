import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { db } from "@/db";
import { users } from "@/db/schema";

import { eq } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, user.email),
      });

      if (!existingUser) {
        await db.insert(users).values({
          id: crypto.randomUUID(),
          name: user.name,
          email: user.email,
          image: user.image,
        });
      } else {
        await db
          .update(users)
          .set({
            name: user.name,
            image: user.image,
          })
          .where(eq(users.email, user.email));
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.email, user.email),
        });

        if (dbUser) {
          token.id = dbUser.id;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }

      return session;
    },
  },

  trustHost: true,
  secret: process.env.AUTH_SECRET,
});
