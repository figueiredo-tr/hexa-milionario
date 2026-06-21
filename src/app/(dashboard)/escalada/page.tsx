"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ApostaEscalada = {
  odd: number;
  stake: number;
  banca: number;
  resultado: string;
};

export default function EscaladaPage() {
  const [bancaInicial, setBancaInicial] = useState(100);
  const [oddPadrao, setOddPadrao] = useState(1.5);
  const [pctBanca, setPctBanca] = useState(20);
  const [meta, setMeta] = useState(500);
  const [apostas, setApostas] = useState<ApostaEscalada[]>([]);
  const [simulador, setSimulador] = useState(5);
  const supabase = createClient();

  useEffect(() => {
    loadEscalada();
  }, []);

  async function loadEscalada() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data } = await supabase
      .from("escalada")
      .select("*")
      .eq("user_id", user!.id)
      .single();
    if (data) {
      setOddPadrao(data.odd_padrao);
      setPctBanca(data.pct_banca);
      setMeta(data.meta);
      setApostas(data.apostas || []);
    }
    const { data: profile } = await supabase
      .from("users_profile")
      .select("banca_atual, banca_inicial")
      .eq("user_id", user!.id)
      .single();
    if (profile) setBancaInicial(profile.banca_atual);
  }

  async function salvar() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: existing } = await supabase
      .from("escalada")
      .select("id")
      .eq("user_id", user!.id)
      .single();
    if (existing) {
      await supabase
        .from("escalada")
        .update({
          apostas,
          odd_padrao: oddPadrao,
          pct_banca: pctBanca,
          meta,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user!.id);
    } else {
      await supabase
        .from("escalada")
        .insert({
          user_id: user!.id,
          apostas,
          odd_padrao: oddPadrao,
          pct_banca: pctBanca,
          meta,
        });
    }
  }

  function adicionarAposta() {
    const bancaAtual =
      apostas.length === 0 ? bancaInicial : apostas[apostas.length - 1].banca;
    const stake = (bancaAtual * pctBanca) / 100;
    const nova: ApostaEscalada = {
      odd: oddPadrao,
      stake: parseFloat(stake.toFixed(2)),
      banca: bancaAtual,
      resultado: "pendente",
    };
    setApostas([...apostas, nova]);
  }

  function toggleResultado(index: number, resultado: string) {
    const novas = [...apostas];
    novas[index].resultado = resultado;
    let banca = bancaInicial;
    novas.forEach((a, i) => {
      if (a.resultado === "ganhou") banca += a.stake * a.odd - a.stake;
      if (a.resultado === "perdeu") banca -= a.stake;
      novas[i].banca = parseFloat(banca.toFixed(2));
    });
    setApostas(novas);
  }

  const bancaAtual =
    apostas.length > 0 ? apostas[apostas.length - 1].banca : bancaInicial;
  const progresso = Math.min((bancaAtual / meta) * 100, 100);
  const chartData = [
    { n: 0, banca: bancaInicial },
    ...apostas.map((a, i) => ({ n: i + 1, banca: a.banca })),
  ];

  let simulacaoBanca = bancaAtual;
  const simDados = [{ n: 0, banca: simulacaoBanca }];
  for (let i = 0; i < simulador; i++) {
    const s = (simulacaoBanca * pctBanca) / 100;
    simulacaoBanca += s * oddPadrao - s;
    simDados.push({ n: i + 1, banca: parseFloat(simulacaoBanca.toFixed(2)) });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">
        📈 Escalada de Reinvestimento
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">Odd Padrão</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              step="0.01"
              value={oddPadrao}
              onChange={(e) => setOddPadrao(parseFloat(e.target.value))}
              className="bg-gray-800 border-gray-700"
            />
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">
              % da Banca por Aposta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              value={pctBanca}
              onChange={(e) => setPctBanca(parseFloat(e.target.value))}
              className="bg-gray-800 border-gray-700"
            />
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">Meta (R$)</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              value={meta}
              onChange={(e) => setMeta(parseFloat(e.target.value))}
              className="bg-gray-800 border-gray-700"
            />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">
            🎯 Meta: R$ {meta.toFixed(2)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progresso} className="h-3" />
          <p className="text-gray-400 text-sm mt-2">
            Banca atual:{" "}
            <span className="text-green-400 font-bold">
              R$ {bancaAtual.toFixed(2)}
            </span>{" "}
            • Progresso:{" "}
            <span className="text-yellow-400">{progresso.toFixed(1)}%</span>
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">📊 Evolução da Banca</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="n" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  color: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="banca"
                stroke="#16a34a"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">Tabela de Apostas</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={adicionarAposta}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                + Aposta
              </Button>
              <Button
                onClick={salvar}
                variant="outline"
                size="sm"
                className="border-gray-700"
              >
                Salvar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left py-2">#</th>
                  <th className="text-left py-2">Odd</th>
                  <th className="text-left py-2">Stake</th>
                  <th className="text-left py-2">Banca</th>
                  <th className="text-left py-2">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {apostas.map((a, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    <td className="py-2 text-gray-400">{i + 1}</td>
                    <td className="py-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={a.odd}
                        onChange={(e) => {
                          const n = [...apostas];
                          n[i].odd = parseFloat(e.target.value);
                          setApostas(n);
                        }}
                        className="bg-gray-800 border-gray-700 w-20 h-7 text-sm"
                      />
                    </td>
                    <td className="py-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={a.stake}
                        onChange={(e) => {
                          const n = [...apostas];
                          n[i].stake = parseFloat(e.target.value);
                          setApostas(n);
                        }}
                        className="bg-gray-800 border-gray-700 w-24 h-7 text-sm"
                      />
                    </td>
                    <td
                      className={`py-2 font-medium ${a.banca > bancaInicial ? "text-green-400" : "text-red-400"}`}
                    >
                      R$ {a.banca.toFixed(2)}
                    </td>
                    <td className="py-2">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          className={`h-6 text-xs ${a.resultado === "ganhou" ? "bg-green-600" : "bg-gray-700"}`}
                          onClick={() => toggleResultado(i, "ganhou")}
                        >
                          ✅
                        </Button>
                        <Button
                          size="sm"
                          className={`h-6 text-xs ${a.resultado === "perdeu" ? "bg-red-600" : "bg-gray-700"}`}
                          onClick={() => toggleResultado(i, "perdeu")}
                        >
                          ❌
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {apostas.length === 0 && (
              <p className="text-gray-400 text-center py-8">
                Clique em + Aposta para começar
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">🔮 Simulador</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Label>Apostas seguidas vencidas:</Label>
            <Input
              type="number"
              value={simulador}
              onChange={(e) => setSimulador(parseInt(e.target.value))}
              className="bg-gray-800 border-gray-700 w-24"
            />
          </div>
          <p className="text-gray-400 mb-4">
            Acertando <span className="text-yellow-400">{simulador}</span>{" "}
            apostas seguidas com odd{" "}
            <span className="text-yellow-400">{oddPadrao}</span> e {pctBanca}%
            da banca:
            <span className="text-green-400 font-bold text-lg ml-2">
              R$ {simDados[simDados.length - 1]?.banca.toFixed(2)}
            </span>
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={simDados}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="n" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  color: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="banca"
                stroke="#eab308"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
