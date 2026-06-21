import { NextResponse } from "next/server";

const bandeiras: Record<string, string> = {
  Brazil: "🇧🇷",
  Argentina: "🇦🇷",
  France: "🇫🇷",
  Germany: "🇩🇪",
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Spain: "🇪🇸",
  Portugal: "🇵🇹",
  Netherlands: "🇳🇱",
  Belgium: "🇧🇪",
  Uruguay: "🇺🇾",
  Colombia: "🇨🇴",
  Mexico: "🇲🇽",
  USA: "🇺🇸",
  Canada: "🇨🇦",
  Japan: "🇯🇵",
  "South Korea": "🇰🇷",
  Morocco: "🇲🇦",
  Senegal: "🇸🇳",
  Australia: "🇦🇺",
  Croatia: "🇭🇷",
  Switzerland: "🇨🇭",
  Poland: "🇵🇱",
  Denmark: "🇩🇰",
  Serbia: "🇷🇸",
  Ecuador: "🇪🇨",
  Cameroon: "🇨🇲",
  Ghana: "🇬🇭",
  Tunisia: "🇹🇳",
  "Saudi Arabia": "🇸🇦",
  Iran: "🇮🇷",
  Qatar: "🇶🇦",
  Italy: "🇮🇹",
  "United States": "🇺🇸",
  Cameroun: "🇨🇲",
  "Costa Rica": "🇨🇷",
  Panama: "🇵🇦",
  Jamaica: "🇯🇲",
  Honduras: "🇭🇳",
  Guatemala: "🇬🇹",
  Venezuela: "🇻🇪",
  Chile: "🇨🇱",
  Peru: "🇵🇪",
  Bolivia: "🇧🇴",
  Paraguay: "🇵🇾",
  Nigeria: "🇳🇬",
  Mali: "🇲🇱",
  Algeria: "🇩🇿",
  Egypt: "🇪🇬",
  "DR Congo": "🇨🇩",
  "South Africa": "🇿🇦",
  "New Zealand": "🇳🇿",
  China: "🇨🇳",
  Indonesia: "🇮🇩",
  Thailand: "🇹🇭",
  Slovakia: "🇸🇰",
  Austria: "🇦🇹",
  Ukraine: "🇺🇦",
  Romania: "🇷🇴",
  Hungary: "🇭🇺",
  Czechia: "🇨🇿",
  Turkey: "🇹🇷",
  Greece: "🇬🇷",
  Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  Wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  Albania: "🇦🇱",
};

function getBandeira(nome: string): string {
  return bandeiras[nome] || "🏳️";
}

async function fetchESPN(url: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "application/json",
    },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`ESPN API error: ${res.status}`);
  return res.json();
}

export async function GET() {
  try {
    const [scoreboard, standings] = await Promise.all([
      fetchESPN(
        "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard",
      ),
      fetchESPN(
        "https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings",
      ),
    ]);

    const jogos = (scoreboard.events || []).map((evento: any, i: number) => {
      const comp = evento.competitions?.[0];
      const home = comp?.competitors?.find((c: any) => c.homeAway === "home");
      const away = comp?.competitors?.find((c: any) => c.homeAway === "away");
      const statusType = comp?.status?.type?.name || "";
      const clock = comp?.status?.displayClock || "";
      const period = comp?.status?.period || 0;

      let status = "em breve";
      let tempo = new Date(evento.date).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Sao_Paulo",
      });

      if (statusType === "STATUS_IN_PROGRESS") {
        status = "ao vivo";
        tempo = clock ? `${clock}` : `${period}T`;
      } else if (
        statusType === "STATUS_FINAL" ||
        statusType === "STATUS_FULL_TIME"
      ) {
        status = "encerrado";
        tempo = "90'";
      } else if (statusType === "STATUS_HALFTIME") {
        status = "ao vivo";
        tempo = "Intervalo";
      }

      const placar =
        statusType !== "STATUS_SCHEDULED"
          ? `${home?.score ?? 0}-${away?.score ?? 0}`
          : "-";

      const homeName = home?.team?.displayName || home?.team?.name || "Time A";
      const awayName = away?.team?.displayName || away?.team?.name || "Time B";
      const grupo = evento.season?.slug || comp?.series?.summary || "Copa 2026";

      // Pega a logo da ESPN (array de logos, pega a primeira)
      const logoCasa: string =
        home?.team?.logos?.[0]?.href || home?.team?.logo || "";
      const logoVisitante: string =
        away?.team?.logos?.[0]?.href || away?.team?.logo || "";

      return {
        id: i + 1,
        casa: homeName,
        visitante: awayName,
        placar,
        status,
        tempo,
        bandeiraCasa: getBandeira(homeName),
        bandeiraVisitante: getBandeira(awayName),
        logoCasa,
        logoVisitante,
        grupo,
      };
    });

    const grupos: any[][] = [];

    if (Array.isArray(standings.children)) {
      for (const grupo of standings.children) {
        const times = (grupo.standings?.entries || [])
          .map((entry: any) => {
            const stats = entry.stats || [];
            const getStat = (name: string) =>
              stats.find((s: any) => s.name === name)?.value ?? 0;
            const logoTime: string =
              entry.team?.logos?.[0]?.href || entry.team?.logo || "";
            return {
              posicao: 0,
              time: entry.team?.displayName || entry.team?.name || "?",
              bandeira: getBandeira(entry.team?.displayName || ""),
              logo: logoTime,
              jogos: getStat("gamesPlayed"),
              vitorias: getStat("wins"),
              empates: getStat("ties"),
              derrotas: getStat("losses"),
              gp: getStat("pointsFor"),
              gc: getStat("pointsAgainst"),
              sg: getStat("pointDifferential"),
              pontos: getStat("points"),
              grupo: grupo.name || grupo.abbreviation || "Grupo",
            };
          })
          .sort((a: any, b: any) => b.pontos - a.pontos || b.sg - a.sg)
          .map((time: any, idx: number) => ({ ...time, posicao: idx + 1 }));
        if (times.length > 0) grupos.push(times);
      }
    }

    return NextResponse.json(
      {
        jogos,
        grupos,
        fonte: "espn",
      },
      {
        headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate" },
      },
    );
  } catch (err) {
    console.error("ESPN API erro:", err);
    return NextResponse.json({
      jogos: [],
      grupos: [],
      fonte: "erro",
      erro: String(err),
    });
  }
}
