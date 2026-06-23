"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// ─── Jogos fixos Copa 2026 ──────────────────────────────────────────────────
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
    "Egito × Nova Zelândia",
    "Japão × Tunísia",
    "Suécia × Tunísia",
  ],
};

// ─── Mercados completos ─────────────────────────────────────────────────────
const MERCADOS = [
  { group: "Resultado", value: "vit_casa", label: "Vitória do mandante" },
  { group: "Resultado", value: "empate", label: "Empate" },
  { group: "Resultado", value: "vit_fora", label: "Vitória do visitante" },
  { group: "Resultado", value: "dupla_1x", label: "Dupla chance 1X" },
  { group: "Resultado", value: "dupla_x2", label: "Dupla chance X2" },
  { group: "Resultado", value: "dupla_12", label: "Dupla chance 12" },
  { group: "Gols Over", value: "over_0_5", label: "Mais de 0.5 gols" },
  { group: "Gols Over", value: "over_1_5", label: "Mais de 1.5 gols" },
  { group: "Gols Over", value: "over_2_5", label: "Mais de 2.5 gols" },
  { group: "Gols Over", value: "over_3_5", label: "Mais de 3.5 gols" },
  { group: "Gols Over", value: "over_4_5", label: "Mais de 4.5 gols" },
  { group: "Gols Over", value: "over_5_5", label: "Mais de 5.5 gols" },
  { group: "Gols Under", value: "under_0_5", label: "Menos de 0.5 gols" },
  { group: "Gols Under", value: "under_1_5", label: "Menos de 1.5 gols" },
  { group: "Gols Under", value: "under_2_5", label: "Menos de 2.5 gols" },
  { group: "Gols Under", value: "under_3_5", label: "Menos de 3.5 gols" },
  { group: "Gols Under", value: "under_4_5", label: "Menos de 4.5 gols" },
  { group: "Gols Under", value: "under_5_5", label: "Menos de 5.5 gols" },
  { group: "Ambas Marcam", value: "btts_sim", label: "Ambas marcam — Sim" },
  { group: "Ambas Marcam", value: "btts_nao", label: "Ambas marcam — Não" },
  {
    group: "Escanteios Over",
    value: "cant_ov_4_5",
    label: "Mais de 4.5 escanteios",
  },
  {
    group: "Escanteios Over",
    value: "cant_ov_5_5",
    label: "Mais de 5.5 escanteios",
  },
  {
    group: "Escanteios Over",
    value: "cant_ov_6_5",
    label: "Mais de 6.5 escanteios",
  },
  {
    group: "Escanteios Over",
    value: "cant_ov_7_5",
    label: "Mais de 7.5 escanteios",
  },
  {
    group: "Escanteios Over",
    value: "cant_ov_8_5",
    label: "Mais de 8.5 escanteios",
  },
  {
    group: "Escanteios Over",
    value: "cant_ov_9_5",
    label: "Mais de 9.5 escanteios",
  },
  {
    group: "Escanteios Over",
    value: "cant_ov_10_5",
    label: "Mais de 10.5 escanteios",
  },
  {
    group: "Escanteios Over",
    value: "cant_ov_11_5",
    label: "Mais de 11.5 escanteios",
  },
  {
    group: "Escanteios Over",
    value: "cant_ov_12_5",
    label: "Mais de 12.5 escanteios",
  },
  {
    group: "Escanteios Over",
    value: "cant_ov_13_5",
    label: "Mais de 13.5 escanteios",
  },
  {
    group: "Escanteios Under",
    value: "cant_un_4_5",
    label: "Menos de 4.5 escanteios",
  },
  {
    group: "Escanteios Under",
    value: "cant_un_5_5",
    label: "Menos de 5.5 escanteios",
  },
  {
    group: "Escanteios Under",
    value: "cant_un_6_5",
    label: "Menos de 6.5 escanteios",
  },
  {
    group: "Escanteios Under",
    value: "cant_un_7_5",
    label: "Menos de 7.5 escanteios",
  },
  {
    group: "Escanteios Under",
    value: "cant_un_8_5",
    label: "Menos de 8.5 escanteios",
  },
  {
    group: "Escanteios Under",
    value: "cant_un_9_5",
    label: "Menos de 9.5 escanteios",
  },
  {
    group: "Escanteios Under",
    value: "cant_un_10_5",
    label: "Menos de 10.5 escanteios",
  },
  {
    group: "Escanteios Under",
    value: "cant_un_11_5",
    label: "Menos de 11.5 escanteios",
  },
  {
    group: "Escanteios Under",
    value: "cant_un_12_5",
    label: "Menos de 12.5 escanteios",
  },
  { group: "Cartões Over", value: "cart_ov_1_5", label: "Mais de 1.5 cartões" },
  { group: "Cartões Over", value: "cart_ov_2_5", label: "Mais de 2.5 cartões" },
  { group: "Cartões Over", value: "cart_ov_3_5", label: "Mais de 3.5 cartões" },
  { group: "Cartões Over", value: "cart_ov_4_5", label: "Mais de 4.5 cartões" },
  { group: "Cartões Over", value: "cart_ov_5_5", label: "Mais de 5.5 cartões" },
  {
    group: "Cartões Under",
    value: "cart_un_2_5",
    label: "Menos de 2.5 cartões",
  },
  {
    group: "Cartões Under",
    value: "cart_un_3_5",
    label: "Menos de 3.5 cartões",
  },
  {
    group: "Cartões Under",
    value: "cart_un_4_5",
    label: "Menos de 4.5 cartões",
  },
  {
    group: "Cartões Under",
    value: "cart_un_5_5",
    label: "Menos de 5.5 cartões",
  },
  { group: "Handicap", value: "hc_casa_1", label: "Handicap mandante -1" },
  { group: "Handicap", value: "hc_casa_2", label: "Handicap mandante -2" },
  { group: "Handicap", value: "hc_fora_1", label: "Handicap visitante -1" },
  { group: "Handicap", value: "hc_fora_2", label: "Handicap visitante -2" },
  { group: "Handicap", value: "hc_casa_p1", label: "Handicap mandante +1" },
  { group: "Handicap", value: "hc_fora_p1", label: "Handicap visitante +1" },
  {
    group: "Intervalo",
    value: "ht_vit_casa",
    label: "Mandante vence no intervalo",
  },
  { group: "Intervalo", value: "ht_empate", label: "Empate no intervalo" },
  {
    group: "Intervalo",
    value: "ht_vit_fora",
    label: "Visitante vence no intervalo",
  },
  {
    group: "Intervalo",
    value: "ht_over_0_5",
    label: "Mais de 0.5 gols no 1º tempo",
  },
  {
    group: "Intervalo",
    value: "ht_over_1_5",
    label: "Mais de 1.5 gols no 1º tempo",
  },
  { group: "Placar Exato", value: "placar_1_0", label: "Placar 1-0" },
  { group: "Placar Exato", value: "placar_2_0", label: "Placar 2-0" },
  { group: "Placar Exato", value: "placar_2_1", label: "Placar 2-1" },
  { group: "Placar Exato", value: "placar_3_0", label: "Placar 3-0" },
  { group: "Placar Exato", value: "placar_3_1", label: "Placar 3-1" },
  { group: "Placar Exato", value: "placar_3_2", label: "Placar 3-2" },
  { group: "Placar Exato", value: "placar_0_0", label: "Placar 0-0" },
  { group: "Placar Exato", value: "placar_1_1", label: "Placar 1-1" },
  { group: "Placar Exato", value: "placar_2_2", label: "Placar 2-2" },
  { group: "Placar Exato", value: "placar_0_1", label: "Placar 0-1" },
  { group: "Placar Exato", value: "placar_0_2", label: "Placar 0-2" },
  { group: "Placar Exato", value: "placar_1_2", label: "Placar 1-2" },
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
  odd: number; // odd do JOGO inteiro (não por mercado)
};

