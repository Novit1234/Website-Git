"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { PhotoType } from "@prisma/client";

const MAX_DATA_URL_LENGTH = 8_000_000; // ~6MB Bilddaten als Base64

export async function addPhoto(
  orderId: string,
  type: PhotoType,
  dataUrl: string,
  note: string,
) {
  if (!dataUrl.startsWith("data:image/")) {
    throw new Error("Ungültiges Bildformat.");
  }
  if (dataUrl.length > MAX_DATA_URL_LENGTH) {
    throw new Error("Bild ist zu groß.");
  }

  await prisma.photo.create({
    data: {
      orderId,
      type,
      dataUrl,
      note: note.trim() || null,
    },
  });

  revalidatePath(`/auftraege/${orderId}`);
}

export async function deletePhoto(photoId: string, orderId: string) {
  await prisma.photo.delete({ where: { id: photoId } });
  revalidatePath(`/auftraege/${orderId}`);
}
