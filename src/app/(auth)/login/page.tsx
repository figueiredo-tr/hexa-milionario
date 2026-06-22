"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";

function HexaLogo() {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-14 h-14 flex items-center justify-center">
        <svg
          viewBox="0 0 50 50"
          className="w-14 h-14 absolute drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]"
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
        <span className="relative text-2xl z-10">⚽</span>
      </div>
      <div className="flex flex-col items-center leading-none mt-1">
        <span className="text-white font-black text-2xl tracking-tight">
          Hexa<span className="text-green-400">Milionário</span>
        </span>
        <span className="text-[10px] text-gray-500 tracking-widest uppercase font-medium mt-0.5">
          Copa do Mundo 2026
        </span>
      </div>
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
    if (error) setErro("Email ou senha incorretos");
    else router.push("/dashboard");
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center pb-2">
          <HexaLogo />
          <p className="text-gray-400 text-sm mt-3">Sua banca rumo ao hexa</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-700 mt-1"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="bg-gray-800 border-gray-700 mt-1"
                placeholder="••••••••"
                required
              />
            </div>
            {erro && <p className="text-red-500 text-sm">{erro}</p>}
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            <p className="text-center text-gray-400 text-sm">
              Não tem conta?{" "}
              <Link
                href="/cadastro"
                className="text-yellow-500 hover:underline"
              >
                Cadastre-se
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
