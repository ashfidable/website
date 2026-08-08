export function formatDate(value: Date | string) {
  const date = new Date(value);
  const day = date.getDate();
  const monthName = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();

  return `${day} ${monthName} ${year}`;
}

export function formatDateSlash(value: Date | string) {
  return new Date(value).toLocaleDateString("en-GB");
}
