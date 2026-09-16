"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { OrderStatus, VehicleType } from "@prisma/client";
import { str, optionalStr, numberOrNull, dateOrNull } from "@/lib/formdata";

export async function createOrder(formData: FormData) {
  let customerId = str(formData, "customerId");
  let vehicleId = str(formData, "vehicleId");

  if (customerId === "__new__") {
    const name = str(formData, "newCustomerName");
    if (!name) throw new Error("Name des neuen Kunden ist erforderlich.");
    const customer = await prisma.customer.create({
      data: {
        name,
        phone: optionalStr(formData, "newCustomerPhone"),
        email: optionalStr(formData, "newCustomerEmail"),
      },
    });
    customerId = customer.id;
  }

  if (vehicleId === "__new__") {
    const make = str(formData, "newVehicleMake");
    const model = str(formData, "newVehicleModel");
    if (!make || !model) throw new Error("Marke und Modell des Fahrzeugs sind erforderlich.");
    const vehicle = await prisma.vehicle.create({
      data: {
        customerId,
        make,
        model,
        licensePlate: optionalStr(formData, "newVehicleLicensePlate"),
        color: optionalStr(formData, "newVehicleColor"),
        vehicleType: (optionalStr(formData, "newVehicleType") as VehicleType | null) ?? "PKW",
      },
    });
    vehicleId = vehicle.id;
  }

  if (!customerId || !vehicleId) {
    throw new Error("Kunde und Fahrzeug sind erforderlich.");
  }

  const serviceTemplateIds = formData.getAll("serviceTemplateIds").map(String);
  if (serviceTemplateIds.length === 0) {
    throw new Error("Bitte mindestens eine Leistung auswählen.");
  }

  const templates = await prisma.serviceTemplate.findMany({
    where: { id: { in: serviceTemplateIds } },
    include: { checklistItems: { orderBy: { sortOrder: "asc" } } },
  });

  const scheduledAt = dateOrNull(formData, "scheduledAt");
  const dueAt = dateOrNull(formData, "dueAt");
  const discountPct = numberOrNull(formData, "discountPct") ?? 0;
  const notes = optionalStr(formData, "notes");
  const initialStatus: OrderStatus = scheduledAt ? "GEPLANT" : "ANFRAGE";

  const order = await prisma.order.create({
    data: {
      customerId,
      vehicleId,
      status: initialStatus,
      scheduledAt,
      dueAt,
      discountPct,
      notes,
      services: {
        create: templates.map((template, index) => ({
          serviceTemplateId: template.id,
          nameSnapshot: template.name,
          price: template.basePrice,
          sortOrder: index,
          checklistItems: {
            create: template.checklistItems.map((item) => ({
              label: item.label,
              sortOrder: item.sortOrder,
            })),
          },
        })),
      },
      statusEvents: {
        create: { status: initialStatus },
      },
    },
  });

  revalidatePath("/auftraege");
  revalidatePath("/dashboard");
  redirect(`/auftraege/${order.id}`);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const data: {
    status: OrderStatus;
    completedAt?: Date | null;
    pickedUpAt?: Date | null;
  } = { status };

  if (status === "FERTIG") data.completedAt = new Date();
  if (status === "ABGEHOLT") data.pickedUpAt = new Date();

  await prisma.order.update({
    where: { id: orderId },
    data: {
      ...data,
      statusEvents: { create: { status } },
    },
  });

  revalidatePath("/auftraege");
  revalidatePath(`/auftraege/${orderId}`);
  revalidatePath("/dashboard");
  revalidatePath("/kalender");
}

export async function updateChecklistItem(
  itemId: string,
  orderId: string,
  checked: boolean,
) {
  await prisma.checklistItem.update({
    where: { id: itemId },
    data: { checked, checkedAt: checked ? new Date() : null },
  });

  revalidatePath(`/auftraege/${orderId}`);
}

export async function updateChecklistItemNote(
  itemId: string,
  orderId: string,
  note: string,
) {
  await prisma.checklistItem.update({
    where: { id: itemId },
    data: { note: note.trim() || null },
  });

  revalidatePath(`/auftraege/${orderId}`);
}

export async function updateOrderNotes(orderId: string, formData: FormData) {
  await prisma.order.update({
    where: { id: orderId },
    data: { notes: optionalStr(formData, "notes") },
  });
  revalidatePath(`/auftraege/${orderId}`);
}

export async function updateOrderSchedule(orderId: string, formData: FormData) {
  await prisma.order.update({
    where: { id: orderId },
    data: {
      scheduledAt: dateOrNull(formData, "scheduledAt"),
      dueAt: dateOrNull(formData, "dueAt"),
      discountPct: numberOrNull(formData, "discountPct") ?? 0,
    },
  });
  revalidatePath(`/auftraege/${orderId}`);
  revalidatePath("/kalender");
  revalidatePath("/dashboard");
}

export async function addOrderService(orderId: string, formData: FormData) {
  const serviceTemplateId = str(formData, "serviceTemplateId");
  if (!serviceTemplateId) return;

  const template = await prisma.serviceTemplate.findUniqueOrThrow({
    where: { id: serviceTemplateId },
    include: { checklistItems: { orderBy: { sortOrder: "asc" } } },
  });

  const count = await prisma.orderService.count({ where: { orderId } });

  await prisma.orderService.create({
    data: {
      orderId,
      serviceTemplateId: template.id,
      nameSnapshot: template.name,
      price: template.basePrice,
      sortOrder: count,
      checklistItems: {
        create: template.checklistItems.map((item) => ({
          label: item.label,
          sortOrder: item.sortOrder,
        })),
      },
    },
  });

  revalidatePath(`/auftraege/${orderId}`);
}

export async function removeOrderService(orderId: string, orderServiceId: string) {
  await prisma.orderService.delete({ where: { id: orderServiceId } });
  revalidatePath(`/auftraege/${orderId}`);
}
