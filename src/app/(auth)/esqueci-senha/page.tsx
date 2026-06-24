"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
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

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    if (error) {
      setErro("Erro ao enviar e-mail. Verifique o endereço e tente novamente.");
    } else {
      setEnviado(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center pb-2">
          <HexaLogo />
          <p className="text-gray-400 text-sm mt-3">Recuperação de senha</p>
        </CardHeader>
        <CardContent>
          {enviado ? (
            <div className="text-center space-y-4 py-4">
              <div className="text-5xl">📧</div>
              <div className="bg-green-950/50 border border-green-800 rounded-lg px-4 py-3">
                <p className="text-green-400 font-semibold text-sm">
                  E-mail enviado!
                </p>
                <p className="text-green-300/70 text-xs mt-1">
                  Verifique sua caixa de entrada em <strong>{email}</strong> e
                  clique no link para redefinir sua senha.
                </p>
              </div>
              <p className="text-gray-500 text-xs">
                Não recebeu? Verifique o spam ou tente novamente.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  variant="outline"
                  className="border-gray-700 text-gray-300"
                  onClick={() => {
                    setEnviado(false);
                    setEmail("");
                  }}
                >
                  Tentar outro e-mail
                </Button>
                <Link
                  href="/login"
                  className="text-center text-sm text-yellow-500 hover:underline"
                >
                  Voltar ao login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEnviar} className="space-y-4">
              <div className="bg-gray-800 rounded-lg px-3 py-2.5 text-xs text-gray-400">
                Digite o e-mail da sua conta e enviaremos um link para você
                redefinir sua senha.
              </div>
              <div>
                <Label htmlFor="email">E-mail da conta</Label>
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
                {loading ? "Enviando..." : "📧 Enviar link de recuperação"}
              </Button>

              <p className="text-center text-gray-400 text-sm">
                Lembrou a senha?{" "}
                <Link href="/login" className="text-yellow-500 hover:underline">
                  Voltar ao login
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
