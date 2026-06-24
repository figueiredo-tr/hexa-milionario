import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function fetchESPN(url: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "application/json",
    },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`ESPN error: ${res.status}`);
  return res.json();
}

const traducaoTimes: Record<string, string> = {
  Brazil: "Brasil",
  Argentina: "Argentina",
  Colombia: "Colômbia",
  Uruguay: "Uruguai",
  Ecuador: "Equador",
  Paraguay: "Paraguai",
  Chile: "Chile",
  Peru: "Peru",
  Bolivia: "Bolívia",
  Venezuela: "Venezuela",
  Mexico: "México",
  "United States": "Estados Unidos",
  USA: "EUA",
  Canada: "Canadá",
  "Costa Rica": "Costa Rica",
  Panama: "Panamá",
  Jamaica: "Jamaica",
  Honduras: "Honduras",
  Guatemala: "Guatemala",
  "Trinidad and Tobago": "Trinidad e Tobago",
  France: "França",
  Germany: "Alemanha",
  Spain: "Espanha",
  Portugal: "Portugal",
  England: "Inglaterra",
  Netherlands: "Holanda",
  Belgium: "Bélgica",
  Italy: "Itália",
  Croatia: "Croácia",
  Switzerland: "Suíça",
  Poland: "Polônia",
  Denmark: "Dinamarca",
  Serbia: "Sérvia",
  Austria: "Áustria",
  Ukraine: "Ucrânia",
  Romania: "Romênia",
  Hungary: "Hungria",
  Czechia: "Tchéquia",
  "Czech Republic": "Tchéquia",
  Slovakia: "Eslováquia",
  Turkey: "Turquia",
  Greece: "Grécia",
  Scotland: "Escócia",
  Wales: "País de Gales",
  Albania: "Albânia",
  Norway: "Noruega",
  Sweden: "Suécia",
  Finland: "Finlândia",
  Slovenia: "Eslovênia",
  "Bosnia & Herzegovina": "Bósnia e Herzegovina",
  "Bosnia and Herzegovina": "Bósnia e Herzegovina",
  Morocco: "Marrocos",
  Senegal: "Senegal",
  Cameroon: "Camarões",
  Cameroun: "Camarões",
  Ghana: "Gana",
  Tunisia: "Tunísia",
  Nigeria: "Nigéria",
  Mali: "Mali",
  Algeria: "Argélia",
  Egypt: "Egito",
  "DR Congo": "Rep. Dem. do Congo",
  "Congo DR": "Rep. Dem. do Congo",
  "South Africa": "África do Sul",
  "Ivory Coast": "Costa do Marfim",
  "Cape Verde": "Cabo Verde",
  Japan: "Japão",
  "South Korea": "Coreia do Sul",
  "Saudi Arabia": "Arábia Saudita",
  Iran: "Irã",
  Qatar: "Catar",
  Australia: "Austrália",
  China: "China",
  Indonesia: "Indonésia",
  Thailand: "Tailândia",
  Uzbekistan: "Uzbequistão",
  "New Zealand": "Nova Zelândia",
  Iraq: "Iraque",
  Jordan: "Jordânia",
};

function traduzirTime(nome: string): string {
  return traducaoTimes[nome] || nome;
}

// Calcula força baseada na forma recente (ex: "WDLWW") com peso maior para jogos recentes
function calcularForcaForma(forma: string): number {
  if (!forma || forma.length === 0) return 1.0;
  const resultados = forma.slice(-5).split("");
  let pontos = 0;
  let pesoTotal = 0;
  resultados.forEach((r, i) => {
    const peso = i + 1; // mais recente = maior peso
    pesoTotal += peso;
    if (r === "W") pontos += 3 * peso;
    else if (r === "D") pontos += 1 * peso;
  });
  const maxPontos = 3 * pesoTotal;
  // Escala: 0.65 (péssima forma) a 1.45 (excelente forma)
  return 0.65 + (pontos / maxPontos) * 0.8;
}

// Parseia record "V-E-D" e retorna stats
function parseRecord(record: string) {
  const parts = (record || "0-0-0").split("-").map(Number);
  const v = parts[0] || 0,
    e = parts[1] || 0,
    d = parts[2] || 0;
  const jogos = v + e + d;
  const pontos = v * 3 + e;
  const aproveitamento = jogos > 0 ? pontos / (jogos * 3) : 0.33;
  return { v, e, d, jogos, aproveitamento };
}

