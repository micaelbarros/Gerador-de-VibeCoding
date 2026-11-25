import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeSpark — Gerador de Ideias para VibeCoding",
  description:
    "Sorteie ideias atuais e rentáveis para hackathons, micro-SaaS, estudos e desafios a partir de tendências reais coletadas em tempo real.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0a0c10] text-zinc-100 antialiased selection:bg-amber-400/30 selection:text-amber-100">
        {children}
      </body>
    </html>
  );
}
