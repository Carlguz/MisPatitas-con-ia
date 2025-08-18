import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PetConnect - Conectamos Amantes de Mascotas",
  description: "La plataforma completa para paseadores de mascotas, vendedores de productos y clientes. Todo en un solo lugar.",
  keywords: ["mascotas", "paseadores", "productos", "pet shop", "cuidado de mascotas", "PetConnect"],
  authors: [{ name: "PetConnect Team" }],
  openGraph: {
    title: "PetConnect - Conectamos Amantes de Mascotas",
    description: "La plataforma completa para paseadores de mascotas, vendedores de productos y clientes.",
    url: "https://petconnect.com",
    siteName: "PetConnect",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PetConnect - Conectamos Amantes de Mascotas",
    description: "La plataforma completa para paseadores de mascotas, vendedores de productos y clientes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
