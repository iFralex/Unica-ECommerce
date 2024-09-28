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
import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react"
import { CartContext, ProductContext, UserContext } from "./context"
import { APIResponseData, CartVisualizzation } from "@/types/strapi-types"
import { getCartVisualizzationData } from "@/actions/get-data"
import { CartContextType, CartLiteType, CartType, UserType, VariantType, Vector2 } from "@/types/types"
import { addToCartItem, deleteCartItem, pushCartData, setNewCartItem } from "@/actions/firebase"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { isCharity } from "@/lib/utils"

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
        try {
            await AddItemToCart(userContext.id, setUserContext, variants[contextValue.variantIndex].id, product.id, quantity, contextValue.variantIndex, cartContext, setCartContext, product.attributes.Name ?? "", (product.attributes.Category?.data.attributes.SKU ?? "") + "/" + (product.attributes.SKU ?? ""), product.attributes.ShortDescription ?? "", variants[contextValue.variantIndex], cartVisual[contextValue.variantIndex].Texture?.data?.attributes.formats?.medium.url ?? "", cartVisual[contextValue.variantIndex].Size as unknown as Vector2)

            toast({
                title: product.attributes.Name + " x" + quantity,
                description: "Hai aggiunto " + product.attributes.Name + " al carrello",
                action: (
                    <ToastAction onClick={() => router.push("/cart", { scroll: false })} altText="Vai al carrello">Vai al carrello</ToastAction>
                ),
                image: (
                    <Image src={process.env.DOMAIN_URL + variants[contextValue.variantIndex].Images?.data[0].attributes.formats?.thumbnail.url ?? ""} alt={variants[contextValue.variantIndex].Images?.data[0].attributes.alternativeText ?? ""} width={variants[contextValue.variantIndex].Images?.data[0].attributes.formats?.thumbnail.width} height={variants[contextValue.variantIndex].Images?.data[0].attributes.formats?.thumbnail.height} />
                )
            })
        } catch (err) {
            console.error("Add to cart", err)
        }
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
        <div className="flex items-start justify-center md:justify-start flex-wrap space-x-5">
            <QuantitySelection handleQuantity={handleQuantity} quantity={quantity} />
            <Price price={variants[contextValue.variantIndex].Price ?? 0} />
        </div>

        <div className="flex items-center flex-wrap justify-center md:justify-start">
            <Button disabled={!userContext.id} size="lg" variant="buy" className="mr-6 mb-4 w-full md:w-auto" onClick={handleAddCart}>
                <ShoppingCart size={25} strokeWidth={3} className="mr-3" />
                Aggiungi al Carrello
            </Button>
            <Button size="lg" className="mb-4 w-full md:w-auto">
                Salva per dopo
                <ShoppingBag size={25} strokeWidth={3} className="ml-3" />
            </Button>
        </div>
    </>)
}

export const AddItemToCart = async (userId: string, setUserContext: Dispatch<SetStateAction<UserType>>, variantId: number, productId: number, increaseQuantity: number, variantIndex: number, cartContext: CartContextType, setCartContext: Dispatch<SetStateAction<CartContextType>>, name: string, urlPath: string, shortDescription: string, variant: VariantType, textureUrl: string, size: Vector2) => {
    console.log("a", userId)
    if (!userId)
        return
    let cookieID = userId
    if (userId === "noid") {
        const dbResult = await pushCartData(variantId, { productId: productId, quantity: increaseQuantity, variantIndex: variantIndex })
        if (dbResult instanceof Error || !dbResult) {
            console.log("error:", dbResult)
            return
        }
        cookieID = dbResult
        setUserContext({ id: cookieID })
    }

    let existingItem = false
    let i = 0
    for (i = 0; i < cartContext.cart.length; i++)
        if (cartContext.cart[i].variant.id === variantId) {
            cartContext.cart[i].quantity += increaseQuantity
            existingItem = true
            break
        }

    cartContext.cartQuantity += increaseQuantity

    if (existingItem) {
        let result = await (cartContext.cart[i].quantity > 0 ? addToCartItem(cookieID, variantId, cartContext.cart[i].quantity)
            : deleteCartItem(cookieID, variantId))
        if (cartContext.cart[i].quantity <= 0)

            if (result instanceof Error) {
                console.log("error: no salvato", result)
                return
            }
        cartContext.cart.splice(i, cartContext.cart[i].quantity > 0 ? 0 : 1)
        console.log("update", cartContext.cart)
        setCartContext({ cart: cartContext.cart, cartQuantity: cartContext.cartQuantity })
    } else {
        let result = await setNewCartItem(cookieID, variantId, { productId: productId, quantity: increaseQuantity, variantIndex: variantIndex })
        if (result instanceof Error) {
            console.log("error: no salvato", result)
            return
        }
        setCartContext({
            cartQuantity: cartContext.cartQuantity
            , cart: cartContext.cart.concat({
                id: productId,
                name: name,
                shortDescription: shortDescription,
                urlPath: urlPath,
                quantity: increaseQuantity,
                variant: variant,
                textureURL: textureUrl,
                size: size,
                charity: isCharity(urlPath.split("/")[0])
            })
        })
    }
}

export const useMedia = (query: string) => {
    const [matches, setMatches] = useState(false);
  
    useEffect(() => {
      const media = window.matchMedia(query);
      if (media.matches !== matches) {
        setMatches(media.matches);
      }
      const listener = () => setMatches(media.matches);
      media.addListener(listener);
      return () => media.removeListener(listener);
    }, [matches, query]);
  
    return matches;
  };

export { ProductVariants }