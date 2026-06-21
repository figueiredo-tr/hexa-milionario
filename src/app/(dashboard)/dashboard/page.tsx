import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    .eq("user_id", user!.id);

  const totalApostas = apostas?.length || 0;
  const ganhas = apostas?.filter((a) => a.resultado === "ganhou").length || 0;
  const perdidas = apostas?.filter((a) => a.resultado === "perdeu").length || 0;
  const aproveitamento =
    totalApostas > 0 ? ((ganhas / (ganhas + perdidas)) * 100).toFixed(1) : "0";
  const lucro = (profile?.banca_atual || 0) - (profile?.banca_inicial || 0);
  const roi =
    profile?.banca_inicial > 0
      ? ((lucro / profile.banca_inicial) * 100).toFixed(1)
      : "0";

  const stats = [
    {
      label: "Banca Atual",
      value: `R$ ${(profile?.banca_atual || 0).toFixed(2)}`,
      color: "text-green-400",
      icon: "💰",
    },
    {
      label: "Lucro Total",
      value: `R$ ${lucro.toFixed(2)}`,
      color: lucro >= 0 ? "text-green-400" : "text-red-400",
      icon: "📊",
    },
    {
      label: "ROI",
      value: `${roi}%`,
      color: parseFloat(roi) >= 0 ? "text-green-400" : "text-red-400",
      icon: "📈",
    },
    {
      label: "Total Apostas",
      value: totalApostas.toString(),
      color: "text-yellow-400",
      icon: "🎯",
    },
    {
      label: "Aproveitamento",
      value: `${aproveitamento}%`,
      color: "text-blue-400",
      icon: "✅",
    },
    {
      label: "Ganhas / Perdidas",
      value: `${ganhas} / ${perdidas}`,
      color: "text-gray-300",
      icon: "⚖️",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Olá, {profile?.username || "Apostador"} 👋
          </h1>
          <p className="text-gray-400">Sua banca rumo ao hexa 🇧🇷</p>
        </div>
        <Badge className="bg-green-600 text-white text-sm px-3 py-1">
          Copa 2026
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <span>{stat.icon}</span>
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">🎯 Últimas Apostas</CardTitle>
        </CardHeader>
        <CardContent>
          {apostas && apostas.length > 0 ? (
            <div className="space-y-2">
              {apostas
                .slice(-5)
                .reverse()
                .map((aposta) => (
                  <div
                    key={aposta.id}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">
                        {aposta.partida}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {aposta.descricao} • Odd: {aposta.odd}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm">R$ {aposta.stake}</p>
                      <Badge
                        className={
                          aposta.resultado === "ganhou"
                            ? "bg-green-600"
                            : aposta.resultado === "perdeu"
                              ? "bg-red-600"
                              : "bg-yellow-600"
                        }
                      >
                        {aposta.resultado}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              Nenhuma aposta ainda. Comece apostando! 🎯
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
