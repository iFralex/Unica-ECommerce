import { getAuthToken } from "@/actions/auth"
import { getOrders } from "@/actions/firebase"
import { getProductsLightFromCartsLight } from "@/actions/get-data"
import { ContainerDashboard } from "@/components/dashboard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formattedDate, formattedPrice } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

const Dashboard = async () => {
    const tokens = await getAuthToken()
    if (!tokens)
        notFound()

    const orders = (await getOrders(tokens.decodedToken.uid)).sort((a, b) => b.createdDate - a.createdDate)
    const products = await getProductsLightFromCartsLight(orders.map(o => o.items).flat().filter((obj, index, self) => index === self.findIndex(t => JSON.stringify(t) === JSON.stringify(obj))))
    if (products instanceof Error)
        return <></>

    return (
        <ContainerDashboard title="I tuoi ordini">
            {!orders.length
                ? <div className="flex flex-col items-center gap-1 text-center">
                    <h3 className="text-2xl font-bold tracking-tight">
                        Nessun ordine
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Non hai ancora ordinato nulla. Fai il tuo primo ordine ora!
                    </p>
                    <Button className="mt-4"><Link href="/">Vai alla home</Link></Button>
                </div>
                : <div className="grid grid-cols-1 gap-3 w-full">
                    {orders.map((order, i, self) => (
                        <div key={order.orderId}>
                            <div className="grid w-full p-3">
                                <div className="flex flex-wrap justify-between items-center">
                                    <h2 className="font-bold text-lg">Ordine del {formattedDate(order.createdDate)}</h2>
                                    <Button variant="outline" className="px-8"><Link href={"/dashboard/ordini/" + order.orderId}>Tutti i dettagli</Link></Button>
                                </div>
                                <div className="flex flex-wrap">
                                    <p>Stato della spedizione: {order.shippingId}</p>
                                    <Separator orientation="vertical" className="mx-5" />
                                    <p>Importo totale: {formattedPrice(order.price)}</p>
                                </div>
                                <Separator className="my-3" />
                                <div className="flex flex-wrap gap-2">
                                    {order.items.map(p => {
                                        let pr
                                        for (let _p of products)
                                            if (_p.id === p.productId && _p.variantIndex === p.variantIndex)
                                                pr = _p
                                        if (!pr)
                                            return <></>
                                        return <Link href={"/" + pr.urlPath}>
                                            <Card key={p.productId + "," + p.variantIndex} className="flex gap-2 p-2">
                                                <Image src={process.env.DOMAIN_URL + pr.image.url} width={pr.image.width / 2} height={pr.image.height / 2} alt={"Immagine di " + pr.name} />
                                                <div>
                                                    <span className="text-lg font-bold">{pr.name} x{p.quantity}</span>
                                                    <div className="flex space-x-3 flex-wrap my-3">
                                                        <Badge variant="outline" className="bg-white min-h-8">
                                                            <div className="flex items-center justify-start flex-no-wrap">
                                                                <div className="w-4 h-4 rounded-full inline-block mr-1" style={{ backgroundColor: "#" + pr.material?.Color }} />
                                                                <span>{pr.material?.Name}</span>
                                                            </div>
                                                        </Badge>
                                                        <Badge variant="outline" className="min-h-8">
                                                            <div className="flex items-center justify-center flex-wrap space-x-2">
                                                                {pr.platings.map((p, i) => <span key={i} className="flex items-center justify-center">
                                                                    <div className="w-4 h-4 rounded-full inline-block" style={{ backgroundColor: "#" + p.attributes.Color }} />
                                                                </span>)}
                                                            </div>
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    }
                                    )}
                                </div>
                            </div>
                            {i < self.length - 1 && <Separator className="my" />}
                        </div>
                    ))}
                </div>}
        </ContainerDashboard>
    )
}

const Page = async () => {
    return <Dashboard />
}

export default Page