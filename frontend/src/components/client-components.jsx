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
import { useContext } from "react"
import { ProductContext } from "./context"

const ProductVariants = ({ variants }) => {
    const [contextValue, setContextValue] = useContext(ProductContext);

    const handleVariantChange = i => {
        contextValue.variantIndex = i
        setContextValue({...contextValue, variantIndex: i})
    }

    return (<>
        <div className="flex items-center flex-wrap">
            <div className="flex items-center mt-3 mr-5">
                <span className="text-foreground mr-2">Materiale: </span>
                <Badge variant="outline" className="min-h-8">
                    <div className="flex items-center justify-start flex-no-wrap">
                        <div className="w-4 h-4 rounded-full inline-block mr-1" style={{ backgroundColor: "#" + variants[contextValue.variantIndex].Material.data.attributes.Color }} />
                        <span>{variants[contextValue.variantIndex].Material.data.attributes.Name}</span>
                        <HoverCard>
                            <HoverCardTrigger><CircleHelp className="ml-2 text-foreground h-4" /></HoverCardTrigger>
                            <HoverCardContent>
                                <p>{variants[contextValue.variantIndex].Material.data.attributes.Description}</p>
                            </HoverCardContent>
                        </HoverCard>
                    </div>
                </Badge>
            </div>

            <div className="flex items-center mt-3">
                <span className="text-foreground mr-2">Placcatura:</span>
                {variants.length > 1 ? <Select onValueChange={handleVariantChange} defaultValue={contextValue.variantIndex} className="text-foreground">
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleziona una variante" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {variants.map((v, i) =>
                                <SelectItem key={i} value={i}>
                                    <div className="flex items-center justify-start flex-wrap space-x-2 mr-3">
                                        {v.Platings.data.map(p => <span key={p} className="flex items-center justify-start flex-no-wrap">
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
                            {variants[contextValue.variantIndex].Platings.data.map(p => <span className="flex items-center justify-start flex-no-wrap">
                                <div className="w-4 h-4 rounded-full inline-block mr-1" style={{ backgroundColor: "#" + p.attributes.Color }} />
                                <span>{p.attributes.Name}</span>
                            </span>)}
                        </div>
                    </Badge>}
            </div>
        </div>

        <Separator className="my-4" />
        <div className="flex items-center justify-center md:justify-start flex-wrap space-x-5 mb-4">
            <QuantitySelection />
            <Price price={variants[contextValue.variantIndex].Price} />
        </div>

        <div className="flex items-center flex-wrap justify-center md:justify-start">
            <Button size="lg" variant="buy" className="mr-6 mb-4">
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