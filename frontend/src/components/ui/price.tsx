import { formattedPrice } from "@/lib/utils"

const Price = ({ price }) => {
    return (
        <div>
            <div className="text-[0.70rem] text-muted-foreground">
                Prezzo
            </div>
            <div className="text-foreground text-5xl font-bold tracking-tighter">
                {formattedPrice(price)}
            </div>
        </div>
    )
}

export default Price;