import Link from "next/link";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDateTime, formatMoney, formatTime } from "@/lib/format";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const [todayOrders, weekOrders, inArbeit, fertig, overdue, upcoming] =
    await Promise.all([
      prisma.order.findMany({
        where: {
          scheduledAt: { gte: todayStart, lte: todayEnd },
          status: { not: "STORNIERT" },
        },
        include: { customer: true, vehicle: true, services: true },
        orderBy: { scheduledAt: "asc" },
      }),
      prisma.order.findMany({
        where: {
          scheduledAt: { gte: weekStart, lte: weekEnd },
          status: { not: "STORNIERT" },
        },
        include: { services: true },
      }),
      prisma.order.count({ where: { status: "IN_ARBEIT" } }),
      prisma.order.count({ where: { status: "FERTIG" } }),
      prisma.order.findMany({
        where: {
          dueAt: { lt: now },
          status: { notIn: ["FERTIG", "ABGEHOLT", "STORNIERT"] },
        },
        include: { customer: true, vehicle: true },
        orderBy: { dueAt: "asc" },
        take: 8,
      }),
      prisma.order.findMany({
        where: {
          scheduledAt: { gte: now },
          status: { notIn: ["ABGEHOLT", "STORNIERT"] },
        },
        include: { customer: true, vehicle: true },
        orderBy: { scheduledAt: "asc" },
        take: 6,
      }),
    ]);

  const weekRevenue = weekOrders.reduce((sum, order) => {
    const gross = order.services.reduce((s, svc) => s + svc.price, 0);
    return sum + gross * (1 - order.discountPct / 100);
  }, 0);

  return {
    todayOrders,
    weekRevenue,
    weekOrderCount: weekOrders.length,
    inArbeit,
    fertig,
    overdue,
    upcoming,
  };
}

function orderTotal(order: { services: { price: number }[]; discountPct: number }) {
  const gross = order.services.reduce((s, svc) => s + svc.price, 0);
  return gross * (1 - order.discountPct / 100);
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Überblick über den heutigen Betrieb"
        actions={
          <Link
            href="/auftraege/neu"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Neuer Auftrag
          </Link>
        }
      />

      <div className="flex-1 space-y-8 px-6 py-6 sm:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Termine heute" value={String(data.todayOrders.length)} />
          <StatCard
            label="Umsatz diese Woche"
            value={formatMoney(data.weekRevenue)}
            hint={`${data.weekOrderCount} Aufträge`}
          />
          <StatCard label="In Arbeit" value={String(data.inArbeit)} />
          <StatCard label="Fertig zur Abholung" value={String(data.fertig)} />
        </div>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Heutige Termine
          </h2>
          {data.todayOrders.length === 0 ? (
            <EmptyHint text="Für heute sind keine Termine geplant." />
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-2 font-medium">Zeit</th>
                    <th className="px-4 py-2 font-medium">Kunde</th>
                    <th className="px-4 py-2 font-medium">Fahrzeug</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium text-right">Preis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.todayOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-900">
                        {formatTime(order.scheduledAt)}
                      </td>
                      <td className="px-4 py-2">
                        <Link
                          href={`/auftraege/${order.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {order.customer.name}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {order.vehicle.make} {order.vehicle.model}
                      </td>
                      <td className="px-4 py-2">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-2 text-right text-gray-900">
                        {formatMoney(orderTotal(order))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Nächste Termine
            </h2>
            {data.upcoming.length === 0 ? (
              <EmptyHint text="Keine anstehenden Termine." />
            ) : (
              <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
                {data.upcoming.map((order) => (
                  <li key={order.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <Link
                        href={`/auftraege/${order.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        {order.customer.name}
                      </Link>
                      <p className="text-xs text-gray-500">
                        {order.vehicle.make} {order.vehicle.model}
                        {order.vehicle.licensePlate ? ` · ${order.vehicle.licensePlate}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatDateTime(order.scheduledAt)}
                      </p>
                      <StatusBadge status={order.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Braucht Aufmerksamkeit (überfällig)
            </h2>
            {data.overdue.length === 0 ? (
              <EmptyHint text="Alles im grünen Bereich – keine überfälligen Aufträge." />
            ) : (
              <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-red-200 bg-red-50">
                {data.overdue.map((order) => (
                  <li key={order.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <Link
                        href={`/auftraege/${order.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        {order.customer.name}
                      </Link>
                      <p className="text-xs text-gray-500">
                        {order.vehicle.make} {order.vehicle.model}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-700">
                        Fällig: {formatDateTime(order.dueAt)}
                      </p>
                      <StatusBadge status={order.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-500">
      {text}
    </div>
  );
}
