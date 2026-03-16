import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TJHUB — Nyheder & Priser",
  description: "Cyber Security og AI nyheder samt prissammenligning",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da">
      <body style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
