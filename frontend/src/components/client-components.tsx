"use client"

import { ShoppingCart, ShoppingBag, CircleHelp, Heart } from "lucide-react"
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
import { CartContext, FavoritesContext, ProductContext, UserContext } from "./context"
import { APIResponseData, CartVisualizzation } from "@/types/strapi-types"
import { getCartFromCartLight, getCartVisualizzationData } from "@/actions/get-data"
import { CartContextType, CartLiteType, CartType, FavoriteType, UserType, VariantType, Vector2 } from "@/types/types"
import { addToCartItem, deleteCartItem, deleteFavoriteItem, getCartLight, pushCartData, pushFavoritesData, setNewCartItem, setNewFavoriteItem } from "@/actions/firebase"
import { redirect, useRouter } from "next/navigation"
import Image from "next/image"
import { isCharity } from "@/lib/utils"
import { CharityBadge } from "./charity-blind"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

const ProductVariants = ({ product }: { product: APIResponseData<"api::product.product"> }) => {
    const variants = product.attributes.ProductDetails
    if (!variants)
        return <></>
    const [contextValue, setContextValue] = useContext(ProductContext);
    const [cartContext, setCartContext] = useContext(CartContext)
    const [favoritesContext, setFavoritesContext] = useContext(FavoritesContext)
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
            await AddItemToCart(userContext.id, setUserContext, variants[contextValue.variantIndex].id, product.id, quantity, contextValue.variantIndex, cartContext, setCartContext, product.attributes.Name ?? "", toast, router)
        } catch (err) {
            console.error("Add to cart", err)
        }
    }

    const handleAddOrRemoveFavorite = async () => {
        try {
            await AddOrRemoveItemToFavorites(userContext.id, setUserContext, variants[contextValue.variantIndex].id, product.id, favoritesContext, setFavoritesContext, product.attributes.Name ?? "", (product.attributes.Category?.data.attributes.SKU ?? "") + "/" + (product.attributes.SKU ?? ""), product.attributes.ShortDescription ?? "", variants[contextValue.variantIndex], contextValue.variantIndex, product.attributes.Description?.find(d => d.__component === "product.charity-link"), toast, router)
        } catch (err) {
            console.error("Add to favorites", err)
        }
    }

    return (<>
        <div className="flex items-center flex-wrap">
            <div className="flex items-center mt-3 mr-5">
                <span className="text-foreground mr-2">Materiale: </span>
                <Badge variant="secondary" className="bg-white min-h-8">
                    <div className="flex items-center justify-start flex-no-wrap">
                        <div className="w-4 h-4 rounded-full inline-block mr-1" style={{ backgroundColor: "#" + variants[contextValue.variantIndex].Material.data.attributes.Color }} />
                        <span>{variants[contextValue.variantIndex].Material?.data.attributes.Name}</span>
                        <HoverCard>
                            <HoverCardTrigger><CircleHelp strokeWidth={1.2} className="ml-2 text-foreground h-4" /></HoverCardTrigger>
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
                    <SelectTrigger className="w-full text-forground">
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
        {(() => {
            const data = product.attributes.Description?.find(d => d.__component === "product.charity-link")
            return data?.CharityCampaign && <CharityBadge CampaignName={data.CharityCampaign.data.attributes.Name} DonatedMoney={data.DonatedMoney} productName={product.attributes.Name} url="#charity" />
        })()}

        <div className="flex items-center flex-wrap space-x-2 justify-center md:justify-start">
            <Button disabled={!userContext.id} size="lg" variant="buy" className="flex-1" onClick={handleAddCart}>
                <ShoppingCart size={25} className="mr-3" />
                Aggiungi al Carrello
            </Button>
            <Button size="icon" disabled={!userContext.id} onClick={handleAddOrRemoveFavorite}>
                <Heart fill={!userContext.id ? "black" : favoritesContext.find(f => f.variant.id === variants[contextValue.variantIndex].id) ? "red" : "white"} size={25} strokeWidth={0} />
            </Button>
        </div>
    </>)
}

