"use client";

import { useTransition } from "react";
import type { OrderStatus } from "@prisma/client";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABEL } from "@/lib/labels";
import { updateOrderStatus } from "@/app/actions/orders";

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => {
        const value = e.target.value as OrderStatus;
        startTransition(() => {
          updateOrderStatus(orderId, value);
        });
      }}
      onClick={(e) => e.stopPropagation()}
      className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs font-medium focus:border-blue-500 focus:outline-none disabled:opacity-50"
    >
      {[...ORDER_STATUS_FLOW, "STORNIERT" as OrderStatus].map((s) => (
        <option key={s} value={s}>
          {ORDER_STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}
