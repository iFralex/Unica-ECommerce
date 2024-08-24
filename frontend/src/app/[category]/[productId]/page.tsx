import { getProduct, getTest } from "@/actions/get-data"
import { ProductProvider } from "@/components/context"
import { HeroProduct } from "@/components/ui/hero-sections"
import { ImagesGallery } from "@/components/product"
import { ModelViewer } from '@/components/3D-viewer'
import { DescriptionSection } from "@/components/DescriptionSection"
import { Materials3D } from "@/types/strapi-types"

const Page = async ({ params }: { params: { productId: string, category: string } }) => {
  const product = await getProduct(params.productId)
  //console.log("err", await getTest(params.productId))
  if (product instanceof Error)
    return <div>An error occured: {product.message}</div>

  return (
    <ProductProvider>
      <div className="">
        <div className="flex flex-wrap">
          <div className="w-full md:w-[calc(100%-300px)]">
            <ImagesGallery imagesUrls={product.attributes.ProductDetails?.map(v => v.Images?.data) ?? []} responsibleSizes={"basis-1/2 md:basis-1/4 lg:basis-1/6"} />
            <ModelViewer product={product} materials={product.attributes.ProductDetails?.map(p => p.Materials3D as unknown as Materials3D ?? []) ?? [] as Materials3D[]} productId={product.id} />
          </div>
          <div className="md:w-[300px] w-full flex items-center justify-center">
            <ImagesGallery imagesUrls={product.attributes.ProductDetails?.map(v => v.Photos?.data.map(image => image)) ?? []} responsibleSizes={"basis-1/1"} orientation="vertical" carouselCustomClass={{ height: "calc(100vw + 157px)", maxHeight: "calc(90vh + 157px)" }} />
          </div>
        </div>
        <DescriptionSection />
      </div>
    </ProductProvider>
  )
}

export default Page