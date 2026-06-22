import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { jogos } = await request.json();

    const prompt = `Você é um especialista em apostas esportivas da Copa do Mundo 2026.
Com base nos seguintes jogos disponíveis hoje: ${JSON.stringify(jogos)}

Gere exatamente 3 dicas de apostas. Responda APENAS com JSON puro, sem texto adicional, sem markdown, sem backticks:
{
  "safe": {
    "partida": "Time A x Time B",
    "dica": "descrição da aposta",
    "odd": 1.35,
    "justificativa": "motivo curto"
  },
  "noAlvo": {
    "partida": "Time A x Time B",
    "dica": "descrição da aposta",
    "odd": 1.85,
    "justificativa": "motivo curto"
  },
  "arriscada": {
    "partida": "Time A x Time B",
    "dica": "descrição da aposta",
    "odd": 6.50,
    "justificativa": "motivo curto"
  }
}

Regras OBRIGATÓRIAS:
- Safe: odd OBRIGATORIAMENTE entre 1.10 e 1.50
- No Alvo: odd OBRIGATORIAMENTE entre 1.70 e 2.00
- Arriscada: odd OBRIGATORIAMENTE acima de 5.00
- Use jogos da lista fornecida quando possível
- Se não houver jogos suficientes, use jogos plausíveis da Copa 2026`;

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
          max_tokens: 1000,
          temperature: 0.7,
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
