import { clsx } from "clsx"
import { ClassNameValue, twMerge } from "tailwind-merge"

export function cn(...inputs: ClassNameValue[]) {
  return twMerge(clsx(inputs))
}

export const formattedPrice = (price: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(price);

export const formattedDate = (dateInMinuts: number) => {
  const date = new Date(dateInMinuts * 60000);
  const currentYear = date.getFullYear();
  const formatted = date.toLocaleString('it-IT', { day: '2-digit', month: 'long', year: (new Date().getFullYear() !== date.getFullYear() ? 'numeric' : undefined) });
  return formatted.replace(' ', ' ').replace(`, ${currentYear}`, '');
};