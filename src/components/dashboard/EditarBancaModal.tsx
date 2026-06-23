"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  bancaInicial: number;
  bancaAtual: number;
  onClose: () => void;
  onSalvo: (novaInicial: number, novaAtual: number) => void;
}

export default function EditarBancaModal({
  bancaInicial,
  bancaAtual,
  onClose,
  onSalvo,
}: Props) {
  const [valorInicial, setValorInicial] = useState(bancaInicial.toFixed(2));
  const [salvando, setSalvando] = useState(false);
  const supabase = createClient();

  async function salvar() {
    setSalvando(true);
    const novaInicial = parseFloat(valorInicial);
    const lucroAtual = bancaAtual - bancaInicial; // preserva o lucro já feito
    const novaBancaAtual = novaInicial + lucroAtual;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase
      .from("users_profile")
      .update({
        banca_inicial: novaInicial,
        banca_atual: novaBancaAtual,
      })
      .eq("user_id", user!.id);

    onSalvo(novaInicial, novaBancaAtual);
    setSalvando(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm space-y-4">
        <h3 className="text-white font-bold text-lg">
          💰 Definir Banca Inicial
        </h3>
        <p className="text-gray-400 text-sm">
          Defina o valor inicial da sua banca. Isso vai resetar a banca atual
          para o mesmo valor.
        </p>
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Valor (R$)</label>
          <input
            type="number"
            step="0.01"
            value={valorInicial}
            onChange={(e) => setValorInicial(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-lg font-bold focus:outline-none focus:border-green-600"
            autoFocus
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={salvar}
            disabled={salvando}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
          >
            {salvando ? "Salvando..." : "✅ Salvar"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-2 rounded-lg transition-colors text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
