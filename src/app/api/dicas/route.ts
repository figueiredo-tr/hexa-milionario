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
    const data = await res.json();
    return data;
  } catch {
    return [];
  }
}

function formatarOddsParaPrompt(oddsData: any[]) {
  if (!oddsData.length) return "Nenhuma odd disponível no momento.";

  return oddsData
    .slice(0, 10)
    .map((jogo: any) => {
      const bookmaker = jogo.bookmakers?.[0];
      if (!bookmaker) return null;

      const mercados = bookmaker.markets
        .map((m: any) => {
          if (m.key === "h2h") {
            const [home, away, draw] = m.outcomes;
            return `Resultado: ${home?.name} vence (${home?.price}) | Empate (${draw?.price}) | ${away?.name} vence (${away?.price})`;
          }
          if (m.key === "totals") {
            return m.outcomes
              .map((o: any) => `Gols ${o.name} ${o.point} (${o.price})`)
              .join(" | ");
          }
          if (m.key === "btts") {
            return m.outcomes
              .map((o: any) => `Ambas marcam ${o.name} (${o.price})`)
              .join(" | ");
          }
          return null;
        })
        .filter(Boolean)
        .join("\n    ");

      return `
Jogo: ${jogo.home_team} x ${jogo.away_team}
Data: ${new Date(jogo.commence_time).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
Odds (${bookmaker.title}):
    ${mercados}`;
    })
    .filter(Boolean)
    .join("\n---");
}

export async function POST(request: Request) {
  try {
    const { jogos } = await request.json();

    // Busca odds reais
    const oddsReais = await buscarOddsReais();
    const oddsFormatadas = formatarOddsParaPrompt(oddsReais);
    const temOddsReais = oddsReais.length > 0;

    const prompt = `Você é um tipster profissional especializado na Copa do Mundo 2026.

${
  temOddsReais
    ? `ODDS REAIS DA COPA DO MUNDO 2026 (use EXATAMENTE essas odds):
${oddsFormatadas}`
    : `Jogos disponíveis hoje (sem odds reais disponíveis):
${JSON.stringify(jogos)}`
}

Gere 3 dicas profissionais usando as odds acima. REGRAS CRÍTICAS:
1. Use EXATAMENTE as odds fornecidas acima — não invente valores
2. Cada dica deve ter apenas UMA partida
3. Os mercados dentro de uma dica NÃO podem ser contraditórios
4. Mercados válidos para combinar: resultado + gols, resultado + ambas marcam, gols + ambas marcam

Responda APENAS com JSON puro sem markdown:
{
  "safe": {
    "partida": "Time A x Time B",
    "mercados": [
      { "mercado": "Resultado (1X2)", "selecao": "Time A vence", "odd": 1.30 },
      { "mercado": "Total de gols", "selecao": "Mais de 1.5", "odd": 1.12 }
    ],
    "odd_combinada": 1.46,
    "analise": "Análise técnica de 2 linhas com argumentos sobre forma, histórico e estatísticas",
    "confianca": "Alta"
  },
  "noAlvo": {
    "partida": "Time A x Time B",
    "mercados": [
      { "mercado": "Total de gols", "selecao": "Mais de 2.5", "odd": 1.85 }
    ],
    "odd_combinada": 1.85,
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

Restrições OBRIGATÓRIAS:
- safe: odd_combinada entre 1.20 e 1.50
- noAlvo: odd_combinada entre 1.60 e 2.00
- arriscada: odd_combinada acima de 5.00

Combinações PROIBIDAS:
- Time A vence + Dupla chance 1X (redundante)
- Mais de 2.5 gols + Ambas marcam Não (contraditório)
- Time A vence + Time B marca primeiro (contraditório)`;

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
          temperature: 0.3,
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
      temOddsReais,
      geradoEm: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ erro: "Falha ao gerar dicas" }, { status: 500 });
  }
}
