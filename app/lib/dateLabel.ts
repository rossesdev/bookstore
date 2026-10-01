export function dateLabel(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T/.test(value)) return value;
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
