import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { jogos } = await request.json();

    const prompt = `Você é um tipster profissional especializado na Copa do Mundo 2026 com anos de experiência em análise estatística de futebol.

Jogos disponíveis hoje: ${JSON.stringify(jogos)}

Analise os confrontos e gere 3 dicas profissionais e detalhadas. Responda APENAS com JSON puro, sem markdown, sem backticks, sem texto adicional:

{
  "safe": {
    "partida": "Time A x Time B",
    "mercados": [
      { "mercado": "nome do mercado", "selecao": "o que apostar", "odd": 1.30 },
      { "mercado": "nome do mercado", "selecao": "o que apostar", "odd": 1.15 }
    ],
    "odd_combinada": 1.45,
    "analise": "análise técnica detalhada de 2-3 linhas explicando o histórico, forma atual, estatísticas relevantes e por que essa aposta tem valor",
    "confianca": "Alta"
  },
  "noAlvo": {
    "partida": "Time A x Time B",
    "mercados": [
      { "mercado": "nome do mercado", "selecao": "o que apostar", "odd": 1.85 }
    ],
    "odd_combinada": 1.85,
    "analise": "análise técnica detalhada de 2-3 linhas",
    "confianca": "Média-Alta"
  },
  "arriscada": {
    "partida": "Time A x Time B",
    "mercados": [
      { "mercado": "nome do mercado", "selecao": "o que apostar", "odd": 3.50 },
      { "mercado": "nome do mercado", "selecao": "o que apostar", "odd": 2.00 }
    ],
    "odd_combinada": 7.00,
    "analise": "análise técnica detalhada de 2-3 linhas",
    "confianca": "Baixa-Média"
  }
}

Mercados disponíveis para usar (varie entre eles):
- Resultado (1X2): Vitória mandante, Empate, Vitória visitante
- Dupla chance: 1X, X2, 12
- Ambas marcam: Sim / Não
- Total de gols: Mais/Menos de 0.5, 1.5, 2.5, 3.5
- Gols do time: Time marca mais de 1.5 gols
- Handicap asiático: ex: Time A -0.5, -1, -1.5
- Escanteios: Total de escanteios acima/abaixo de 8.5, 9.5, 10.5
- Cartões: Total de cartões acima/abaixo de 3.5, 4.5
- Primeiro a marcar: Time X marca primeiro
- Placar exato (apenas na arriscada)

Regras OBRIGATÓRIAS:
- Safe: odd combinada OBRIGATORIAMENTE entre 1.20 e 1.50. Pode combinar 2-3 mercados seguros
- No Alvo: odd combinada OBRIGATORIAMENTE entre 1.60 e 2.00. 1-2 mercados
- Arriscada: odd combinada OBRIGATORIAMENTE acima de 5.00. Pode combinar mercados mais ousados
- Use estatísticas reais e argumentos técnicos na análise
- Mencione forma recente, histórico de confrontos, fase da competição
- Use jogos da lista fornecida. Se não houver jogos suficientes, crie jogos plausíveis da Copa 2026
- As odds individuais devem ser realistas para o mercado escolhido`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          max_tokens: 1500,
          temperature: 0.6,
          messages: [{ role: "user", content: prompt }],
        }),
      },
    );

    const data = await response.json();
    const texto = data.choices?.[0]?.message?.content || "{}";
    const clean = texto.replace(/```json|```/g, "").trim();
    const dicas = JSON.parse(clean);

    return NextResponse.json({ dicas, geradoEm: new Date().toISOString() });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ erro: "Falha ao gerar dicas" }, { status: 500 });
  }
}
