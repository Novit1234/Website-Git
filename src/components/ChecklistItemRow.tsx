"use client";

import { useState, useTransition } from "react";
import { updateChecklistItem, updateChecklistItemNote } from "@/app/actions/orders";

export function ChecklistItemRow({
  item,
  orderId,
}: {
  item: { id: string; label: string; checked: boolean; note: string | null };
  orderId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [showNote, setShowNote] = useState(Boolean(item.note));
  const [checked, setChecked] = useState(item.checked);

  return (
    <li className="rounded-lg border border-gray-100 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <label className="flex flex-1 cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={checked}
            disabled={isPending}
            onChange={(e) => {
              const next = e.target.checked;
              setChecked(next);
              startTransition(() => {
                updateChecklistItem(item.id, orderId, next);
              });
            }}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className={checked ? "text-gray-400 line-through" : "text-gray-800"}>
            {item.label}
          </span>
        </label>
        <button
          type="button"
          onClick={() => setShowNote((v) => !v)}
          className="shrink-0 text-xs text-gray-400 hover:text-blue-600"
        >
          {showNote ? "Notiz ausblenden" : "+ Notiz"}
        </button>
      </div>
      {showNote && (
        <form
          action={(formData) => {
            const note = String(formData.get("note") ?? "");
            startTransition(() => {
              updateChecklistItemNote(item.id, orderId, note);
            });
          }}
          className="mt-2 flex gap-2"
        >
          <input
            type="text"
            name="note"
            defaultValue={item.note ?? ""}
            placeholder="z.B. Fleck auf Rücksitz braucht 2. Durchgang"
            className="flex-1 rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-3 py-1 text-xs font-medium text-white hover:bg-gray-700"
          >
            Speichern
          </button>
        </form>
      )}
    </li>
  );
}
