"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// ─── Dados fixos ───────────────────────────────────────────────────────────
const JOGOS_COPA: Record<string, string[]> = {
  "Fase de Grupos": [
    "Brasil × Marrocos",
    "Brasil × Croácia",
    "Brasil × Nova Zelândia",
    "Argentina × Argélia",
    "Argentina × Áustria",
    "Argentina × Vietnã",
    "França × Iraque",
    "França × Noruega",
    "França × Panamá",
    "Espanha × Cabo Verde",
    "Espanha × México",
    "Espanha × Uzbequistão",
    "Portugal × Uzbequistão",
    "Portugal × Coreia do Sul",
    "Portugal × Gana",
    "Alemanha × Curaçao",
    "Alemanha × Eslováquia",
    "Alemanha × Chile",
    "Inglaterra × Gana",
    "Inglaterra × Sérvia",
    "Inglaterra × Irão",
    "Holanda × Japão",
    "Holanda × Peru",
    "Holanda × Venezuela",
    "Bélgica × Egito",
    "Bélgica × Vietnã",
    "Bélgica × Paraguai",
    "Noruega × Iraque",
    "Noruega × Senegal",
    "Uruguai × Cabo Verde",
    "EUA × Paraguai",
    "EUA × Paquistão",
    "EUA × Panamá",
    "Arábia Saudita × Uruguai",
    "México × China",
    "Canadá × Bósnia",
    "Austrália × Turquia",
    "Catar × Suíça",
    "Coreia do Sul × Rep. Tcheca",
    "Haiti × Escócia",
    "Tunísia × Japão",
    "Irã × Nova Zelândia",
    "Colômbia × Grécia",
    "Suíça × Jordânia",
  ],
};

const MERCADOS = [
  { value: "vit_casa", label: "Vitória do mandante" },
  { value: "empate", label: "Empate" },
  { value: "vit_fora", label: "Vitória do visitante" },
  { value: "dupla_1x", label: "Dupla chance — Mandante ou Empate (1X)" },
  { value: "dupla_x2", label: "Dupla chance — Empate ou Visitante (X2)" },
  { value: "dupla_12", label: "Dupla chance — Mandante ou Visitante (12)" },
  { value: "btts_sim", label: "Ambas marcam — Sim (BTTS)" },
  { value: "btts_nao", label: "Ambas marcam — Não" },
  { value: "over_0_5", label: "Mais de 0.5 gols" },
  { value: "over_1_5", label: "Mais de 1.5 gols" },
  { value: "over_2_5", label: "Mais de 2.5 gols" },
  { value: "over_3_5", label: "Mais de 3.5 gols" },
  { value: "under_0_5", label: "Menos de 0.5 gols" },
  { value: "under_1_5", label: "Menos de 1.5 gols" },
  { value: "under_2_5", label: "Menos de 2.5 gols" },
  { value: "under_3_5", label: "Menos de 3.5 gols" },
  { value: "cantos_over_8", label: "Mais de 8.5 escanteios" },
  { value: "cantos_over_9", label: "Mais de 9.5 escanteios" },
  { value: "cantos_over_10", label: "Mais de 10.5 escanteios" },
  { value: "cantos_under_8", label: "Menos de 8.5 escanteios" },
  { value: "cantos_under_9", label: "Menos de 9.5 escanteios" },
  { value: "cartoes_over_3", label: "Mais de 3.5 cartões" },
  { value: "cartoes_over_4", label: "Mais de 4.5 cartões" },
  { value: "hc_casa_1", label: "Handicap mandante -1" },
  { value: "hc_fora_1", label: "Handicap visitante -1" },
  { value: "intervalo_vit_casa", label: "Vence mandante no intervalo" },
  { value: "intervalo_empate", label: "Empate no intervalo" },
];

// ─── Types ──────────────────────────────────────────────────────────────────
type Aposta = {
  id: string;
  tipo: "simples" | "multipla";
  partida: string;
  descricao: string;
  odd: number;
  stake: number;
  retorno: number;
  resultado: string;
  created_at: string;
  selecoes?: SelecaoMultipla[];
};

