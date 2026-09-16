import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function KundenPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const customers = await prisma.customer.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query } },
            { phone: { contains: query } },
            { email: { contains: query } },
          ],
        }
      : undefined,
    include: { vehicles: true, _count: { select: { orders: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <PageHeader
        title="Kunden"
        description={`${customers.length} Kunde${customers.length === 1 ? "" : "n"}`}
        actions={
          <Link
            href="/kunden/neu"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Neuer Kunde
          </Link>
        }
      />

      <div className="flex-1 px-6 py-6 sm:px-8">
        <form className="mb-4">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Suche nach Name, Telefon oder E-Mail…"
            className="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none sm:w-80"
          />
        </form>

        {customers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-10 text-center text-sm text-gray-500">
            Keine Kunden gefunden.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Kontakt</th>
                  <th className="px-4 py-2 font-medium">Fahrzeuge</th>
                  <th className="px-4 py-2 font-medium text-right">Aufträge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/kunden/${customer.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {customer.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {[customer.phone, customer.email].filter(Boolean).join(" · ") || "–"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {customer.vehicles.length === 0
                        ? "–"
                        : customer.vehicles
                            .map((v) => `${v.make} ${v.model}`)
                            .join(", ")}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {customer._count.orders}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
