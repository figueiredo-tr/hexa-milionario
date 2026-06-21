"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/dashboard", label: "🏠 Início" },
  { href: "/apostas", label: "🎯 Apostas" },
  { href: "/escalada", label: "📈 Escalada" },
  { href: "/jogos", label: "⚽ Jogos" },
  { href: "/ranking", label: "🏆 Ranking" },
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
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏆⚽</span>
          <span className="text-green-500 font-bold text-lg hidden sm:block">
            Hexa Milionário
          </span>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={pathname === link.href ? "default" : "ghost"}
                size="sm"
                className={
                  pathname === link.href
                    ? "bg-green-600 hover:bg-green-700"
                    : "text-gray-400 hover:text-white"
                }
              >
                {link.label}
              </Button>
            </Link>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 ml-2"
          >
            Sair
          </Button>
        </div>
      </div>
    </nav>
  );
}
