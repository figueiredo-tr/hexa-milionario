"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function CadastroPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [username, setUsername] = useState("");
  const [banca, setBanca] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
    });
    if (error) {
      setErro(error.message);
      setLoading(false);
      return;
    }
    if (data.user) {
      await supabase.from("users_profile").insert({
        user_id: data.user.id,
        username,
        banca_inicial: parseFloat(banca) || 0,
        banca_atual: parseFloat(banca) || 0,
      });
    }
    router.push("/dashboard");
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🏆⚽</div>
          <CardTitle className="text-2xl text-green-500">Criar Conta</CardTitle>
          <p className="text-gray-400 text-sm">Hexa Milionário</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCadastro} className="space-y-4">
            <div>
              <Label htmlFor="username">Nome de usuário</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-gray-800 border-gray-700 mt-1"
                placeholder="SeuNome"
                required
              />
            </div>
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
            <div>
              <Label htmlFor="banca">Banca inicial (R$)</Label>
              <Input
                id="banca"
                type="number"
                value={banca}
                onChange={(e) => setBanca(e.target.value)}
                className="bg-gray-800 border-gray-700 mt-1"
                placeholder="100.00"
                required
              />
            </div>
            {erro && <p className="text-red-500 text-sm">{erro}</p>}
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Criando conta..." : "Criar conta"}
            </Button>
            <p className="text-center text-gray-400 text-sm">
              Já tem conta?{" "}
              <Link href="/login" className="text-yellow-500 hover:underline">
                Entrar
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
