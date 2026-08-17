export function formatDate(value: Date | string) {
  const date = new Date(value);
  const day = date.getDate();
  const monthName = date.toLocaleString("en-GB", { month: "long" });
  const year = date.getFullYear();

  return `${day} ${monthName} ${year}`;
}
