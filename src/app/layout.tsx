import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "kobian",
  description: "Export your Kobo highlights to Obsidian",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${mono.variable} h-full`}>
      <body className="min-h-full bg-stone-50 font-mono antialiased">
        {children}
      </body>
    </html>
  );
}
