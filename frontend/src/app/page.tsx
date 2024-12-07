import { getProducts } from "@/actions/get-data"
import { Hero3D } from "@/components/hero-home";
import { WordPullUp } from "@/components/magicui/word-pull-up";
import JewelryCollectionsSlider from "@/components/slider-home";
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card";
import { APIResponseCollection } from "@/types/strapi-types";
import { Transform } from "@/types/types";
import Image from "next/image";
import Link from 'next/link'

const Hero = async ({ products }: {products: APIResponseCollection<"api::product.product">}) => {
  return <section>
    <div className="relative w-full h-screen md:h-80 overflow-hidden">
      <Image
        src="https://thumbs.dreamstime.com/b/milan-skyline-night-duomo-cathedral-financial-district-milan-skyline-night-illuminated-duomo-cathedral-343266767.jpg"
        width={1200}
        height={500}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0">
        <Hero3D modelDatas={products.data.map(p => p.attributes.Viewer?.map(v => v.__component === "pr.single-item3-d" ? { url: v.Model3D?.data.attributes.url || "", transform: v.HeroPreview } : [v.SelectedViewer?.data.attributes.Items3D?.find(i => i.RelativeProduct?.data.id === p.id)].filter(i => i !== undefined).map(i => ({ url: i.Model3D?.data.attributes.url || "", transform: i.HeroPreview })).flat()).flat().map(o => ({ ...o, materials: p.attributes.ProductDetails?.map(d => d.Materials3D) || [] }))).flat().filter(data => data !== undefined)} />
      </div>
      <div className="absolute bottom-[10%] left-0 right-0 p-4">
        <WordPullUp words="Il gioiello che ti rappresenta" className="text-white text-center text-6xl md:text-7xl font-bold md:px-[15%]" />
      </div>
    </div>
  </section>
}

const Page = async ({ }) => {
  const products = await getProducts()
  if (products instanceof Error) {
    return <div>An error occured: {products.message}</div>;
  }

  return <>
    <Hero products={products} />
    <section className="overflow-hidden">
      <JewelryCollectionsSlider />
    </section>
    <h1 className="text-center font-bold text-3xl">Prodotti</h1>
    <div className="flex gap-2 flex-wrap">
      {products.data.filter(p => p.attributes.MainImage?.data).sort((a, b) => a.id > b.id ? 1 : -1).map(product => (
        <Card key={product.id}>
          <Link href={"/" + product.attributes.Category.data.attributes.SKU + "/" + product.attributes.SKU}>
            <Image src={product.attributes.MainImage?.data.attributes.formats.thumbnail.url} width={product.attributes.MainImage?.data.attributes.formats.thumbnail.width} height={product.attributes.MainImage?.data.attributes.formats.thumbnail.height} alt="Product image" />
            <h2 className="text-center font-bold">{product.attributes.Name}</h2>
          </Link>
        </Card>
      ))}
    </div>
  </>
};

export default Page;