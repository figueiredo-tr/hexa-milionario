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
        className={`           ${inter.className}
          min-h-screen
          text-white
          bg-black
          bg-fixed
          bg-cover
          bg-center
        `}
        style={{
          backgroundImage: `             linear-gradient(
              rgba(0,0,0,0.85),
              rgba(0,0,0,0.92)
            ),
            url('/images/worldcup-bg.jpg')
          `,
        }}
      >
        {children}{" "}
      </body>{" "}
    </html>
  );
}
