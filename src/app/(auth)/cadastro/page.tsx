"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const SELECOES = [
  { codigo: "br" },
  { codigo: "ar" },
  { codigo: "fr" },
  { codigo: "de" },
  { codigo: "es" },
  { codigo: "pt" },
  { codigo: "gb-eng" },
  { codigo: "nl" },
  { codigo: "be" },
  { codigo: "hr" },
  { codigo: "it" },
  { codigo: "us" },
  { codigo: "mx" },
  { codigo: "ca" },
  { codigo: "jp" },
  { codigo: "ma" },
  { codigo: "sn" },
  { codigo: "ng" },
  { codigo: "au" },
  { codigo: "no" },
  { codigo: "dk" },
  { codigo: "pl" },
  { codigo: "ch" },
  { codigo: "uy" },
];

const POS_ESQUERDA = [
  { top: "6%", left: "14%" },
  { top: "20%", left: "10%" },
  { top: "34%", left: "14%" },
  { top: "48%", left: "10%" },
  { top: "62%", left: "14%" },
  { top: "76%", left: "10%" },
  { top: "90%", left: "14%" },
  { top: "13%", left: "20%" },
  { top: "27%", left: "20%" },
  { top: "41%", left: "20%" },
  { top: "55%", left: "20%" },
  { top: "69%", left: "20%" },
];

const POS_DIREITA = [
  { top: "6%", right: "14%" },
  { top: "20%", right: "10%" },
  { top: "34%", right: "14%" },
  { top: "48%", right: "10%" },
  { top: "62%", right: "14%" },
  { top: "76%", right: "10%" },
  { top: "90%", right: "14%" },
  { top: "13%", right: "20%" },
  { top: "27%", right: "20%" },
  { top: "41%", right: "20%" },
  { top: "55%", right: "20%" },
  { top: "69%", right: "20%" },
];

function HexBandeira({
  codigo,
  style,
}: {
  codigo: string;
  style: React.CSSProperties;
}) {
  return (
    <div style={{ position: "absolute", ...style, opacity: 0.5 }}>
      <div
        style={{
          position: "relative",
          width: 52,
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          viewBox="0 0 50 50"
          style={{ position: "absolute", width: 52, height: 52 }}
        >
          <polygon
            points="25,2 47,14 47,36 25,48 3,36 3,14"
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1.5"
          />
        </svg>
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: 32,
            height: 32,
            overflow: "hidden",
            clipPath:
              "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
          }}
        >
          <img
            src={`https://flagcdn.com/w40/${codigo}.png`}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>
    </div>
  );
}

