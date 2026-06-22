"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/dashboard", label: "Início", icon: "🏠" },
  { href: "/apostas", label: "Apostas", icon: "🎯" },
  { href: "/escalada", label: "Escalada", icon: "📈" },
  { href: "/jogos", label: "Jogos", icon: "⚽" },
  { href: "/ranking", label: "Ranking", icon: "🏆" },
  { href: "/calculadora", label: "Calc", icon: "🧮" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800/80 bg-gray-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 group shrink-0"
        >
          {/* Hexágono SVG */}
          <div className="relative w-9 h-9 flex items-center justify-center">
            <svg
              viewBox="0 0 40 40"
              className="w-9 h-9 drop-shadow-[0_0_6px_rgba(34,197,94,0.5)] group-hover:drop-shadow-[0_0_10px_rgba(34,197,94,0.8)] transition-all"
            >
              <polygon
                points="20,2 37,11 37,29 20,38 3,29 3,11"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2"
              />
              <polygon
                points="20,8 31,14 31,26 20,32 9,26 9,14"
                fill="rgba(34,197,94,0.12)"
                stroke="#16a34a"
                strokeWidth="1"
              />
            </svg>
            <span className="absolute text-sm">⚽</span>
          </div>

          {/* Nome */}
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-white font-black text-lg tracking-tight">
              Hexa
              <span className="text-green-400">Milionário</span>
            </span>
            <span className="text-[10px] text-gray-500 tracking-widest uppercase font-medium">
              Copa do Mundo 2026
            </span>
          </div>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                }`}
              >
                {active && (
                  <span className="absolute inset-0 rounded-lg bg-green-600/20 border border-green-700/50" />
                )}
                <span className="relative text-base">{link.icon}</span>
                <span className="relative hidden sm:block">{link.label}</span>
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-green-400 rounded-full" />
                )}
              </Link>
            );
          })}

          {/* Divisor */}
          <div className="w-px h-5 bg-gray-700 mx-1 shrink-0" />

          {/* Sair */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all"
          >
            <span className="text-base">🚪</span>
            <span className="hidden sm:block">Sair</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
