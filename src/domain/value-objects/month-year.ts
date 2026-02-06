const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTH_NAMES_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export interface MonthYear {
  month: number; // 1-12
  year: number;
}

export function getCurrentMonthYear(): MonthYear {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function getPreviousMonthYear(my: MonthYear): MonthYear {
  if (my.month === 1) return { month: 12, year: my.year - 1 };
  return { month: my.month - 1, year: my.year };
}

export function getNextMonthYear(my: MonthYear): MonthYear {
  if (my.month === 12) return { month: 1, year: my.year + 1 };
  return { month: my.month + 1, year: my.year };
}

export function formatMonthYear(my: MonthYear): string {
  return `${MONTH_NAMES[my.month - 1]} ${my.year}`;
}

export function formatMonthYearEs(my: MonthYear): string {
  return `${MONTH_NAMES_ES[my.month - 1]} ${my.year}`;
}

export function monthYearToString(my: MonthYear): string {
  return `${my.year}-${String(my.month).padStart(2, "0")}`;
}

export function parseMonthYear(str: string): MonthYear {
  const [year, month] = str.split("-").map(Number);
  return { month, year };
}
