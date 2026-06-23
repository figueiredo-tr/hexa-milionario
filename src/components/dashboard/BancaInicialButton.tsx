"use client";
import { useState } from "react";
import EditarBancaModal from "./EditarBancaModal";

interface Props {
  bancaInicial: number;
  bancaAtual: number;
}

export default function BancaInicialButton({
  bancaInicial,
  bancaAtual,
}: Props) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-green-700 text-white text-sm px-4 py-2 rounded-xl transition-all"
      >
        <span>💰</span>
        <div className="text-left">
          <p className="text-[10px] text-gray-400 leading-none">
            Banca inicial
          </p>
          <p className="text-sm font-bold text-green-400 leading-tight">
            R$ {bancaInicial.toFixed(2)}
          </p>
        </div>
        <span className="text-gray-500 text-xs ml-1">✏️</span>
      </button>

      {aberto && (
        <EditarBancaModal
          bancaInicial={bancaInicial}
          bancaAtual={bancaAtual}
          onClose={() => setAberto(false)}
          onSalvo={() => {
            setAberto(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
