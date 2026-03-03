
import NextAuth from "next-auth"
import { SupabaseAdapter } from "@auth/supabase-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { createClient } from "@supabase/supabase-js"
import { Adapter } from "next-auth/adapters"

// Use the SERVICE_ROLE_KEY for admin-level access
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

          // 1. Create the user in Supabase Auth
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

          // 2. Insert the corresponding profile in the public table
          // This is done with service_role privileges, bypassing RLS.
          let profileTable = "";
          switch(credentials.role) {
            case "CUSTOMER": profileTable = "customers"; break;
            case "WALKER": profileTable = "walkers"; break;
            case "SELLER": profileTable = "sellers"; break;
            default:
              // If role is invalid, we should delete the created user to avoid orphans
              await supabase.auth.admin.deleteUser(user.id);
              throw new Error("Invalid user role provided.");
          }
          
          const { error: profileError } = await supabase
            .from(profileTable)
            .insert({
              id: user.id, // Ensure UUID matches the auth user
              name: credentials.name,
              email: credentials.email,
              phone: credentials.phone
              // Add any other role-specific fields here if necessary
            });

          if (profileError) {
            console.error("Profile Creation Error:", profileError.message);
            // IMPORTANT: If profile creation fails, delete the auth user to prevent orphans.
            await supabase.auth.admin.deleteUser(user.id);
            throw new Error(`PROFILE_CREATION_ERROR: ${profileError.message}`);
          }

          // 3. Return the user object for NextAuth
          return {
              id: user.id,
              email: user.email,
              name: user.user_metadata.name,
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

        if (error) {
          // Don't throw an error here, return null to indicate failed sign-in
          return null;
        }

        if (data.user) {
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata.name,
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
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  debug: process.env.NODE_ENV === 'development',
})

export { handler as GET, handler as POST }
