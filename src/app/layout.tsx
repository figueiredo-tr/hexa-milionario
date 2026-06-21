import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hexa Milionário",
  description: "Sua banca rumo ao hexa",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${inter.className} bg-gray-950 text-white min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
