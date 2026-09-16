import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Field, SelectField, TextAreaField } from "@/components/form";
import { SERVICE_CATEGORY_LABEL } from "@/lib/labels";
import {
  updateServiceTemplate,
  toggleServiceActive,
  addChecklistTemplateItem,
  deleteChecklistTemplateItem,
  moveChecklistTemplateItem,
} from "@/app/actions/services";

const categoryOptions = Object.entries(SERVICE_CATEGORY_LABEL).map(([value, label]) => ({
  value,
  label,
}));

export default async function LeistungDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const service = await prisma.serviceTemplate.findUnique({
    where: { id },
    include: { checklistItems: { orderBy: { sortOrder: "asc" } } },
  });

  if (!service) notFound();

  const updateWithId = updateServiceTemplate.bind(null, service.id);
  const addItemWithId = addChecklistTemplateItem.bind(null, service.id);
  const toggleActive = toggleServiceActive.bind(null, service.id, !service.active);

  return (
    <>
      <PageHeader
        title={service.name}
        description={SERVICE_CATEGORY_LABEL[service.category]}
        actions={
          <form action={toggleActive}>
            <button
              type="submit"
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                service.active
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {service.active ? "Leistung deaktivieren" : "Leistung aktivieren"}
            </button>
          </form>
        }
      />

      <div className="flex-1 space-y-6 px-6 py-6 sm:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">Details</h2>
            <form action={updateWithId} className="space-y-4">
              <Field label="Name" name="name" defaultValue={service.name} required />
              <TextAreaField
                label="Beschreibung"
                name="description"
                defaultValue={service.description ?? ""}
              />
              <div className="grid grid-cols-3 gap-4">
                <SelectField
                  label="Kategorie"
                  name="category"
                  defaultValue={service.category}
                  options={categoryOptions}
                />
                <Field
                  label="Preis (€)"
                  name="basePrice"
                  type="number"
                  step="0.01"
                  defaultValue={service.basePrice}
                  required
                />
                <Field
                  label="Dauer (Minuten)"
                  name="estimatedMinutes"
                  type="number"
                  defaultValue={service.estimatedMinutes}
                  required
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
              >
                Speichern
              </button>
            </form>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">
              Checkliste ({service.checklistItems.length} Schritte)
            </h2>
            <p className="mb-3 text-xs text-gray-500">
              Diese Schritte werden automatisch in jeden neuen Auftrag übernommen, der diese
              Leistung enthält.
            </p>
            <ul className="mb-4 space-y-1">
              {service.checklistItems.map((item, index) => {
                const moveUp = moveChecklistTemplateItem.bind(null, item.id, service.id, "up");
                const moveDown = moveChecklistTemplateItem.bind(null, item.id, service.id, "down");
                const remove = deleteChecklistTemplateItem.bind(null, item.id, service.id);
                return (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm"
                  >
                    <span className="text-gray-800">
                      {index + 1}. {item.label}
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                      <form action={moveUp}>
                        <button
                          type="submit"
                          disabled={index === 0}
                          className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                          aria-label="Nach oben"
                        >
                          ↑
                        </button>
                      </form>
                      <form action={moveDown}>
                        <button
                          type="submit"
                          disabled={index === service.checklistItems.length - 1}
                          className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                          aria-label="Nach unten"
                        >
                          ↓
                        </button>
                      </form>
                      <form action={remove}>
                        <button
                          type="submit"
                          className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50"
                          aria-label="Löschen"
                        >
                          ✕
                        </button>
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
            <form action={addItemWithId} className="flex gap-2">
              <input
                type="text"
                name="label"
                placeholder="Neuer Arbeitsschritt…"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Hinzufügen
              </button>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}
