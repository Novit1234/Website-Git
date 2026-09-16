"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { VehicleType } from "@prisma/client";
import { str, optionalStr } from "@/lib/formdata";

export async function createCustomer(formData: FormData) {
  const name = str(formData, "name");
  if (!name) throw new Error("Name ist erforderlich.");

  const phone = optionalStr(formData, "phone");
  const email = optionalStr(formData, "email");
  const notes = optionalStr(formData, "notes");

  const make = optionalStr(formData, "vehicleMake");
  const model = optionalStr(formData, "vehicleModel");

  const customer = await prisma.customer.create({
    data: {
      name,
      phone,
      email,
      notes,
      vehicles:
        make && model
          ? {
              create: {
                make,
                model,
                licensePlate: optionalStr(formData, "vehicleLicensePlate"),
                color: optionalStr(formData, "vehicleColor"),
                vehicleType:
                  (optionalStr(formData, "vehicleType") as VehicleType | null) ??
                  "PKW",
              },
            }
          : undefined,
    },
  });

  revalidatePath("/kunden");
  redirect(`/kunden/${customer.id}`);
}

export async function updateCustomer(customerId: string, formData: FormData) {
  const name = str(formData, "name");
  if (!name) throw new Error("Name ist erforderlich.");

  await prisma.customer.update({
    where: { id: customerId },
    data: {
      name,
      phone: optionalStr(formData, "phone"),
      email: optionalStr(formData, "email"),
      notes: optionalStr(formData, "notes"),
    },
  });

  revalidatePath(`/kunden/${customerId}`);
  revalidatePath("/kunden");
}

export async function addVehicle(customerId: string, formData: FormData) {
  const make = str(formData, "make");
  const model = str(formData, "model");
  if (!make || !model) throw new Error("Marke und Modell sind erforderlich.");

  await prisma.vehicle.create({
    data: {
      customerId,
      make,
      model,
      licensePlate: optionalStr(formData, "licensePlate"),
      color: optionalStr(formData, "color"),
      vehicleType: (optionalStr(formData, "vehicleType") as VehicleType | null) ?? "PKW",
      notes: optionalStr(formData, "notes"),
    },
  });

  revalidatePath(`/kunden/${customerId}`);
}
