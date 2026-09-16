import Link from "next/link";
import type { Order, Customer, Vehicle, OrderService } from "@prisma/client";
import { OrderStatusSelect } from "@/components/OrderStatusSelect";
import { formatDateTime, formatMoney } from "@/lib/format";

type OrderWithRelations = Order & {
  customer: Customer;
  vehicle: Vehicle;
  services: OrderService[];
};

export function OrderCard({ order }: { order: OrderWithRelations }) {
  const total =
    order.services.reduce((sum, s) => sum + s.price, 0) * (1 - order.discountPct / 100);
  const isOverdue =
    order.dueAt &&
    new Date(order.dueAt) < new Date() &&
    !['FERTIG', 'ABGEHOLT', 'STORNIERT'].includes(order.status);

  return (
    <Link
      href={`/auftraege/${order.id}`}
      className={`block rounded-lg border bg-white p-3 shadow-sm transition-shadow hover:shadow-md ${
        isOverdue ? "border-red-300" : "border-gray-200"
      }`}
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <p className="font-medium text-gray-900">{order.customer.name}</p>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>
      <p className="mb-2 text-xs text-gray-500">
        {order.vehicle.make} {order.vehicle.model}
        {order.vehicle.licensePlate ? ` · ${order.vehicle.licensePlate}` : ""}
      </p>
      <div className="flex items-center justify-between text-xs">
        <span className={isOverdue ? "font-medium text-red-600" : "text-gray-500"}>
          {order.scheduledAt ? formatDateTime(order.scheduledAt) : "Nicht geplant"}
        </span>
        <span className="font-medium text-gray-900">{formatMoney(total)}</span>
      </div>
      <p className="mt-1 truncate text-xs text-gray-400">
        {order.services.map((s) => s.nameSnapshot).join(", ")}
      </p>
    </Link>
  );
}
