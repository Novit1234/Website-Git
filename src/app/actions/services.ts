"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { ServiceCategory } from "@prisma/client";
import { str, optionalStr, numberOrNull } from "@/lib/formdata";

export async function createServiceTemplate(formData: FormData) {
  const name = str(formData, "name");
  const basePrice = numberOrNull(formData, "basePrice");
  const estimatedMinutes = numberOrNull(formData, "estimatedMinutes");
  if (!name || basePrice === null || estimatedMinutes === null) {
    throw new Error("Name, Preis und Dauer sind erforderlich.");
  }

  const checklistRaw = str(formData, "checklist");
  const checklistLines = checklistRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const service = await prisma.serviceTemplate.create({
    data: {
      name,
      description: optionalStr(formData, "description"),
      category: (optionalStr(formData, "category") as ServiceCategory | null) ?? "SONDERLEISTUNG",
      basePrice,
      estimatedMinutes,
      checklistItems: {
        create: checklistLines.map((label, index) => ({ label, sortOrder: index })),
      },
    },
  });

  revalidatePath("/leistungen");
  redirect(`/leistungen/${service.id}`);
}

export async function updateServiceTemplate(serviceId: string, formData: FormData) {
  const name = str(formData, "name");
  const basePrice = numberOrNull(formData, "basePrice");
  const estimatedMinutes = numberOrNull(formData, "estimatedMinutes");
  if (!name || basePrice === null || estimatedMinutes === null) {
    throw new Error("Name, Preis und Dauer sind erforderlich.");
  }

  await prisma.serviceTemplate.update({
    where: { id: serviceId },
    data: {
      name,
      description: optionalStr(formData, "description"),
      category: (optionalStr(formData, "category") as ServiceCategory | null) ?? "SONDERLEISTUNG",
      basePrice,
      estimatedMinutes,
    },
  });

  revalidatePath("/leistungen");
  revalidatePath(`/leistungen/${serviceId}`);
}

export async function toggleServiceActive(serviceId: string, active: boolean) {
  await prisma.serviceTemplate.update({
    where: { id: serviceId },
    data: { active },
  });
  revalidatePath("/leistungen");
  revalidatePath(`/leistungen/${serviceId}`);
}

export async function addChecklistTemplateItem(serviceId: string, formData: FormData) {
  const label = str(formData, "label");
  if (!label) return;

  const count = await prisma.checklistTemplateItem.count({
    where: { serviceTemplateId: serviceId },
  });

  await prisma.checklistTemplateItem.create({
    data: { serviceTemplateId: serviceId, label, sortOrder: count },
  });

  revalidatePath(`/leistungen/${serviceId}`);
}

export async function deleteChecklistTemplateItem(itemId: string, serviceId: string) {
  await prisma.checklistTemplateItem.delete({ where: { id: itemId } });
  revalidatePath(`/leistungen/${serviceId}`);
}

export async function moveChecklistTemplateItem(
  itemId: string,
  serviceId: string,
  direction: "up" | "down",
) {
  const items = await prisma.checklistTemplateItem.findMany({
    where: { serviceTemplateId: serviceId },
    orderBy: { sortOrder: "asc" },
  });

  const index = items.findIndex((item) => item.id === itemId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= items.length) return;

  const a = items[index];
  const b = items[swapIndex];

  await prisma.$transaction([
    prisma.checklistTemplateItem.update({
      where: { id: a.id },
      data: { sortOrder: b.sortOrder },
    }),
    prisma.checklistTemplateItem.update({
      where: { id: b.id },
      data: { sortOrder: a.sortOrder },
    }),
  ]);

  revalidatePath(`/leistungen/${serviceId}`);
}
