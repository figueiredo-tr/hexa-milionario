"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";

const ADMIN_EMAIL = "andrefigueiredo.v@gmail.com";

type Mercado = {
  mercado: string;
  selecao: string;
  odd: number;
};

type Dica = {
  partida: string;
  mercados: Mercado[];
  odd_combinada: number;
  analise: string;
  confianca: string;
};

type DicaLegacy = {
  partida: string;
  mercado: string;
  odd: string;
  descricao: string;
};

type DicasDia = {
  dica_safe: Dica | DicaLegacy;
  dica_alvo: Dica | DicaLegacy;
  dica_arriscada: Dica | DicaLegacy;
};

const dicaVazia: Dica = {
  partida: "",
  mercados: [],
  odd_combinada: 0,
  analise: "",
  confianca: "",
};

function isNovaEstrutura(dica: any): dica is Dica {
  return dica && Array.isArray(dica.mercados);
}

const configTipo = {
  safe: {
    label: "🛡️ Safe",
    sub: "Odd até 1.50",
    color: "text-green-400",
    border: "border-green-900",
    bg: "bg-green-900/10",
    badge: "bg-green-900/30 text-green-300 border-green-800",
    confiancaBg: "bg-green-800/40",
  },
  alvo: {
    label: "🎯 No Alvo",
    sub: "Odd 1.70 – 2.00",
    color: "text-yellow-400",
    border: "border-yellow-900",
    bg: "bg-yellow-900/10",
    badge: "bg-yellow-900/30 text-yellow-300 border-yellow-800",
    confiancaBg: "bg-yellow-800/40",
  },
  arriscada: {
    label: "🔥 Arriscada",
    sub: "Odd acima de 5.00",
    color: "text-red-400",
    border: "border-red-900",
    bg: "bg-red-900/10",
    badge: "bg-red-900/30 text-red-300 border-red-800",
    confiancaBg: "bg-red-800/40",
  },
};

