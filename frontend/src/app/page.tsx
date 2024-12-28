import { getProducts } from "@/actions/get-data"
import { CharitySection } from "@/components/charity-blind";
import { Hero3D } from "@/components/hero-home";
import { WhatIs } from "@/components/home/what-is";
import { WordPullUp } from "@/components/magicui/word-pull-up";
import { OutlineProductCard } from "@/components/product-card";
import JewelryCollectionsSlider from "@/components/slider-home";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { APIResponseCollection, APIResponseData } from "@/types/strapi-types";
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
    <WhatIs allRows={allRows} allColors={allRows.map((rows, i) => rows.map(r => r.map(_ => generateColorVariation(sections[i].color))))} allBorderColors={allRows.map((rows, i) => rows.map(r => r.map(_ => generateColorVariation(sections[i].color, 10))))} />
    <Separator className="my-5" />
  </section>
}

const Promos = ({ data }: { data: APIResponseData<"api::charity-campaign.charity-campaign">[] }) => {
  return data.some(d => 'Products' in d.attributes) && <div className="relative w-full min-h-96 bg-gradient-to-br from-gray-800 to-black">
    {/* SVG onda */}
    <div className="absolute inset-0">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 500 500"
        fill="none"
        className="w-full h-full"
        preserveAspectRatio="none"
        stroke="white"
      >
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: "#bec2cb", stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: "#4c4e50", stopOpacity: 0.8 }} />
          </linearGradient>
        </defs>
        <path
          d="M-10,100 C150,200 350,500 510,400 L510,-10 L-10,-10 Z"
          fill="url(#gradient)"
        />
      </svg>
    </div>

    {/* Titolo e paragrafo */}
    <div className="relative container pt-16 md:pt-32 pb-16">
      <h1 className="text-5xl font-bold text-white mb-4">Acquista, Risparmia, Dona</h1>
      <p className="text-xl text-white max-w-lg">
        Questo è un esempio di paragrafo per descrivere gli ordini. Puoi personalizzare il testo come preferisci.
      </p>
      <div className="lg:grid grid-cols-2 gap-6 mt-3">
        {([data, data]).flat().map((camp, index) => camp.attributes.Products && <div key={index}>
          <CharitySection DonatedMoney={5} CharityCampaign={{ ...camp.attributes }} />
          <div className="relative py-3">
            <div className="absolute inset-0 rounded-lg overflow-hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 500 500"
                fill="none"
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                <path
                  //d="M0,0 C0,50 30,200 200,100 C230,100 240,120 250,250 C260,480 270,500 500,300 L500,0 L0,0 Z"
                  d="M0,100 C30,300 100,350 230,400 C290,150 180,50 100,50 C100,50 70,30 50,0 L100,0 L0,0 Z"
                  fill="#bec2cbcc"
                />
                <path
                  d="M0,500 C300,500 180,400 100,400 C100,400 70,430 0,350 L0,350 L0,500 Z"
                  fill="#bec2cbcc"
                />
                <path
                  d="M500,100 C470,300 400,350 270,400 C240,150 320,50 400,50 C400,50 430,30 450,0 L400,0 L500,0 Z"
                  fill="#d4af37cc"
                />
                <path
                  d="M500,500 C200,500 320,400 400,400 C400,400 430,430 500,350 L500,350 L500,500 Z"
                  fill="#d4af37cc"
                />
              </svg>
            </div>
            <div className="relative z-1">
              <h3 className="text-center text-white mb-2">Prodotti inclusi</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mx-auto px-2">
                {camp.attributes.Products.data.map(p => (
                  <Link href={"/" + p.attributes.Category.data.attributes.SKU + "/" + p.attributes.SKU}>
                    <OutlineProductCard caption={p.attributes.Name}
                      imageProps={p.attributes.ProductDetails.map(v => ({ src: v.Images.data?.[0].attributes.formats?.thumbnail.url, ...(v.Images.data?.[0].attributes.formats?.thumbnail || {}) }))} 
                      className="bg-[#0000008f] text-white h-full" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>)}
      </div>
    </div>
  </div>
};

const Page = async ({ }) => {
  const res = await getProducts()
  if (res instanceof Error) {
    return <div>An error occured: {res.message}</div>
  }
  const { products, promos } = res
products.data[0].attributes.ProductDetails[0].Images
  return <>
    <Hero products={products} />
    <WhatIsSec />
    <section className="overflow-hidden">
      <JewelryCollectionsSlider />
    </section>
    <Promos data={promos.data.map(d => ({ attributes: { ...d.attributes, Products: products } }))} />
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