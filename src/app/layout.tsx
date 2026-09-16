import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "DetailFlow – Auftragsverwaltung für Fahrzeugaufbereitung",
  description:
    "Verwalte Aufträge, Checklisten, Kunden und Termine für dein Detailing-Geschäft.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className="flex h-full min-h-screen">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