export const AddItemToCart = async (userId: string, setUserContext: Dispatch<SetStateAction<UserType>>, variantId: number, productId: number, increaseQuantity: number, variantIndex: number, cartContext: CartContextType, setCartContext: Dispatch<SetStateAction<CartContextType>>, name: string, toast?: ({ ...props }: {}) => void, router?: AppRouterInstance) => {
    if (!userId || !cartContext)
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
    let variant: VariantType | null = null
    for (i = 0; i < cartContext.length; i++)
        if (cartContext[i].variant.id === variantId) {
            cartContext[i].quantity += increaseQuantity
            existingItem = true
            break
        }

    if (existingItem) {
        let result = await (cartContext[i].quantity > 0 ? addToCartItem(cookieID, variantId, cartContext[i].quantity)
            : deleteCartItem(cookieID, variantId))
        if (cartContext[i].quantity <= 0)
            if (result instanceof Error) {
                console.log("error: no salvato", result)
                return
            }
        variant = cartContext[i].variant
        cartContext.splice(i, cartContext[i].quantity > 0 ? 0 : 1)
        setCartContext(cartContext.map(i => i))
    } else {
        const cartLight = { productId: productId, quantity: increaseQuantity, variantIndex: variantIndex }
        let result = await setNewCartItem(cookieID, variantId, cartLight)
        console.log("ciao")
        if (result instanceof Error) {
            console.log("error: no salvato", result)
            return
        }

        let cart = await getCartFromCartLight(cartLight)
        if (typeof cart === "string") {
            console.log("error: no salvato", cart)
            return
        }
        setCartContext(cartContext.concat(cart))
        variant = cart.variant
    }

    if (toast && variant)
        toast({
            title: name + " x" + increaseQuantity,
            description: "Hai aggiunto " + name + " al carrello",
            action: (
                <ToastAction onClick={() => router?.push("/carrello", { scroll: false })} altText="Vai al carrello"><ShoppingCart strokeWidth={1.5} color="white" size={20} className="mr-1" />Vai al Carrello</ToastAction>
            ),
            image: (
                <Image src={process.env.DOMAIN_URL + variant.Images?.data[0].attributes.formats?.thumbnail.url ?? ""} alt={variant.Images?.data[0].attributes.alternativeText ?? ""} width={variant.Images?.data[0].attributes.formats?.thumbnail.width} height={variant.Images?.data[0].attributes.formats?.thumbnail.height} />
            )
        })
}

export const AddOrRemoveItemToFavorites = async (userId: string, setUserContext: Dispatch<SetStateAction<UserType>>, variantId: number, productId: number, favoritesContext: FavoriteType[], setFavoritesContext: Dispatch<SetStateAction<FavoriteType[]>>, name: string, urlPath: string, shortDescription: string, variant: VariantType, variantIndex: number, charity: FavoriteType["charity"], toast?: ({ ...props }: {}) => void, router?: AppRouterInstance) => {
    if (!userId)
        return
    let cookieID = userId
    if (userId === "noid") {
        const dbResult = await pushFavoritesData(variantId, productId)
        if (dbResult instanceof Error || !dbResult) {
            console.log("error:", dbResult)
            return
        }
        cookieID = dbResult
        setUserContext({ id: cookieID })
    }

    let existingItem = false
    let added: boolean | null = null
    let i = 0
    for (i = 0; i < favoritesContext.length; i++)
        if (favoritesContext[i].variant.id === variantId) {
            existingItem = true
            break
        }

    if (existingItem) {
        let result = await deleteFavoriteItem(cookieID, variantId)
        if (result instanceof Error) {
            console.log("error: no salvato", result)
            return
        }
        favoritesContext.splice(i, 1)
        setFavoritesContext([...favoritesContext])
        added = false
    } else {
        let result = await setNewFavoriteItem(cookieID, variantId, productId)
        if (result instanceof Error) {
            console.log("error: no salvato", result)
            return
        }
        setFavoritesContext(favoritesContext.concat({
            id: productId,
            name: name,
            shortDescription: shortDescription,
            urlPath: urlPath,
            variant: variant,
            variantIndex: variantIndex,
            charity: charity
        }))
        added = true
    }
    if (toast)
        toast({
            title: (added ? "+ " : "- ") + name,
            description: "Hai " + (added ? "aggiunto " : "rimosso ") + name + (added ? " ai" : " dai") + " preferiti",
            action: (
                <ToastAction onClick={() => router?.push("/preferiti", { scroll: false })} altText="Vai ai Preferiti"><Heart strokeWidth={0} fill={added ? "red" : "white"} size={20} className="mr-1" />Vai ai Preferiti</ToastAction>
            ),
            image: (
                <Image src={process.env.DOMAIN_URL + variant.Images?.data[0].attributes.formats?.thumbnail.url ?? ""} alt={variant.Images?.data[0].attributes.alternativeText ?? ""} width={variant.Images?.data[0].attributes.formats?.thumbnail.width} height={variant.Images?.data[0].attributes.formats?.thumbnail.height} />
            )
        })
    return added
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