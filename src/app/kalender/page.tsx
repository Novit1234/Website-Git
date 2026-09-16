import Link from "next/link";
import {
  addDays,
  addWeeks,
  endOfWeek,
  format,
  isSameDay,
  isToday,
  startOfWeek,
} from "date-fns";
import { de } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney, formatTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function KalenderPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const anchor = week ? new Date(week) : new Date();
  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(anchor, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const orders = await prisma.order.findMany({
    where: {
      scheduledAt: { gte: weekStart, lte: weekEnd },
      status: { not: "STORNIERT" },
    },
    include: { customer: true, vehicle: true, services: true },
    orderBy: { scheduledAt: "asc" },
  });

  const prevWeek = format(addWeeks(weekStart, -1), "yyyy-MM-dd");
  const nextWeek = format(addWeeks(weekStart, 1), "yyyy-MM-dd");

  return (
    <>
      <PageHeader
        title="Kalender"
        description={`${format(weekStart, "dd.MM.yyyy")} – ${format(weekEnd, "dd.MM.yyyy")}`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/kalender?week=${prevWeek}`}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              ← Vorherige
            </Link>
            <Link
              href="/kalender"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Heute
            </Link>
            <Link
              href={`/kalender?week=${nextWeek}`}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Nächste →
            </Link>
          </div>
        }
      />

      <div className="flex-1 overflow-x-auto px-6 py-6 sm:px-8">
        <div className="grid min-w-[980px] grid-cols-7 gap-3">
          {days.map((day) => {
            const dayOrders = orders.filter(
              (o) => o.scheduledAt && isSameDay(new Date(o.scheduledAt), day),
            );
            return (
              <div
                key={day.toISOString()}
                className={`rounded-xl border bg-white p-3 ${
                  isToday(day) ? "border-blue-400 ring-1 ring-blue-100" : "border-gray-200"
                }`}
              >
                <p className="mb-2 text-sm font-semibold text-gray-700">
                  {format(day, "EEEE", { locale: de })}
                  <span className="ml-1 font-normal text-gray-400">
                    {format(day, "dd.MM.")}
                  </span>
                </p>
                <div className="space-y-2">
                  {dayOrders.length === 0 ? (
                    <p className="text-xs text-gray-300">–</p>
                  ) : (
                    dayOrders.map((order) => {
                      const total =
                        order.services.reduce((s, svc) => s + svc.price, 0) *
                        (1 - order.discountPct / 100);
                      return (
                        <Link
                          key={order.id}
                          href={`/auftraege/${order.id}`}
                          className="block rounded-lg border border-gray-100 p-2 text-xs hover:border-blue-300 hover:bg-blue-50"
                        >
                          <p className="font-medium text-gray-900">
                            {formatTime(order.scheduledAt)} · {order.customer.name}
                          </p>
                          <p className="text-gray-500">
                            {order.vehicle.make} {order.vehicle.model}
                          </p>
                          <div className="mt-1 flex items-center justify-between">
                            <StatusBadge status={order.status} />
                            <span className="font-medium text-gray-700">
                              {formatMoney(total)}
                            </span>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
