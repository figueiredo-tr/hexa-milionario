"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  bancaInicial: number;
  bancaAtual: number;
  metaDiaria?: number | null;
  metaMensal?: number | null;
}

export default function MetasEditaveis({
  bancaInicial,
  bancaAtual,
  metaDiaria: metaDiariaInicial,
  metaMensal: metaMensalInicial,
}: Props) {
  const [metaDiaria, setMetaDiaria] = useState<string>(
    metaDiariaInicial ? metaDiariaInicial.toFixed(2) : "",
  );
  const [metaMensal, setMetaMensal] = useState<string>(
    metaMensalInicial ? metaMensalInicial.toFixed(2) : "",
  );
  const [editandoDiaria, setEditandoDiaria] = useState(false);
  const [editandoMensal, setEditandoMensal] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const supabase = createClient();

  const banca = bancaAtual || bancaInicial || 0;
  const diariaNum = parseFloat(metaDiaria) || 0;
  const mensalNum = parseFloat(metaMensal) || 0;
  const diariaPct =
    banca > 0 && diariaNum > 0 ? ((diariaNum / banca) * 100).toFixed(1) : null;
  const mensalPct =
    banca > 0 && mensalNum > 0 ? ((mensalNum / banca) * 100).toFixed(1) : null;

  function handleChangeDiaria(val: string) {
    setMetaDiaria(val);
    const d = parseFloat(val);
    if (!isNaN(d) && d > 0) setMetaMensal((d * 22).toFixed(2));
    else setMetaMensal("");
  }

  function handleChangeMensal(val: string) {
    setMetaMensal(val);
    const m = parseFloat(val);
    if (!isNaN(m) && m > 0) setMetaDiaria((m / 22).toFixed(2));
    else setMetaDiaria("");
  }

  async function salvar() {
    setSalvando(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("users_profile")
      .update({
        meta_diaria: parseFloat(metaDiaria) || null,
        meta_mensal: parseFloat(metaMensal) || null,
      })
      .eq("user_id", user.id);
    setSalvando(false);
    setEditandoDiaria(false);
    setEditandoMensal(false);
  }

  function cancelar() {
    setMetaDiaria(metaDiariaInicial ? metaDiariaInicial.toFixed(2) : "");
    setMetaMensal(metaMensalInicial ? metaMensalInicial.toFixed(2) : "");
    setEditandoDiaria(false);
    setEditandoMensal(false);
  }

  const editando = editandoDiaria || editandoMensal;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Meta Diária */}
      <div className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-yellow-700 text-white text-sm px-4 py-2 rounded-xl transition-all">
        <span>🎯</span>
        <div className="text-left min-w-[90px]">
          <p className="text-[10px] text-gray-400 leading-none">Meta diária</p>
          {editandoDiaria ? (
            <input
              type="number"
              step="0.01"
              value={metaDiaria}
              onChange={(e) => handleChangeDiaria(e.target.value)}
              className="w-24 bg-gray-900 border border-yellow-600 rounded px-1 py-0.5 text-sm font-bold text-yellow-400 focus:outline-none mt-0.5"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") salvar();
                if (e.key === "Escape") cancelar();
              }}
            />
          ) : (
            <p className="text-sm font-bold text-yellow-400 leading-tight">
              {diariaNum > 0 ? `R$ ${diariaNum.toFixed(2)}` : "Definir meta"}
              {diariaPct && (
                <span className="text-[10px] text-gray-400 font-normal ml-1">
                  ({diariaPct}%)
                </span>
              )}
            </p>
          )}
        </div>
        <button
          onClick={() => {
            setEditandoDiaria(true);
            setEditandoMensal(false);
          }}
          className="text-gray-500 hover:text-yellow-400 text-xs ml-1 transition-colors"
        >
          ✏️
        </button>
      </div>

      {/* Meta Mensal */}
      <div className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-700 text-white text-sm px-4 py-2 rounded-xl transition-all">
        <span>📅</span>
        <div className="text-left min-w-[90px]">
          <p className="text-[10px] text-gray-400 leading-none">Meta mensal</p>
          {editandoMensal ? (
            <input
              type="number"
              step="0.01"
              value={metaMensal}
              onChange={(e) => handleChangeMensal(e.target.value)}
              className="w-24 bg-gray-900 border border-blue-600 rounded px-1 py-0.5 text-sm font-bold text-blue-400 focus:outline-none mt-0.5"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") salvar();
                if (e.key === "Escape") cancelar();
              }}
            />
          ) : (
            <p className="text-sm font-bold text-blue-400 leading-tight">
              {mensalNum > 0 ? `R$ ${mensalNum.toFixed(2)}` : "Definir meta"}
              {mensalPct && (
                <span className="text-[10px] text-gray-400 font-normal ml-1">
                  ({mensalPct}%)
                </span>
              )}
            </p>
          )}
        </div>
        <button
          onClick={() => {
            setEditandoMensal(true);
            setEditandoDiaria(false);
          }}
          className="text-gray-500 hover:text-blue-400 text-xs ml-1 transition-colors"
        >
          ✏️
        </button>
      </div>

      {/* Salvar / Cancelar */}
      {editando && (
        <div className="flex gap-2">
          <button
            onClick={salvar}
            disabled={salvando}
            className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            {salvando ? "..." : "✅ Salvar"}
          </button>
          <button
            onClick={cancelar}
            className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
