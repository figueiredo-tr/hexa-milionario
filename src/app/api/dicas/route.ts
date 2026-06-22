import { NextResponse } from "next/server";

const ODDS_API_KEY = process.env.ODDS_API_KEY!;
const GROQ_API_KEY = process.env.GROQ_API_KEY!;

async function buscarOddsReais() {
  try {
    const res = await fetch(
      `https://api.the-odds-api.com/v4/sports/soccer_fifa_world_cup/odds/?apiKey=${ODDS_API_KEY}&regions=eu&markets=h2h,totals,btts&oddsFormat=decimal&dateFormat=iso`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

function calcularOddMedia(outcomes: any[]) {
  if (!outcomes?.length) return 0;
  return parseFloat(
    (
      outcomes.reduce((s: number, o: any) => s + o.price, 0) / outcomes.length
    ).toFixed(2),
  );
}

function formatarJogos(oddsData: any[]) {
  return oddsData.slice(0, 12).map((jogo: any) => {
    const bookmakers = jogo.bookmakers || [];
    const h2hMercado = bookmakers.flatMap((b: any) =>
      b.markets.filter((m: any) => m.key === "h2h"),
    )[0];
    const totalsMercado = bookmakers.flatMap((b: any) =>
      b.markets.filter((m: any) => m.key === "totals"),
    )[0];
    const bttsMercado = bookmakers.flatMap((b: any) =>
      b.markets.filter((m: any) => m.key === "btts"),
    )[0];

    const home = h2hMercado?.outcomes?.find(
      (o: any) => o.name === jogo.home_team,
    );
    const away = h2hMercado?.outcomes?.find(
      (o: any) => o.name === jogo.away_team,
    );
    const draw = h2hMercado?.outcomes?.find((o: any) => o.name === "Draw");

    const totals =
      totalsMercado?.outcomes?.map((o: any) => ({
        selecao: `${o.name} ${o.point} gols`,
        odd: o.price,
      })) || [];

    const btts =
      bttsMercado?.outcomes?.map((o: any) => ({
        selecao: `Ambas marcam: ${o.name}`,
        odd: o.price,
      })) || [];

    return {
      partida: `${jogo.home_team} x ${jogo.away_team}`,
      data: new Date(jogo.commence_time).toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
      }),
      odds_resultado: {
        casa: { selecao: `${jogo.home_team} vence`, odd: home?.price || 0 },
        empate: { selecao: "Empate", odd: draw?.price || 0 },
        visitante: {
          selecao: `${jogo.away_team} vence`,
          odd: away?.price || 0,
        },
      },
      odds_gols: totals,
      odds_btts: btts,
    };
  });
}

export async function POST(request: Request) {
  try {
    const { jogos } = await request.json();
    const oddsReais = await buscarOddsReais();
    const temOdds = oddsReais.length > 0;
    const jogosFormatados = temOdds ? formatarJogos(oddsReais) : jogos;

    const prompt = `Você é um tipster profissional da Copa do Mundo 2026.

${
  temOdds
    ? `DADOS REAIS COM ODDS (use EXATAMENTE esses valores):
${JSON.stringify(jogosFormatados, null, 2)}`
    : `Jogos disponíveis: ${JSON.stringify(jogos)}`
}

Gere 3 dicas usando APENAS as odds acima. Responda SOMENTE com JSON puro sem markdown:
{
  "safe": {
    "partida": "Time A x Time B",
    "mercados": [
      { "mercado": "Resultado (1X2)", "selecao": "Time A vence", "odd": 1.30 },
      { "mercado": "Total de gols", "selecao": "Mais de 1.5 gols", "odd": 1.12 }
    ],
    "odd_combinada": 1.46,
    "analise": "Análise técnica de 2 linhas",
    "confianca": "Alta"
  },
  "noAlvo": {
    "partida": "Time A x Time B",
    "mercados": [
      { "mercado": "Total de gols", "selecao": "Mais de 2.5 gols", "odd": 1.80 }
    ],
    "odd_combinada": 1.80,
    "analise": "Análise técnica de 2 linhas",
    "confianca": "Média-Alta"
  },
  "arriscada": {
    "partida": "Time A x Time B",
    "mercados": [
      { "mercado": "Resultado (1X2)", "selecao": "Time B vence", "odd": 4.50 },
      { "mercado": "Ambas marcam", "selecao": "Sim", "odd": 1.60 }
    ],
    "odd_combinada": 7.20,
    "analise": "Análise técnica de 2 linhas",
    "confianca": "Baixa"
  }
}

REGRAS:
- Use EXATAMENTE as odds dos dados fornecidos — copie os valores sem arredondar
- safe: odd_combinada entre 1.20 e 1.50
- noAlvo: odd_combinada entre 1.60 e 2.00
- arriscada: odd_combinada acima de 5.00
- Não combine mercados contraditórios
- A odd_combinada deve ser o produto das odds individuais`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          max_tokens: 1500,
          temperature: 0.2,
          messages: [{ role: "user", content: prompt }],
        }),
      },
    );

    const data = await response.json();
    const texto = data.choices?.[0]?.message?.content || "{}";
    const clean = texto.replace(/```json|```/g, "").trim();
    const dicas = JSON.parse(clean);

    return NextResponse.json({
      dicas,
      temOddsReais: temOdds,
      geradoEm: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ erro: "Falha ao gerar dicas" }, { status: 500 });
  }
}
