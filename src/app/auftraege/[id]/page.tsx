import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { ChecklistItemRow } from "@/components/ChecklistItemRow";
import { PhotoUploader } from "@/components/PhotoUploader";
import { OrderStatusSelect } from "@/components/OrderStatusSelect";
import { formatMoney, toDateTimeLocalValue } from "@/lib/format";
import { VEHICLE_TYPE_LABEL } from "@/lib/labels";
import {
  updateOrderNotes,
  updateOrderSchedule,
  addOrderService,
  removeOrderService,
} from "@/app/actions/orders";

export const dynamic = "force-dynamic";

export default async function AuftragDetailPage({
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
      photos: { orderBy: { createdAt: "asc" } },
      services: {
        orderBy: { sortOrder: "asc" },
        include: { checklistItems: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });

  if (!order) notFound();

  const availableServices = await prisma.serviceTemplate.findMany({
    where: {
      active: true,
      id: { notIn: order.services.map((s) => s.serviceTemplateId) },
    },
    orderBy: { name: "asc" },
  });

  const subtotal = order.services.reduce((sum, s) => sum + s.price, 0);
  const total = subtotal * (1 - order.discountPct / 100);
  const totalChecklistItems = order.services.reduce((s, svc) => s + svc.checklistItems.length, 0);
  const checkedChecklistItems = order.services.reduce(
    (s, svc) => s + svc.checklistItems.filter((i) => i.checked).length,
    0,
  );

  const updateNotesWithId = updateOrderNotes.bind(null, order.id);
  const updateScheduleWithId = updateOrderSchedule.bind(null, order.id);
  const addServiceWithId = addOrderService.bind(null, order.id);

  return (
    <>
      <PageHeader
        title={`${order.customer.name} · ${order.vehicle.make} ${order.vehicle.model}`}
        description={`Auftrag angelegt am ${new Date(order.createdAt).toLocaleDateString("de-DE")}`}
        actions={
          <>
            <Link
              href={`/auftraege/${order.id}/rechnung`}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Rechnung
            </Link>
            <OrderStatusSelect orderId={order.id} status={order.status} />
          </>
        }
      />

      <div className="flex-1 space-y-6 px-6 py-6 sm:px-8">
        <div className="flex flex-wrap items-center gap-4">
          <StatusBadge status={order.status} />
          <span className="text-sm text-gray-500">
            Checkliste: {checkedChecklistItems}/{totalChecklistItems} erledigt
          </span>
          <Link href={`/kunden/${order.customer.id}`} className="text-sm text-blue-600 hover:underline">
            Zum Kundenprofil
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Leistungen & Checklisten
              </h2>
              <div className="space-y-4">
                {order.services.map((service) => {
                  const done = service.checklistItems.filter((i) => i.checked).length;
                  const removeService = removeOrderService.bind(null, order.id, service.id);
                  return (
                    <div key={service.id} className="rounded-xl border border-gray-200 bg-white p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{service.nameSnapshot}</h3>
                          <p className="text-xs text-gray-500">
                            {done}/{service.checklistItems.length} Schritte erledigt ·{" "}
                            {formatMoney(service.price)}
                          </p>
                        </div>
                        <form action={removeService}>
                          <button
                            type="submit"
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Entfernen
                          </button>
                        </form>
                      </div>
                      <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full bg-emerald-500 transition-all"
                          style={{
                            width: `${
                              service.checklistItems.length
                                ? (done / service.checklistItems.length) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <ul className="space-y-1">
                        {service.checklistItems.map((item) => (
                          <ChecklistItemRow key={item.id} item={item} orderId={order.id} />
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {availableServices.length > 0 && (
                <form action={addServiceWithId} className="mt-3 flex gap-2">
                  <select
                    name="serviceTemplateId"
                    required
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Weitere Leistung hinzufügen…</option>
                    {availableServices.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({formatMoney(s.basePrice)})
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Hinzufügen
                  </button>
                </form>
              )}
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Vorher-/Nachher-Fotos
              </h2>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <PhotoUploader orderId={order.id} photos={order.photos} />
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Notizen
              </h2>
              <form action={updateNotesWithId} className="rounded-xl border border-gray-200 bg-white p-4">
                <textarea
                  name="notes"
                  rows={4}
                  defaultValue={order.notes ?? ""}
                  placeholder="Besonderheiten, Kundenwünsche, Zustand bei Annahme…"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="mt-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                  Notizen speichern
                </button>
              </form>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="mb-2 text-sm font-semibold text-gray-700">Fahrzeug</h2>
              <p className="text-sm text-gray-900">
                {order.vehicle.make} {order.vehicle.model}
              </p>
              <p className="text-xs text-gray-500">
                {VEHICLE_TYPE_LABEL[order.vehicle.vehicleType]}
                {order.vehicle.licensePlate ? ` · ${order.vehicle.licensePlate}` : ""}
                {order.vehicle.color ? ` · ${order.vehicle.color}` : ""}
              </p>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-semibold text-gray-700">Termin & Preis</h2>
              <form action={updateScheduleWithId} className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Geplanter Termin
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduledAt"
                    defaultValue={toDateTimeLocalValue(order.scheduledAt)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Zugesagt bis
                  </label>
                  <input
                    type="datetime-local"
                    name="dueAt"
                    defaultValue={toDateTimeLocalValue(order.dueAt)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Rabatt (%)
                  </label>
                  <input
                    type="number"
                    name="discountPct"
                    min={0}
                    max={100}
                    defaultValue={order.discountPct}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                  Speichern
                </button>
              </form>

              <div className="mt-4 space-y-1 border-t border-gray-100 pt-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Zwischensumme</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
                {order.discountPct > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Rabatt ({order.discountPct}%)</span>
                    <span>-{formatMoney(subtotal - total)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold text-gray-900">
                  <span>Gesamt</span>
                  <span>{formatMoney(total)}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
