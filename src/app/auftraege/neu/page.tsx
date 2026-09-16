import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { NewOrderForm } from "@/components/NewOrderForm";

export const dynamic = "force-dynamic";

export default async function NeuerAuftragPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const { customerId } = await searchParams;

  const [customers, serviceTemplates] = await Promise.all([
    prisma.customer.findMany({
      include: { vehicles: true },
      orderBy: { name: "asc" },
    }),
    prisma.serviceTemplate.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Neuer Auftrag"
        description="Kunde, Fahrzeug und Leistungen auswählen – die Checkliste wird automatisch erstellt"
      />
      <div className="flex-1 px-6 py-6 sm:px-8">
        <NewOrderForm
          customers={customers}
          serviceTemplates={serviceTemplates}
          preselectedCustomerId={customerId}
        />
      </div>
    </>
  );
}
