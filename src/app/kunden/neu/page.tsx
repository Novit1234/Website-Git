import { PageHeader } from "@/components/PageHeader";
import { Field, TextAreaField, SelectField } from "@/components/form";
import { createCustomer } from "@/app/actions/customers";
import { VEHICLE_TYPE_LABEL } from "@/lib/labels";

const vehicleTypeOptions = Object.entries(VEHICLE_TYPE_LABEL).map(([value, label]) => ({
  value,
  label,
}));

export default function NeuerKundePage() {
  return (
    <>
      <PageHeader title="Neuer Kunde" description="Kunde mit optionalem Erstfahrzeug anlegen" />

      <div className="flex-1 px-6 py-6 sm:px-8">
        <form action={createCustomer} className="max-w-2xl space-y-6">
          <fieldset className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
            <legend className="px-1 text-sm font-semibold text-gray-700">Kontaktdaten</legend>
            <Field label="Name" name="name" required />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Telefon" name="phone" type="tel" />
              <Field label="E-Mail" name="email" type="email" />
            </div>
            <TextAreaField label="Notizen" name="notes" />
          </fieldset>

          <fieldset className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
            <legend className="px-1 text-sm font-semibold text-gray-700">
              Erstfahrzeug (optional)
            </legend>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Marke" name="vehicleMake" />
              <Field label="Modell" name="vehicleModel" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Kennzeichen" name="vehicleLicensePlate" />
              <Field label="Farbe" name="vehicleColor" />
              <SelectField
                label="Typ"
                name="vehicleType"
                defaultValue="PKW"
                options={vehicleTypeOptions}
              />
            </div>
          </fieldset>

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Kunde speichern
          </button>
        </form>
      </div>
    </>
  );
}
