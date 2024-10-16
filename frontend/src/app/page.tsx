import { getProducts } from "@/actions/get-data"
import { Button } from "@/components/ui/button"
import { APIResponseCollection } from "@/types/strapi-types";
import Link from 'next/link'

const Page = async ({ }) => {
  const products = await getProducts()
  if (products instanceof Error) {
    return <div>An error occured: {products.message}</div>;
  }

  return (
    <ul>
      <Button>Ciao</Button>
      {products.data.map(product => (
        <li key={product.id}><Link href={"/" + product.attributes.Category.data.attributes.SKU + "/" + product.attributes.SKU}>{product.attributes.Name + ": " + product.id}</Link></li>
      ))}
    </ul>
  );
};

export default Page;