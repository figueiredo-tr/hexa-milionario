"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type Aposta = {
  id: string;
  partida: string;
  descricao: string;
  odd: number;
  stake: number;
  retorno: number;
  resultado: string;
  created_at: string;
};

export default function ApostasPage() {
  const [apostas, setApostas] = useState<Aposta[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState("todos");
  const [editando, setEditando] = useState<Aposta | null>(null);
  const [excluindo, setExcluindo] = useState<string | null>(null);
  const [form, setForm] = useState({
    partida: "",
    descricao: "",
    odd: "",
    stake: "",
  });
  const supabase = createClient();

  async function loadApostas() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data } = await supabase
      .from("apostas")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setApostas(data || []);
  }

  useEffect(() => {
    loadApostas();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const odd = parseFloat(form.odd);
    const stake = parseFloat(form.stake);
    const retorno = stake * odd;
    await supabase.from("apostas").insert({
      user_id: user!.id,
      partida: form.partida,
      descricao: form.descricao,
      odd,
      stake,
      retorno,
      resultado: "pendente",
    });
    setForm({ partida: "", descricao: "", odd: "", stake: "" });
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

    // Busca resultado anterior pra reverter banca corretamente
    const apostaAtual = apostas.find((a) => a.id === id);
    const resultadoAnterior = apostaAtual?.resultado;

    await supabase.from("apostas").update({ resultado }).eq("id", id);

    const { data: profile } = await supabase
      .from("users_profile")
      .select("banca_atual")
      .eq("user_id", user!.id)
      .single();

    let novaBanca = profile?.banca_atual || 0;

    // Reverte o efeito anterior se já tinha resultado
    if (resultadoAnterior === "ganhou") novaBanca -= stake * odd - stake;
    if (resultadoAnterior === "perdeu") novaBanca += stake;

    // Aplica o novo resultado
    if (resultado === "ganhou") novaBanca += stake * odd - stake;
    if (resultado === "perdeu") novaBanca -= stake;

    await supabase
      .from("users_profile")
      .update({ banca_atual: novaBanca })
      .eq("user_id", user!.id);
    await loadApostas();
  }

  async function handleEditar(e: React.FormEvent) {
    e.preventDefault();
    if (!editando) return;
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const odd = parseFloat(String(editando.odd));
    const stake = parseFloat(String(editando.stake));
    const retorno = stake * odd;

    await supabase
      .from("apostas")
      .update({
        partida: editando.partida,
        descricao: editando.descricao,
        odd,
        stake,
        retorno,
      })
      .eq("id", editando.id);

    // Recalcula banca do zero
    const { data: profile } = await supabase
      .from("users_profile")
      .select("banca_inicial")
      .eq("user_id", user!.id)
      .single();
    const { data: todasApostas } = await supabase
      .from("apostas")
      .select("*")
      .eq("user_id", user!.id);

    let banca = profile?.banca_inicial || 0;
    todasApostas?.forEach((a: any) => {
      const aOdd = a.id === editando.id ? odd : Number(a.odd);
      const aStake = a.id === editando.id ? stake : Number(a.stake);
      if (a.resultado === "ganhou") banca += aStake * aOdd - aStake;
      if (a.resultado === "perdeu") banca -= aStake;
    });

    await supabase
      .from("users_profile")
      .update({ banca_atual: banca })
      .eq("user_id", user!.id);

    setEditando(null);
    await loadApostas();
    setLoading(false);
  }

  async function handleExcluir(aposta: Aposta) {
    setExcluindo(aposta.id);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("apostas").delete().eq("id", aposta.id);

    // Recalcula banca sem essa aposta
    const { data: profile } = await supabase
      .from("users_profile")
      .select("banca_inicial")
      .eq("user_id", user!.id)
      .single();
    const { data: todasApostas } = await supabase
      .from("apostas")
      .select("*")
      .eq("user_id", user!.id);

    let banca = profile?.banca_inicial || 0;
    todasApostas?.forEach((a: any) => {
      if (a.resultado === "ganhou")
        banca += Number(a.stake) * Number(a.odd) - Number(a.stake);
      if (a.resultado === "perdeu") banca -= Number(a.stake);
    });

    await supabase
      .from("users_profile")
      .update({ banca_atual: banca })
      .eq("user_id", user!.id);
    setExcluindo(null);
    await loadApostas();
  }

  function exportCSV() {
    const headers = [
      "Data",
      "Partida",
      "Descrição",
      "Odd",
      "Stake (R$)",
      "Retorno (R$)",
      "Resultado",
    ];
    const rows = apostasFiltradas.map((a) => [
      new Date(a.created_at).toLocaleDateString("pt-BR"),
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
    link.download = `apostas_hexa_milionario_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const apostasFiltradas = apostas.filter(
    (a) => filtro === "todos" || a.resultado === filtro,
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">🎯 Minhas Apostas</h1>

      {/* ── Formulário nova aposta ── */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Nova Aposta</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <Label>Partida</Label>
              <Input
                value={form.partida}
                onChange={(e) => setForm({ ...form, partida: e.target.value })}
                className="bg-gray-800 border-gray-700 mt-1"
                placeholder="Brasil x Argentina"
                required
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Input
                value={form.descricao}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
                }
                className="bg-gray-800 border-gray-700 mt-1"
                placeholder="Brasil vence"
              />
            </div>
            <div>
              <Label>Odd</Label>
              <Input
                type="number"
                step="0.01"
                value={form.odd}
                onChange={(e) => setForm({ ...form, odd: e.target.value })}
                className="bg-gray-800 border-gray-700 mt-1"
                placeholder="1.80"
                required
              />
            </div>
            <div>
              <Label>Stake (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.stake}
                onChange={(e) => setForm({ ...form, stake: e.target.value })}
                className="bg-gray-800 border-gray-700 mt-1"
                placeholder="50.00"
                required
              />
            </div>
            {form.odd && form.stake && (
              <div className="md:col-span-2 bg-gray-800 rounded-lg p-3 flex justify-between">
                <span className="text-gray-400">Retorno potencial:</span>
                <span className="text-green-400 font-bold">
                  R${" "}
                  {(parseFloat(form.stake) * parseFloat(form.odd)).toFixed(2)}
                </span>
              </div>
            )}
            <Button
              type="submit"
              className="md:col-span-2 bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Salvando..." : "+ Adicionar Aposta"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Modal de edição ── */}
      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <Card className="bg-gray-900 border-gray-700 w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-white">✏️ Editar Aposta</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleEditar}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <Label>Partida</Label>
                  <Input
                    value={editando.partida}
                    onChange={(e) =>
                      setEditando({ ...editando, partida: e.target.value })
                    }
                    className="bg-gray-800 border-gray-700 mt-1"
                    required
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Input
                    value={editando.descricao}
                    onChange={(e) =>
                      setEditando({ ...editando, descricao: e.target.value })
                    }
                    className="bg-gray-800 border-gray-700 mt-1"
                  />
                </div>
                <div>
                  <Label>Odd</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editando.odd}
                    onChange={(e) =>
                      setEditando({
                        ...editando,
                        odd: parseFloat(e.target.value),
                      })
                    }
                    className="bg-gray-800 border-gray-700 mt-1"
                    required
                  />
                </div>
                <div>
                  <Label>Stake (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editando.stake}
                    onChange={(e) =>
                      setEditando({
                        ...editando,
                        stake: parseFloat(e.target.value),
                      })
                    }
                    className="bg-gray-800 border-gray-700 mt-1"
                    required
                  />
                </div>
                <div>
                  <Label>Resultado</Label>
                  <select
                    value={editando.resultado}
                    onChange={(e) =>
                      setEditando({ ...editando, resultado: e.target.value })
                    }
                    className="w-full mt-1 bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 text-sm"
                  >
                    <option value="pendente">⏳ Pendente</option>
                    <option value="ganhou">✅ Ganhou</option>
                    <option value="perdeu">❌ Perdeu</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <div className="w-full bg-gray-800 rounded-lg p-3">
                    <span className="text-gray-400 text-xs">
                      Retorno potencial
                    </span>
                    <p className="text-green-400 font-bold">
                      R${" "}
                      {(Number(editando.stake) * Number(editando.odd)).toFixed(
                        2,
                      )}
                    </p>
                  </div>
                </div>
                <div className="md:col-span-2 flex gap-3 pt-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={loading}
                  >
                    {loading ? "Salvando..." : "💾 Salvar alterações"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setEditando(null)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

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
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium">{aposta.partida}</p>
                  <p className="text-gray-400 text-sm">{aposta.descricao}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(aposta.created_at).toLocaleDateString("pt-BR")} •
                    Odd: <span className="text-yellow-400">{aposta.odd}</span> •
                    Stake: <span className="text-white">R$ {aposta.stake}</span>{" "}
                    • Retorno:{" "}
                    <span className="text-green-400">
                      R$ {aposta.retorno?.toFixed(2)}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Resultado */}
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
                    <Badge
                      className={
                        aposta.resultado === "ganhou"
                          ? "bg-green-600"
                          : "bg-red-600"
                      }
                    >
                      {aposta.resultado === "ganhou"
                        ? "✅ Ganhou"
                        : "❌ Perdeu"}
                    </Badge>
                  )}

                  {/* Editar */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={() => setEditando(aposta)}
                  >
                    ✏️ Editar
                  </Button>

                  {/* Excluir */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-800 text-red-400 hover:bg-red-600 hover:text-white"
                    disabled={excluindo === aposta.id}
                    onClick={() => {
                      if (confirm(`Excluir aposta "${aposta.partida}"?`)) {
                        handleExcluir(aposta);
                      }
                    }}
                  >
                    {excluindo === aposta.id ? "..." : "🗑️ Excluir"}
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
