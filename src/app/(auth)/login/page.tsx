"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const SELECOES = [
  { codigo: "br", nome: "Brasil" },
  { codigo: "ar", nome: "Argentina" },
  { codigo: "fr", nome: "França" },
  { codigo: "de", nome: "Alemanha" },
  { codigo: "es", nome: "Espanha" },
  { codigo: "pt", nome: "Portugal" },
];

function Hexagono({ codigo, nome }: { codigo: string; nome: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-10 h-10 flex items-center justify-center">
        <svg viewBox="0 0 50 50" className="w-10 h-10 absolute">
          <polygon
            points="25,2 47,14 47,36 25,48 3,36 3,14"
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1.5"
          />
        </svg>
        <div
          className="relative z-10 w-6 h-6 overflow-hidden"
          style={{
            clipPath:
              "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
          }}
        >
          <img
            src={`https://flagcdn.com/w40/${codigo}.png`}
            alt={nome}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <span className="text-[8px] text-gray-500 font-medium">{nome}</span>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    if (error) setErro("E-mail ou senha incorretos. Verifique seus dados.");
    else router.push("/dashboard");
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex bg-gray-950">
      {/* ── Painel esquerdo — arte ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Fundo */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-950 via-gray-900 to-yellow-950" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L55 20 L55 50 L30 65 L5 50 L5 20 Z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-yellow-500/10 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent" />

        {/* Conteúdo */}
        <div className="relative z-10 flex flex-col justify-center px-12 py-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg
                viewBox="0 0 50 50"
                className="w-10 h-10 absolute drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]"
              >
                <polygon
                  points="25,2 47,14 47,36 25,48 3,36 3,14"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                />
                <polygon
                  points="25,8 39,16 39,34 25,42 11,34 11,16"
                  fill="rgba(34,197,94,0.1)"
                  stroke="#16a34a"
                  strokeWidth="1"
                />
              </svg>
              <span className="relative text-lg z-10">⚽</span>
            </div>
            <div>
              <span className="text-white font-black text-xl tracking-tight">
                Hexa<span className="text-green-400">Milionário</span>
              </span>
              <p className="text-[10px] text-gray-500 tracking-widest uppercase">
                Copa do Mundo 2026
              </p>
            </div>
          </div>

          {/* Headline */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold tracking-widest text-yellow-400 uppercase">
                🏆 FIFA World Cup
              </span>
              <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-0.5 rounded-full border border-yellow-700">
                2026
              </span>
            </div>
            <h1 className="text-4xl font-black text-white leading-tight mb-3">
              Rumo ao <span className="text-yellow-400">Hexa</span>
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Gerencie sua banca, acompanhe os jogos ao vivo e compita no
              ranking dos apostadores mais precisos do Brasil.
            </p>
          </div>

          {/* Troféu + bandeiras */}
          <div className="flex items-center gap-8">
            <svg width="80" height="100" viewBox="0 0 90 120" fill="none">
              <rect
                x="25"
                y="100"
                width="40"
                height="8"
                rx="3"
                fill="#ca8a04"
                opacity="0.9"
              />
              <rect
                x="30"
                y="92"
                width="30"
                height="10"
                rx="2"
                fill="#ca8a04"
                opacity="0.8"
              />
              <rect
                x="38"
                y="75"
                width="14"
                height="20"
                rx="2"
                fill="#eab308"
              />
              <path
                d="M15 15 Q15 70 45 70 Q75 70 75 15 Z"
                fill="url(#tg1)"
                opacity="0.95"
              />
              <path
                d="M15 20 Q5 20 5 35 Q5 50 15 50"
                stroke="#ca8a04"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M75 20 Q85 20 85 35 Q85 50 75 50"
                stroke="#ca8a04"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
              />
              <text
                x="45"
                y="48"
                textAnchor="middle"
                fontSize="22"
                fill="white"
                opacity="0.9"
              >
                ★
              </text>
              <defs>
                <linearGradient id="tg1" x1="15" y1="15" x2="75" y2="70">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="50%" stopColor="#ca8a04" />
                  <stop offset="100%" stopColor="#92400e" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                {SELECOES.slice(0, 3).map((s) => (
                  <Hexagono key={s.nome} {...s} />
                ))}
              </div>
              <div className="flex gap-2">
                {SELECOES.slice(3, 6).map((s) => (
                  <Hexagono key={s.nome} {...s} />
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-10">
            {[
              ["⚽", "48 jogos", "Copa 2026"],
              ["🎯", "3 dicas/dia", "Análise IA"],
              ["🏅", "Ranking", "ao vivo"],
            ].map(([icon, val, sub]) => (
              <div key={val}>
                <div className="text-lg">{icon}</div>
                <div className="font-bold text-yellow-400 text-sm">{val}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                  {sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Painel direito — formulário ── */}
      <div className="w-full lg:w-[420px] flex items-center justify-center p-6 bg-gray-950">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="flex lg:hidden flex-col items-center mb-8">
            <div className="relative w-12 h-12 flex items-center justify-center mb-2">
              <svg
                viewBox="0 0 50 50"
                className="w-12 h-12 absolute drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]"
              >
                <polygon
                  points="25,2 47,14 47,36 25,48 3,36 3,14"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                />
                <polygon
                  points="25,8 39,16 39,34 25,42 11,34 11,16"
                  fill="rgba(34,197,94,0.1)"
                  stroke="#16a34a"
                  strokeWidth="1"
                />
              </svg>
              <span className="relative text-xl z-10">⚽</span>
            </div>
            <span className="text-white font-black text-2xl">
              Hexa<span className="text-green-400">Milionário</span>
            </span>
            <span className="text-[10px] text-gray-500 tracking-widest uppercase">
              Copa do Mundo 2026
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Entrar</h2>
          <p className="text-gray-400 text-sm mb-8">
            Bem-vindo de volta! Acesse sua conta.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-300 text-sm">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-900 border-gray-700 mt-1.5 focus:border-green-600 h-11"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="senha" className="text-gray-300 text-sm">
                  Senha
                </Label>
                <Link
                  href="/esqueci-senha"
                  className="text-xs text-gray-500 hover:text-yellow-400 transition-colors"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="bg-gray-900 border-gray-700 focus:border-green-600 h-11"
                placeholder="••••••••"
                required
              />
            </div>

            {erro && (
              <div className="bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">
                <p className="text-red-400 text-sm">{erro}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 h-11 text-base font-semibold mt-2"
            >
              {loading ? "Entrando..." : "Entrar →"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-800 text-center">
            <p className="text-gray-500 text-sm">
              Não tem conta?{" "}
              <Link
                href="/cadastro"
                className="text-yellow-400 font-semibold hover:underline"
              >
                Criar conta grátis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
