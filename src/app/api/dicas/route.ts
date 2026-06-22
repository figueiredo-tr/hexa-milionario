import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { jogos } = await request.json();

    const prompt = `Você é um tipster profissional especializado na Copa do Mundo 2026.

Jogos disponíveis hoje: ${JSON.stringify(jogos)}

Gere 3 dicas profissionais. REGRAS CRÍTICAS:
1. Cada dica deve ter apenas UMA partida
2. Os mercados dentro de uma dica NÃO podem ser contraditórios (ex: não combine "Time A vence" com "Dupla chance X2" pois são redundantes; não combine "Mais de 2.5 gols" com "Ambas marcam - Não")
3. Mercados válidos para combinar: resultado + escanteios, resultado + cartões, gols + escanteios
4. Analise APENAS jogos da lista fornecida

Responda APENAS com JSON puro sem markdown:
{
  "safe": {
    "partida": "Time A x Time B",
    "mercados": [
      { "mercado": "Resultado (1X2)", "selecao": "Time A vence", "odd": 1.30 },
      { "mercado": "Escanteios", "selecao": "Mais de 8.5 escanteios", "odd": 1.15 }
    ],
    "odd_combinada": 1.50,
    "analise": "Análise técnica de 2 linhas com argumentos reais sobre forma, histórico e estatísticas",
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

Restrições de odd OBRIGATÓRIAS:
- safe: odd_combinada entre 1.20 e 1.50
- noAlvo: odd_combinada entre 1.60 e 2.00
- arriscada: odd_combinada acima de 5.00

Exemplos de combinações VÁLIDAS:
- Vitória do favorito + Mais de 1.5 gols no jogo
- Vitória do favorito + Mais de 8.5 escanteios
- Ambas marcam Sim + Mais de 2.5 gols
- Placar exato (sozinho, apenas na arriscada)

Exemplos de combinações INVÁLIDAS (PROIBIDAS):
- Time A vence + Dupla chance 1X (redundante)
- Mais de 2.5 gols + Ambas marcam Não (contraditório)
- Time A vence + Time B marca primeiro (contraditório)`;

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
          temperature: 0.4,
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
