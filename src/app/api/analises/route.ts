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

  const maxGols = 6;
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
      if (i <= 4 && j <= 4) placares.push({ placar: `${i}x${j}`, prob: p });
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

    const jogosAnalisados = eventos.map((evento: any) => {
      const comp = evento.competitions?.[0];
      const home = comp?.competitors?.find((c: any) => c.homeAway === "home");
      const away = comp?.competitors?.find((c: any) => c.homeAway === "away");

      const homeName = home?.team?.displayName || "Time A";
      const awayName = away?.team?.displayName || "Time B";
      const logoHome = home?.team?.logos?.[0]?.href || home?.team?.logo || "";
      const logoAway = away?.team?.logos?.[0]?.href || away?.team?.logo || "";

      const horario = new Date(evento.date).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Sao_Paulo",
      });

      const homeStats = home?.statistics || [];
      const awayStats = away?.statistics || [];
      const getStat = (stats: any[], name: string) =>
        parseFloat(
          stats.find((s: any) => s.name === name)?.displayValue || "0",
        ) || 0;

      const homeGols = getStat(homeStats, "totalGoals");
      const awayGols = getStat(awayStats, "totalGoals");
      const homeJogos = Math.max(getStat(homeStats, "appearances") || 1, 1);
      const awayJogos = Math.max(getStat(awayStats, "appearances") || 1, 1);

      const mediaGols = 1.35;
      let golsEsperadosCasa =
        homeJogos > 0 && homeGols > 0 ? homeGols / homeJogos : mediaGols;
      let golsEsperadosFora =
        awayJogos > 0 && awayGols > 0 ? awayGols / awayJogos : mediaGols * 0.85;
      golsEsperadosCasa = Math.max(0.3, Math.min(4.5, golsEsperadosCasa));
      golsEsperadosFora = Math.max(0.3, Math.min(4.5, golsEsperadosFora));

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
