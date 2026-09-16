import type { OrderStatus, ServiceCategory, VehicleType, PhotoType } from "@prisma/client";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  ANFRAGE: "Anfrage",
  GEPLANT: "Geplant",
  IN_ARBEIT: "In Arbeit",
  QUALITAETSKONTROLLE: "Qualitätskontrolle",
  FERTIG: "Fertig zur Abholung",
  ABGEHOLT: "Abgeholt",
  STORNIERT: "Storniert",
};

// Reihenfolge der Kanban-Spalten / des Workflows.
export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "ANFRAGE",
  "GEPLANT",
  "IN_ARBEIT",
  "QUALITAETSKONTROLLE",
  "FERTIG",
  "ABGEHOLT",
];

export const ORDER_STATUS_BADGE_CLASS: Record<OrderStatus, string> = {
  ANFRAGE: "bg-slate-100 text-slate-700 ring-slate-300",
  GEPLANT: "bg-blue-100 text-blue-700 ring-blue-300",
  IN_ARBEIT: "bg-amber-100 text-amber-800 ring-amber-300",
  QUALITAETSKONTROLLE: "bg-purple-100 text-purple-700 ring-purple-300",
  FERTIG: "bg-emerald-100 text-emerald-700 ring-emerald-300",
  ABGEHOLT: "bg-gray-100 text-gray-600 ring-gray-300",
  STORNIERT: "bg-red-100 text-red-700 ring-red-300",
};

export const SERVICE_CATEGORY_LABEL: Record<ServiceCategory, string> = {
  AUSSEN: "Außenpflege",
  INNEN: "Innenpflege",
  POLITUR: "Politur",
  VERSIEGELUNG: "Versiegelung",
  KOMPLETT: "Komplettpaket",
  SONDERLEISTUNG: "Sonderleistung",
};

export const VEHICLE_TYPE_LABEL: Record<VehicleType, string> = {
  PKW: "PKW",
  SUV: "SUV",
  TRANSPORTER: "Transporter",
  WOHNMOBIL: "Wohnmobil",
  MOTORRAD: "Motorrad",
  SONSTIGES: "Sonstiges",
};

export const PHOTO_TYPE_LABEL: Record<PhotoType, string> = {
  VORHER: "Vorher",
  NACHHER: "Nachher",
};

export function nextOrderStatus(status: OrderStatus): OrderStatus | null {
  const index = ORDER_STATUS_FLOW.indexOf(status);
  if (index === -1 || index === ORDER_STATUS_FLOW.length - 1) return null;
  return ORDER_STATUS_FLOW[index + 1];
}