// Jogo agrupado na múltipla — odd é do jogo, mercados são só descritivos
type JogoMultipla = {
  jogo: string;
  odd: number; // ← odd única por jogo
  mercados: string[]; // lista de mercados selecionados (sem odd individual)
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function labelMercado(value: string) {
  return MERCADOS.find((m) => m.value === value)?.label || value;
}
const groups = [...new Set(MERCADOS.map((m) => m.group))];

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
    {groups.map((g) => (
      <optgroup key={g} label={g}>
        {MERCADOS.filter((m) => m.group === g).map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </optgroup>
    ))}
  </select>
);

// ─── Página ──────────────────────────────────────────────────────────────────
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
    odd: "",
    stake: "",
  });

  // Form múltipla — odd por jogo
  const [jogosMultipla, setJogosMultipla] = useState<JogoMultipla[]>([
    { jogo: "", odd: 1.5, mercados: [""] },
  ]);
  const [oddMultiplaManual, setOddMultiplaManual] = useState("");
  const [stakeMultipla, setStakeMultipla] = useState("");
  const [editarOddManual, setEditarOddManual] = useState(false);

  const oddCalculada = parseFloat(
    jogosMultipla.reduce((acc, j) => acc * (j.odd || 1), 1).toFixed(2),
  );
  const oddFinal =
    editarOddManual && oddMultiplaManual
      ? parseFloat(oddMultiplaManual)
      : oddCalculada;

  const totalSelecoes = jogosMultipla.reduce(
    (acc, j) => acc + j.mercados.filter(Boolean).length,
    0,
  );

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

  async function handleSimples(e: React.FormEvent) {
    e.preventDefault();
    if (!formSimples.jogo || !formSimples.mercado) return;
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const odd = parseFloat(formSimples.odd);
    const stake = parseFloat(formSimples.stake);
    await supabase.from("apostas").insert({
      user_id: user!.id,
      tipo: "simples",
      partida: formSimples.jogo,
      descricao: labelMercado(formSimples.mercado),
      odd,
      stake,
      retorno: stake * odd,
      resultado: "pendente",
    });
    setFormSimples({ jogo: "", mercado: "", odd: "", stake: "" });
    await loadApostas();
    setLoading(false);
  }

  async function handleMultipla(e: React.FormEvent) {
    e.preventDefault();
    if (jogosMultipla.some((j) => !j.jogo || j.mercados.every((m) => !m)))
      return;
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const stake = parseFloat(stakeMultipla);

    // Monta seleções flattenadas para salvar
    const selecoes: SelecaoMultipla[] = jogosMultipla.flatMap((j) =>
      j.mercados
        .filter(Boolean)
        .map((m) => ({ jogo: j.jogo, mercado: m, odd: j.odd })),
    );

    const partida = `Múltipla (${jogosMultipla.length} jogo${jogosMultipla.length > 1 ? "s" : ""})`;
    const descricao = jogosMultipla
      .map(
        (j) =>
          `${j.jogo} [${j.mercados.filter(Boolean).map(labelMercado).join(" + ")}] @${j.odd}`,
      )
      .join(" | ");

    await supabase.from("apostas").insert({
      user_id: user!.id,
      tipo: "multipla",
      partida,
      descricao,
      odd: oddFinal,
      stake,
      retorno: stake * oddFinal,
      resultado: "pendente",
      selecoes,
    });

    setJogosMultipla([{ jogo: "", odd: 1.5, mercados: [""] }]);
    setStakeMultipla("");
    setOddMultiplaManual("");
    setEditarOddManual(false);
    await loadApostas();
    setLoading(false);
  }

  async function handleResultado(
    id: string,
    resultado: string,
    stake: number,
    odd: number,
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const retorno = resultado === "ganhou" ? stake * odd : 0;
    await supabase.from("apostas").update({ resultado, retorno }).eq("id", id);
    await atualizarBanca(user!.id);
    await loadApostas();
  }

  async function handleExcluir(id: string) {
    if (!confirm("Excluir esta aposta?")) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("apostas").delete().eq("id", id);
    await atualizarBanca(user!.id);
    await loadApostas();
  }

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
      Number(a.retorno).toFixed(2),
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

  // ── Helpers múltipla ──
  function addJogo() {
    setJogosMultipla((p) => [...p, { jogo: "", odd: 1.5, mercados: [""] }]);
  }
  function removeJogo(ji: number) {
    setJogosMultipla((p) => p.filter((_, i) => i !== ji));
  }
  function updateJogoField(ji: number, field: "jogo" | "odd", value: any) {
    setJogosMultipla((p) =>
      p.map((j, i) => (i === ji ? { ...j, [field]: value } : j)),
    );
  }
  function addMercado(ji: number) {
    setJogosMultipla((p) =>
      p.map((j, i) => (i === ji ? { ...j, mercados: [...j.mercados, ""] } : j)),
    );
  }
  function removeMercado(ji: number, mi: number) {
    setJogosMultipla((p) =>
      p.map((j, i) =>
        i === ji
          ? { ...j, mercados: j.mercados.filter((_, idx) => idx !== mi) }
          : j,
      ),
    );
  }
  function updateMercado(ji: number, mi: number, value: string) {
    setJogosMultipla((p) =>
      p.map((j, i) =>
        i === ji
          ? {
              ...j,
              mercados: j.mercados.map((m, idx) => (idx === mi ? value : m)),
            }
          : j,
      ),
    );
  }

  const apostasFiltradas = apostas.filter(
    (a) => filtro === "todos" || a.resultado === filtro,
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">🎯 Minhas Apostas</h1>

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
          {/* ── SIMPLES ── */}
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
                    value={formSimples.odd}
                    onChange={(e) =>
                      setFormSimples({ ...formSimples, odd: e.target.value })
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
              {formSimples.odd && formSimples.stake && (
                <div className="bg-gray-800 rounded-lg p-3 flex justify-between">
                  <span className="text-gray-400 text-sm">
                    Retorno potencial:
                  </span>
                  <span className="text-green-400 font-bold">
                    R${" "}
                    {(
                      parseFloat(formSimples.stake) *
                      parseFloat(formSimples.odd)
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

          {/* ── MÚLTIPLA ── */}
          {aba === "multipla" && (
            <form onSubmit={handleMultipla} className="space-y-4">
              {jogosMultipla.map((jogoItem, ji) => (
                <div
                  key={ji}
                  className="bg-gray-800 rounded-xl p-4 space-y-3 border border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                      ⚽ Jogo {ji + 1}
                    </span>
                    {jogosMultipla.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeJogo(ji)}
                        className="text-gray-500 hover:text-red-400 text-xs transition-colors"
                      >
                        🗑️ Remover jogo
                      </button>
                    )}
                  </div>

                  {/* Jogo + Odd do jogo na mesma linha */}
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <Label className="text-gray-400 text-xs mb-1 block">
                        Jogo
                      </Label>
                      <SelectJogo
                        value={jogoItem.jogo}
                        onChange={(v) => updateJogoField(ji, "jogo", v)}
                      />
                    </div>
                    <div className="w-28 shrink-0">
                      <Label className="text-gray-400 text-xs mb-1 block">
                        Odd do jogo
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="1.01"
                        value={jogoItem.odd}
                        onChange={(e) =>
                          updateJogoField(ji, "odd", parseFloat(e.target.value))
                        }
                        className="bg-gray-700 border-gray-600 text-center font-bold text-yellow-400"
                      />
                    </div>
                  </div>

                  {/* Mercados — só descritivos, sem odd */}
                  <div className="space-y-2 pl-2 border-l-2 border-gray-700">
                    <Label className="text-gray-400 text-xs block">
                      Mercados selecionados
                    </Label>
                    {jogoItem.mercados.map((m, mi) => (
                      <div key={mi} className="flex items-center gap-2">
                        <div className="flex-1">
                          <SelectMercado
                            value={m}
                            onChange={(v) => updateMercado(ji, mi, v)}
                          />
                        </div>
                        {jogoItem.mercados.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMercado(ji, mi)}
                            className="text-gray-500 hover:text-red-400 text-lg leading-none transition-colors shrink-0"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addMercado(ji)}
                      className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors flex items-center gap-1"
                    >
                      + Adicionar mercado neste jogo
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addJogo}
                className="w-full border border-dashed border-gray-600 text-gray-400 hover:text-yellow-400 hover:border-yellow-600 py-2.5 rounded-xl text-sm transition-colors"
              >
                + Adicionar outro jogo
              </button>

              {/* Resumo */}
              <div className="bg-gray-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">
                    Odd combinada ({jogosMultipla.length} jogo
                    {jogosMultipla.length > 1 ? "s" : ""}):
                  </span>
                  <span className="text-yellow-400 font-bold text-xl">
                    {oddCalculada.toFixed(2)}
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
                    className="accent-yellow-500 w-4 h-4"
                  />
                  <label
                    htmlFor="editarOdd"
                    className="text-xs text-gray-400 cursor-pointer"
                  >
                    Usar odd real da casa (diferente da calculada)
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
                    placeholder={`Calculada: ${oddCalculada.toFixed(2)}`}
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
                    <div className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-green-400 font-bold">
                      {stakeMultipla
                        ? `R$ ${(parseFloat(stakeMultipla) * oddFinal).toFixed(2)}`
                        : "R$ 0.00"}
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={
                  loading ||
                  jogosMultipla.some((j) => !j.jogo) ||
                  !stakeMultipla
                }
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold"
              >
                {loading
                  ? "Salvando..."
                  : `🎰 Adicionar Múltipla (${jogosMultipla.length} jogo${jogosMultipla.length > 1 ? "s" : ""} · ${totalSelecoes} mercado${totalSelecoes !== 1 ? "s" : ""})`}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* ── Filtros ── */}
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

      {/* ── Lista ── */}
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

                  {/* Exibe seleções agrupadas por jogo */}
                  {aposta.tipo === "multipla" &&
                    aposta.selecoes &&
                    (() => {
                      const porJogo: Record<string, SelecaoMultipla[]> = {};
                      aposta.selecoes.forEach((s) => {
                        if (!porJogo[s.jogo]) porJogo[s.jogo] = [];
                        porJogo[s.jogo].push(s);
                      });
                      return (
                        <div className="mt-1 mb-2 space-y-1.5">
                          {Object.entries(porJogo).map(([jogo, sels]) => (
                            <div key={jogo}>
                              <p className="text-[12px] text-gray-300 font-semibold flex items-center gap-2">
                                {jogo}
                                <span className="text-yellow-400 font-bold">
                                  @{sels[0].odd}
                                </span>
                              </p>
                              {sels.map((s, i) => (
                                <p
                                  key={i}
                                  className="text-[11px] text-gray-500 pl-3"
                                >
                                  ↳ {labelMercado(s.mercado)}
                                </p>
                              ))}
                            </div>
                          ))}
                        </div>
                      );
                    })()}

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
