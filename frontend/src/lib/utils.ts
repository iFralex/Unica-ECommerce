import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const formattedPrice = price => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(price);
