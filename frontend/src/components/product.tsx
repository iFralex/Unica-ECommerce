"use client";

import Image from "next/image";
import { ProductContext } from "@/components/context";
import { useContext } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { APIResponseData } from "@/types/strapi-types";

const ImagesGallery = ({ imagesUrls, responsibleSizes = "basis-1/2", orientation = "horizontal", carouselCustomClass = {} }: { imagesUrls: (APIResponseData<"plugin::upload.file">[] | undefined)[], responsibleSizes?: string, orientation?: "horizontal" | "vertical", carouselCustomClass?: Object }) => {
    const [productContext, _] = useContext(ProductContext);

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
            >
                <CarouselContent style={carouselCustomClass}>
                    {imagesUrls[productContext.variantIndex]?.map((image, index) => (
                        image.attributes.formats?.small?.url && <CarouselItem key={index} className={responsibleSizes}>
                            <div className="p-1">
                                <Card>
                                    <CardContent>
                                        <Image
                                            src={`http://localhost:1337${image.attributes.formats?.small?.url}`}
                                            alt={`Product Image ${index + 1}`}
                                            width={image.attributes.formats?.small?.width}
                                            height={image.attributes.formats?.small?.height}
                                            className="rounded-md"
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    )) ?? <></>}
                </CarouselContent>
            </Carousel>
        </div>
    );
};

export { ImagesGallery };