"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Aba = "simples" | "dutching" | "ve" | "lay";

export default function CalculadoraPage() {
  const [aba, setAba] = useState<Aba>("simples");

  // Calculadora simples
  const [odd, setOdd] = useState("");
  const [stake, setStake] = useState("");

  // Calculadora dutching
  const [selecoes, setSelecoes] = useState([
    { odd: "", stake: "" },
    { odd: "", stake: "" },
  ]);
  const [bancaDutch, setBancaDutch] = useState("");

  // Calculadora valor esperado
  const [oddVE, setOddVE] = useState("");
  const [probReal, setProbReal] = useState("");
  const [stakeVE, setStakeVE] = useState("");

  // Calculadora lay
  const [oddLay, setOddLay] = useState("");
  const [stakeLay, setStakeLay] = useState("");
  const [comissao, setComissao] = useState("5");

  // Simples
  const retorno = odd && stake ? parseFloat(stake) * parseFloat(odd) : 0;
  const lucro = retorno - parseFloat(stake || "0");
  const probImplicita = odd ? ((1 / parseFloat(odd)) * 100).toFixed(1) : "0";

  // Dutching
  function calcDutching() {
    const banca = parseFloat(bancaDutch || "0");
    if (!banca) return selecoes;
    const total = selecoes.reduce(
      (acc, s) => acc + (s.odd ? 1 / parseFloat(s.odd) : 0),
      0,
    );
    return selecoes.map((s) => ({
      ...s,
      stake: s.odd ? ((1 / parseFloat(s.odd) / total) * banca).toFixed(2) : "",
    }));
  }
  const selecoesDutch = calcDutching();
  const retornoDutch =
    selecoesDutch[0]?.odd && selecoesDutch[0]?.stake
      ? (
          parseFloat(selecoesDutch[0].stake) * parseFloat(selecoesDutch[0].odd)
        ).toFixed(2)
      : "0";

  // Valor Esperado
  const ve =
    oddVE && probReal && stakeVE
      ? (
          (parseFloat(probReal) / 100) *
            (parseFloat(oddVE) - 1) *
            parseFloat(stakeVE) -
          (1 - parseFloat(probReal) / 100) * parseFloat(stakeVE)
        ).toFixed(2)
      : null;
  const vePositivo = ve !== null && parseFloat(ve) > 0;

  // Lay
  const responsabilidadeLay =
    oddLay && stakeLay
      ? (
          (parseFloat(oddLay) - 1) *
          parseFloat(stakeLay) *
          (1 - parseFloat(comissao) / 100)
        ).toFixed(2)
      : "0";
  const lucroLay = stakeLay
    ? (parseFloat(stakeLay) * (1 - parseFloat(comissao) / 100)).toFixed(2)
    : "0";

  const botoes: { key: Aba; label: string }[] = [
    { key: "simples", label: "💰 Simples" },
    { key: "dutching", label: "⚖️ Dutching" },
    { key: "ve", label: "📊 Valor Esperado" },
    { key: "lay", label: "🔄 Lay" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">🧮 Calculadora de Odds</h1>

      {/* Botões no topo */}
      <div className="flex flex-wrap gap-2">
        {botoes.map((b) => (
          <Button
            key={b.key}
            onClick={() => setAba(b.key)}
            className={
              aba === b.key
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300"
            }
          >
            {b.label}
          </Button>
        ))}
      </div>

      {/* SIMPLES */}
      {aba === "simples" && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Calculadora Simples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Odd</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={odd}
                  onChange={(e) => setOdd(e.target.value)}
                  className="bg-gray-800 border-gray-700 mt-1"
                  placeholder="1.80"
                />
              </div>
              <div>
                <Label>Stake (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={stake}
                  onChange={(e) => setStake(e.target.value)}
                  className="bg-gray-800 border-gray-700 mt-1"
                  placeholder="100.00"
                />
              </div>
            </div>

            {odd && stake && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-xs mb-1">Retorno Total</p>
                  <p className="text-green-400 font-bold text-xl">
                    R$ {retorno.toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-xs mb-1">Lucro Líquido</p>
                  <p
                    className={`font-bold text-xl ${lucro >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    R$ {lucro.toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-xs mb-1">Prob. Implícita</p>
                  <p className="text-yellow-400 font-bold text-xl">
                    {probImplicita}%
                  </p>
                </div>
              </div>
            )}

            <div className="bg-gray-800 rounded-lg p-4 mt-2">
              <p className="text-gray-400 text-sm font-medium mb-2">
                📚 Conversão de odds
              </p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Decimal</p>
                  <p className="text-white">{odd || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Americano</p>
                  <p className="text-white">
                    {odd
                      ? parseFloat(odd) >= 2
                        ? `+${((parseFloat(odd) - 1) * 100).toFixed(0)}`
                        : `-${(100 / (parseFloat(odd) - 1)).toFixed(0)}`
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Fracionário</p>
                  <p className="text-white">
                    {odd
                      ? `${((parseFloat(odd) - 1) * 100).toFixed(0)}/100`
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* DUTCHING */}
      {aba === "dutching" && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">
              ⚖️ Dutching — Distribuir banca entre seleções
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Banca total (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={bancaDutch}
                onChange={(e) => setBancaDutch(e.target.value)}
                className="bg-gray-800 border-gray-700 mt-1"
                placeholder="200.00"
              />
            </div>

            <div className="space-y-3">
              {selecoes.map((s, i) => (
                <div key={i} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Label>Seleção {i + 1} — Odd</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={s.odd}
                      onChange={(e) => {
                        const n = [...selecoes];
                        n[i].odd = e.target.value;
                        setSelecoes(n);
                      }}
                      className="bg-gray-800 border-gray-700 mt-1"
                      placeholder="2.50"
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Stake calculado</Label>
                    <div className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 mt-1 text-green-400 font-medium">
                      R$ {selecoesDutch[i]?.stake || "0.00"}
                    </div>
                  </div>
                  {selecoes.length > 2 && (
                    <Button
                      size="sm"
                      className="bg-red-700 hover:bg-red-600 mb-0.5"
                      onClick={() =>
                        setSelecoes(selecoes.filter((_, j) => j !== i))
                      }
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              onClick={() => setSelecoes([...selecoes, { odd: "", stake: "" }])}
              variant="outline"
              size="sm"
              className="border-gray-700"
            >
              + Adicionar seleção
            </Button>

            {bancaDutch && (
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm">
                  Retorno garantido (qualquer seleção ganhar):
                </p>
                <p className="text-green-400 font-bold text-xl">
                  R$ {retornoDutch}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Lucro: R${" "}
                  {(parseFloat(retornoDutch) - parseFloat(bancaDutch)).toFixed(
                    2,
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* VALOR ESPERADO */}
      {aba === "ve" && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">📊 Valor Esperado (EV)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400 text-sm">
              Calcula se uma aposta tem valor positivo com base na sua
              estimativa de probabilidade real.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Odd da casa</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={oddVE}
                  onChange={(e) => setOddVE(e.target.value)}
                  className="bg-gray-800 border-gray-700 mt-1"
                  placeholder="2.10"
                />
              </div>
              <div>
                <Label>Sua prob. real (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={probReal}
                  onChange={(e) => setProbReal(e.target.value)}
                  className="bg-gray-800 border-gray-700 mt-1"
                  placeholder="55"
                />
              </div>
              <div>
                <Label>Stake (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={stakeVE}
                  onChange={(e) => setStakeVE(e.target.value)}
                  className="bg-gray-800 border-gray-700 mt-1"
                  placeholder="100.00"
                />
              </div>
            </div>

            {ve !== null && (
              <div
                className={`rounded-lg p-4 ${vePositivo ? "bg-green-900 border border-green-600" : "bg-red-900 border border-red-600"}`}
              >
                <p className="text-white text-sm font-medium">
                  {vePositivo
                    ? "✅ Aposta com VALOR POSITIVO!"
                    : "❌ Aposta sem valor — evite!"}
                </p>
                <p
                  className={`font-bold text-2xl mt-1 ${vePositivo ? "text-green-400" : "text-red-400"}`}
                >
                  EV: R$ {ve}
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  Prob. implícita da odd:{" "}
                  {oddVE ? ((1 / parseFloat(oddVE)) * 100).toFixed(1) : 0}% •
                  Sua estimativa: {probReal}%
                </p>
              </div>
            )}

            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-xs font-medium mb-1">
                📚 Como funciona
              </p>
              <p className="text-gray-500 text-xs">
                EV = (Prob. real × Lucro) - (1 - Prob. real) × Stake. Se EV{" "}
                {">"} 0, a aposta tem valor no longo prazo.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* LAY */}
      {aba === "lay" && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">
              🔄 Calculadora Lay (Betfair)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400 text-sm">
              Calcule sua responsabilidade ao apostar contra um resultado na
              Betfair.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Odd Lay</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={oddLay}
                  onChange={(e) => setOddLay(e.target.value)}
                  className="bg-gray-800 border-gray-700 mt-1"
                  placeholder="2.10"
                />
              </div>
              <div>
                <Label>Stake (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={stakeLay}
                  onChange={(e) => setStakeLay(e.target.value)}
                  className="bg-gray-800 border-gray-700 mt-1"
                  placeholder="100.00"
                />
              </div>
              <div>
                <Label>Comissão (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={comissao}
                  onChange={(e) => setComissao(e.target.value)}
                  className="bg-gray-800 border-gray-700 mt-1"
                  placeholder="5"
                />
              </div>
            </div>

            {oddLay && stakeLay && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-900 border border-green-700 rounded-lg p-4 text-center">
                  <p className="text-gray-300 text-xs mb-1">
                    Lucro se PERDER (lay ganhar)
                  </p>
                  <p className="text-green-400 font-bold text-xl">
                    R$ {lucroLay}
                  </p>
                </div>
                <div className="bg-red-900 border border-red-700 rounded-lg p-4 text-center">
                  <p className="text-gray-300 text-xs mb-1">
                    Responsabilidade se GANHAR
                  </p>
                  <p className="text-red-400 font-bold text-xl">
                    R$ {responsabilidadeLay}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
