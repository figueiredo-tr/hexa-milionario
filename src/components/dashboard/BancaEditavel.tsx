"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  bancaAtual: number;
  bancaInicial: number;
}

export default function BancaEditavel({ bancaAtual, bancaInicial }: Props) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(bancaAtual.toFixed(2));
  const [valorInicial, setValorInicial] = useState(bancaInicial.toFixed(2));
  const [salvando, setSalvando] = useState(false);
  const [atual, setAtual] = useState(bancaAtual);
  const [inicial, setInicial] = useState(bancaInicial);
  const supabase = createClient();

  async function salvar() {
    setSalvando(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const novaAtual = parseFloat(valor);
    const novaInicial = parseFloat(valorInicial);
    await supabase
      .from("users_profile")
      .update({
        banca_atual: novaAtual,
        banca_inicial: novaInicial,
      })
      .eq("user_id", user!.id);
    setAtual(novaAtual);
    setInicial(novaInicial);
    setSalvando(false);
    setEditando(false);
  }

  return (
    <Card className="bg-gray-900 border border-green-900 transition-all hover:scale-[1.02]">
      <CardContent className="pt-6 pb-6">
        <div className="flex flex-col items-center text-center gap-2">
          <span className="text-3xl">💰</span>
          <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-widest">
            Banca Atual
          </span>

          {editando ? (
            <div className="w-full flex flex-col gap-2 mt-1">
              <div>
                <p className="text-[10px] text-gray-500 mb-1">
                  Banca atual (R$)
                </p>
                <input
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 text-green-400 font-bold text-center rounded-lg px-2 py-1.5 text-lg focus:outline-none focus:border-green-600"
                  autoFocus
                />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 mb-1">
                  Banca inicial (R$)
                </p>
                <input
                  type="number"
                  step="0.01"
                  value={valorInicial}
                  onChange={(e) => setValorInicial(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 text-white text-center rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-green-600"
                />
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={salvar}
                  disabled={salvando}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors"
                >
                  {salvando ? "..." : "✅ Salvar"}
                </button>
                <button
                  onClick={() => {
                    setEditando(false);
                    setValor(atual.toFixed(2));
                    setValorInicial(inicial.toFixed(2));
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold text-green-400">
                R$ {atual.toFixed(2)}
              </p>
              <p className="text-[12px] text-gray-500">
                Inicial: R$ {inicial.toFixed(2)}
              </p>
              <button
                onClick={() => setEditando(true)}
                className="text-[11px] text-gray-600 hover:text-green-400 transition-colors mt-1 underline underline-offset-2"
              >
                ✏️ Editar banca
              </button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
