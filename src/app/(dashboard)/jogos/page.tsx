"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Jogo = {
  id: number;
  casa: string;
  visitante: string;
  placar: string;
  status: string;
  tempo: string;
  bandeiraCasa: string;
  bandeiraVisitante: string;
  logoCasa: string;
  logoVisitante: string;
  grupo: string;
};

type TimeGrupo = {
  posicao: number;
  time: string;
  bandeira: string;
  logo: string;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  gp: number;
  gc: number;
  sg: number;
  pontos: number;
  grupo: string;
};

function TeamFlag({
  logo,
  bandeira,
  alt,
}: {
  logo: string;
  bandeira: string;
  alt: string;
}) {
  if (logo) {
    return (
      <img
        src={logo}
        alt={alt}
        className="inline w-6 h-6 object-contain"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }
  return <span>{bandeira}</span>;
}

function formatDateParam(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

function formatDateLabel(date: Date): string {
  const hoje = new Date();
  const amanha = new Date();
  amanha.setDate(hoje.getDate() + 1);
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (sameDay(date, hoje)) return "Hoje";
  if (sameDay(date, amanha)) return "Amanhã";
  if (sameDay(date, ontem)) return "Ontem";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    weekday: "short",
  });
}

export default function JogosPage() {
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [grupos, setGrupos] = useState<TimeGrupo[][]>([]);
  const [loading, setLoading] = useState(true);
  const [fonte, setFonte] = useState("");
  const [aba, setAba] = useState<"jogos" | "grupos">("jogos");
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());

  async function fetchJogos(data: Date) {
    setLoading(true);
    const param = formatDateParam(data);
    const res = await fetch(`/api/jogos?data=${param}`);
    const json = await res.json();
    setJogos(json.jogos || []);
    setGrupos(json.grupos || []);
    setFonte(json.fonte);
    setLoading(false);
  }

  useEffect(() => {
    fetchJogos(dataSelecionada);
    const interval = setInterval(() => fetchJogos(dataSelecionada), 60000);
    return () => clearInterval(interval);
  }, [dataSelecionada]);

  function mudarData(dias: number) {
    const nova = new Date(dataSelecionada);
    nova.setDate(nova.getDate() + dias);
    setDataSelecionada(nova);
  }

  const aoVivo = jogos.filter((j) => j.status === "ao vivo");
  const emBreve = jogos.filter((j) => j.status === "em breve");
  const encerrados = jogos.filter((j) => j.status === "encerrado");

  function JogoCard({ jogo }: { jogo: Jogo }) {
    const statusConfig: Record<string, string> = {
      "ao vivo": "bg-red-600 animate-pulse",
      "em breve": "bg-yellow-600",
      encerrado: "bg-gray-600",
    };
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-right flex items-center justify-end gap-2">
              <p className="text-white font-medium">{jogo.casa}</p>
              <TeamFlag
                logo={jogo.logoCasa}
                bandeira={jogo.bandeiraCasa}
                alt={jogo.casa}
              />
            </div>
            <div className="mx-4 text-center min-w-[80px]">
              <p className="text-yellow-400 font-bold text-lg">{jogo.placar}</p>
              <p className="text-gray-400 text-xs">{jogo.tempo}</p>
            </div>
            <div className="flex-1 text-left flex items-center gap-2">
              <TeamFlag
                logo={jogo.logoVisitante}
                bandeira={jogo.bandeiraVisitante}
                alt={jogo.visitante}
              />
              <p className="text-white font-medium">{jogo.visitante}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-gray-500 text-xs">{jogo.grupo}</span>
            <Badge className={statusConfig[jogo.status] || "bg-gray-600"}>
              {jogo.status.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">⚽ Copa do Mundo 2026</h1>
        <span className="text-gray-500 text-xs">
          Fonte: {fonte} • Atualiza a cada 60s
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setAba("jogos")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            aba === "jogos"
              ? "bg-green-600 text-white"
              : "bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          📅 Jogos
        </button>
        <button
          onClick={() => setAba("grupos")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            aba === "grupos"
              ? "bg-green-600 text-white"
              : "bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          📊 Grupos
        </button>
      </div>

      {aba === "jogos" && (
        <>
          <div className="flex items-center gap-3">
            <button
              onClick={() => mudarData(-1)}
              className="px-3 py-1 rounded-md bg-gray-800 text-gray-300 hover:text-white text-sm"
            >
              ← Anterior
            </button>
            <span className="text-white font-medium text-sm min-w-[80px] text-center">
              {formatDateLabel(dataSelecionada)}
            </span>
            <button
              onClick={() => mudarData(1)}
              className="px-3 py-1 rounded-md bg-gray-800 text-gray-300 hover:text-white text-sm"
            >
              Próximo →
            </button>
            {dataSelecionada.toDateString() !== new Date().toDateString() && (
              <button
                onClick={() => setDataSelecionada(new Date())}
                className="px-3 py-1 rounded-md bg-gray-700 text-gray-300 hover:text-white text-xs"
              >
                Hoje
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-12">
              Carregando jogos...
            </div>
          ) : (
            <div className="space-y-6">
              {aoVivo.length > 0 && (
                <div>
                  <h2 className="text-red-400 font-semibold mb-3">
                    🔴 Ao Vivo
                  </h2>
                  <div className="space-y-3">
                    {aoVivo.map((j) => (
                      <JogoCard key={j.id} jogo={j} />
                    ))}
                  </div>
                </div>
              )}
              {emBreve.length > 0 && (
                <div>
                  <h2 className="text-yellow-400 font-semibold mb-3">
                    🕐 Em Breve
                  </h2>
                  <div className="space-y-3">
                    {emBreve.map((j) => (
                      <JogoCard key={j.id} jogo={j} />
                    ))}
                  </div>
                </div>
              )}
              {encerrados.length > 0 && (
                <div>
                  <h2 className="text-gray-400 font-semibold mb-3">
                    ✅ Encerrados
                  </h2>
                  <div className="space-y-3">
                    {encerrados.map((j) => (
                      <JogoCard key={j.id} jogo={j} />
                    ))}
                  </div>
                </div>
              )}
              {jogos.length === 0 && (
                <p className="text-gray-400 text-center py-12">
                  Nenhum jogo em {formatDateLabel(dataSelecionada)}. 📊
                </p>
              )}
            </div>
          )}
        </>
      )}

      {aba === "grupos" && (
        <div>
          {grupos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {grupos.map((grupo, i) => (
                <Card key={i} className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">
                      {grupo[0]?.grupo || `Grupo ${i + 1}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-gray-400 border-b border-gray-800">
                          <th className="text-left py-1">#</th>
                          <th className="text-left py-1">Time</th>
                          <th className="text-center py-1">J</th>
                          <th className="text-center py-1">V</th>
                          <th className="text-center py-1">E</th>
                          <th className="text-center py-1">D</th>
                          <th className="text-center py-1">SG</th>
                          <th className="text-center py-1 text-yellow-400">
                            Pts
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {grupo.map((time, j) => (
                          <tr
                            key={j}
                            className={`border-b border-gray-800 ${j < 2 ? "text-green-400" : "text-gray-300"}`}
                          >
                            <td className="py-1">{time.posicao}</td>
                            <td className="py-1 flex items-center gap-1">
                              {time.logo ? (
                                <img
                                  src={time.logo}
                                  alt={time.time}
                                  className="w-4 h-4 object-contain"
                                />
                              ) : (
                                <span>{time.bandeira}</span>
                              )}
                              {time.time}
                            </td>
                            <td className="text-center py-1">{time.jogos}</td>
                            <td className="text-center py-1">
                              {time.vitorias}
                            </td>
                            <td className="text-center py-1">{time.empates}</td>
                            <td className="text-center py-1">
                              {time.derrotas}
                            </td>
                            <td className="text-center py-1">
                              {time.sg > 0 ? "+" : ""}
                              {time.sg}
                            </td>
                            <td className="text-center py-1 font-bold text-white">
                              {time.pontos}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-12">
              Tabela de grupos ainda não disponível.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
