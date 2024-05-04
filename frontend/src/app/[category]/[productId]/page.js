import { getProduct } from "@/actions/get-data"
import ProductProvider from "@/components/context"
import { HeroProduct } from "@/components/ui/hero-sections"
import { ImagesGallery } from "@/components/product"

const Page = async ({ params }) => {
    const product = await getProduct(params.productId)
    if (product.error)
        return <div>An error occured: {product.error}</div>;
    
    return (
        <ProductProvider>
            <HeroProduct product={product} params={params} />
            <div className="">
                <ImagesGallery productDetails={product.attributes.ProductDetails}/>
            </div>
        </ProductProvider>
    )
}

export default Page