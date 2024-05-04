"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"

const QuantitySelection = () => {
    const [quantity, setQuantity] = useState(1);

    const handleQuantity = incr => setQuantity(quantity + incr)
    return (
        <div>
            <div className="text-[0.70rem] text-muted-foreground">
                Quantità
            </div>
            <div className="flex items-center justify-center space-x-3">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-full"
                    onClick={() => handleQuantity(-1)}
                    disabled={quantity <= 1}
                >
                    <Minus className="h-4 w-4" />
                </Button>
                <div className="text-center">
                    <div className="text-foreground text-xl font-bold tracking-tighter">
                        {quantity}
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-full"
                    onClick={() => handleQuantity(1)}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

export default QuantitySelection