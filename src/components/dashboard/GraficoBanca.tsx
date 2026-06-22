"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

interface Ponto {
  label: string;
  banca: number;
}
interface Props {
  dados: Ponto[];
  bancaInicial: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#111",
        border: "1px solid #1f2937",
        borderRadius: 10,
        padding: "10px 14px",
      }}
    >
      <p style={{ color: "#6b7280", fontSize: 11, marginBottom: 4 }}>
        Aposta #{label}
      </p>
      <p style={{ color: "#16a34a", fontWeight: 700, fontSize: 16 }}>
        R$ {payload[0].value.toFixed(2)}
      </p>
    </div>
  );
};

export default function GraficoBanca({ dados, bancaInicial }: Props) {
  if (dados.length < 2)
    return (
      <div
        style={{
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p className="text-gray-500 text-sm">
          Registre mais apostas para ver o gráfico
        </p>
      </div>
    );

  const min = Math.min(...dados.map((d) => d.banca), bancaInicial) * 0.97;
  const max = Math.max(...dados.map((d) => d.banca), bancaInicial) * 1.03;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={dados} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#1f2937"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          stroke="#374151"
          tick={{ fill: "#6b7280", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#374151"
          tick={{ fill: "#6b7280", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          domain={[min, max]}
          tickFormatter={(v) => `R$${v.toFixed(0)}`}
          width={60}
        />
        <ReferenceLine
          y={bancaInicial}
          stroke="#374151"
          strokeDasharray="4 4"
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="banca"
          stroke="#16a34a"
          strokeWidth={2.5}
          dot={{ fill: "#16a34a", r: 3, strokeWidth: 0 }}
          activeDot={{ fill: "#4ade80", r: 5, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
