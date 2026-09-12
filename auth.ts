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
      try {
        console.log("NextAuth signIn callback started for user:", user.email);
        if (!user.email) {
          console.error("No email provided by Google.");
          return false;
        }

        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, user.email),
        });

        if (!existingUser) {
          console.log("User not found, creating new user...");
          await db.insert(users).values({
            id: crypto.randomUUID(),
            name: user.name,
            email: user.email,
            image: user.image,
          });
          console.log("New user created successfully.");
        } else {
          console.log("User found, updating existing user...");
          await db
            .update(users)
            .set({
              name: user.name,
              image: user.image,
            })
            .where(eq(users.email, user.email));
          console.log("Existing user updated successfully.");
        }

        return true;
      } catch (error) {
        console.error("FATAL ERROR IN SIGNIN CALLBACK:", error);
        return false;
      }
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
  debug: true,
});