export default function CadastroPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [username, setUsername] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (username.trim().length < 3) {
      setErro("O nome de usuário deve ter pelo menos 3 caracteres.");
      return;
    }
    setLoading(true);

    const { data: usernameExiste } = await supabase
      .from("users_profile")
      .select("id")
      .eq("username", username.trim())
      .single();
    if (usernameExiste) {
      setErro("Este nome de usuário já está em uso. Escolha outro.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
    });
    if (error) {
      if (
        error.message.toLowerCase().includes("already registered") ||
        error.message.toLowerCase().includes("user already exists") ||
        error.status === 422
      ) {
        setErro(
          "Este e-mail já está cadastrado. Tente fazer login ou recuperar sua senha.",
        );
      } else {
        setErro("Erro ao criar conta. Tente novamente.");
      }
      setLoading(false);
      return;
    }
    if (data.user && data.user.identities?.length === 0) {
      setErro(
        "Este e-mail já está cadastrado. Tente fazer login ou recuperar sua senha.",
      );
      setLoading(false);
      return;
    }
    if (data.user) {
      await supabase.from("users_profile").insert({
        user_id: data.user.id,
        username: username.trim(),
        banca_inicial: 0,
        banca_atual: 0,
      });
      router.push("/dashboard");
    }
    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050a05",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "2rem 1rem",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(22,163,74,0.13) 0%, rgba(5,10,5,0) 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          opacity: 0.06,
          pointerEvents: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L55 20 L55 50 L30 65 L5 50 L5 20 Z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background:
            "linear-gradient(to right, transparent, rgba(234,179,8,0.6), transparent)",
          pointerEvents: "none",
        }}
      />

      {POS_ESQUERDA.map((pos, i) => (
        <HexBandeira
          key={`e${i}`}
          codigo={SELECOES[i % SELECOES.length].codigo}
          style={pos as any}
        />
      ))}
      {POS_DIREITA.map((pos, i) => (
        <HexBandeira
          key={`d${i}`}
          codigo={SELECOES[(i + 12) % SELECOES.length].codigo}
          style={pos as any}
        />
      ))}

      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 420,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                position: "relative",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                viewBox="0 0 50 50"
                style={{
                  position: "absolute",
                  width: 40,
                  height: 40,
                  filter: "drop-shadow(0 0 8px rgba(34,197,94,0.7))",
                }}
              >
                <polygon
                  points="25,2 47,14 47,36 25,48 3,36 3,14"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                />
                <polygon
                  points="25,8 39,16 39,34 25,42 11,34 11,16"
                  fill="rgba(34,197,94,0.15)"
                  stroke="#16a34a"
                  strokeWidth="1"
                />
              </svg>
              <span style={{ position: "relative", zIndex: 1, fontSize: 18 }}>
                ⚽
              </span>
            </div>
            <span
              style={{
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: "-0.5px",
                color: "#fff",
              }}
            >
              Hexa<span style={{ color: "#4ade80" }}>Milionário</span>
            </span>
          </div>
          <p
            style={{
              fontSize: 10,
              color: "#4b5563",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Copa do Mundo 2026
          </p>
        </div>

        {/* Badge + Título */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "1.25rem",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#eab308",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              🏆 FIFA World Cup
            </span>
            <span
              style={{
                background: "rgba(234,179,8,0.15)",
                color: "#fde047",
                fontSize: 11,
                padding: "2px 10px",
                borderRadius: 20,
                border: "1px solid rgba(234,179,8,0.4)",
                fontWeight: 600,
              }}
            >
              2026
            </span>
          </div>
          <h1
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: "#fff",
              margin: "0 0 8px",
              lineHeight: 1.1,
              textAlign: "center",
            }}
          >
            Rumo ao <span style={{ color: "#eab308" }}>Hexa</span>
          </h1>
          <p
            style={{
              color: "#6b7280",
              fontSize: 13,
              margin: 0,
              lineHeight: 1.6,
              textAlign: "center",
            }}
          >
            Crie sua conta grátis e comece a competir no ranking dos apostadores
            mais precisos do Brasil.
          </p>
        </div>

        {/* Card formulário */}
        <div
          style={{
            width: "100%",
            background: "rgba(17,24,17,0.90)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: "1.75rem 2rem",
            backdropFilter: "blur(16px)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
          }}
        >
          {/* Título centralizado */}
          <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
            <h2
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 22,
                margin: "0 0 4px",
              }}
            >
              Criar conta
            </h2>
            <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>
              Grátis e sem cartão de crédito.
            </p>
          </div>

          <form
            onSubmit={handleCadastro}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <Label
                htmlFor="username"
                style={{ color: "#9ca3af", fontSize: 13 }}
              >
                Nome de usuário
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-gray-900 border-gray-700 mt-1.5 focus:border-green-600 h-11"
                placeholder="SeuNome"
                required
              />
            </div>
            <div>
              <Label htmlFor="email" style={{ color: "#9ca3af", fontSize: 13 }}>
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-900 border-gray-700 mt-1.5 focus:border-green-600 h-11"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="senha" style={{ color: "#9ca3af", fontSize: 13 }}>
                Senha
              </Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="bg-gray-900 border-gray-700 mt-1.5 focus:border-green-600 h-11"
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>
            <div>
              <Label
                htmlFor="confirmarSenha"
                style={{ color: "#9ca3af", fontSize: 13 }}
              >
                Confirmar senha
              </Label>
              <Input
                id="confirmarSenha"
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="bg-gray-900 border-gray-700 mt-1.5 focus:border-green-600 h-11"
                placeholder="••••••••"
                required
              />
            </div>

            {erro && (
              <div
                style={{
                  background: "rgba(127,29,29,0.4)",
                  border: "1px solid rgba(239,68,68,0.4)",
                  borderRadius: 8,
                  padding: "8px 12px",
                }}
              >
                <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>
                  {erro}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 h-11 text-base font-semibold"
              style={{ marginTop: 4 }}
            >
              {loading ? "Criando conta..." : "Criar conta grátis 🚀"}
            </Button>
          </form>

          <div
            style={{
              marginTop: "1.25rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              textAlign: "center",
            }}
          >
            <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>
              Já tem conta?{" "}
              <Link
                href="/login"
                style={{
                  color: "#eab308",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
                className="hover:underline"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: "1.75rem",
            justifyContent: "center",
          }}
        >
          {[
            { icon: "⚽", val: "48 jogos", sub: "Copa 2026" },
            { icon: "🎯", val: "3 dicas/dia", sub: "Análise IA" },
            { icon: "🏅", val: "Ranking", sub: "Ao vivo" },
          ].map((s) => (
            <div key={s.val} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20 }}>{s.icon}</div>
              <div style={{ color: "#eab308", fontWeight: 700, fontSize: 13 }}>
                {s.val}
              </div>
              <div
                style={{
                  color: "#4b5563",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
