import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function RankingPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("users_profile")
    .select("username, banca_inicial, banca_atual")
    .order("banca_atual", { ascending: false });

  const ranking = (profiles || []).map((p, i) => {
    const lucro = p.banca_atual - p.banca_inicial;
    const roi =
      p.banca_inicial > 0 ? ((lucro / p.banca_inicial) * 100).toFixed(1) : "0";
    return { ...p, lucro, roi, posicao: i + 1 };
  });

  const medalhas: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">🏆 Hall dos Milionários</h1>
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">
            Ranking Geral — Copa 2026
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left py-3">#</th>
                  <th className="text-left py-3">Apostador</th>
                  <th className="text-left py-3">Banca Atual</th>
                  <th className="text-left py-3">Lucro</th>
                  <th className="text-left py-3">ROI</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r) => (
                  <tr
                    key={r.username}
                    className="border-b border-gray-800 hover:bg-gray-800 transition-colors"
                  >
                    <td className="py-3 text-lg">
                      {medalhas[r.posicao] || r.posicao}
                    </td>
                    <td className="py-3 text-white font-medium">
                      {r.username}
                      {r.banca_atual >= 1000 && (
                        <Badge className="ml-2 bg-yellow-600 text-xs">
                          Milionário 🌟
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 text-green-400 font-bold">
                      R$ {r.banca_atual.toFixed(2)}
                    </td>
                    <td
                      className={`py-3 font-medium ${r.lucro >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {r.lucro >= 0 ? "+" : ""}R$ {r.lucro.toFixed(2)}
                    </td>
                    <td
                      className={`py-3 ${parseFloat(r.roi) >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {r.roi}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {ranking.length === 0 && (
              <p className="text-gray-400 text-center py-8">
                Nenhum apostador ainda. Seja o primeiro! 🏆
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
