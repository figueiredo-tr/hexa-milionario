"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function AllInResumo() {
  const supabase = createClient();
  const [dados, setDados] = useState<{
    bancaInicial: number;
    bancaAtual: number;
    rodada: number;
    lucro: number;
    roi: number;
  } | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data } = await supabase
        .from("escalada")
        .select("allin_apostas, allin_banca_inicial")
        .eq("user_id", user!.id)
        .single();

      if (!data) return;

      const bancaInicial = data.allin_banca_inicial || 0;
      const apostas = data.allin_apostas || [];

      let banca = bancaInicial;
      apostas.forEach((bet: any) => {
        const stake = bet.stake ?? banca;
        if (bet.status === "won") banca = banca - stake + stake * bet.odd;
        else if (bet.status === "lost") banca = banca - stake;
      });

      const rodada = apostas.length;
      const lucro = banca - bancaInicial;
      const roi = bancaInicial > 0 ? (lucro / bancaInicial) * 100 : 0;

      setDados({
        bancaInicial,
        bancaAtual: parseFloat(banca.toFixed(2)),
        rodada,
        lucro: parseFloat(lucro.toFixed(2)),
        roi: parseFloat(roi.toFixed(1)),
      });
    }
    load();
  }, []);

  if (!dados || dados.bancaInicial === 0) return null;

  return (
    <Card className="bg-gray-900 border-red-900/50">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-900/30 border border-red-800 flex items-center justify-center text-xl">
              💥
            </div>
            <div>
              <p className="text-white font-bold text-sm">ALL IN</p>
              <p className="text-gray-500 text-[11px]">
                Banca inicial: R$ {dados.bancaInicial.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex gap-6 flex-wrap">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                Banca Atual
              </span>
              <span className="text-lg font-black text-green-400">
                R$ {dados.bancaAtual.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                Rodada
              </span>
              <span className="text-lg font-black text-white">
                {dados.rodada}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                Lucro
              </span>
              <span
                className={`text-lg font-black ${dados.lucro >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                {dados.lucro >= 0 ? "+" : ""}R$ {dados.lucro.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                ROI
              </span>
              <span
                className={`text-lg font-black ${dados.roi >= 0 ? "text-yellow-400" : "text-red-400"}`}
              >
                {dados.roi >= 0 ? "+" : ""}
                {dados.roi.toFixed(1)}%
              </span>
            </div>
          </div>

          <Link
            href="/escalada"
            className="text-xs text-gray-500 hover:text-red-400 transition-colors"
          >
            Ver ALL IN →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
