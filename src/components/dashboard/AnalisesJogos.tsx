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

function TeamLogo({ logo, nome }: { logo: string; nome: string }) {
  if (logo)
    return (
      <img
        src={logo}
        alt={nome}
        className="w-8 h-8 object-contain"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    );
  return <span className="text-2xl">⚽</span>;
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
          <div>
            <label className="text-gray-400 text-xs mb-1 block">
              Gols esp. {form.casa}
            </label>
            <input
              type="number"
              step="0.1"
              value={form.golsEsperadosCasa}
              onChange={(e) =>
                setForm({
                  ...form,
                  golsEsperadosCasa: parseFloat(e.target.value),
                })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-600"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">
              Gols esp. {form.fora}
            </label>
            <input
              type="number"
              step="0.1"
              value={form.golsEsperadosFora}
              onChange={(e) =>
                setForm({
                  ...form,
                  golsEsperadosFora: parseFloat(e.target.value),
                })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-600"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">
              % {form.casa} vence
            </label>
            <input
              type="number"
              step="0.1"
              value={form.probCasa}
              onChange={(e) =>
                setForm({ ...form, probCasa: parseFloat(e.target.value) })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-600"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">% Empate</label>
            <input
              type="number"
              step="0.1"
              value={form.probEmpate}
              onChange={(e) =>
                setForm({ ...form, probEmpate: parseFloat(e.target.value) })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-600"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">
              % {form.fora} vence
            </label>
            <input
              type="number"
              step="0.1"
              value={form.probFora}
              onChange={(e) =>
                setForm({ ...form, probFora: parseFloat(e.target.value) })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-600"
            />
          </div>
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
              % Ambas marcam
            </label>
            <input
              type="number"
              step="0.1"
              value={form.ambaMarcam}
              onChange={(e) =>
                setForm({ ...form, ambaMarcam: parseFloat(e.target.value) })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-600"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">
              % Mais de 2.5 gols
            </label>
            <input
              type="number"
              step="0.1"
              value={form.mais25}
              onChange={(e) =>
                setForm({ ...form, mais25: parseFloat(e.target.value) })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-600"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">
              Placar mais provável
            </label>
            <input
              type="text"
              value={form.maisProvavel.placar}
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
              placeholder="2x0"
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
                  onChange={(e) => updateOtro(i, "placar", e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-green-600"
                  placeholder="1x0"
                />
                <input
                  type="number"
                  step="0.1"
                  value={o.prob}
                  onChange={(e) => updateOtro(i, "prob", e.target.value)}
                  className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-green-600"
                  placeholder="%"
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

function JogoCard({
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
      <div className="bg-gray-800/50 px-4 py-4 relative">
        {isAdmin && (
          <button
            onClick={onEdit}
            className="absolute top-3 right-3 text-gray-500 hover:text-white text-xs bg-gray-700 px-2 py-1 rounded-md transition-colors"
          >
            ✏️ Editar
          </button>
        )}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col items-center gap-1 flex-1">
            <TeamLogo logo={jogo.logoHome} nome={jogo.casa} />
            <p className="text-white font-black text-sm uppercase text-center">
              {jogo.casa}
            </p>
            <p className="text-gray-500 text-[10px]">
              {jogo.golsEsperadosCasa} gols esp.
            </p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="bg-gray-900 text-white font-bold text-sm px-3 py-1 rounded-full border border-gray-700">
              {jogo.horario}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1">
            <TeamLogo logo={jogo.logoAway} nome={jogo.fora} />
            <p className="text-white font-black text-sm uppercase text-center">
              {jogo.fora}
            </p>
            <p className="text-gray-500 text-[10px]">
              {jogo.golsEsperadosFora} gols esp.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest text-center mb-3">
            Chance de cada resultado
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div
              className={`rounded-xl p-3 border-2 text-center ${jogo.favorito === "casa" ? "border-green-500 bg-green-950/30" : "border-gray-700 bg-gray-800/40"}`}
            >
              {jogo.favorito === "casa" && (
                <span className="block text-[9px] bg-green-500 text-white font-bold px-2 py-0.5 rounded-full mb-1 uppercase">
                  Favorita
                </span>
              )}
              <p
                className={`text-[11px] font-bold uppercase mb-1 ${jogo.favorito === "casa" ? "text-green-400" : "text-gray-300"}`}
              >
                {jogo.casa}
              </p>
              <p
                className={`text-2xl font-black ${jogo.favorito === "casa" ? "text-green-400" : "text-white"}`}
              >
                {jogo.probCasa}%
              </p>
              <p className="text-[10px] text-gray-500 mt-1">não sofre gol</p>
              <p className="text-[10px] text-gray-400">{jogo.naoSofreCasa}%</p>
            </div>
            <div
              className={`rounded-xl p-3 border-2 text-center ${jogo.favorito === "empate" ? "border-yellow-500 bg-yellow-950/30" : "border-gray-700 bg-gray-800/40"}`}
            >
              {jogo.favorito === "empate" && (
                <span className="block text-[9px] bg-yellow-500 text-black font-bold px-2 py-0.5 rounded-full mb-1 uppercase">
                  Favorito
                </span>
              )}
              <p className="text-[11px] font-bold uppercase mb-1 text-yellow-400">
                Empate
              </p>
              <p className="text-2xl font-black text-yellow-400">
                {jogo.probEmpate}%
              </p>
              <p className="text-[10px] text-gray-500 mt-1">
                com gols {jogo.empateComGols}% · sem {jogo.empateSemGols}%
              </p>
            </div>
            <div
              className={`rounded-xl p-3 border-2 text-center ${jogo.favorito === "fora" ? "border-green-500 bg-green-950/30" : "border-gray-700 bg-gray-800/40"}`}
            >
              {jogo.favorito === "fora" && (
                <span className="block text-[9px] bg-green-500 text-white font-bold px-2 py-0.5 rounded-full mb-1 uppercase">
                  Favorita
                </span>
              )}
              <p
                className={`text-[11px] font-bold uppercase mb-1 ${jogo.favorito === "fora" ? "text-green-400" : "text-gray-300"}`}
              >
                {jogo.fora}
              </p>
              <p
                className={`text-2xl font-black ${jogo.favorito === "fora" ? "text-green-400" : "text-white"}`}
              >
                {jogo.probFora}%
              </p>
              <p className="text-[10px] text-gray-500 mt-1">não sofre gol</p>
              <p className="text-[10px] text-gray-400">{jogo.naoSofreFora}%</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest text-center mb-3">
            Gols e placar do jogo
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-800/40 rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-500 uppercase mb-1">
                Placar mais provável
              </p>
              <p className="text-white font-black text-lg">
                {jogo.maisProvavel.placar}
              </p>
              <p className="text-gray-500 text-[10px]">
                {jogo.maisProvavel.prob}%
              </p>
            </div>
            <div className="bg-gray-800/40 rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-500 uppercase mb-1">
                Mais de 2.5 gols
              </p>
              <p className="text-white font-black text-lg">{jogo.mais25}%</p>
            </div>
            <div className="bg-gray-800/40 rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-500 uppercase mb-1">
                Ambas marcam
              </p>
              <p className="text-white font-black text-lg">
                {jogo.ambaMarcam}%
              </p>
            </div>
          </div>
        </div>

        {jogo.outrosProvaveis.length > 0 && (
          <div className="border border-gray-700 rounded-xl p-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest text-center mb-3">
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {jogos.map((jogo) => (
            <JogoCard
              key={jogo.id}
              jogo={jogo}
              isAdmin={isAdmin}
              onEdit={() => setEditando(jogo)}
            />
          ))}
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
