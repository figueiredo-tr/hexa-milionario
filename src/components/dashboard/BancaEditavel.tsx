"use client";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  bancaAtual: number;
  bancaInicial: number;
}

export default function BancaEditavel({ bancaAtual, bancaInicial }: Props) {
  return (
    <Card className="bg-gray-900 border border-green-900 transition-all hover:scale-[1.02]">
      <CardContent className="pt-6 pb-6">
        <div className="flex flex-col items-center text-center gap-2">
          <span className="text-3xl">💰</span>
          <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-widest">
            Banca Atual
          </span>
          <p className="text-2xl font-bold text-green-400">
            R$ {bancaAtual.toFixed(2)}
          </p>
          <p className="text-[12px] text-gray-500">
            Inicial: R$ {bancaInicial.toFixed(2)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
