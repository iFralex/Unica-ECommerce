import { getCategory } from "@/actions/get-data"
import Link from "next/link"

const Page = async ({ params }) => {
    const category = await getCategory(params.category)
    console.log(category)
    if (category.error) {
        return <div>An error occured: {category.error}</div>;
    }

    return (
        <div>
            <h1>{category.attributes.Name}</h1>
            <p>{category.attributes.ShortDescription}</p>
            <ul>
                Prodotti:
            {category.attributes.Products.data.map(product => (
                <li>
                    <Link href={"/" + category.attributes.SKU + "/" + product.attributes.SKU}>{product.attributes.Name}</Link>
                    </li>
            ))}
            </ul>
        </div>
    )
}

export default Page