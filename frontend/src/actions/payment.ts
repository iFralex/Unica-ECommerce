"use server"
import { redirect } from "next/navigation"
import { getAuthToken } from "./auth"
import { createOrder, deleteCart, getCartsLight } from "./firebase"
import { getCartsFromCartsLight, getPricesFromCartsLight } from "./get-data"

export const payOrder = async () => {
    try {
        console.log("paga")
        const tokens = await getAuthToken()
        if (!tokens)
            return null
        const userId = tokens.decodedToken.uid
        const cartLight = await getCartsLight(userId)
        if (cartLight instanceof Error)
            return null
        const prices = await getPricesFromCartsLight(cartLight)
        if (typeof prices === "string")
            return null
        const totalPrice = prices.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)
        await createOrder(userId, { items: cartLight, createdDate: Math.floor(Date.now() / 60000), paymentId: "1235", shippingId: "54123", price: totalPrice })
        await deleteCart(userId)
        console.log("fatto")
        return true
    } catch (err) {
        console.error((err as Error).message)
        return null
    }
}