'use client'

import { createContext, useState } from 'react'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

// Theme
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// Product
export const ProductContext = createContext<[{ variantIndex: number }, React.Dispatch<React.SetStateAction<{ variantIndex: number }>>]>(null!);

export function ProductProvider({ children }: { children: React.ReactNode }) {
    const [contextValue, setContextValue] = useState({ variantIndex: 0 });
    return <ProductContext.Provider value={[contextValue, setContextValue]}>{children}</ProductContext.Provider>
}


// Cart
export const CartContext = createContext<[Object[], React.Dispatch<React.SetStateAction<Object[]>>]>(null!);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [contextValue, setContextValue] = useState([{}]);
    return <CartContext.Provider value={[contextValue, setContextValue]}>{children}</CartContext.Provider>
}