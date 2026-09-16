export function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function optionalStr(formData: FormData, key: string): string | null {
  const value = str(formData, key);
  return value.length > 0 ? value : null;
}

export function numberOrNull(formData: FormData, key: string): number | null {
  const value = str(formData, key);
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function dateOrNull(formData: FormData, key: string): Date | null {
  const value = str(formData, key);
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}
