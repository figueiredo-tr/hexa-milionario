"use client";

export default function HeroBanner() {
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden mb-2"
      style={{ minHeight: 200 }}
    >
      {/* Fundo gradiente */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-950 via-gray-900 to-yellow-950" />

      {/* Padrão de hexágonos decorativo */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L55 20 L55 50 L30 65 L5 50 L5 20 Z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Brilho lateral */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-yellow-500/10 to-transparent" />

      {/* Conteúdo */}
      <div className="relative z-10 flex items-center justify-between px-8 py-8 gap-6">
        {/* Texto esquerda */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold tracking-widest text-yellow-400 uppercase">
              🏆 FIFA World Cup
            </span>
            <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-0.5 rounded-full border border-yellow-700">
              2026
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
            Rumo ao <span className="text-yellow-400">Hexa</span> 🇧🇷
          </h2>
          <p className="text-gray-400 text-sm mt-2 max-w-md">
            Acompanhe seus palpites, gerencie sua banca e compete com amigos
            durante a maior Copa do Mundo da história — 48 seleções, 3 países, 1
            campeão.
          </p>
          <div className="flex gap-3 mt-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-gray-300 bg-gray-800/60 px-3 py-1.5 rounded-full border border-gray-700">
              🇺🇸 EUA · 🇲🇽 México · 🇨🇦 Canadá
            </span>
            <span className="flex items-center gap-1.5 text-xs text-green-300 bg-green-900/30 px-3 py-1.5 rounded-full border border-green-800">
              ⚽ 48 seleções · 104 jogos
            </span>
          </div>
        </div>

        {/* Arte direita */}
        <div className="hidden md:flex items-center justify-center gap-4 shrink-0">
          {/* Troféu SVG */}
          <svg
            width="90"
            height="120"
            viewBox="0 0 90 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="25"
              y="100"
              width="40"
              height="8"
              rx="3"
              fill="#ca8a04"
              opacity="0.9"
            />
            <rect
              x="30"
              y="92"
              width="30"
              height="10"
              rx="2"
              fill="#ca8a04"
              opacity="0.8"
            />
            <rect x="38" y="75" width="14" height="20" rx="2" fill="#eab308" />
            <path
              d="M15 15 Q15 70 45 70 Q75 70 75 15 Z"
              fill="url(#trofeuGrad)"
              opacity="0.95"
            />
            <path
              d="M15 20 Q5 20 5 35 Q5 50 15 50"
              stroke="#ca8a04"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M75 20 Q85 20 85 35 Q85 50 75 50"
              stroke="#ca8a04"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
            <text
              x="45"
              y="48"
              textAnchor="middle"
              fontSize="22"
              fill="white"
              opacity="0.9"
            >
              ★
            </text>
            <ellipse
              cx="32"
              cy="28"
              rx="5"
              ry="8"
              fill="white"
              opacity="0.15"
              transform="rotate(-20 32 28)"
            />
            <defs>
              <linearGradient id="trofeuGrad" x1="15" y1="15" x2="75" y2="70">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#ca8a04" />
                <stop offset="100%" stopColor="#92400e" />
              </linearGradient>
            </defs>
          </svg>

          {/* Jogadores */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 bg-gray-800/50 rounded-xl px-3 py-2 border border-gray-700">
              <div className="w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-600 flex items-center justify-center text-sm">
                ⭐
              </div>
              <div>
                <p className="text-white text-xs font-bold">Vinicius Jr.</p>
                <p className="text-gray-400 text-[10px]">🇧🇷 Brasil</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/50 rounded-xl px-3 py-2 border border-gray-700">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-600 flex items-center justify-center text-sm">
                ⭐
              </div>
              <div>
                <p className="text-white text-xs font-bold">Mbappé</p>
                <p className="text-gray-400 text-[10px]">🇫🇷 França</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/50 rounded-xl px-3 py-2 border border-gray-700">
              <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-600 flex items-center justify-center text-sm">
                ⭐
              </div>
              <div>
                <p className="text-white text-xs font-bold">Yamal</p>
                <p className="text-gray-400 text-[10px]">🇪🇸 Espanha</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Linha de brilho no topo */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent" />
    </div>
  );
}
