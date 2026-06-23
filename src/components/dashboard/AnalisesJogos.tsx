"use client";
import { useState, useEffect } from "react";

const ADMIN_EMAIL = "andrefigueiredo.v@gmail.com";

type Placar = { placar: string; prob: number };

type JogoAnalise = {
  id: string;
  casa: string;
  fora: string;
  logoHome: string;
  logoAway: string;
  horario: string;
  golsEsperadosCasa: number;
  golsEsperadosFora: number;
  probCasa: number;
  probEmpate: number;
  probFora: number;
  ambaMarcam: number;
  mais25: number;
  naoSofreCasa: number;
  naoSofreFora: number;
  empateComGols: number;
  empateSemGols: number;
  maisProvavel: Placar;
  outrosProvaveis: Placar[];
  favorito: "casa" | "fora" | "empate";
};

function TeamLogo({
  logo,
  nome,
  size = "md",
}: {
  logo: string;
  nome: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "w-6 h-6", md: "w-8 h-8", lg: "w-12 h-12" };
  if (logo)
    return (
      <img
        src={logo}
        alt={nome}
        className={`${sizes[size]} object-contain`}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    );
  return <span className={size === "lg" ? "text-4xl" : "text-2xl"}>⚽</span>;
}

function EditModal({
  jogo,
  onSave,
  onClose,
}: {
  jogo: JogoAnalise;
  onSave: (j: JogoAnalise) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ ...jogo });

  function updateOtro(
    i: number,
    field: "placar" | "prob",
    value: string | number,
  ) {
    const novos = [...form.outrosProvaveis];
    novos[i] = {
      ...novos[i],
      [field]: field === "prob" ? parseFloat(value as string) : value,
    };
    setForm({ ...form, outrosProvaveis: novos });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 overflow-y-auto py-8">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg space-y-4">
        <h3 className="text-white font-bold text-lg">
          ✏️ Editar — {form.casa} x {form.fora}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: `Gols esp. ${form.casa}`,
              key: "golsEsperadosCasa",
              step: "0.1",
            },
            {
              label: `Gols esp. ${form.fora}`,
              key: "golsEsperadosFora",
              step: "0.1",
            },
            { label: `% ${form.casa} vence`, key: "probCasa", step: "0.1" },
            { label: "% Empate", key: "probEmpate", step: "0.1" },
            { label: `% ${form.fora} vence`, key: "probFora", step: "0.1" },
            { label: "% Ambas marcam", key: "ambaMarcam", step: "0.1" },
            { label: "% Mais de 2.5 gols", key: "mais25", step: "0.1" },
          ].map(({ label, key, step }) => (
            <div key={key}>
              <label className="text-gray-400 text-xs mb-1 block">
                {label}
              </label>
              <input
                type="number"
                step={step}
                value={(form as any)[key]}
                onChange={(e) =>
                  setForm({ ...form, [key]: parseFloat(e.target.value) })
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-600"
              />
            </div>
          ))}
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Favorito</label>
            <select
              value={form.favorito}
              onChange={(e) =>
                setForm({ ...form, favorito: e.target.value as any })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-600"
            >
              <option value="casa">{form.casa}</option>
              <option value="empate">Empate</option>
              <option value="fora">{form.fora}</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">
              Placar mais provável
            </label>
            <input
              type="text"
              value={form.maisProvavel.placar}
              placeholder="2x0"
              onChange={(e) =>
                setForm({
                  ...form,
                  maisProvavel: {
                    ...form.maisProvavel,
                    placar: e.target.value,
                  },
                })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-600"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">
              % placar mais provável
            </label>
            <input
              type="number"
              step="0.1"
              value={form.maisProvavel.prob}
              onChange={(e) =>
                setForm({
                  ...form,
                  maisProvavel: {
                    ...form.maisProvavel,
                    prob: parseFloat(e.target.value),
                  },
                })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-600"
            />
          </div>
        </div>
        <div>
          <label className="text-gray-400 text-xs mb-2 block">
            Outros placares prováveis
          </label>
          <div className="space-y-2">
            {form.outrosProvaveis.map((o, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={o.placar}
                  placeholder="1x0"
                  onChange={(e) => updateOtro(i, "placar", e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-green-600"
                />
                <input
                  type="number"
                  step="0.1"
                  value={o.prob}
                  placeholder="%"
                  onChange={(e) => updateOtro(i, "prob", e.target.value)}
                  className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-green-600"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onSave(form)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
          >
            ✅ Salvar
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

// Card DESTAQUE (grande)
function JogoCardDestaque({
  jogo,
  isAdmin,
  onEdit,
}: {
  jogo: JogoAnalise;
  isAdmin: boolean;
  onEdit: () => void;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="bg-gray-800/50 px-6 py-5 relative">
        {isAdmin && (
          <button
            onClick={onEdit}
            className="absolute top-3 right-3 text-gray-500 hover:text-white text-xs bg-gray-700 px-2 py-1 rounded-md transition-colors"
          >
            ✏️ Editar
          </button>
        )}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamLogo logo={jogo.logoHome} nome={jogo.casa} size="lg" />
            <p className="text-white font-black text-base uppercase text-center">
              {jogo.casa}
            </p>
            <p className="text-gray-500 text-xs">
              {jogo.golsEsperadosCasa} gols esp.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="bg-gray-900 text-white font-bold text-base px-4 py-1.5 rounded-full border border-gray-700">
              {jogo.horario}
            </span>
            <span className="text-gray-500 text-xs">vs</span>
          </div>
          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamLogo logo={jogo.logoAway} nome={jogo.fora} size="lg" />
            <p className="text-white font-black text-base uppercase text-center">
              {jogo.fora}
            </p>
            <p className="text-gray-500 text-xs">
              {jogo.golsEsperadosFora} gols esp.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest text-center mb-3">
            Chance de cada resultado
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                key: "casa",
                label: jogo.casa,
                prob: jogo.probCasa,
                sub: `não sofre gol`,
                subVal: `${jogo.naoSofreCasa}%`,
              },
              {
                key: "empate",
                label: "Empate",
                prob: jogo.probEmpate,
                sub: `c/ gols ${jogo.empateComGols}% · s/ ${jogo.empateSemGols}%`,
                subVal: "",
              },
              {
                key: "fora",
                label: jogo.fora,
                prob: jogo.probFora,
                sub: `não sofre gol`,
                subVal: `${jogo.naoSofreFora}%`,
              },
            ].map(({ key, label, prob, sub, subVal }) => {
              const isFav = jogo.favorito === key;
              const cor = key === "empate" ? "yellow" : "green";
              return (
                <div
                  key={key}
                  className={`rounded-xl p-4 border-2 text-center ${isFav ? `border-${cor}-500 bg-${cor}-950/30` : "border-gray-700 bg-gray-800/40"}`}
                >
                  {isFav && (
                    <span
                      className={`block text-[9px] bg-${cor}-500 ${cor === "yellow" ? "text-black" : "text-white"} font-bold px-2 py-0.5 rounded-full mb-1 uppercase`}
                    >
                      Favorita
                    </span>
                  )}
                  <p
                    className={`text-xs font-bold uppercase mb-1 ${isFav ? `text-${cor}-400` : "text-gray-300"}`}
                  >
                    {label}
                  </p>
                  <p
                    className={`text-3xl font-black ${isFav ? `text-${cor}-400` : "text-white"}`}
                  >
                    {prob}%
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">{sub}</p>
                  {subVal && (
                    <p className="text-[10px] text-gray-400">{subVal}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-800/40 rounded-xl p-3 text-center">
            <p className="text-[10px] text-gray-500 uppercase mb-1">
              Placar mais provável
            </p>
            <p className="text-white font-black text-xl">
              {jogo.maisProvavel.placar}
            </p>
            <p className="text-gray-500 text-xs">{jogo.maisProvavel.prob}%</p>
          </div>
          <div className="bg-gray-800/40 rounded-xl p-3 text-center">
            <p className="text-[10px] text-gray-500 uppercase mb-1">
              Mais de 2.5 gols
            </p>
            <p className="text-white font-black text-xl">{jogo.mais25}%</p>
          </div>
          <div className="bg-gray-800/40 rounded-xl p-3 text-center">
            <p className="text-[10px] text-gray-500 uppercase mb-1">
              Ambas marcam
            </p>
            <p className="text-white font-black text-xl">{jogo.ambaMarcam}%</p>
          </div>
        </div>

        {jogo.outrosProvaveis.length > 0 && (
          <div className="border border-gray-700 rounded-xl p-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest text-center mb-2">
              Outros resultados prováveis
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {jogo.outrosProvaveis.map((p, i) => (
                <span
                  key={i}
                  className="bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg font-medium"
                >
                  {p.placar} <span className="text-gray-400">{p.prob}%</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Card MENOR (compacto)
function JogoCardMenor({
  jogo,
  isAdmin,
  onEdit,
}: {
  jogo: JogoAnalise;
  isAdmin: boolean;
  onEdit: () => void;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="bg-gray-800/50 px-4 py-3 relative">
        {isAdmin && (
          <button
            onClick={onEdit}
            className="absolute top-2 right-2 text-gray-500 hover:text-white text-xs bg-gray-700 px-2 py-0.5 rounded-md transition-colors"
          >
            ✏️ Editar
          </button>
        )}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col items-center gap-1 flex-1">
            <TeamLogo logo={jogo.logoHome} nome={jogo.casa} size="sm" />
            <p className="text-white font-black text-xs uppercase text-center leading-tight">
              {jogo.casa}
            </p>
            <p className="text-gray-500 text-[9px]">
              {jogo.golsEsperadosCasa} gols esp.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <span className="bg-gray-900 text-white font-bold text-xs px-2 py-1 rounded-full border border-gray-700">
              {jogo.horario}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1">
            <TeamLogo logo={jogo.logoAway} nome={jogo.fora} size="sm" />
            <p className="text-white font-black text-xs uppercase text-center leading-tight">
              {jogo.fora}
            </p>
            <p className="text-gray-500 text-[9px]">
              {jogo.golsEsperadosFora} gols esp.
            </p>
          </div>
        </div>
      </div>

      <div className="p-3 space-y-3">
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { key: "casa", label: jogo.casa, prob: jogo.probCasa },
            { key: "empate", label: "Empate", prob: jogo.probEmpate },
            { key: "fora", label: jogo.fora, prob: jogo.probFora },
          ].map(({ key, label, prob }) => {
            const isFav = jogo.favorito === key;
            const cor = key === "empate" ? "text-yellow-400" : "text-green-400";
            return (
              <div
                key={key}
                className={`rounded-lg p-2 border text-center ${isFav ? "border-green-600 bg-green-950/20" : "border-gray-700 bg-gray-800/40"}`}
              >
                {isFav && (
                  <span className="block text-[8px] text-green-400 font-bold mb-0.5 uppercase">
                    Fav.
                  </span>
                )}
                <p className="text-[9px] text-gray-400 uppercase truncate mb-0.5">
                  {label}
                </p>
                <p
                  className={`text-base font-black ${isFav ? cor : "text-white"}`}
                >
                  {prob}%
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <div className="bg-gray-800/40 rounded-lg p-2 text-center">
            <p className="text-[8px] text-gray-500 uppercase mb-0.5">Placar</p>
            <p className="text-white font-black text-sm">
              {jogo.maisProvavel.placar}
            </p>
            <p className="text-gray-500 text-[9px]">
              {jogo.maisProvavel.prob}%
            </p>
          </div>
          <div className="bg-gray-800/40 rounded-lg p-2 text-center">
            <p className="text-[8px] text-gray-500 uppercase mb-0.5">
              +2.5 gols
            </p>
            <p className="text-white font-black text-sm">{jogo.mais25}%</p>
          </div>
          <div className="bg-gray-800/40 rounded-lg p-2 text-center">
            <p className="text-[8px] text-gray-500 uppercase mb-0.5">Ambas</p>
            <p className="text-white font-black text-sm">{jogo.ambaMarcam}%</p>
          </div>
        </div>

        {jogo.outrosProvaveis.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center">
            {jogo.outrosProvaveis.slice(0, 4).map((p, i) => (
              <span
                key={i}
                className="bg-gray-800 text-white text-[10px] px-2 py-1 rounded-md font-medium"
              >
                {p.placar} <span className="text-gray-400">{p.prob}%</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnalisesJogos({ userEmail }: { userEmail: string }) {
  const isAdmin = userEmail === ADMIN_EMAIL;
  const [jogos, setJogos] = useState<JogoAnalise[]>([]);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [editando, setEditando] = useState<JogoAnalise | null>(null);

  async function carregar(forcar = false) {
    setLoading(true);
    const res = await fetch(`/api/analises${forcar ? "?forcar=1" : ""}`);
    const data = await res.json();
    setJogos(data.jogos || []);
    setLoading(false);
    setGerando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function salvarEdicao(jogoEditado: JogoAnalise) {
    const novos = jogos.map((j) => (j.id === jogoEditado.id ? jogoEditado : j));
    setJogos(novos);
    setEditando(null);
    await fetch("/api/analises", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jogos: novos }),
    });
  }

  const destaque = jogos[0];
  const menores = jogos.slice(1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-white font-bold text-base">
          📊 Análise dos Jogos do Dia
        </h2>
        <div className="flex gap-2 items-center">
          <span className="text-gray-500 text-xs">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
            })}
          </span>
          {isAdmin && (
            <button
              onClick={() => {
                setGerando(true);
                carregar(true);
              }}
              disabled={gerando}
              className="flex items-center gap-1.5 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              {gerando ? "⏳ Gerando..." : "🔄 Regerar"}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-8">
          Calculando probabilidades...
        </div>
      ) : jogos.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          Nenhum jogo hoje para analisar.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Card destaque */}
          {destaque && (
            <JogoCardDestaque
              jogo={destaque}
              isAdmin={isAdmin}
              onEdit={() => setEditando(destaque)}
            />
          )}

          {/* Cards menores — 3 em linha */}
          {menores.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {menores.map((jogo) => (
                <JogoCardMenor
                  key={jogo.id}
                  jogo={jogo}
                  isAdmin={isAdmin}
                  onEdit={() => setEditando(jogo)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {editando && (
        <EditModal
          jogo={editando}
          onSave={salvarEdicao}
          onClose={() => setEditando(null)}
        />
      )}
    </div>
  );
}
