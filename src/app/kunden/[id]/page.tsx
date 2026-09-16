import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Field, SelectField, TextAreaField } from "@/components/form";
import { formatDate, formatMoney } from "@/lib/format";
import { VEHICLE_TYPE_LABEL } from "@/lib/labels";
import { addVehicle, updateCustomer } from "@/app/actions/customers";

const vehicleTypeOptions = Object.entries(VEHICLE_TYPE_LABEL).map(([value, label]) => ({
  value,
  label,
}));

export default async function KundeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      vehicles: { orderBy: { createdAt: "asc" } },
      orders: {
        include: { vehicle: true, services: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!customer) notFound();

  const updateCustomerWithId = updateCustomer.bind(null, customer.id);
  const addVehicleWithId = addVehicle.bind(null, customer.id);

  return (
    <>
      <PageHeader
        title={customer.name}
        description={`Kunde seit ${formatDate(customer.createdAt)}`}
        actions={
          <Link
            href={`/auftraege/neu?customerId=${customer.id}`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Auftrag für diesen Kunden
          </Link>
        }
      />

      <div className="flex-1 space-y-8 px-6 py-6 sm:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-1">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">Kontaktdaten</h2>
            <form action={updateCustomerWithId} className="space-y-3">
              <Field label="Name" name="name" defaultValue={customer.name} required />
              <Field label="Telefon" name="phone" type="tel" defaultValue={customer.phone ?? ""} />
              <Field label="E-Mail" name="email" type="email" defaultValue={customer.email ?? ""} />
              <TextAreaField label="Notizen" name="notes" defaultValue={customer.notes ?? ""} />
              <button
                type="submit"
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
              >
                Speichern
              </button>
            </form>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Fahrzeuge</h2>
            </div>
            {customer.vehicles.length === 0 ? (
              <p className="text-sm text-gray-500">Noch keine Fahrzeuge hinterlegt.</p>
            ) : (
              <ul className="mb-4 divide-y divide-gray-100">
                {customer.vehicles.map((vehicle) => (
                  <li key={vehicle.id} className="flex items-center justify-between py-2 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">
                        {vehicle.make} {vehicle.model}
                      </p>
                      <p className="text-xs text-gray-500">
                        {VEHICLE_TYPE_LABEL[vehicle.vehicleType]}
                        {vehicle.licensePlate ? ` · ${vehicle.licensePlate}` : ""}
                        {vehicle.color ? ` · ${vehicle.color}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <details className="rounded-lg border border-dashed border-gray-300 p-3">
              <summary className="cursor-pointer text-sm font-medium text-blue-600">
                + Fahrzeug hinzufügen
              </summary>
              <form action={addVehicleWithId} className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Marke" name="make" required />
                  <Field label="Modell" name="model" required />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Kennzeichen" name="licensePlate" />
                  <Field label="Farbe" name="color" />
                  <SelectField label="Typ" name="vehicleType" defaultValue="PKW" options={vehicleTypeOptions} />
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Fahrzeug speichern
                </button>
              </form>
            </details>
          </section>
        </div>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Auftragshistorie
          </h2>
          {customer.orders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-gray-500">
              Noch keine Aufträge für diesen Kunden.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-2 font-medium">Datum</th>
                    <th className="px-4 py-2 font-medium">Fahrzeug</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium text-right">Preis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customer.orders.map((order) => {
                    const total =
                      order.services.reduce((s, svc) => s + svc.price, 0) *
                      (1 - order.discountPct / 100);
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Link
                            href={`/auftraege/${order.id}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {formatDate(order.createdAt)}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {order.vehicle.make} {order.vehicle.model}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">{formatMoney(total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
