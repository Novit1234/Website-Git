import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { OrderCard } from "@/components/OrderCard";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABEL } from "@/lib/labels";
import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AuftraegePage() {
  const orders = await prisma.order.findMany({
    include: { customer: true, vehicle: true, services: true },
    orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
  });

  const columns = ORDER_STATUS_FLOW.map((status) => ({
    status,
    orders: orders.filter((o) => o.status === status),
  }));
  const stornierte = orders.filter((o) => o.status === "STORNIERT");

  return (
    <>
      <PageHeader
        title="Aufträge"
        description={`${orders.length} Aufträge insgesamt`}
        actions={
          <Link
            href="/auftraege/neu"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Neuer Auftrag
          </Link>
        }
      />

      <div className="flex-1 overflow-x-auto px-6 py-6 sm:px-8">
        <div className="flex min-w-max gap-4">
          {columns.map((column) => (
            <div key={column.status} className="w-72 shrink-0">
              <div className="mb-2 flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-gray-700">
                  {ORDER_STATUS_LABEL[column.status as OrderStatus]}
                </h2>
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
                  {column.orders.length}
                </span>
              </div>
              <div className="space-y-2 rounded-xl bg-gray-100 p-2 min-h-[120px]">
                {column.orders.length === 0 ? (
                  <p className="px-2 py-4 text-center text-xs text-gray-400">Keine Aufträge</p>
                ) : (
                  column.orders.map((order) => <OrderCard key={order.id} order={order} />)
                )}
              </div>
            </div>
          ))}
        </div>

        {stornierte.length > 0 && (
          <details className="mt-6">
            <summary className="cursor-pointer text-sm font-medium text-gray-500">
              Stornierte Aufträge ({stornierte.length})
            </summary>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {stornierte.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </details>
        )}
      </div>
    </>
  );
}
