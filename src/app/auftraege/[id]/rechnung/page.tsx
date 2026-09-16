import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PrintButton } from "@/components/PrintButton";
import { formatDate, formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function RechnungPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      vehicle: true,
      services: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!order) notFound();

  const subtotal = order.services.reduce((sum, s) => sum + s.price, 0);
  const discountAmount = subtotal * (order.discountPct / 100);
  const total = subtotal - discountAmount;
  const invoiceNumber = `${order.createdAt.getFullYear()}-${order.id.slice(0, 6).toUpperCase()}`;

  return (
    <div className="flex-1 bg-gray-50 px-6 py-8 sm:px-8 print:bg-white print:px-0 print:py-0">
      <div className="no-print mb-4 flex items-center justify-between">
        <Link href={`/auftraege/${order.id}`} className="text-sm text-blue-600 hover:underline">
          ← Zurück zum Auftrag
        </Link>
        <PrintButton />
      </div>

      <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-8 print:border-0 print:p-0 print:shadow-none">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Rechnung</h1>
            <p className="text-sm text-gray-500">Nr. {invoiceNumber}</p>
            <p className="text-sm text-gray-500">Datum: {formatDate(new Date())}</p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-gray-400">Kunde</p>
            <p className="font-medium text-gray-900">{order.customer.name}</p>
            {order.customer.phone && <p className="text-gray-600">{order.customer.phone}</p>}
            {order.customer.email && <p className="text-gray-600">{order.customer.email}</p>}
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-gray-400">Fahrzeug</p>
            <p className="font-medium text-gray-900">
              {order.vehicle.make} {order.vehicle.model}
            </p>
            {order.vehicle.licensePlate && (
              <p className="text-gray-600">Kennzeichen: {order.vehicle.licensePlate}</p>
            )}
          </div>
        </div>

        <table className="mb-6 w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-400">
              <th className="pb-2 font-medium">Leistung</th>
              <th className="pb-2 text-right font-medium">Preis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.services.map((service) => (
              <tr key={service.id}>
                <td className="py-2 text-gray-800">{service.nameSnapshot}</td>
                <td className="py-2 text-right text-gray-800">{formatMoney(service.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto max-w-xs space-y-1 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Zwischensumme</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          {order.discountPct > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Rabatt ({order.discountPct}%)</span>
              <span>-{formatMoney(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-semibold text-gray-900">
            <span>Gesamtbetrag</span>
            <span>{formatMoney(total)}</span>
          </div>
        </div>

        <p className="mt-10 text-xs text-gray-400">
          Vielen Dank für Ihren Auftrag. Zahlung bar oder per Überweisung nach Erhalt der Rechnung.
        </p>
      </div>
    </div>
  );
}
