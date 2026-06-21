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
    await supabase.from("apostas").update({ resultado }).eq("id", id);
    const { data: profile } = await supabase
      .from("users_profile")
      .select("banca_atual")
      .eq("user_id", user!.id)
      .single();
    let novaBanca = profile?.banca_atual || 0;
    if (resultado === "ganhou") novaBanca += stake * odd - stake;
    if (resultado === "perdeu") novaBanca -= stake;
    await supabase
      .from("users_profile")
      .update({ banca_atual: novaBanca })
      .eq("user_id", user!.id);
    await loadApostas();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">🎯 Minhas Apostas</h1>

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

      <div className="space-y-3">
        {apostas.map((aposta) => (
          <Card key={aposta.id} className="bg-gray-900 border-gray-800">
            <CardContent className="pt-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <p className="text-white font-medium">{aposta.partida}</p>
                  <p className="text-gray-400 text-sm">{aposta.descricao}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Odd: <span className="text-yellow-400">{aposta.odd}</span> •
                    Stake: <span className="text-white">R$ {aposta.stake}</span>{" "}
                    • Retorno:{" "}
                    <span className="text-green-400">
                      R$ {aposta.retorno?.toFixed(2)}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
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
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {apostas.length === 0 && (
          <p className="text-gray-400 text-center py-12">
            Nenhuma aposta ainda. Adicione sua primeira! 🎯
          </p>
        )}
      </div>
    </div>
  );
}
