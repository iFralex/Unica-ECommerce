import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { TopicsList } from "@/components/ui/topic"
import { ProductVariants } from "@/components/client-components"
import Image from "next/image"

const HeroProduct = ({ product, params }) => {
    return (
        <div className="relative flex justify-center bg-gradient-to-r from-black to-black/30 md:to-black/0 pt-16 pb-12 px-8">
            <div className="w-[1400px] flex flex-col md:flex-row justify-between items-center">
                <div className="dark md:w-1/2 text-center md:text-left overflow-x-hidden">
                    <div className="flex justify-center md:justify-start flex-wrap">
                        <Breadcrumb className="">
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink href={"/" + params.category}>{product.attributes.Category.data.attributes.Name}</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{product.attributes.Name}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{product.attributes.Name}</h1>
                    <p className="text-lg text-foreground mb-6">{product.attributes.ShortDescription}</p>
                    <TopicsList topics={product.attributes.Tags.data.map(d => d.attributes)} />
                    <ProductVariants variants={product.attributes.ProductDetails} />
                </div>
            </div>
            <div className="absolute inset-0 z-[-1] flex justify-end bg-white overflow-x-hidden">
                <Image className="w-full object-right object-cover overflow-x-hidden" src={"http://localhost:1337" + product.attributes.MainImage.data.attributes.url} alt="Immagine" width={1200} height={1000}/>
            </div>
        </div>
    )
}

export { HeroProduct }