"use client"

import { CartContext } from "@/components/context"
import { CartType } from "@/types/types"
import { useContext } from "react"

export const CartClient = ({children}: {children: React.ReactNode}) => {
    const [cart, _] = useContext(CartContext)
    console.log(cart)
    return <p>{JSON.stringify(cart)}</p>
}