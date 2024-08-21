'use client'

import { createContext, useState } from 'react'
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Theme
export function ThemeProvider({ children, ...props }) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// Product
export const ProductContext = createContext({})

export function ProductProvider({ children }) {
    const [contextValue, setContextValue] = useState({ product: {}, variantIndex: 0 });
    return <ProductContext.Provider value={[contextValue, setContextValue]}>{children}</ProductContext.Provider>
}

// Cart
export const CartContext = createContext([])

export function CartProvider({ children }) {
    const [contextValue, setContextValue] = useState([{}]);
    return <CartContext.Provider value={[contextValue, setContextValue]}>{children}</CartContext.Provider>
}