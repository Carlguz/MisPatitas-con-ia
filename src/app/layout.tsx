import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

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
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
