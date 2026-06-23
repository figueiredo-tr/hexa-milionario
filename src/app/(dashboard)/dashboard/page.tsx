import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import GraficoBanca from "@/components/dashboard/GraficoBanca";
import HeroBanner from "@/components/dashboard/HeroBanner";
import DicasDiarias from "@/components/dashboard/DicasDiarias";
import BancaEditavel from "@/components/dashboard/BancaEditavel";
import BancaInicialButton from "@/components/dashboard/BancaInicialButton";
import AllInResumo from "@/components/dashboard/AllInResumo";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users_profile")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  const { data: apostas } = await supabase
    .from("apostas")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: true });

  const { data: topRanking } = await supabase
    .from("users_profile")
    .select("username, banca_atual, banca_inicial")
    .order("banca_atual", { ascending: false })
    .limit(3);

  const totalApostas = apostas?.length || 0;
  const ganhas = apostas?.filter((a) => a.resultado === "ganhou").length || 0;
  const perdidas = apostas?.filter((a) => a.resultado === "perdeu").length || 0;
  const pendentes =
    apostas?.filter((a) => a.resultado === "pendente").length || 0;
  const aproveitamento =
    ganhas + perdidas > 0
      ? ((ganhas / (ganhas + perdidas)) * 100).toFixed(1)
      : "0";
  const lucro = (profile?.banca_atual || 0) - (profile?.banca_inicial || 0);
  const roi =
    profile?.banca_inicial > 0
      ? ((lucro / profile.banca_inicial) * 100).toFixed(1)
      : "0";
  const totalStake =
    apostas
      ?.filter((a) => a.resultado !== "pendente")
      .reduce((s: number, a: any) => s + Number(a.stake), 0) || 0;

  const evolucao = (() => {
    let banca = profile?.banca_inicial || 0;
    const pontos: { label: string; banca: number }[] = [
      { label: "0", banca: parseFloat(banca.toFixed(2)) },
    ];
    apostas?.forEach((a: any, i: number) => {
      if (a.resultado === "ganhou")
        banca = banca - Number(a.stake) + Number(a.retorno);
      else if (a.resultado === "perdeu") banca = banca - Number(a.stake);
      pontos.push({
        label: String(i + 1),
        banca: parseFloat(banca.toFixed(2)),
      });
    });
    return pontos;
  })();

  const ultimasApostas = [...(apostas || [])].reverse().slice(0, 5);

  const statCards = [
    {
      label: "Lucro Total",
      value: `R$ ${lucro.toFixed(2)}`,
      sub: `ROI: ${roi}%`,
      color: lucro >= 0 ? "text-green-400" : "text-red-400",
      border: lucro >= 0 ? "border-green-900" : "border-red-900",
      icon: lucro >= 0 ? "📈" : "📉",
    },
    {
      label: "Aproveitamento",
      value: `${aproveitamento}%`,
      sub: `${ganhas}G · ${perdidas}P · ${pendentes} pend.`,
      color: "text-yellow-400",
      border: "border-yellow-900",
      icon: "🎯",
    },
    {
      label: "Total Apostado",
      value: `R$ ${totalStake.toFixed(2)}`,
      sub: `${totalApostas} apostas no total`,
      color: "text-blue-400",
      border: "border-blue-900",
      icon: "📊",
    },
  ];

  return (
    <div className="space-y-6">
      <HeroBanner />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Olá, {profile?.username || "Apostador"} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Sua banca rumo ao hexa 🇧🇷 · Copa do Mundo 2026
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {pendentes > 0 && (
            <Badge className="bg-yellow-600/20 text-yellow-400 border border-yellow-800 text-xs px-3 py-1">
              ⏳ {pendentes} pendente{pendentes > 1 ? "s" : ""}
            </Badge>
          )}
          <BancaInicialButton
            bancaInicial={profile?.banca_inicial || 0}
            bancaAtual={profile?.banca_atual || 0}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <BancaEditavel
          bancaAtual={profile?.banca_atual || 0}
          bancaInicial={profile?.banca_inicial || 0}
        />
        {statCards.map((s) => (
          <Card
            key={s.label}
            className={`bg-gray-900 border ${s.border} transition-all hover:scale-[1.02]`}
          >
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col items-center text-center gap-2">
                <span className="text-3xl">{s.icon}</span>
                <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-widest">
                  {s.label}
                </span>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[12px] text-gray-500">{s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DicasDiarias userEmail={user?.email || ""} />

      <AllInResumo />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-900 border-gray-800 md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base">
                📈 Evolução da Banca
              </CardTitle>
              <span className="text-xs text-gray-500">
                inicial: R$ {(profile?.banca_inicial || 0).toFixed(2)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <GraficoBanca
              dados={evolucao}
              bancaInicial={profile?.banca_inicial || 0}
            />
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base">
              🏅 Top Ranking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topRanking && topRanking.length > 0 ? (
              topRanking.map((u: any, i: number) => {
                const lucroUser = (u.banca_atual || 0) - (u.banca_inicial || 0);
                const medals = ["🥇", "🥈", "🥉"];
                const isMe = u.username === profile?.username;
                return (
                  <div
                    key={u.username}
                    className={`flex items-center justify-between p-2.5 rounded-lg transition-colors ${isMe ? "bg-green-900/30 border border-green-800" : "bg-gray-800"}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{medals[i]}</span>
                      <div>
                        <p
                          className={`text-sm font-semibold ${isMe ? "text-green-400" : "text-white"}`}
                        >
                          {u.username}
                          {isMe ? " (você)" : ""}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          R$ {(u.banca_atual || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold ${lucroUser >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {lucroUser >= 0 ? "+" : ""}R$ {lucroUser.toFixed(2)}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                Nenhum usuário ainda
              </p>
            )}
            <Link
              href="/ranking"
              className="block text-center text-xs text-gray-500 hover:text-green-400 transition-colors pt-1"
            >
              Ver ranking completo →
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-base">
              🎯 Últimas Apostas
            </CardTitle>
            <Link
              href="/apostas"
              className="text-xs text-gray-500 hover:text-green-400 transition-colors"
            >
              Ver todas →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {ultimasApostas.length > 0 ? (
            <div className="space-y-2">
              {ultimasApostas.map((aposta: any) => {
                const retornoPotencial = (
                  Number(aposta.odd) * Number(aposta.stake)
                ).toFixed(2);
                return (
                  <div
                    key={aposta.id}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-xl gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">
                        {aposta.partida}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5 truncate">
                        {aposta.descricao} · Odd{" "}
                        <span className="text-yellow-400 font-medium">
                          {Number(aposta.odd).toFixed(2)}
                        </span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-white text-sm font-semibold">
                        R$ {Number(aposta.stake).toFixed(2)}
                      </p>
                      <p className="text-[11px]">
                        {aposta.resultado === "ganhou" ? (
                          <span className="text-green-400">
                            +R${" "}
                            {(
                              Number(aposta.retorno) - Number(aposta.stake)
                            ).toFixed(2)}
                          </span>
                        ) : aposta.resultado === "perdeu" ? (
                          <span className="text-red-400">
                            -R$ {Number(aposta.stake).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-500">
                            ret.: R$ {retornoPotencial}
                          </span>
                        )}
                      </p>
                    </div>
                    <Badge
                      className={`shrink-0 text-xs px-2 py-0.5 ${aposta.resultado === "ganhou" ? "bg-green-600/20 text-green-400 border border-green-800" : aposta.resultado === "perdeu" ? "bg-red-600/20 text-red-400 border border-red-800" : "bg-yellow-600/20 text-yellow-400 border border-yellow-800"}`}
                    >
                      {aposta.resultado === "ganhou"
                        ? "✅ Ganhou"
                        : aposta.resultado === "perdeu"
                          ? "❌ Perdeu"
                          : "⏳ Pendente"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">🎯</p>
              <p className="text-gray-400 text-sm">Nenhuma aposta ainda.</p>
              <Link
                href="/apostas"
                className="inline-block mt-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
              >
                Adicionar primeira aposta
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: "/apostas", icon: "🎯", label: "Nova Aposta" },
          { href: "/escalada", icon: "📈", label: "Escalada" },
          { href: "/jogos", icon: "🔴", label: "Jogos ao vivo" },
          { href: "/ranking", icon: "🏅", label: "Ranking" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-800 rounded-xl hover:border-green-800 hover:bg-green-900/10 transition-all group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">
              {a.icon}
            </span>
            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
              {a.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
