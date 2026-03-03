
import NextAuth, { User } from "next-auth";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import { Adapter } from "next-auth/adapters";
import { UserRole } from '@prisma/client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const handler = NextAuth({
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }) as Adapter,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        phone: { label: "Phone", type: "text" },
        role: { label: "Role", type: "text" },
        isSignUp: { label: "Is Sign Up", type: "text" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials) {
          throw new Error("No credentials provided.");
        }

        // =================================================================
        // SIGN UP LOGIC
        // =================================================================
        if (credentials.isSignUp === 'true') {
          if (!credentials.email || !credentials.password || !credentials.name || !credentials.role) {
            throw new Error("Missing fields for sign up.");
          }

          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
              data: {
                name: credentials.name,
                phone: credentials.phone,
                role: credentials.role,
              },
            },
          });

          if (authError || !authData.user) {
            console.error("Supabase Sign Up Error:", authError?.message);
            throw new Error(`AUTH_SIGNUP_ERROR: ${authError?.message || "Could not create user."}`);
          }

          const user = authData.user;
          let profileTable = "";
          let profileData: any = {};

          switch (credentials.role) {
            case "CUSTOMER":
              profileTable = "customers";
              profileData = { userId: user.id, phone: credentials.phone };
              break;
            case "WALKER":
              profileTable = "walkers";
              profileData = { userId: user.id, name: credentials.name, phone: credentials.phone, pricePerHour: 0 };
              break;
            case "SELLER":
              profileTable = "sellers";
              profileData = { userId: user.id, storeName: credentials.name, phone: credentials.phone };
              break;
            default:
              await supabase.auth.admin.deleteUser(user.id);
              throw new Error("Invalid user role provided.");
          }

          const { error: profileError } = await supabase.from(profileTable).insert(profileData);

          if (profileError) {
            console.error("Profile Creation Error:", profileError.message);
            await supabase.auth.admin.deleteUser(user.id);
            throw new Error(`PROFILE_CREATION_ERROR: ${profileError.message}`);
          }

          return {
            id: user.id,
            email: user.email!,
            name: user.user_metadata.name,
            role: user.user_metadata.role as UserRole,
          };
        }

        // =================================================================
        // SIGN IN LOGIC
        // =================================================================
        if (!credentials.email || !credentials.password) {
          throw new Error("Email and password are required for sign in.");
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error || !data.user) {
          return null;
        }

        return {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata.name,
          role: data.user.user_metadata.role as UserRole,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as UserRole;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };
