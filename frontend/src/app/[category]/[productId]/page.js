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
        <ImagesGallery productDetails={product.attributes.ProductDetails} />
        <ModelViewer productModel={product.attributes.Model3D.data.attributes} materials={product.attributes.ProductDetails.map(p => p.Materials3D)} />
      </div>
    </ProductProvider>
  )
}

export default Page