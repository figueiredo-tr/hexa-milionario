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

type ApostaAllIn = {
  id: number;
  desc: string;
  odd: number;
  stake: number | null;
  status: "pending" | "won" | "lost";
};

// ─────────────────────────────────────────────
// ABA GERENCIAMENTO (código original)
// ─────────────────────────────────────────────
function Gerenciamento({ bancaInicial }: { bancaInicial: number }) {
  const [oddPadrao, setOddPadrao] = useState(1.5);
  const [pctBanca, setPctBanca] = useState(20);
  const [meta, setMeta] = useState(500);
  const [apostas, setApostas] = useState<ApostaEscalada[]>([]);
  const [simulador, setSimulador] = useState(5);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
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
    }
    load();
  }, []);

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
      await supabase.from("escalada").insert({
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
    setApostas([
      ...apostas,
      {
        odd: oddPadrao,
        stake: parseFloat(stake.toFixed(2)),
        banca: bancaAtual,
        resultado: "pendente",
      },
    ]);
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

// ─────────────────────────────────────────────
// ABA ALL IN — reinveste lucro total em odds baixas
// ─────────────────────────────────────────────
function AllIn({ bancaInicial }: { bancaInicial: number }) {
  const [bets, setBets] = useState<ApostaAllIn[]>([]);
  const [oddPadrao, setOddPadrao] = useState(1.5);
  const [meta, setMeta] = useState(1000);
  const [idCnt, setIdCnt] = useState(1);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data } = await supabase
        .from("escalada")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (data?.allin_apostas) {
        setBets(data.allin_apostas);
        setOddPadrao(data.allin_odd || 1.5);
        setMeta(data.allin_meta || 1000);
        setIdCnt((data.allin_apostas?.length || 0) + 1);
      }
    }
    load();
  }, []);

  async function salvar() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: existing } = await supabase
      .from("escalada")
      .select("id")
      .eq("user_id", user!.id)
      .single();
    const payload = {
      allin_apostas: bets,
      allin_odd: oddPadrao,
      allin_meta: meta,
    };
    if (existing) {
      await supabase
        .from("escalada")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("user_id", user!.id);
    } else {
      await supabase.from("escalada").insert({ user_id: user!.id, ...payload });
    }
  }

  // Calcula banca a partir do índice
  function bancaEm(idx: number): number {
    let b = bancaInicial;
    for (let i = 0; i < idx; i++) {
      const bet = bets[i];
      const stake = bet.stake ?? b; // ALL IN = aposta tudo
      if (bet.status === "won") b = b - stake + stake * bet.odd;
      else if (bet.status === "lost") b = b - stake;
    }
    return parseFloat(b.toFixed(2));
  }

  const bancaFinal = bancaEm(bets.length);
  const lucro = bancaFinal - bancaInicial;
  const progresso = Math.min(
    100,
    Math.max(0, ((bancaFinal - bancaInicial) / (meta - bancaInicial)) * 100),
  );
  const ganhos = bets.filter((b) => b.status === "won").length;
  const total = bets.filter((b) => b.status !== "pending").length;

  const chartData = [
    { n: 0, banca: bancaInicial },
    ...bets.map((_, i) => ({ n: i + 1, banca: bancaEm(i + 1) })),
  ];

  function addBet() {
    setBets((prev) => [
      ...prev,
      { id: idCnt, desc: "", odd: oddPadrao, stake: null, status: "pending" },
    ]);
    setIdCnt((c) => c + 1);
  }

  function updateBet(id: number, field: string, value: any) {
    setBets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)),
    );
  }

  function removeBet(id: number) {
    setBets((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div className="space-y-6">
      {/* Aviso */}
      <div className="bg-red-950/40 border border-red-800 rounded-xl px-4 py-3 flex items-start gap-3">
        <span className="text-2xl">⚠️</span>
        <div>
          <p className="text-red-400 font-semibold text-sm">
            Modo ALL IN ativado
          </p>
          <p className="text-red-300/70 text-xs mt-0.5">
            Cada aposta usa <strong>toda a banca disponível</strong>. Uma
            derrota zera tudo. Use com responsabilidade.
          </p>
        </div>
      </div>

      {/* Configurações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">
              Odd Padrão (editável por linha)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              step="0.01"
              min="1.01"
              value={oddPadrao}
              onChange={(e) => setOddPadrao(parseFloat(e.target.value))}
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

      {/* Cards de stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Banca Inicial",
            value: `R$ ${bancaInicial.toFixed(2)}`,
            color: "text-white",
          },
          {
            label: "Banca Atual",
            value: `R$ ${bancaFinal.toFixed(2)}`,
            color: "text-green-400",
          },
          {
            label: "Lucro",
            value: `${lucro >= 0 ? "+" : ""}R$ ${lucro.toFixed(2)}`,
            color: lucro >= 0 ? "text-green-400" : "text-red-400",
          },
          {
            label: "Aproveitamento",
            value: total > 0 ? `${ganhos}/${total}` : "—",
            color: "text-yellow-400",
          },
        ].map((s) => (
          <Card key={s.label} className="bg-gray-900 border-gray-800">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">
                {s.label}
              </p>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progresso */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="pt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">
              Progresso para meta R$ {meta.toFixed(0)}
            </span>
            <span className="text-yellow-400 font-semibold">
              {progresso.toFixed(1)}%
            </span>
          </div>
          <Progress value={progresso} className="h-3" />
        </CardContent>
      </Card>

      {/* Gráfico */}
      {chartData.length > 1 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">
              📊 Evolução da Banca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="n" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" tickFormatter={(v) => `R$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    color: "#fff",
                  }}
                  formatter={(v: number) => [`R$ ${v.toFixed(2)}`, "Banca"]}
                />
                <Line
                  type="monotone"
                  dataKey="banca"
                  stroke="#eab308"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Tabela */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">Tabela ALL IN</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={addBet}
                className="bg-red-600 hover:bg-red-700"
                size="sm"
              >
                + Rodada
              </Button>
              <Button
                onClick={salvar}
                variant="outline"
                size="sm"
                className="border-gray-700"
              >
                💾 Salvar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left py-2 w-8">#</th>
                  <th className="text-left py-2">Partida</th>
                  <th className="text-left py-2 w-24">Odd</th>
                  <th className="text-left py-2 w-28">Banca antes</th>
                  <th className="text-left py-2 w-28">Stake (ALL IN)</th>
                  <th className="text-left py-2 w-28">Retorno</th>
                  <th className="text-left py-2 w-28">Resultado</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {bets.map((bet, i) => {
                  const bancaAntes = bancaEm(i);
                  const stake = bet.stake ?? bancaAntes;
                  const retorno =
                    bet.status === "won"
                      ? stake * bet.odd
                      : bet.status === "lost"
                        ? 0
                        : stake * bet.odd;
                  return (
                    <tr
                      key={bet.id}
                      className={`border-b border-gray-800 ${bet.status === "won" ? "bg-green-950/20" : bet.status === "lost" ? "bg-red-950/20" : ""}`}
                    >
                      <td className="py-2 text-gray-500">{i + 1}</td>
                      <td className="py-2">
                        <Input
                          value={bet.desc}
                          onChange={(e) =>
                            updateBet(bet.id, "desc", e.target.value)
                          }
                          className="bg-gray-800 border-gray-700 h-7 text-sm"
                          placeholder="Partida..."
                        />
                      </td>
                      <td className="py-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="1.01"
                          value={bet.odd}
                          onChange={(e) =>
                            updateBet(bet.id, "odd", parseFloat(e.target.value))
                          }
                          className="bg-gray-800 border-gray-700 w-20 h-7 text-sm"
                        />
                      </td>
                      <td className="py-2 text-gray-300 text-xs">
                        R$ {bancaAntes.toFixed(2)}
                      </td>
                      <td className="py-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={bet.stake ?? bancaAntes}
                          onChange={(e) =>
                            updateBet(
                              bet.id,
                              "stake",
                              parseFloat(e.target.value),
                            )
                          }
                          className="bg-gray-800 border-gray-700 w-24 h-7 text-sm"
                        />
                      </td>
                      <td
                        className={`py-2 font-semibold text-xs ${bet.status === "won" ? "text-green-400" : bet.status === "lost" ? "text-red-400" : "text-gray-400"}`}
                      >
                        R$ {retorno.toFixed(2)}
                        {bet.status === "pending" ? "*" : ""}
                      </td>
                      <td className="py-2">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            className={`h-6 text-xs ${bet.status === "won" ? "bg-green-600" : "bg-gray-700"}`}
                            onClick={() =>
                              updateBet(
                                bet.id,
                                "status",
                                bet.status === "won" ? "pending" : "won",
                              )
                            }
                          >
                            ✅
                          </Button>
                          <Button
                            size="sm"
                            className={`h-6 text-xs ${bet.status === "lost" ? "bg-red-600" : "bg-gray-700"}`}
                            onClick={() =>
                              updateBet(
                                bet.id,
                                "status",
                                bet.status === "lost" ? "pending" : "lost",
                              )
                            }
                          >
                            ❌
                          </Button>
                        </div>
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => removeBet(bet.id)}
                          className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {bets.length === 0 && (
              <p className="text-gray-400 text-center py-8">
                Clique em + Rodada para começar
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// PÁGINA PRINCIPAL com abas
// ─────────────────────────────────────────────
export default function EscaladaPage() {
  const [aba, setAba] = useState<"gerenciamento" | "allin">("gerenciamento");
  const [bancaInicial, setBancaInicial] = useState(100);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("users_profile")
        .select("banca_atual")
        .eq("user_id", user!.id)
        .single();
      if (profile) setBancaInicial(profile.banca_atual);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">
        📈 Escalada de Reinvestimento
      </h1>

      {/* Seletor de abas */}
      <div className="flex gap-2">
        <button
          onClick={() => setAba("gerenciamento")}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            aba === "gerenciamento"
              ? "bg-green-600 text-white shadow-lg shadow-green-900/40"
              : "bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          📊 Gerenciamento
        </button>
        <button
          onClick={() => setAba("allin")}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            aba === "allin"
              ? "bg-red-600 text-white shadow-lg shadow-red-900/40"
              : "bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          💥 ALL IN
        </button>
      </div>

      {/* Conteúdo */}
      {aba === "gerenciamento" ? (
        <Gerenciamento bancaInicial={bancaInicial} />
      ) : (
        <AllIn bancaInicial={bancaInicial} />
      )}
    </div>
  );
}
