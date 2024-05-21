"use client";

import Image from "next/image";
import { ProductContext } from "@/components/context";
import { useContext } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const ImagesGallery = ({ imagesUrls, responsibleSizes = { _: 2 }, orientation = "horizontal", carouselCustomClass = {} }) => {
    const [productContext, _] = useContext(ProductContext);
    const getClassFromObject = (object, prestring = "") => Object.keys(object).map(key => (key !== "_" ? (key + ":") : "") + prestring + object[key]).join(" ")
    return (
        <div className="flex justify-center">
            <Carousel
                orientation={orientation}
                opts={{
                    align: "start",
                    loop: true,
                }}
                plugins={[
                    Autoplay({
                        delay: 2000,
                    }),
                ]}
                className="max-w-xl "
            >
                <CarouselContent style={carouselCustomClass}>
                    {imagesUrls[productContext.variantIndex].map((image, index) => (
                        <CarouselItem key={index} className={getClassFromObject(responsibleSizes, "basis-1/")}>
                            <div className="p-1">
                                <Card>
                                    <CardContent>
                                        <Image
                                            src={`http://localhost:1337${image.url}`}
                                            alt={`Product Image ${index + 1}`}
                                            width={500}
                                            height={500}
                                            className="rounded-md"
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    );
};

export { ImagesGallery };