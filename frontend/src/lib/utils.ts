import { clsx } from "clsx"
import { ClassNameValue, twMerge } from "tailwind-merge"

export function cn(...inputs: ClassNameValue[]) {
  return twMerge(clsx(inputs))
}

export const isCharity = (category: string | undefined) => category === "ciondoli"

export const formattedPrice = price => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(price);