type SelecaoMultipla = {
  jogo: string;
  mercado: string;
  odd: number;
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const todosJogos = Object.values(JOGOS_COPA).flat();

function labelMercado(value: string) {
  return MERCADOS.find((m) => m.value === value)?.label || value;
}

// ─── Componente principal ───────────────────────────────────────────────────
export default function ApostasPage() {
  const [apostas, setApostas] = useState<Aposta[]>([]);
  const [filtro, setFiltro] = useState("todos");
  const [aba, setAba] = useState<"simples" | "multipla">("simples");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Form simples
  const [formSimples, setFormSimples] = useState({
    jogo: "",
    mercado: "",
    oddCustom: "",
    stake: "",
  });

  // Form múltipla
  const [selecoes, setSelecoes] = useState<SelecaoMultipla[]>([
    { jogo: "", mercado: "", odd: 1.5 },
  ]);
  const [oddMultiplaManual, setOddMultiplaManual] = useState("");
  const [stakeMultipla, setStakeMultipla] = useState("");
  const [editarOddManual, setEditarOddManual] = useState(false);

  const oddMultiplaCalculada = parseFloat(
    selecoes.reduce((acc, s) => acc * (s.odd || 1), 1).toFixed(2),
  );
  const oddMultiplaFinal =
    editarOddManual && oddMultiplaManual
      ? parseFloat(oddMultiplaManual)
      : oddMultiplaCalculada;

  useEffect(() => {
    loadApostas();
  }, []);

  async function loadApostas() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data } = await supabase
      .from("apostas")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setApostas((data || []) as Aposta[]);
  }

  async function atualizarBanca(userId: string) {
    const { data: profile } = await supabase
      .from("users_profile")
      .select("banca_inicial")
      .eq("user_id", userId)
      .single();
    const { data: todas } = await supabase
      .from("apostas")
      .select("stake, retorno, resultado")
      .eq("user_id", userId);
    let banca = profile?.banca_inicial || 0;
    todas?.forEach((a: any) => {
      if (a.resultado === "ganhou")
        banca = banca - Number(a.stake) + Number(a.retorno);
      else if (a.resultado === "perdeu") banca = banca - Number(a.stake);
    });
    await supabase
      .from("users_profile")
      .update({ banca_atual: banca })
      .eq("user_id", userId);
  }

  // ── Submete aposta simples ──
  async function handleSimples(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const odd = parseFloat(formSimples.oddCustom);
    const stake = parseFloat(formSimples.stake);
    const descricao = labelMercado(formSimples.mercado);
    await supabase.from("apostas").insert({
      user_id: user!.id,
      tipo: "simples",
      partida: formSimples.jogo,
      descricao,
      odd,
      stake,
      retorno: stake * odd,
      resultado: "pendente",
    });
    setFormSimples({ jogo: "", mercado: "", oddCustom: "", stake: "" });
    await loadApostas();
    setLoading(false);
  }

  // ── Submete aposta múltipla ──
  async function handleMultipla(e: React.FormEvent) {
    e.preventDefault();
    if (selecoes.some((s) => !s.jogo || !s.mercado)) return;
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const stake = parseFloat(stakeMultipla);
    const partida = `Múltipla (${selecoes.length} seleções)`;
    const descricao = selecoes
      .map((s) => `${s.jogo}: ${labelMercado(s.mercado)}`)
      .join(" | ");
    await supabase.from("apostas").insert({
      user_id: user!.id,
      tipo: "multipla",
      partida,
      descricao,
      odd: oddMultiplaFinal,
      stake,
      retorno: stake * oddMultiplaFinal,
      resultado: "pendente",
      selecoes,
    });
    setSelecoes([{ jogo: "", mercado: "", odd: 1.5 }]);
    setStakeMultipla("");
    setOddMultiplaManual("");
    setEditarOddManual(false);
    await loadApostas();
    setLoading(false);
  }

  // ── Atualiza resultado ──
  async function handleResultado(
    id: string,
    resultado: string,
    stake: number,
    odd: number,
    resultadoAnterior: string,
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const retorno = resultado === "ganhou" ? stake * odd : 0;
    await supabase.from("apostas").update({ resultado, retorno }).eq("id", id);
    await atualizarBanca(user!.id);
    await loadApostas();
  }

  // ── Exclui aposta ──
  async function handleExcluir(id: string) {
    if (!confirm("Excluir esta aposta?")) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("apostas").delete().eq("id", id);
    await atualizarBanca(user!.id);
    await loadApostas();
  }

  // ── Exportar CSV ──
  function exportCSV() {
    const headers = [
      "Data",
      "Tipo",
      "Partida",
      "Descrição",
      "Odd",
      "Stake",
      "Retorno",
      "Resultado",
    ];
    const rows = apostasFiltradas.map((a) => [
      new Date(a.created_at).toLocaleDateString("pt-BR"),
      a.tipo || "simples",
      a.partida,
      a.descricao,
      a.odd,
      a.stake,
      a.retorno?.toFixed(2),
      a.resultado,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `apostas_hexa_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const apostasFiltradas = apostas.filter(
    (a) => filtro === "todos" || a.resultado === filtro,
  );

  // ── Selects reutilizáveis ──
  const SelectJogo = ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-600"
    >
      <option value="">Selecione o jogo...</option>
      {Object.entries(JOGOS_COPA).map(([fase, jogos]) => (
        <optgroup key={fase} label={fase}>
          {jogos.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );

  const SelectMercado = ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-600"
    >
      <option value="">Selecione o mercado...</option>
      {MERCADOS.map((m) => (
        <option key={m.value} value={m.value}>
          {m.label}
        </option>
      ))}
    </select>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">🎯 Minhas Apostas</h1>

      {/* ── Abas nova aposta ── */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-white">Nova Aposta</CardTitle>
            <div className="flex gap-2">
              <button
                onClick={() => setAba("simples")}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${aba === "simples" ? "bg-green-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}
              >
                🎯 Simples
              </button>
              <button
                onClick={() => setAba("multipla")}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${aba === "multipla" ? "bg-yellow-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}
              >
                🎰 Múltipla
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* ── FORM SIMPLES ── */}
          {aba === "simples" && (
            <form onSubmit={handleSimples} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400 text-xs mb-1 block">
                    Jogo
                  </Label>
                  <SelectJogo
                    value={formSimples.jogo}
                    onChange={(v) =>
                      setFormSimples({ ...formSimples, jogo: v })
                    }
                  />
                </div>
                <div>
                  <Label className="text-gray-400 text-xs mb-1 block">
                    Mercado
                  </Label>
                  <SelectMercado
                    value={formSimples.mercado}
                    onChange={(v) =>
                      setFormSimples({ ...formSimples, mercado: v })
                    }
                  />
                </div>
                <div>
                  <Label className="text-gray-400 text-xs mb-1 block">
                    Odd
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="1.01"
                    value={formSimples.oddCustom}
                    onChange={(e) =>
                      setFormSimples({
                        ...formSimples,
                        oddCustom: e.target.value,
                      })
                    }
                    className="bg-gray-800 border-gray-700"
                    placeholder="Ex: 1.85"
                    required
                  />
                </div>
                <div>
                  <Label className="text-gray-400 text-xs mb-1 block">
                    Stake (R$)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formSimples.stake}
                    onChange={(e) =>
                      setFormSimples({ ...formSimples, stake: e.target.value })
                    }
                    className="bg-gray-800 border-gray-700"
                    placeholder="Ex: 50.00"
                    required
                  />
                </div>
              </div>
              {formSimples.oddCustom && formSimples.stake && (
                <div className="bg-gray-800 rounded-lg p-3 flex justify-between">
                  <span className="text-gray-400 text-sm">
                    Retorno potencial:
                  </span>
                  <span className="text-green-400 font-bold">
                    R${" "}
                    {(
                      parseFloat(formSimples.stake) *
                      parseFloat(formSimples.oddCustom)
                    ).toFixed(2)}
                  </span>
                </div>
              )}
              <Button
                type="submit"
                disabled={loading || !formSimples.jogo || !formSimples.mercado}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? "Salvando..." : "+ Adicionar Aposta Simples"}
              </Button>
            </form>
          )}

          {/* ── FORM MÚLTIPLA ── */}
          {aba === "multipla" && (
            <form onSubmit={handleMultipla} className="space-y-4">
              {/* Seleções */}
              <div className="space-y-3">
                {selecoes.map((sel, i) => (
                  <div key={i} className="bg-gray-800 rounded-xl p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-yellow-400">
                        Seleção {i + 1}
                      </span>
                      {selecoes.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setSelecoes((prev) =>
                              prev.filter((_, idx) => idx !== i),
                            )
                          }
                          className="text-gray-500 hover:text-red-400 text-lg leading-none transition-colors"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-1">
                        <Label className="text-gray-400 text-xs mb-1 block">
                          Jogo
                        </Label>
                        <SelectJogo
                          value={sel.jogo}
                          onChange={(v) =>
                            setSelecoes((prev) =>
                              prev.map((s, idx) =>
                                idx === i ? { ...s, jogo: v } : s,
                              ),
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400 text-xs mb-1 block">
                          Mercado
                        </Label>
                        <SelectMercado
                          value={sel.mercado}
                          onChange={(v) =>
                            setSelecoes((prev) =>
                              prev.map((s, idx) =>
                                idx === i ? { ...s, mercado: v } : s,
                              ),
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400 text-xs mb-1 block">
                          Odd
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="1.01"
                          value={sel.odd}
                          onChange={(e) =>
                            setSelecoes((prev) =>
                              prev.map((s, idx) =>
                                idx === i
                                  ? { ...s, odd: parseFloat(e.target.value) }
                                  : s,
                              ),
                            )
                          }
                          className="bg-gray-700 border-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelecoes((prev) => [
                    ...prev,
                    { jogo: "", mercado: "", odd: 1.5 },
                  ])
                }
                className="w-full border border-dashed border-gray-600 text-gray-400 hover:text-yellow-400 hover:border-yellow-600 py-2 rounded-xl text-sm transition-colors"
              >
                + Adicionar seleção
              </button>

              {/* Odd combinada */}
              <div className="bg-gray-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">
                    Odd combinada ({selecoes.length} seleções):
                  </span>
                  <span className="text-yellow-400 font-bold text-lg">
                    {oddMultiplaCalculada.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editarOdd"
                    checked={editarOddManual}
                    onChange={(e) => {
                      setEditarOddManual(e.target.checked);
                      if (!e.target.checked) setOddMultiplaManual("");
                    }}
                    className="accent-yellow-500"
                  />
                  <label
                    htmlFor="editarOdd"
                    className="text-xs text-gray-400 cursor-pointer"
                  >
                    Editar odd manualmente (ex: odd real da casa)
                  </label>
                </div>

                {editarOddManual && (
                  <Input
                    type="number"
                    step="0.01"
                    min="1.01"
                    value={oddMultiplaManual}
                    onChange={(e) => setOddMultiplaManual(e.target.value)}
                    className="bg-gray-700 border-gray-600"
                    placeholder={`Calculada: ${oddMultiplaCalculada.toFixed(2)}`}
                  />
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-gray-400 text-xs mb-1 block">
                      Stake (R$)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={stakeMultipla}
                      onChange={(e) => setStakeMultipla(e.target.value)}
                      className="bg-gray-700 border-gray-600"
                      placeholder="Ex: 30.00"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs mb-1 block">
                      Retorno potencial
                    </Label>
                    <div className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-green-400 font-bold text-sm">
                      {stakeMultipla
                        ? `R$ ${(parseFloat(stakeMultipla) * oddMultiplaFinal).toFixed(2)}`
                        : "R$ 0.00"}
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={
                  loading ||
                  selecoes.some((s) => !s.jogo || !s.mercado) ||
                  !stakeMultipla
                }
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold"
              >
                {loading
                  ? "Salvando..."
                  : `🎰 Adicionar Múltipla (${selecoes.length} seleções)`}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* ── Filtros + exportar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "todos", label: "Todos" },
            { key: "pendente", label: "⏳ Pendentes" },
            { key: "ganhou", label: "✅ Ganhas" },
            { key: "perdeu", label: "❌ Perdidas" },
          ].map((f) => (
            <Button
              key={f.key}
              size="sm"
              className={
                filtro === f.key
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-800 hover:bg-gray-700"
              }
              onClick={() => setFiltro(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <Button
          onClick={exportCSV}
          variant="outline"
          size="sm"
          className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
        >
          📥 Exportar CSV
        </Button>
      </div>

      {/* ── Lista de apostas ── */}
      <div className="space-y-3">
        {apostasFiltradas.map((aposta) => (
          <Card key={aposta.id} className="bg-gray-900 border-gray-800">
            <CardContent className="pt-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-white font-semibold text-sm">
                      {aposta.partida}
                    </p>
                    <Badge
                      className={`text-[10px] px-2 py-0 ${
                        aposta.tipo === "multipla"
                          ? "bg-yellow-600/20 text-yellow-400 border border-yellow-800"
                          : "bg-blue-600/20 text-blue-400 border border-blue-800"
                      }`}
                    >
                      {aposta.tipo === "multipla"
                        ? "🎰 Múltipla"
                        : "🎯 Simples"}
                    </Badge>
                  </div>

                  {/* Seleções da múltipla */}
                  {aposta.tipo === "multipla" && aposta.selecoes && (
                    <div className="mt-1 mb-2 space-y-0.5">
                      {aposta.selecoes.map((s, i) => (
                        <p key={i} className="text-[11px] text-gray-500">
                          <span className="text-gray-400">{s.jogo}</span>
                          {" · "}
                          {labelMercado(s.mercado)}
                          {" · "}
                          <span className="text-yellow-400">{s.odd}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  {aposta.tipo !== "multipla" && (
                    <p className="text-gray-400 text-xs mb-1">
                      {aposta.descricao}
                    </p>
                  )}

                  <p className="text-gray-500 text-xs">
                    {new Date(aposta.created_at).toLocaleDateString("pt-BR")} ·
                    Odd:{" "}
                    <span className="text-yellow-400">
                      {Number(aposta.odd).toFixed(2)}
                    </span>{" "}
                    · Stake:{" "}
                    <span className="text-white">
                      R$ {Number(aposta.stake).toFixed(2)}
                    </span>{" "}
                    · Retorno:{" "}
                    <span className="text-green-400">
                      R$ {Number(aposta.retorno).toFixed(2)}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  {aposta.resultado === "pendente" ? (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() =>
                          handleResultado(
                            aposta.id,
                            "ganhou",
                            aposta.stake,
                            aposta.odd,
                            aposta.resultado,
                          )
                        }
                      >
                        ✅ Ganhou
                      </Button>
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() =>
                          handleResultado(
                            aposta.id,
                            "perdeu",
                            aposta.stake,
                            aposta.odd,
                            aposta.resultado,
                          )
                        }
                      >
                        ❌ Perdeu
                      </Button>
                    </>
                  ) : (
                    <>
                      <Badge
                        className={
                          aposta.resultado === "ganhou"
                            ? "bg-green-600/20 text-green-400 border border-green-800"
                            : "bg-red-600/20 text-red-400 border border-red-800"
                        }
                      >
                        {aposta.resultado === "ganhou"
                          ? "✅ Ganhou"
                          : "❌ Perdeu"}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-400 hover:text-white hover:bg-gray-700 text-xs"
                        onClick={() =>
                          handleResultado(
                            aposta.id,
                            "pendente",
                            aposta.stake,
                            aposta.odd,
                            aposta.resultado,
                          )
                        }
                      >
                        Desfazer
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-900 text-red-500 hover:bg-red-600 hover:text-white text-xs"
                    onClick={() => handleExcluir(aposta.id)}
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {apostasFiltradas.length === 0 && (
          <p className="text-gray-400 text-center py-12">
            Nenhuma aposta encontrada. 🎯
          </p>
        )}
      </div>
    </div>
  );
}
