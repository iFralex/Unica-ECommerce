'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { CartContextType, CartType, UserType } from '@/types/types'
import { getCartFromCartLight, getCookie, setCookie } from '@/actions/get-data'
import { getCartLight } from '@/actions/firebase'

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
export const CartContext = createContext<[CartContextType, React.Dispatch<React.SetStateAction<CartContextType>>]>([{ cart: [], cartQuantity: -1 }, null!]);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [contextValue, setContextValue] = useState<CartContextType>({ cart: [], cartQuantity: -1 });
    return <CartContext.Provider value={[contextValue, setContextValue]}>{children}</CartContext.Provider>
}

// User
export const UserContext = createContext<[UserType, React.Dispatch<React.SetStateAction<UserType>>]>([{ cart: [], cartQuantity: -1 }, null!]);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [contextValue, setContextValue] = useState<UserType>({ id: "" });
    return <UserContext.Provider value={[contextValue, setContextValue]}>{children}</UserContext.Provider>
}


export const ContextListeners = ({ }: {}) => {
    const [userContext, setUserContext] = useContext(UserContext)
    const [cartContext, setCartContext] = useContext(CartContext)

    //At start
    useEffect(() => {
        getCookie<string>("cookieID").then(async r => {
            if (r) {
                const userID = await getCookie("cookieID")
                if (!userID)
                    return <p>Errore: cookie mancanti.</p>
                const cartLight = await getCartLight(userID)
                if (cartLight instanceof Error)
                    return <p>{cartLight.message}</p>
                const cart = await getCartFromCartLight(cartLight)
                console.log(cart)
                if (cart instanceof Error || !cart)
                    return <p>{cart.message}</p>
                setCartContext({cart: cart, cartQuantity: cartContext.cartQuantity})
            }
            setUserContext({ id: r ?? "noid" })
            console.log("started id:", r, r ?? "noid")
        })

        getCookie<string>("cartQuantity").then(r => {
            setCartContext({ cart: cartContext.cart, cartQuantity: parseInt(r ?? 0) })
        })
    }, [])

    //Listeners
    useEffect(() => {
        console.log(" id:", userContext.id)
        if (userContext.id === "noid" || !userContext.id)
            return
        setCookie("cookieID", userContext.id, { maxAge: 31536000 })
    }, [userContext.id])

    useEffect(() => {
        if (cartContext.cartQuantity === -1)
            return
        setCookie("cartQuantity", cartContext.cartQuantity.toString(), { maxAge: 31536000 })
    }, [cartContext.cartQuantity])

    return <></>
}