"use client"

import Image from "next/image"
import { ProductContext } from "@/components/context"
import { useContext } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

const ImagesGallery = ({ productDetails }) => {
    const [productContex, _] = useContext(ProductContext)
    return (
        <div className="flex justify-center">
            <Carousel style={{  "overflow": "hidden"}}
                opts={{
                    align: "start",
                    loop: true
                }}
                plugins={[
                    Autoplay({
                      delay: 2000,
                    }),
                  ]}
                className="max-w-xl"
            >
                <CarouselContent>
                    {productDetails[productContex.variantIndex].Images.data.map((image, index) => (
                        <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/4 basis-1/2">
                            <div className="p-1">
                                <Card>
                                    <CardContent className="p-3">
                                        <img key={index} src={"http://localhost:1337" + image.attributes.url}  />
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel> 
        </div>
    )
}

export { ImagesGallery }