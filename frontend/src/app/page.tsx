import { getProducts } from "@/actions/get-data"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card";
import { APIResponseCollection } from "@/types/strapi-types";
import Image from "next/image";
import Link from 'next/link'

const Page = async ({ }) => {
  const products = await getProducts()
  if (products instanceof Error) {
    return <div>An error occured: {products.message}</div>;
  }
  console.log(products.data)

  return (
    <div>
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
    </div>
  );
};

export default Page;