function calcularProbabilidades(
  golsEsperadosCasa: number,
  golsEsperadosFora: number,
) {
  function poisson(k: number, lambda: number): number {
    if (lambda <= 0) return k === 0 ? 1 : 0;
    let result = Math.exp(-lambda);
    for (let i = 1; i <= k; i++) result *= lambda / i;
    return result;
  }

  const maxGols = 7;
  let probCasa = 0,
    probEmpate = 0,
    probFora = 0;
  let ambaMarcam = 0,
    mais25 = 0;
  let naoSofreCasa = 0,
    naoSofreFora = 0;
  let empateComGols = 0,
    empateSemGols = 0;
  const placares: { placar: string; prob: number }[] = [];

  for (let i = 0; i <= maxGols; i++) {
    for (let j = 0; j <= maxGols; j++) {
      const p = poisson(i, golsEsperadosCasa) * poisson(j, golsEsperadosFora);
      if (i > j) probCasa += p;
      else if (i === j) probEmpate += p;
      else probFora += p;
      if (i > 0 && j > 0) ambaMarcam += p;
      if (i + j > 2.5) mais25 += p;
      if (i <= 5 && j <= 5) placares.push({ placar: `${i}x${j}`, prob: p });
    }
  }

  for (let i = 0; i <= maxGols; i++) {
    naoSofreCasa +=
      poisson(i, golsEsperadosCasa) * poisson(0, golsEsperadosFora);
    naoSofreFora +=
      poisson(0, golsEsperadosCasa) * poisson(i, golsEsperadosFora);
  }
  for (let i = 1; i <= maxGols; i++) {
    empateComGols +=
      poisson(i, golsEsperadosCasa) * poisson(i, golsEsperadosFora);
  }
  empateSemGols = poisson(0, golsEsperadosCasa) * poisson(0, golsEsperadosFora);

  placares.sort((a, b) => b.prob - a.prob);
  const top6 = placares.slice(0, 6);
  const maisProvavel = top6[0];
  const outrosProvaveis = top6.slice(1);
  const favorito =
    probCasa > probFora ? "casa" : probFora > probCasa ? "fora" : "empate";

  return {
    probCasa: parseFloat((probCasa * 100).toFixed(1)),
    probEmpate: parseFloat((probEmpate * 100).toFixed(1)),
    probFora: parseFloat((probFora * 100).toFixed(1)),
    ambaMarcam: parseFloat((ambaMarcam * 100).toFixed(1)),
    mais25: parseFloat((mais25 * 100).toFixed(1)),
    naoSofreCasa: parseFloat((naoSofreCasa * 100).toFixed(1)),
    naoSofreFora: parseFloat((naoSofreFora * 100).toFixed(1)),
    empateComGols: parseFloat((empateComGols * 100).toFixed(1)),
    empateSemGols: parseFloat((empateSemGols * 100).toFixed(1)),
    maisProvavel: {
      placar: maisProvavel.placar,
      prob: parseFloat((maisProvavel.prob * 100).toFixed(1)),
    },
    outrosProvaveis: outrosProvaveis.map((p) => ({
      placar: p.placar,
      prob: parseFloat((p.prob * 100).toFixed(1)),
    })),
    favorito,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forcar = searchParams.get("forcar") === "1";
    const hoje = new Date().toISOString().slice(0, 10);
    const supabase = await createClient();

    if (!forcar) {
      const { data: existente } = await supabase
        .from("analises_jogos")
        .select("*")
        .eq("data", hoje)
        .single();
      if (existente)
        return NextResponse.json({ jogos: existente.jogos, fonte: "cache" });
    }

    const dataParam = hoje.replace(/-/g, "");
    const scoreboard = await fetchESPN(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dataParam}`,
    );

    const eventos = scoreboard.events || [];
    if (eventos.length === 0)
      return NextResponse.json({ jogos: [], fonte: "sem_jogos" });

    // Média de gols por time por jogo na Copa 2026 fase de grupos
    const mediaGolsCopa = 1.35;

    const jogosAnalisados = eventos.map((evento: any) => {
      const comp = evento.competitions?.[0];
      const home = comp?.competitors?.find((c: any) => c.homeAway === "home");
      const away = comp?.competitors?.find((c: any) => c.homeAway === "away");

      const homeNameOriginal = home?.team?.displayName || "Time A";
      const awayNameOriginal = away?.team?.displayName || "Time B";
      const homeName = traduzirTime(homeNameOriginal);
      const awayName = traduzirTime(awayNameOriginal);
      const logoHome = home?.team?.logos?.[0]?.href || home?.team?.logo || "";
      const logoAway = away?.team?.logos?.[0]?.href || away?.team?.logo || "";

      const horario = new Date(evento.date).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Sao_Paulo",
      });

      // Forma recente (campo "form" da ESPN, ex: "WDLWW")
      const formaHome = home?.form || "";
      const formaAway = away?.form || "";
      const forcaHome = calcularForcaForma(formaHome);
      const forcaAway = calcularForcaForma(formaAway);

      // Record na Copa (ex: "1-1-0")
      const recordHome = parseRecord(home?.records?.[0]?.summary || "");
      const recordAway = parseRecord(away?.records?.[0]?.summary || "");

      // Estatísticas de gols da Copa atual
      const homeStats = home?.statistics || [];
      const awayStats = away?.statistics || [];
      const getStat = (stats: any[], name: string) =>
        parseFloat(
          stats.find((s: any) => s.name === name)?.displayValue || "0",
        ) || 0;

      const homeGolsMarcados = getStat(homeStats, "totalGoals");
      const awayGolsMarcados = getStat(awayStats, "totalGoals");
      const homeShotsOnTarget = getStat(homeStats, "shotsOnTarget");
      const awayShotsOnTarget = getStat(awayStats, "shotsOnTarget");

      // Calcula gols esperados combinando múltiplas fontes
      let golsEsperadosCasa: number;
      let golsEsperadosFora: number;

      if (recordHome.jogos > 0 && homeGolsMarcados > 0) {
        // Tem dados reais da Copa: média de gols * força da forma
        const mediaAtaqueCasa = homeGolsMarcados / recordHome.jogos;
        const mediaDefesaFora =
          recordAway.jogos > 0 && awayGolsMarcados > 0
            ? awayGolsMarcados / recordAway.jogos
            : mediaGolsCopa;
        // Dixon-Coles simplificado
        golsEsperadosCasa =
          mediaAtaqueCasa *
          forcaHome *
          (mediaGolsCopa / Math.max(mediaDefesaFora * forcaAway, 0.4));
      } else {
        // Sem dados: usa aproveitamento no torneio + forma
        const baseHome = mediaGolsCopa * (0.5 + recordHome.aproveitamento);
        golsEsperadosCasa = baseHome * forcaHome;
      }

      if (recordAway.jogos > 0 && awayGolsMarcados > 0) {
        const mediaAtaqueFora = awayGolsMarcados / recordAway.jogos;
        const mediaDefesaCasa =
          recordHome.jogos > 0 && homeGolsMarcados > 0
            ? homeGolsMarcados / recordHome.jogos
            : mediaGolsCopa;
        golsEsperadosFora =
          mediaAtaqueFora *
          forcaAway *
          (mediaGolsCopa / Math.max(mediaDefesaCasa * forcaHome, 0.4));
      } else {
        const baseFora =
          mediaGolsCopa * (0.5 + recordAway.aproveitamento) * 0.88;
        golsEsperadosFora = baseFora * forcaAway;
      }

      // Clamp valores razoáveis
      golsEsperadosCasa = Math.max(0.25, Math.min(4.5, golsEsperadosCasa));
      golsEsperadosFora = Math.max(0.25, Math.min(4.5, golsEsperadosFora));

      const probs = calcularProbabilidades(
        golsEsperadosCasa,
        golsEsperadosFora,
      );

      return {
        id: evento.id,
        casa: homeName,
        fora: awayName,
        logoHome,
        logoAway,
        horario,
        golsEsperadosCasa: parseFloat(golsEsperadosCasa.toFixed(1)),
        golsEsperadosFora: parseFloat(golsEsperadosFora.toFixed(1)),
        formaHome,
        formaAway,
        ...probs,
      };
    });

    const { data: existente } = await supabase
      .from("analises_jogos")
      .select("id")
      .eq("data", hoje)
      .single();

    if (existente) {
      await supabase
        .from("analises_jogos")
        .update({
          jogos: jogosAnalisados,
          updated_at: new Date().toISOString(),
        })
        .eq("data", hoje);
    } else {
      await supabase
        .from("analises_jogos")
        .insert({ data: hoje, jogos: jogosAnalisados });
    }

    return NextResponse.json({ jogos: jogosAnalisados, fonte: "calculado" });
  } catch (err) {
    console.error("Erro analises:", err);
    return NextResponse.json({ jogos: [], fonte: "erro", erro: String(err) });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const hoje = new Date().toISOString().slice(0, 10);
    const body = await request.json();

    const { data: existente } = await supabase
      .from("analises_jogos")
      .select("id")
      .eq("data", hoje)
      .single();

    if (existente) {
      await supabase
        .from("analises_jogos")
        .update({ jogos: body.jogos, updated_at: new Date().toISOString() })
        .eq("data", hoje);
    } else {
      await supabase
        .from("analises_jogos")
        .insert({ data: hoje, jogos: body.jogos });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, erro: String(err) });
  }
}
