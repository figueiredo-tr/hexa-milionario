"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function RedefinirSenhaPage() {
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Garante que o Supabase processa o token da URL
    supabase.auth.getSession();
  }, []);

  async function handleRedefinir(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (senha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) {
      setErro(
        "Erro ao redefinir senha. O link pode ter expirado. Solicite um novo.",
      );
    } else {
      setSucesso(true);
      setTimeout(() => router.push("/dashboard"), 2500);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center pb-2">
          <div className="text-4xl mb-2">🔐</div>
          <h1 className="text-white font-black text-xl">Redefinir senha</h1>
          <p className="text-gray-400 text-sm mt-1">
            HexaMilionário · Copa 2026
          </p>
        </CardHeader>
        <CardContent>
          {sucesso ? (
            <div className="text-center space-y-3 py-4">
              <div className="text-5xl">✅</div>
              <div className="bg-green-950/50 border border-green-800 rounded-lg px-4 py-3">
                <p className="text-green-400 font-semibold">
                  Senha redefinida!
                </p>
                <p className="text-green-300/70 text-xs mt-1">
                  Redirecionando para o dashboard...
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRedefinir} className="space-y-4">
              <div>
                <Label htmlFor="senha">Nova senha</Label>
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="bg-gray-800 border-gray-700 mt-1"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmar">Confirmar nova senha</Label>
                <Input
                  id="confirmar"
                  type="password"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  className="bg-gray-800 border-gray-700 mt-1"
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
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? "Salvando..." : "Salvar nova senha"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
