"use client";

import { useRef, useState, useTransition } from "react";
import type { PhotoType } from "@prisma/client";
import { addPhoto, deletePhoto } from "@/app/actions/photos";
import { PHOTO_TYPE_LABEL } from "@/lib/labels";

type PhotoData = {
  id: string;
  type: PhotoType;
  dataUrl: string;
  note: string | null;
};

export function PhotoUploader({ orderId, photos }: { orderId: string; photos: PhotoData[] }) {
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<PhotoType>("VORHER");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      startTransition(async () => {
        try {
          await addPhoto(orderId, type, dataUrl, "");
        } catch {
          setError("Foto konnte nicht gespeichert werden (zu groß?).");
        }
      });
      if (inputRef.current) inputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  }

  const before = photos.filter((p) => p.type === "VORHER");
  const after = photos.filter((p) => p.type === "NACHHER");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as PhotoType)}
          className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        >
          {Object.entries(PHOTO_TYPE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          disabled={isPending}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="text-sm text-gray-600"
        />
        {isPending && <span className="text-xs text-gray-400">Speichert…</span>}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}

      <PhotoGrid title="Vorher" photos={before} orderId={orderId} />
      <PhotoGrid title="Nachher" photos={after} orderId={orderId} />
    </div>
  );
}

function PhotoGrid({
  title,
  photos,
  orderId,
}: {
  title: string;
  photos: PhotoData[];
  orderId: string;
}) {
  if (photos.length === 0) return null;
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">{title}</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative overflow-hidden rounded-lg border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.dataUrl} alt={title} className="h-24 w-full object-cover" />
            <form
              action={deletePhoto.bind(null, photo.id, orderId)}
              className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <button
                type="submit"
                className="rounded-full bg-black/60 px-1.5 py-0.5 text-xs text-white hover:bg-black/80"
              >
                ✕
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
