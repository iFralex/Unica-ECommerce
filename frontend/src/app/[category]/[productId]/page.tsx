import { getCartVisualizzationData, getProduct, getTest } from "@/actions/get-data"
import { ProductProvider } from "@/components/context"
import { HeroProduct } from "@/components/ui/hero-sections"
import { ImagesGallery } from "@/components/product"
import { ModelViewer } from '@/components/3D-viewer'
import { CardGrid, Testimonial, DetailsDescription, FAQ } from "@/components/DescriptionSection"
import { Materials3D } from "@/types/strapi-types"
import { ProductCards, ProductCartVisualizzation, ProductCharityLink } from "@/types/components"
import { CardDescriptionType } from "@/types/types"
import { CharitySection, PromoSection } from "@/components/promos"
import { Reviews } from "@/components/reviews"
import { Separator } from "@/components/ui/separator"

const Page = async ({ params }: { params: { productId: string, category: string } }) => {
  const product = await getProduct(params.productId)
  if (product instanceof Error)
    return <div>An error occured: {product.message}</div>
  return (
    <ProductProvider>
      <HeroProduct product={product} params={params} />
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
        <div className="container">
          <Testimonial data={product.attributes.Description?.find(d => d.__component === "pr.testimonial")?.TestimonialLink?.data?.attributes} />
          <CardGrid cards={product.attributes.Description?.filter(desc => desc.__component === "pr.cards").find(desc => desc.Type === "Come sei")?.Card?.map(c => ({ title: c.Title, description: c.Description } as CardDescriptionType)) ?? []} />
          <DetailsDescription cards={product.attributes.Description?.filter(desc => desc.__component === "pr.cards").find(desc => desc.Type === "Dettagli")?.Card?.map(c => ({ title: c.Title, description: c.Description } as CardDescriptionType)) ?? []} />
          {(() => {
            const promos = product.attributes.Description?.filter(d => d.__component === "pr.charity-link")
            if (!promos?.length) return <></>
            return promos.map(data => <>
              <Separator className="my-5" />
              {data.CharityCampaign?.data ?
                <CharitySection CharityCampaign={data.CharityCampaign.data.attributes} DonatedMoney={data.DonatedMoney} />
                : data.PromoCampaign?.data ? <PromoSection {...data.PromoCampaign.data.attributes} /> : <></>}</>)
          })()}
          <Reviews reviews={product.attributes.Description?.filter(d => d.__component === "pr.review") ?? []} />
          <FAQ faqs={product.attributes.Description?.find(d => d.__component === "pr.faq")?.FAQs?.data} />
        </div>
        <div className="h-[100px]" />
      </div>
    </ProductProvider>
  )
}

export default Page