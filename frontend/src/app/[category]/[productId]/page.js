import { getProduct, getTest } from "@/actions/get-data"
import ProductProvider from "@/components/context"
import { HeroProduct } from "@/components/ui/hero-sections"
import { ImagesGallery } from "@/components/product"
import { ModelViewer } from '@/components/3D-viewer'

const Page = async ({ params }) => {
  const product = await getProduct(params.productId)
  //console.log("err", await getTest(params.productId))
  if (product.error)
    return <div>An error occured: {product.error}</div>;

  return (
    <ProductProvider>
      <HeroProduct product={product} params={params} />
      <div className="">
        <div className="flex flex-wrap">
          <div className="w-full md:w-[calc(100%-300px)]">
            <ImagesGallery imagesUrls={product.attributes.ProductDetails.map(v => v.Images.data.map(image => image.attributes))} responsibleSizes={{ _: 2, md: 3, lg: 4 }} />
            <ModelViewer productModel={product.attributes.Model3D.data.attributes} materials={product.attributes.ProductDetails.map(p => p.Materials3D)} />
          </div>
          <div className="md:w-[300px] w-full flex items-center justify-center">
            <ImagesGallery imagesUrls={product.attributes.ProductDetails.map(v => v.Photos.data.map(image => image.attributes))} responsibleSizes={{ _: 1, md: 4 }} orientation="vertical" carouselCustomClass={{height: "calc(100vw + 157px)", maxHeight: "calc(90vh + 157px)" }} />
          </div>
        </div>
      </div>
    </ProductProvider>
  )
}

export default Page