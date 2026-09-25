import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "suchdirhilfe.de – Domain kaufen",
  description: "suchdirhilfe.de steht zum Verkauf. Sende deinen Preisvorschlag direkt an info@fynnpetersen.de.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="de"><body>{children}</body></html>;
}
