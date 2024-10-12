import { formattedPrice } from "@/lib/utils"

const Price = ({ price, size, mb4 = true, title, color = "black" }: {price: number, size?: number, mb4?: boolean, title?: string, color?: string }) => {
    return (
        <div className={mb4 === false ? "" : "mb-4"}>
            <div className="text-[0.70rem] text-muted-foreground">
                {title ?? "Prezzo"}
            </div>
            <div className={"text-" + color + " font-bold tracking-tighter text-" + (size ?? 5).toString() + "xl"}>
                {formattedPrice(price)}
            </div>
        </div>
    )
}

export default Price;