function DicaCard({
  tipo,
  dica,
  isAdmin,
  onEdit,
}: {
  tipo: "safe" | "alvo" | "arriscada";
  dica: Dica | DicaLegacy;
  isAdmin: boolean;
  onEdit: () => void;
}) {
  const config = configTipo[tipo];
  const nova = isNovaEstrutura(dica);
  const vazia = !dica.partida;

  return (
    <Card
      className={`bg-gray-900 border ${config.border} ${config.bg} relative flex flex-col`}
    >
      {isAdmin && (
        <button
          onClick={onEdit}
          className="absolute top-3 right-3 text-gray-500 hover:text-white text-xs bg-gray-800 px-2 py-1 rounded-md transition-colors z-10"
        >
          ✏️ Editar
        </button>
      )}

      <div className="pt-4 px-4 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-base font-bold ${config.color}`}>
            {config.label}
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border ${config.badge}`}
          >
            {config.sub}
          </span>
          {nova && dica.confianca && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full text-gray-300 ${config.confiancaBg}`}
            >
              Confiança: {dica.confianca}
            </span>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 space-y-3 flex-1">
        {vazia ? (
          <p className="text-gray-500 text-sm italic">
            Dica ainda não definida para hoje.
          </p>
        ) : (
          <>
            <p className="text-white text-sm font-semibold">
              ⚽ {dica.partida}
            </p>

            {nova ? (
              <>
                <div className="space-y-2">
                  {dica.mercados.map((m, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-2 rounded-lg ${config.badge} border`}
                    >
                      <div>
                        <p className="text-[10px] text-gray-400">{m.mercado}</p>
                        <p className="text-xs font-semibold text-white">
                          {m.selecao}
                        </p>
                      </div>
                      <span className="text-xs font-bold ml-2 shrink-0">
                        Odd: {m.odd}
                      </span>
                    </div>
                  ))}
                </div>

                {dica.mercados.length > 1 && (
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border ${config.badge}`}
                  >
                    <span className="text-xs text-gray-300">Odd Combinada</span>
                    <span className={`text-sm font-bold ${config.color}`}>
                      {dica.odd_combinada}
                    </span>
                  </div>
                )}

                {dica.analise && (
                  <p className="text-gray-400 text-xs leading-relaxed border-t border-gray-800 pt-2">
                    📊 {dica.analise}
                  </p>
                )}
              </>
            ) : (
              <>
                {(dica as DicaLegacy).mercado && (
                  <p className="text-gray-300 text-xs">
                    📌 {(dica as DicaLegacy).mercado}
                  </p>
                )}
                {(dica as DicaLegacy).descricao && (
                  <p className="text-gray-400 text-xs">
                    {(dica as DicaLegacy).descricao}
                  </p>
                )}
                {(dica as DicaLegacy).odd && (
                  <div
                    className={`inline-block text-sm font-bold px-3 py-1 rounded-lg ${config.badge} border`}
                  >
                    Odd: {(dica as DicaLegacy).odd}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Card>
  );
}

function EditModal({
  tipo,
  onClose,
  onSaveManual,
}: {
  tipo: "safe" | "alvo" | "arriscada";
  onClose: () => void;
  onSaveManual: (d: DicaLegacy) => void;
}) {
  const [form, setForm] = useState<DicaLegacy>({
    partida: "",
    mercado: "",
    odd: "",
    descricao: "",
  });
  const labels = {
    safe: "🛡️ Safe",
    alvo: "🎯 No Alvo",
    arriscada: "🔥 Arriscada",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md space-y-4">
        <h3 className="text-white font-bold text-lg">
          Editar dica — {labels[tipo]}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Partida</label>
            <input
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-600"
              placeholder="Ex: Brasil x Argentina"
              value={form.partida}
              onChange={(e) => setForm({ ...form, partida: e.target.value })}
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">
              Mercado / Seleção
            </label>
            <input
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-600"
              placeholder="Ex: Ambas marcam - Não"
              value={form.mercado}
              onChange={(e) => setForm({ ...form, mercado: e.target.value })}
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Odd</label>
            <input
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-600"
              placeholder="Ex: 1.45"
              value={form.odd}
              onChange={(e) => setForm({ ...form, odd: e.target.value })}
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Análise</label>
            <textarea
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-600 resize-none"
              placeholder="Ex: Time com melhor defesa da fase de grupos..."
              rows={3}
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onSaveManual(form)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
          >
            Salvar
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-2 rounded-lg transition-colors text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DicasDiarias({ userEmail }: { userEmail: string }) {
  const supabase = createClient();
  const isAdmin = userEmail === ADMIN_EMAIL;
  const hoje = new Date().toISOString().slice(0, 10);

  const [dicas, setDicas] = useState<DicasDia>({
    dica_safe: dicaVazia,
    dica_alvo: dicaVazia,
    dica_arriscada: dicaVazia,
  });
  const [editando, setEditando] = useState<
    "safe" | "alvo" | "arriscada" | null
  >(null);
  const [gerando, setGerando] = useState(false);
  const [erroIA, setErroIA] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("dicas_diarias")
        .select("*")
        .eq("data", hoje)
        .single();
      if (data) {
        setDicas({
          dica_safe: data.dica_safe || dicaVazia,
          dica_alvo: data.dica_alvo || dicaVazia,
          dica_arriscada: data.dica_arriscada || dicaVazia,
        });
      }
    }
    load();
  }, []);

  async function salvarDicaManual(
    tipo: "safe" | "alvo" | "arriscada",
    novaDica: DicaLegacy,
  ) {
    const campo = `dica_${tipo}`;
    const novasDicas = { ...dicas, [campo]: novaDica };

    const { data: existente } = await supabase
      .from("dicas_diarias")
      .select("id")
      .eq("data", hoje)
      .single();

    if (existente) {
      await supabase
        .from("dicas_diarias")
        .update({ [campo]: novaDica, updated_at: new Date().toISOString() })
        .eq("data", hoje);
    } else {
      await supabase.from("dicas_diarias").insert({
        data: hoje,
        dica_safe: novasDicas.dica_safe,
        dica_alvo: novasDicas.dica_alvo,
        dica_arriscada: novasDicas.dica_arriscada,
      });
    }

    setDicas(novasDicas);
    setEditando(null);
  }

  async function gerarComIA() {
    setGerando(true);
    setErroIA("");
    try {
      const resJogos = await fetch("/api/jogos");
      const dataJogos = await resJogos.json();
      const jogos = dataJogos.jogos || [];

      const res = await fetch("/api/dicas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jogos }),
      });

      const data = await res.json();
      if (data.erro) throw new Error(data.erro);

      const { dicas: dicasIA } = data;

      const novasSafe: Dica = {
        partida: dicasIA.safe?.partida || "",
        mercados: dicasIA.safe?.mercados || [],
        odd_combinada: dicasIA.safe?.odd_combinada || 0,
        analise: dicasIA.safe?.analise || "",
        confianca: dicasIA.safe?.confianca || "",
      };
      const novasAlvo: Dica = {
        partida: dicasIA.noAlvo?.partida || "",
        mercados: dicasIA.noAlvo?.mercados || [],
        odd_combinada: dicasIA.noAlvo?.odd_combinada || 0,
        analise: dicasIA.noAlvo?.analise || "",
        confianca: dicasIA.noAlvo?.confianca || "",
      };
      const novasArriscada: Dica = {
        partida: dicasIA.arriscada?.partida || "",
        mercados: dicasIA.arriscada?.mercados || [],
        odd_combinada: dicasIA.arriscada?.odd_combinada || 0,
        analise: dicasIA.arriscada?.analise || "",
        confianca: dicasIA.arriscada?.confianca || "",
      };

      const { data: existente } = await supabase
        .from("dicas_diarias")
        .select("id")
        .eq("data", hoje)
        .single();

      const payload = {
        dica_safe: novasSafe,
        dica_alvo: novasAlvo,
        dica_arriscada: novasArriscada,
        updated_at: new Date().toISOString(),
      };

      if (existente) {
        await supabase.from("dicas_diarias").update(payload).eq("data", hoje);
      } else {
        await supabase.from("dicas_diarias").insert({ data: hoje, ...payload });
      }

      setDicas({
        dica_safe: novasSafe,
        dica_alvo: novasAlvo,
        dica_arriscada: novasArriscada,
      });
    } catch (err) {
      setErroIA("Erro ao gerar dicas. Verifique a chave do Groq no .env.local");
      console.error(err);
    }
    setGerando(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-white font-bold text-base">💡 Dicas do Dia</h2>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={gerarComIA}
              disabled={gerando}
              className="flex items-center gap-2 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              {gerando ? (
                <>
                  <span className="animate-spin">⚙️</span> Gerando...
                </>
              ) : (
                <>✨ Gerar com IA</>
              )}
            </button>
          )}
          <span className="text-gray-500 text-xs">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
            })}
          </span>
        </div>
      </div>

      {erroIA && (
        <p className="text-red-400 text-xs bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
          {erroIA}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <DicaCard
          tipo="safe"
          dica={dicas.dica_safe}
          isAdmin={isAdmin}
          onEdit={() => setEditando("safe")}
        />
        <DicaCard
          tipo="alvo"
          dica={dicas.dica_alvo}
          isAdmin={isAdmin}
          onEdit={() => setEditando("alvo")}
        />
        <DicaCard
          tipo="arriscada"
          dica={dicas.dica_arriscada}
          isAdmin={isAdmin}
          onEdit={() => setEditando("arriscada")}
        />
      </div>

      {editando && (
        <EditModal
          tipo={editando}
          onClose={() => setEditando(null)}
          onSaveManual={(d) => salvarDicaManual(editando, d)}
        />
      )}
    </div>
  );
}
