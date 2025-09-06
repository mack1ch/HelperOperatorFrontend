export function formatDateToDayMonthYearFormat(dateValue: Date): {
  day: number;
  month: string;
  year: number;
} {
  const months: string[] = [
    "январь",
    "февраль",
    "март",
    "апрель",
    "май",
    "июнь",
    "июль",
    "август",
    "сентябрь",
    "октябрь",
    "ноябрь",
    "декабрь",
  ];

  const date = new Date(dateValue);
  const day: number = date.getDate();
  const month: string = months[date.getMonth()];
  const year: number = date.getFullYear();

  return { day, month, year };
}

export function formatDateToDDMMYYYY(dateValue: Date): string {
  const date = new Date(dateValue);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const dayString = day < 10 ? `0${day}` : `${day}`;
  const monthString = month < 10 ? `0${month}` : `${month}`;

  return `${dayString}.${monthString}.${year}`;
}

// Всегда возвращает Date, даже если вход мусор — удобно для IMessage.createdAt
export const toDateStrict = (v: unknown): Date => {
  if (v instanceof Date) return v;
  if (typeof v === "string" || typeof v === "number") {
    const d = new Date(v);
    return isNaN(+d) ? new Date() : d;
  }
  return new Date();
};

// Возвращает Date | undefined — для опциональных полей IIssue
export const toDateOptional = (v: unknown): Date | undefined => {
  if (v == null) return undefined;

  if (v instanceof Date) return v;
  if (typeof v === "string" || typeof v === "number") {
    const d = new Date(v);
    return isNaN(+d) ? undefined : d;
  }

  return undefined;
};
