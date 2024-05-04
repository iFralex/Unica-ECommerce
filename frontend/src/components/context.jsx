'use client'

import { createContext, useState } from 'react'

export const ProductContext = createContext({})

export default function ProductProvider({ children }) {
    const [contextValue, setContextValue] = useState({product: {}, variantIndex: 0 });
    return <ProductContext.Provider value={[ contextValue, setContextValue ]}>{children}</ProductContext.Provider>
}