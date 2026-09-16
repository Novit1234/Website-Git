import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { formatMinutes, formatMoney } from "@/lib/format";
import { SERVICE_CATEGORY_LABEL } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function LeistungenPage() {
  const services = await prisma.serviceTemplate.findMany({
    include: { _count: { select: { checklistItems: true } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <>
      <PageHeader
        title="Leistungen & Checklisten"
        description="Dein Servicekatalog mit festem Arbeitsablauf pro Leistung"
        actions={
          <Link
            href="/leistungen/neu"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Neue Leistung
          </Link>
        }
      />

      <div className="flex-1 px-6 py-6 sm:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/leistungen/${service.id}`}
              className={`rounded-xl border bg-white p-5 transition-shadow hover:shadow-md ${
                service.active ? "border-gray-200" : "border-gray-200 opacity-60"
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-900">{service.name}</h3>
                {!service.active && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                    inaktiv
                  </span>
                )}
              </div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-blue-600">
                {SERVICE_CATEGORY_LABEL[service.category]}
              </p>
              {service.description && (
                <p className="mb-3 line-clamp-2 text-sm text-gray-500">{service.description}</p>
              )}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{formatMoney(service.basePrice)}</span>
                <span>{formatMinutes(service.estimatedMinutes)}</span>
                <span>{service._count.checklistItems} Checklistenpunkte</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
