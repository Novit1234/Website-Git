"use client";

import { useMemo, useState } from "react";
import type { Customer, Vehicle, ServiceTemplate } from "@prisma/client";
import { createOrder } from "@/app/actions/orders";
import { SERVICE_CATEGORY_LABEL, VEHICLE_TYPE_LABEL } from "@/lib/labels";
import { formatMinutes, formatMoney } from "@/lib/format";

type CustomerWithVehicles = Customer & { vehicles: Vehicle[] };

export function NewOrderForm({
  customers,
  serviceTemplates,
  preselectedCustomerId,
}: {
  customers: CustomerWithVehicles[];
  serviceTemplates: ServiceTemplate[];
  preselectedCustomerId?: string;
}) {
  const [customerId, setCustomerId] = useState(preselectedCustomerId ?? "");
  const [vehicleId, setVehicleId] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [discountPct, setDiscountPct] = useState(0);

  const selectedCustomer = customers.find((c) => c.id === customerId);
  const vehicles = selectedCustomer?.vehicles ?? [];
  const isNewCustomer = customerId === "__new__";
  const isNewVehicle = isNewCustomer || vehicleId === "__new__";

  const grouped = useMemo(() => {
    const map = new Map<string, ServiceTemplate[]>();
    for (const service of serviceTemplates) {
      const list = map.get(service.category) ?? [];
      list.push(service);
      map.set(service.category, list);
    }
    return map;
  }, [serviceTemplates]);

  const subtotal = serviceTemplates
    .filter((s) => selectedServiceIds.includes(s.id))
    .reduce((sum, s) => sum + s.basePrice, 0);
  const total = subtotal * (1 - discountPct / 100);

  function toggleService(id: string) {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <form action={createOrder} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <fieldset className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
          <legend className="px-1 text-sm font-semibold text-gray-700">Kunde</legend>
          <select
            name="customerId"
            required
            value={customerId}
            onChange={(e) => {
              setCustomerId(e.target.value);
              setVehicleId("");
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="" disabled>
              -- Kunde wählen --
            </option>
            <option value="__new__">+ Neuer Kunde</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {isNewCustomer && (
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-blue-50 p-3">
              <input
                name="newCustomerName"
                required
                placeholder="Name"
                className="col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                name="newCustomerPhone"
                placeholder="Telefon"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                name="newCustomerEmail"
                placeholder="E-Mail"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          )}
        </fieldset>

        <fieldset className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
          <legend className="px-1 text-sm font-semibold text-gray-700">Fahrzeug</legend>
          {isNewCustomer ? (
            <p className="text-xs text-gray-500">
              Für einen neuen Kunden wird direkt ein neues Fahrzeug angelegt.
            </p>
          ) : (
            <select
              name="vehicleId"
              required
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              disabled={!customerId}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
            >
              <option value="" disabled>
                -- Fahrzeug wählen --
              </option>
              <option value="__new__">+ Neues Fahrzeug</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.make} {v.model}
                  {v.licensePlate ? ` (${v.licensePlate})` : ""}
                </option>
              ))}
            </select>
          )}

          {isNewCustomer && <input type="hidden" name="vehicleId" value="__new__" />}

          {isNewVehicle && (
            <div className="grid grid-cols-3 gap-3 rounded-lg bg-blue-50 p-3">
              <input
                name="newVehicleMake"
                required
                placeholder="Marke"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                name="newVehicleModel"
                required
                placeholder="Modell"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                name="newVehicleLicensePlate"
                placeholder="Kennzeichen"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                name="newVehicleColor"
                placeholder="Farbe"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <select
                name="newVehicleType"
                defaultValue="PKW"
                className="col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {Object.entries(VEHICLE_TYPE_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </fieldset>

        <fieldset className="space-y-3 rounded-xl border border-gray-200 bg-white p-5">
          <legend className="px-1 text-sm font-semibold text-gray-700">Leistungen</legend>
          {[...grouped.entries()].map(([category, services]) => (
            <div key={category}>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                {SERVICE_CATEGORY_LABEL[category as keyof typeof SERVICE_CATEGORY_LABEL]}
              </p>
              <div className="mb-3 space-y-1">
                {services.map((service) => (
                  <label
                    key={service.id}
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="serviceTemplateIds"
                        value={service.id}
                        checked={selectedServiceIds.includes(service.id)}
                        onChange={() => toggleService(service.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {service.name}
                    </span>
                    <span className="shrink-0 text-xs text-gray-500">
                      {formatMoney(service.basePrice)} · {formatMinutes(service.estimatedMinutes)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </fieldset>
      </div>

      <div className="space-y-6">
        <fieldset className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
          <legend className="px-1 text-sm font-semibold text-gray-700">Termin & Notizen</legend>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Geplanter Termin
            </label>
            <input
              type="datetime-local"
              name="scheduledAt"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Zugesagt bis (fällig)
            </label>
            <input
              type="datetime-local"
              name="dueAt"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Rabatt (%)</label>
            <input
              type="number"
              name="discountPct"
              min={0}
              max={100}
              value={discountPct}
              onChange={(e) => setDiscountPct(Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Notizen</label>
            <textarea
              name="notes"
              rows={3}
              placeholder="z.B. Kratzer an der Fahrertür, Kunde wartet vor Ort…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </fieldset>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Zwischensumme</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          {discountPct > 0 && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Rabatt ({discountPct}%)</span>
              <span>-{formatMoney(subtotal - total)}</span>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2 text-base font-semibold text-gray-900">
            <span>Gesamt</span>
            <span>{formatMoney(total)}</span>
          </div>
          <button
            type="submit"
            disabled={selectedServiceIds.length === 0}
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Auftrag anlegen
          </button>
        </div>
      </div>
    </form>
  );
}
