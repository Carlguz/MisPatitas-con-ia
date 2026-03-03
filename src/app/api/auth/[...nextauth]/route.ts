
import NextAuth from "next-auth"
import { SupabaseAdapter } from "@auth/supabase-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { createClient } from "@supabase/supabase-js"
import { Adapter } from "next-auth/adapters"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        // Handle Sign Up
        if (credentials.isSignUp === 'true') {
          const { data, error } = await supabase.auth.signUp({
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

          if (error) {
            console.error("Supabase Sign Up Error:", error.message);
            // Throw a generic error to the user
            throw new Error("Could not create user. Please try again.");
          }
          
          if (data.user) {
             // We need to manually return the user object in the shape NextAuth expects
             // The adapter will handle linking this to the database
            return {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata.name,
            };
          }
          return null; // Should not happen if signUp is successful
        }
        
        // Handle Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error) {
          console.error("Supabase Sign In Error:", error.message);
          // Return null to indicate failed authentication
          return null;
        }

        if (data.user) {
          // On successful sign-in, return the user object for NextAuth
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata.name,
            // any other fields you want to pass to the session
          };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      // Pass user id and other token properties to the session
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      // This is called after a successful sign-in
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    // You can add other pages like signOut, error, etc.
  },
  // Enable debug messages in development
  debug: process.env.NODE_ENV === 'development',
})

export { handler as GET, handler as POST }
