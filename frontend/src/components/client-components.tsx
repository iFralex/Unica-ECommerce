"use client"

import { ShoppingCart, ShoppingBag, CircleHelp } from "lucide-react"
import { Button } from "@/components/ui/button"
import QuantitySelection from "@/components/ui/quantity-selection"
import Price from "@/components/ui/price"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { useContext, useEffect, useState } from "react"
import { CartContext, ProductContext, UserContext } from "./context"
import { APIResponseData, CartVisualizzation } from "@/types/strapi-types"
import { getCartVisualizzationData } from "@/actions/get-data"
import { CartLiteType, CartType, Vector2 } from "@/types/types"
import { addToCartItem, pushCartData, setNewCartItem } from "@/actions/firebase"
import { useRouter } from "next/navigation"
import Image from "next/image"

const ProductVariants = ({ product }: { product: APIResponseData<"api::product.product"> }) => {
    const variants = product.attributes.ProductDetails
    if (!variants)
        return <></>
    const [contextValue, setContextValue] = useContext(ProductContext);
    const [cartContext, setCartContext] = useContext(CartContext)
    const [userContext, setUserContext] = useContext(UserContext)
    const [quantity, setQuantity] = useState(1);
    const [cartVisual, setCartVisual] = useState<CartVisualizzation[]>(null!)
    const { toast } = useToast()
    const router = useRouter()

    useEffect(() => {
        getCartVisualizzationData(product.id).then(r => {
            if (r instanceof Error)
                console.log(r);
            else
                setCartVisual(r)
        })
    }, [])

    const handleVariantChange = (i: number) => {
        contextValue.variantIndex = i
        setContextValue({ ...contextValue, variantIndex: i })
    }

    const handleQuantity = (incr: number) => {
        setQuantity(quantity + incr)
    }

    const handleAddCart = async () => {
        console.log("id i:", userContext.id)
        if (!userContext.id)
            return
        let cookieID = userContext.id
        if (userContext.id === "noid") {
            const dbResult = await pushCartData(variants[contextValue.variantIndex].id, { productId: product.id, quantity: quantity, variantIndex: contextValue.variantIndex })
            if (dbResult instanceof Error || !dbResult) {
                console.log("error:", dbResult)
                return
            }
            cookieID = dbResult
            setUserContext({ id: cookieID })
        }

        let existingItem: boolean = false
        let i = 0
        for (i = 0; i < cartContext.cart.length; i++)
            if (cartContext.cart[i].variant.id === variants[contextValue.variantIndex].id) {
                cartContext.cart[i].quantity += quantity
                existingItem = true
                break
            }

        cartContext.cartQuantity += quantity

        if (existingItem) {
            let result = await addToCartItem(cookieID, variants[contextValue.variantIndex].id, cartContext.cart[i].quantity)
            if (result instanceof Error) {
                console.log("error: no salvato", result)
                return
            }
            setCartContext({ cart: cartContext.cart, cartQuantity: cartContext.cartQuantity })
        } else {
            let result = await setNewCartItem(cookieID, variants[contextValue.variantIndex].id, { productId: product.id, quantity: quantity, variantIndex: contextValue.variantIndex })
            if (result instanceof Error) {
                console.log("error: no salvato", result)
                return
            }
            setCartContext({
                cartQuantity: cartContext.cartQuantity
                , cart: cartContext.cart.concat({
                    id: product.id,
                    name: product.attributes.Name ?? "",
                    sku: product.attributes.SKU ?? "",
                    quantity: quantity,
                    variant: variants[contextValue.variantIndex],
                    textureURL: cartVisual[contextValue.variantIndex].Texture?.data?.attributes.formats?.medium.url ?? "",
                    size: cartVisual[contextValue.variantIndex].Size as unknown as Vector2
                })
            })
        }

        toast({
            title: product.attributes.Name + " x" + quantity,
            description: "Hai aggiunto " + product.attributes.Name + " al carrello",
            action: (
                <ToastAction onClick={() => router.push("/cart")} altText="Vai al carrello">Vai al carrello</ToastAction>
            ),
            image: (
                <Image src={process.env.DOMAIN_URL + variants[contextValue.variantIndex].Images?.data[0].attributes.formats?.thumbnail.url ?? ""} alt={variants[contextValue.variantIndex].Images?.data[0].attributes.alternativeText ?? ""} width={variants[contextValue.variantIndex].Images?.data[0].attributes.formats?.thumbnail.width} height={variants[contextValue.variantIndex].Images?.data[0].attributes.formats?.thumbnail.height}/>
            )
        })
    }

    return (<>
        <div className="flex items-center flex-wrap">
            <div className="flex items-center mt-3 mr-5">
                <span className="text-foreground mr-2">Materiale: </span>
                <Badge variant="outline" className="min-h-8">
                    <div className="flex items-center justify-start flex-no-wrap">
                        <div className="w-4 h-4 rounded-full inline-block mr-1" style={{ backgroundColor: "#" + variants[contextValue.variantIndex].Material.data.attributes.Color }} />
                        <span>{variants[contextValue.variantIndex].Material?.data.attributes.Name}</span>
                        <HoverCard>
                            <HoverCardTrigger><CircleHelp className="ml-2 text-foreground h-4" /></HoverCardTrigger>
                            <HoverCardContent>
                                <p>{variants[contextValue.variantIndex].Material?.data.attributes.Description}</p>
                            </HoverCardContent>
                        </HoverCard>
                    </div>
                </Badge>
            </div>

            <div className="flex items-center mt-3">
                <span className="text-foreground mr-2">Placcatura:</span>
                {variants.length > 1 ? <Select onValueChange={v => handleVariantChange(parseInt(v))} defaultValue={contextValue.variantIndex.toString()}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleziona una variante" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {variants.map((v, i) =>
                                <SelectItem key={i} value={i.toString()}>
                                    <div className="flex items-center justify-start flex-wrap space-x-2 mr-3">
                                        {v.Platings?.data.map((p, i) => <span key={i} className="flex items-center justify-start flex-no-wrap">
                                            <div className="w-4 h-4 rounded-full inline-block mr-1" style={{ backgroundColor: "#" + p.attributes.Color }} />
                                            <span>{p.attributes.Name}</span>
                                        </span>)}
                                    </div>
                                </SelectItem>)}
                        </SelectGroup>
                    </SelectContent>
                </Select> :
                    <Badge variant="outline" className="min-h-8">
                        <div className="flex items-center justify-start flex-wrap space-x-2 mr-3">
                            {variants[contextValue.variantIndex].Platings?.data.map((p, i) => <span key={i} className="flex items-center justify-start flex-no-wrap">
                                <div className="w-4 h-4 rounded-full inline-block mr-1" style={{ backgroundColor: "#" + p.attributes.Color }} />
                                <span>{p.attributes.Name}</span>
                            </span>)}
                        </div>
                    </Badge>}
            </div>
        </div>

        <Separator className="my-4" />
        <div className="flex items-center justify-center md:justify-start flex-wrap space-x-5 mb-4">
            <QuantitySelection handleQuantity={handleQuantity} quantity={quantity} />
            <Price price={variants[contextValue.variantIndex].Price ?? 0} />
        </div>

        <div className="flex items-center flex-wrap justify-center md:justify-start">
            <Button disabled={!userContext.id} size="lg" variant="buy" className="mr-6 mb-4" onClick={handleAddCart}>
                <ShoppingCart size={25} strokeWidth={3} className="mr-3" />
                Aggiungi al Carrello
            </Button>
            <Button size="lg" className="mb-4">
                Salva per dopo
                <ShoppingBag size={25} strokeWidth={3} className="ml-3" />
            </Button>
        </div>
    </>)
}

export { ProductVariants }