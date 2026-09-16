import { PageHeader } from "@/components/PageHeader";
import { Field, SelectField, TextAreaField } from "@/components/form";
import { createServiceTemplate } from "@/app/actions/services";
import { SERVICE_CATEGORY_LABEL } from "@/lib/labels";

const categoryOptions = Object.entries(SERVICE_CATEGORY_LABEL).map(([value, label]) => ({
  value,
  label,
}));

export default function NeueLeistungPage() {
  return (
    <>
      <PageHeader
        title="Neue Leistung"
        description="Definiere eine Leistung inkl. Standard-Checkliste für einen konsistenten Arbeitsablauf"
      />

      <div className="flex-1 px-6 py-6 sm:px-8">
        <form action={createServiceTemplate} className="max-w-2xl space-y-4 rounded-xl border border-gray-200 bg-white p-5">
          <Field label="Name der Leistung" name="name" required />
          <TextAreaField label="Beschreibung" name="description" />
          <div className="grid grid-cols-3 gap-4">
            <SelectField
              label="Kategorie"
              name="category"
              defaultValue="SONDERLEISTUNG"
              options={categoryOptions}
            />
            <Field label="Preis (€)" name="basePrice" type="number" step="0.01" required />
            <Field label="Dauer (Minuten)" name="estimatedMinutes" type="number" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Checkliste (ein Arbeitsschritt pro Zeile)
            </label>
            <textarea
              name="checklist"
              rows={8}
              placeholder={"Fahrzeug vorwaschen\nFelgen reinigen\n..."}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Leistung speichern
          </button>
        </form>
      </div>
    </>
  );
}
