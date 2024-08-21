import { getProducts } from "@/actions/get-data"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

const Page = async ({ }) => {
  const products = await getProducts()
  if (products.error) {
    return <div>An error occured: {products.error}</div>;
  }
  console.log(products.data)
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