import { cn } from "@/lib/utils"
import { Card } from "./ui/card"
import { forwardRef } from "react"
import Image from "next/image"
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel"
import Autoplay from "embla-carousel-autoplay";


export const OutlineProductCard = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { imageProps: { width: number, height: number, src?: string, alt: string } | { width: number, height: number, src?: string, alt: string }[], caption?: string }
>(({ className, imageProps, caption, ...props }, ref) => {
    return <Card ref={ref} className={cn("cursor-pointer flex flex-col justify-center p-3 text-center", className)} {...props}>
        <figure aria-hidden>
            {imageProps && Array.isArray(imageProps)
                ? <Carousel
                    orientation="horizontal"
                    opts={{
                        align: "center",
                        loop: true,
                    }}
                    autoplay={{delay: 1000}}
                >
                    <CarouselContent>
                        {imageProps.map((prop, idx) => prop.src && <CarouselItem>
                            <Image key={idx} {...prop} className="mx-auto" />
                        </CarouselItem>)}
                    </CarouselContent>
                </Carousel>
                : imageProps.src && <Image {...imageProps} className="mx-auto" />}
            <figcaption>
                <span>{caption}</span>
            </figcaption>
        </figure>
    </Card>
})