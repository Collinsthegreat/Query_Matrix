import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QueryMatrix — Visual Query Engineering Platform",
  description: "A recursive visual query builder with generators, simulation, graph mode, and time travel."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
