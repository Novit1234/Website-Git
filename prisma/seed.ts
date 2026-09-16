import { PrismaClient, ServiceCategory } from "@prisma/client";

const prisma = new PrismaClient();

type ServiceSeed = {
  name: string;
  description: string;
  category: ServiceCategory;
  basePrice: number;
  estimatedMinutes: number;
  sortOrder: number;
  checklist: string[];
};

const services: ServiceSeed[] = [
  {
    name: "Außenreinigung",
    description: "Handwäsche mit Zweieimer-Methode inkl. Felgen und Trocknung.",
    category: "AUSSEN",
    basePrice: 39,
    estimatedMinutes: 60,
    sortOrder: 10,
    checklist: [
      "Vorwäsche mit Snow Foam ansetzen und einwirken lassen",
      "Felgen & Radläufe reinigen",
      "Türfalzen, Tankdeckel und Kofferraumfalz reinigen",
      "Kontaktwäsche im Zweieimer-System",
      "Insekten- und Teerreste gezielt entfernen",
      "Fahrzeug trockenziehen (Mikrofasertuch / Luftbläser)",
      "Reifen und Außenkunststoffe eindressen",
      "Sichtkontrolle bei Tageslicht auf Wasserflecken und Schlieren",
    ],
  },
  {
    name: "Innenreinigung",
    description: "Gründliche Innenraumreinigung inkl. Polster, Kunststoffe und Kofferraum.",
    category: "INNEN",
    basePrice: 49,
    estimatedMinutes: 75,
    sortOrder: 20,
    checklist: [
      "Fußmatten entnehmen, absaugen und reinigen",
      "Sitze und Teppiche gründlich absaugen",
      "Polster- bzw. Ledersitze reinigen",
      "Armaturenbrett, Mittelkonsole und Schalter reinigen",
      "Türverkleidungen reinigen und pflegen",
      "Fenster und Spiegel von innen putzen",
      "Lüftungsdüsen und Fugen mit Detailbürste reinigen",
      "Kofferraum aussaugen und abwischen",
      "Endkontrolle auf Gerüche und Flecken",
    ],
  },
  {
    name: "Lederpflege",
    description: "Reinigung, Pflege und Imprägnierung von Ledersitzen.",
    category: "INNEN",
    basePrice: 59,
    estimatedMinutes: 60,
    sortOrder: 30,
    checklist: [
      "Leder absaugen und groben Schmutz entfernen",
      "Lederreiniger auftragen und einarbeiten",
      "Reinigungsrückstände vollständig entfernen",
      "Leder-Pflegecreme bzw. Imprägnierung auftragen",
      "Nähte, Wangen und Ecken auf Rückstände kontrollieren",
    ],
  },
  {
    name: "Politur (Lackaufbereitung)",
    description: "Ein- oder mehrstufige Politur zur Entfernung von Kratzern und Hologrammen.",
    category: "POLITUR",
    basePrice: 249,
    estimatedMinutes: 300,
    sortOrder: 40,
    checklist: [
      "Fahrzeug vollständig waschen und dekontaminieren (Fe-Entferner)",
      "Lack mit Tonknete (Clay Bar) dekontaminieren",
      "Lackschichtdicke messen und dokumentieren",
      "Testfläche polieren und Ergebnis prüfen",
      "Grobschnitt (Compound) auf Problemzonen anwenden",
      "Feinpolitur (Finish) auf der gesamten Karosserie",
      "Lack mit IPA reinigen, um Polierrückstände zu entfernen",
      "Kunststoff- und Gummiteile vor der Politur abkleben",
      "Endkontrolle bei Tageslicht bzw. unter LED-Lampe",
    ],
  },
  {
    name: "Keramikversiegelung",
    description: "Langzeitschutz durch Nano-/Keramikversiegelung inkl. Vorbereitung.",
    category: "VERSIEGELUNG",
    basePrice: 399,
    estimatedMinutes: 360,
    sortOrder: 50,
    checklist: [
      "Fahrzeug chemisch und mechanisch dekontaminieren (Clay Bar)",
      "Lack polieren bzw. Vorbereitung der Oberfläche",
      "IPA-Wipedown zum vollständigen Entfetten",
      "Umgebungsbedingungen prüfen (Temperatur, Luftfeuchtigkeit, Staub)",
      "Keramikversiegelung Panel für Panel auftragen",
      "Vorgegebene Aushärtezeit je Panel einhalten",
      "Überschüsse kontrollieren und entfernen",
      "Curing-Hinweise dokumentieren (Fahrverbot / erste Wäsche)",
      "Kunde über Pflegehinweise und Nachsorge informieren",
    ],
  },
  {
    name: "Scheibenversiegelung",
    description: "Versiegelung der Frontscheibe und Seitenscheiben für besseren Regenablauf.",
    category: "VERSIEGELUNG",
    basePrice: 49,
    estimatedMinutes: 45,
    sortOrder: 60,
    checklist: [
      "Scheiben polieren und Altrückstände entfernen",
      "Glas vollständig entfetten",
      "Versiegelung gleichmäßig auftragen",
      "Aushärten lassen und Überschüsse abpolieren",
    ],
  },
  {
    name: "Motorwäsche",
    description: "Schonende Reinigung des Motorraums inkl. Kunststoffpflege.",
    category: "SONDERLEISTUNG",
    basePrice: 39,
    estimatedMinutes: 45,
    sortOrder: 70,
    checklist: [
      "Motor abkühlen lassen",
      "Empfindliche Elektronik und Ansaugöffnungen abdecken",
      "Entfetter auftragen und einwirken lassen",
      "Vorsichtig mit Dampf bzw. wenig Wasser abspülen",
      "Motorraum trockenblasen",
      "Kunststoffteile pflegen und Sichtkontrolle auf Undichtigkeiten",
    ],
  },
  {
    name: "Geruchsentfernung (Ozon)",
    description: "Neutralisation hartnäckiger Gerüche per Ozonbehandlung.",
    category: "SONDERLEISTUNG",
    basePrice: 69,
    estimatedMinutes: 90,
    sortOrder: 80,
    checklist: [
      "Fahrzeug reinigen und Feuchtigkeitsquellen beseitigen",
      "Ozongenerator im Innenraum platzieren",
      "Behandlungszeit bei verschlossenem Fahrzeug einhalten",
      "Fahrzeug nach Behandlung ausreichend belüften",
      "Geruchskontrolle und ggf. Behandlung wiederholen",
    ],
  },
  {
    name: "Komplettpaket Innen & Außen",
    description: "Kompakte Rundum-Pflege für Kunden ohne Detailwünsche.",
    category: "KOMPLETT",
    basePrice: 99,
    estimatedMinutes: 150,
    sortOrder: 5,
    checklist: [
      "Vorwäsche und Kontaktwäsche außen",
      "Felgen reinigen und Reifen pflegen",
      "Fahrzeug trockenziehen",
      "Innenraum komplett aussaugen",
      "Armaturenbrett und Mittelkonsole abwischen",
      "Fenster innen und außen putzen",
      "Abschließende Rundum-Kontrolle",
    ],
  },
];

async function main() {
  console.log("Seeding Leistungen & Checklisten...");

  for (const service of services) {
    const existing = await prisma.serviceTemplate.findFirst({
      where: { name: service.name },
    });
    if (existing) {
      console.log(`- übersprungen (existiert bereits): ${service.name}`);
      continue;
    }

    await prisma.serviceTemplate.create({
      data: {
        name: service.name,
        description: service.description,
        category: service.category,
        basePrice: service.basePrice,
        estimatedMinutes: service.estimatedMinutes,
        sortOrder: service.sortOrder,
        checklistItems: {
          create: service.checklist.map((label, index) => ({
            label,
            sortOrder: index,
          })),
        },
      },
    });
    console.log(`- angelegt: ${service.name} (${service.checklist.length} Checklistenpunkte)`);
  }

  console.log("Seed abgeschlossen.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
