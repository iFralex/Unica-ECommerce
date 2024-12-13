import { getProducts } from "@/actions/get-data"
import { Hero3D } from "@/components/hero-home";
import { WhatIs } from "@/components/home/what-is";
import { WordPullUp } from "@/components/magicui/word-pull-up";
import JewelryCollectionsSlider from "@/components/slider-home";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { APIResponseCollection } from "@/types/strapi-types";
import Image from "next/image";
import Link from 'next/link'

export const sections = [
  {
    key: 'bellezza',
    title: 'Bellezza',
    description: 'Descrizione del primo blocco che entra e esce.',
    height: 150,
    color: [66, 170, 245]
  },
  {
    key: 'significato',
    title: 'Significato',
    description: 'Descrizione del secondo blocco che entra e esce.',
    height: 220,
    color: [252, 161, 3]
  },
  {
    key: 'unicità',
    title: 'Unicità',
    description: 'Descrizione del terzo blocco che entra e esce.',
    height: 300,
    color: [50, 168, 82]
  }
]

const Hero = async ({ products }: { products: APIResponseCollection<"api::product.product"> }) => {
  return <section className="w-full h-full md:h-auto">
    <div className="relative w-full h-full md:h-80 overflow-hidden">
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

const WhatIsSec = () => {
  // Calculate rows based on totalHeight and random heights of bricks
  const calculateRows = (totalHeight: number) => {
    let rows = [];
    let currentHeight = 0;
    const rowWidth = 100; // Fixed width for each row

    while (currentHeight < totalHeight) {
      const bricksPerRow = Math.floor(Math.random() * 3) + 2; // Random between 2 and 4
      const rowHeight = 30//Math.random() * 20 + 30; // Random height between 30px and 50px

      if (currentHeight + rowHeight > totalHeight) break;

      // Generate bricks with random widths summing up to rowWidth
      let remainingWidth = rowWidth;
      const row = Array.from({ length: bricksPerRow }).map((_, index) => {
        const isLastBrick = index === bricksPerRow - 1;
        const width = isLastBrick
          ? remainingWidth
          : Math.random() * (remainingWidth / (bricksPerRow - index)) * 0.8 + 20;
        remainingWidth -= width;
        return {
          width,
          height: rowHeight,
        };
      });

      rows.push(Math.random() > 0.5 ? row : row.reverse());
      currentHeight += rowHeight;
    }

    return rows;
  };

  const generateColorVariation = (_baseColor, variationRange = 30) => {
    const randomize = (value) =>
      Math.min(255, Math.max(0, value + Math.floor(Math.random() * (2 * variationRange + 1)) - variationRange));

    return `rgb(${randomize(_baseColor[0])}, ${randomize(_baseColor[1])}, ${randomize(_baseColor[2])})`;
  };
  const allRows = sections.map(s => calculateRows(s.height))

  return <section>
    <h1 className="mt-8 mb-2 text-center text-4xl font-bold">I pilastri di UNICA</h1>
    <WhatIs allRows={allRows} allColors={allRows.map((rows, i) => rows.map(r => r.map(_ => generateColorVariation(sections[i].color))))} allBorderColors={allRows.map((rows, i) => rows.map(r => r.map(_ => generateColorVariation(sections[i].color, 10))))} />
    <Separator className="my-5" />
  </section>
}

const Page = async ({ }) => {
  const products = await getProducts()
  if (products instanceof Error) {
    return <div>An error occured: {products.message}</div>;
  }

  return <>
    <Hero products={products} />
    <WhatIsSec />
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