"use client"

import { useContext, useState } from "react"
import { CartContext, FavoritesContext, UserContext } from "./context"
import { Button } from "./ui/button"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Badge } from "./ui/badge"
import { Separator } from "./ui/separator"
import { Heart, ShoppingCart, Trash, Trash2 } from "lucide-react"
import { AddItemToCart, AddOrRemoveItemToFavorites } from "./client-components"
import { Card } from "./ui/card"
import { useToast } from "./ui/use-toast"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { CharityBadge } from "./charity-blind"

export const FavoritesList = () => {
    const [favorites, setFavorites] = useContext(FavoritesContext)
    const [userContext, setUserContext] = useContext(UserContext)
    if (!favorites.length)
        return <Card className="min-h-[300px] text-center flex items-center justify-center mt-3 p-3">
            {userContext.id ? <div>
                <p>La tua lista dei Preferiti è ancora vuota.</p>
                <p className="text-base">
                    Per aggiungere un gioiello, premi il pulsante con l'icona{' '}
                    <span className="inline-flex items-center whitespace-nowrap">
                        <Heart strokeWidth={0} fill="red" size={25} style={{ transform: "TranslateY(5px)" }} />
                        <span className="sr-only">Aggiungi ai Preferiti</span>
                    </span>{' '}
                    nella pagina prodotto.
                </p>
            </div> : <p>Caricamento...</p>
}
        </Card>

    const router = useRouter()
    const [cartContext, setCartContext] = useContext(CartContext)
    const [loading, setLoading] = useState(new Array(favorites.length).fill(false))
    const { toast } = useToast()

    return <ScrollArea className="h-full">
        {favorites.map((f, i) => (
            <Card key={i} className="flex items-center space-x-3 my-4 pb-3">
                <div className="flex-1 flex justify-center">
                    <Image src={process.env.DOMAIN_URL + f.variant.Images?.data[0].attributes.formats?.thumbnail.url} width={f.variant.Images?.data[0].attributes.formats?.thumbnail.width} height={f.variant.Images?.data[0].attributes.formats?.thumbnail.height} alt="Immagine di prodotto" />
                </div>
                <div className="min-w-[75%] flex-1">
                    <Button variant={"link"} className="m-0 p-0" onClick={() => { router.push("/" + f.urlPath) }}>
                        <h2 className="font-bold text-xl">
                            {f.name}
                        </h2>
                    </Button>
                    <div className="flex space-x-3 flex-wrap">
                        <Badge variant="outline" className="bg-white min-h-8 mb-1">
                            <div className="flex items-center justify-start flex-no-wrap">
                                <div className="w-4 h-4 rounded-full inline-block mr-1" style={{ backgroundColor: "#" + f.variant.Material.data.attributes.Color }} />
                                <span>{f.variant.Material?.data.attributes.Name}</span>
                            </div>
                        </Badge>
                        <Badge variant="outline" className="min-h-8  mb-1">
                            <div className="flex items-center justify-center flex-wrap space-x-2">
                                {f.variant.Platings?.data.map((p, i) => <span key={i} className="flex items-center justify-center">
                                    <div className="w-4 h-4 rounded-full inline-block" style={{ backgroundColor: "#" + p.attributes.Color }} />
                                </span>)}
                            </div>
                        </Badge>
                    </div>
                    <p className="line-clamp-2 mb-2">{f.shortDescription}</p>
                    {f.charity && <CharityBadge CampaignName={f.charity?.CharityCampaign?.data.attributes.Name} DonatedMoney={f.charity?.DonatedMoney} productName={f.name} url={"/" + f.charity?.CharityCampaign?.data.attributes.SKU}/>}
                    <div className="max-w-full flex space-x-1 mt-[-7px]">
                        <div className="flex-1">
                            <Button disabled={loading[i]} variant="buy" className="w-full" onClick={async () => {
                                try {
                                    loading[i] = true
                                    setLoading([...loading])
                                    await AddItemToCart(userContext.id, setUserContext, f.variant.id, f.id, 1, f.variantIndex, cartContext, setCartContext, f.name, toast, router)
                                    loading[i] = false
                                    setLoading([...loading])
                                } catch (err) { console.log("ads") }
                            }}>
                                <ShoppingCart size={25} className="mr-3" />
                                Aggiungi
                            </Button>
                        </div>
                        <Button disabled={loading[i]} variant={"outline"} size={"icon"} className="w-[30px]" onClick={async () => {
                            loading[i] = true
                            setLoading([...loading])
                            await AddOrRemoveItemToFavorites(userContext.id, setUserContext, f.variant.id, f.id, favorites, setFavorites, f.name, f.urlPath, f.shortDescription, f.variant, f.variantIndex, f.charity)
                            loading[i] = false
                            setLoading([...loading])
                        }}>
                            <Trash2 size={25} className="" color="red" strokeWidth={1.5} />
                            <span className="sr-only">Elimina</span>
                        </Button>
                    </div>
                </div>
            </Card>
        ))}
        <ScrollBar />
    </ScrollArea>
}