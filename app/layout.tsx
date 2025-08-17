import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "@/components/providers/ClientProviders";

export const metadata: Metadata = {
  title: "Alexandria",
  description: "Asistente legal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
