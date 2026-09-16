# DetailFlow – Auftragsverwaltung für Fahrzeugaufbereitung

Eine schlanke Web-App, um als Auto-Detailer den kompletten Betrieb zu organisieren:
Aufträge, Checklisten mit festem Arbeitsablauf, Kunden & Fahrzeuge, Termine und
Rechnungen – an einem Ort.

## Funktionen

- **Dashboard** – heutige Termine, Wochenumsatz, Aufträge in Arbeit/fertig zur
  Abholung, überfällige Aufträge auf einen Blick.
- **Aufträge als Kanban-Board** – Status per Dropdown ändern (Anfrage → Geplant →
  In Arbeit → Qualitätskontrolle → Fertig → Abgeholt), inkl. Stornierung.
- **Checklisten pro Leistung** – jede gebuchte Leistung bringt automatisch ihre
  hinterlegte Schritt-für-Schritt-Checkliste mit in den Auftrag, damit jeder
  Auftrag nach demselben Ablauf abgearbeitet wird. Einzelne Schritte lassen sich
  abhaken und mit Notizen versehen (z. B. "Fleck braucht 2. Durchgang").
- **Leistungs- & Checklisten-Verwaltung** – eigener Servicekatalog mit Preis,
  Dauer und editierbaren Arbeitsschritten (hinzufügen, umsortieren, löschen,
  de-/aktivieren). Vorbelegt mit 9 typischen Detailing-Leistungen (Außen- &
  Innenreinigung, Politur, Keramikversiegelung, Lederpflege, Motorwäsche,
  Scheibenversiegelung, Geruchsentfernung, Komplettpaket).
- **Kunden & Fahrzeuge** – Kontaktdaten, mehrere Fahrzeuge pro Kunde,
  vollständige Auftragshistorie.
- **Kalender** – Wochenansicht aller geplanten Termine.
- **Vorher-/Nachher-Fotos** – direkt am Auftrag hochladen und dokumentieren.
- **Rechnung** – druckfertige, minimalistische Rechnungsansicht pro Auftrag
  (inkl. Rabatt), per Browser als PDF speicherbar.

## Tech-Stack

- [Next.js](https://nextjs.org) (App Router, Server Actions) + TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4
- [Prisma](https://www.prisma.io) + SQLite (lokale Datei, kein externer Server nötig)

## Setup

```bash
npm install
cp .env.example .env
npm run db:migrate   # legt die SQLite-Datenbank inkl. Schema an
npm run db:seed       # befüllt den Leistungskatalog mit Standard-Checklisten
npm run dev
```

Die App läuft danach unter `http://localhost:3000`.

## Nützliche Skripte

| Befehl              | Zweck                                              |
| ------------------- | --------------------------------------------------- |
| `npm run dev`        | Entwicklungsserver starten                          |
| `npm run build`      | Produktions-Build                                   |
| `npm run start`      | Produktions-Build ausliefern                        |
| `npm run lint`       | ESLint                                              |
| `npm run db:migrate` | Prisma-Migration anwenden/erstellen                 |
| `npm run db:seed`    | Leistungskatalog & Checklisten neu einspielen        |
| `npm run db:studio`  | Prisma Studio (Datenbank-GUI) öffnen                |

## Datenmodell (Kurzüberblick)

`Customer` → `Vehicle` → `Order` → `OrderService` (Preis-Snapshot der Leistung) →
`ChecklistItem` (Kopie der `ChecklistTemplateItem`s zum Zeitpunkt der
Auftragserstellung, damit spätere Änderungen am Katalog bestehende Aufträge
nicht verändern). `Photo` hängt direkt am `Order`.
