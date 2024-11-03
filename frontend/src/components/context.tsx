'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { CartContextType, CartType, FavoriteType, UserType } from '@/types/types'
import { getCartsFromCartsLight, getCookie, getFavoritesFromFavoritesLight, setCookie } from '@/actions/get-data'
import { getCartsLight, getFavoritesLight } from '@/actions/firebase'

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
export const CartContext = createContext<[CartContextType, React.Dispatch<React.SetStateAction<CartContextType>>]>([null, null!]);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [contextValue, setContextValue] = useState<CartContextType>(null);
    return <CartContext.Provider value={[contextValue, setContextValue]}>{children}</CartContext.Provider>
}

// Favorites
export const FavoritesContext = createContext<[FavoriteType[], React.Dispatch<React.SetStateAction<FavoriteType[]>>]>([[], () => { }]);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const [contextValue, setContextValue] = useState<FavoriteType[]>([]);
    return <FavoritesContext.Provider value={[contextValue, setContextValue]}>{children}</FavoritesContext.Provider>
}

// User
export const UserContext = createContext<[UserType, React.Dispatch<React.SetStateAction<UserType>>]>([{ cart: [], cartQuantity: -1 }, null!]);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [contextValue, setContextValue] = useState<UserType>({ id: "" });
    return <UserContext.Provider value={[contextValue, setContextValue]}>{children}</UserContext.Provider>
}


export const ContextListeners = ({ loggedUserId }: { loggedUserId?: string }) => {
    const [userContext, setUserContext] = useContext(UserContext)
    const [cartContext, setCartContext] = useContext(CartContext)
    const [favoritesContext, setFavoritesContext] = useContext(FavoritesContext)

    //At start
    useEffect(() => {
        getCookie<string>("cookieID").then(async userID => {
            console.log("cookie", userID, "user", loggedUserId)
            if (loggedUserId)
                userID = loggedUserId
            if (userID) {
                await (async () => {
                    const cartLight = await getCartsLight(userID)
                    if (cartLight instanceof Error) {
                        setCartContext([])
                        return console.log("Error cartLight:", cartLight.message)
                    }
                    const cart = await getCartsFromCartsLight(cartLight)
                    console.log(cart)
                    if (cart instanceof Error || !cart) {
                        setCartContext([])
                        return console.log("Error cart:", cart.message)
                    }
                    setCartContext(cart)
                })();
                await (async () => {
                    const favoritesLight = await getFavoritesLight(userID)
                    if (favoritesLight instanceof Error) {
                        setFavoritesContext([])
                        return console.log("Error favoritesLight:", favoritesLight.message)
                    }
                    const favorites = await getFavoritesFromFavoritesLight(favoritesLight)
                    console.log(favorites)
                    if (favorites instanceof Error || !favorites) {
                        setFavoritesContext([])
                        return console.log("Error favorites:", favorites.message)
                    }
                    setFavoritesContext(favorites)
                })();
            }
            else {
                setCartContext([])
                setFavoritesContext([])
            }
            setUserContext({ id: userID ?? "noid" })
            console.log("started id:", userID, userID ?? "noid")
        })
    }, [loggedUserId])

    //Listeners
    useEffect(() => {
        if (userContext.id === "noid" || !userContext.id || loggedUserId)
            return
        setCookie("cookieID", userContext.id, { maxAge: 31536000 })
    }, [userContext.id])

    return <></>
}