import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clini+",
  description: "Gestão moderna para profissionais da saúde",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}