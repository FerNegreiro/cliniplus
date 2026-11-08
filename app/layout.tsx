import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clini+",
  description: "Gestão para clínicas odontológicas e HOF",
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