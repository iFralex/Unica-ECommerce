import { getAuthToken } from "@/actions/auth"
import { getOrder, getOrders } from "@/actions/firebase"
import { getProductsLightFromCartsLight } from "@/actions/get-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formattedPrice } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { ReactNode } from "react"
import { ContainerDashboard, TextDetail } from "@/components/dashboard"

const Page = async ({ params }: { params: { orderId: string } }) => {
    const tokens = await getAuthToken()
    if (!tokens)
        notFound()

    const order = await getOrder(tokens.decodedToken.uid, params.orderId)
    if (!order)
        return <p>Ordine non trovato</p>
    const products = await getProductsLightFromCartsLight(order.items.filter((obj, index, self) => index === self.findIndex(t => JSON.stringify(t) === JSON.stringify(obj))))
    if (products instanceof Error)
        return <></>

    return (<ContainerDashboard title="Dettagli ordine" backButton={{ url: "/ordini", lable: "Tutti gli ordini", icon: <ChevronLeft /> }}>
        <div className="grid grid-cols-1 gap-3 w-full">
            <div className="grid w-full p-3">
                <TextDetail title="ID ordine">{params.orderId}</TextDetail>
                <div className="grid lg:grid-cols-2 gap-3">
                    <DetailCard
                        title="Spedizione"
                        items={[
                            { label: "Stato della spedizione", body: "Consegnato" },
                            { label: "Indirizzo di consegna", body: "Via delle Orchidee, Cisterna di Latina, Latina, 04012, Italia" },
                            { label: "Corriere", body: "DHL" },
                            { label: "Tracking number", body: "1236547" },
                            { label: "ID ordine", body: order.shippingId }
                        ]}
                    />
                    <DetailCard
                        title="Pagamento"
                        items={[
                            { label: "Importo speso", body: order.price },
                            { label: "Metodo di pagamento", body: "Carta di credito" },
                            { label: "Numero carta", body: "••••7623" },
                            { label: "Circuito carta", body: "Visa" },
                            { label: "ID pagamento", body: order.shippingId }
                        ]}
                    />
                </div>
                <Separator className="my-3" />
                <h2 className="text-xl font-bold mb-1">Articoli acquistati</h2>
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
                                <Image src={process.env.DOMAIN_URL + pr.image.url} width={pr.image.width} height={pr.image.height} alt={"Immagine di " + pr.name} />
                                <div>
                                    <span className="text-lg font-bold">{pr.name}</span>
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
                                    <TextDetail title="Quantità">{p.quantity}</TextDetail>
                                </div>
                            </Card>
                        </Link>
                    }
                    )}
                </div>
            </div>
        </div>
    </ContainerDashboard>
    )
}

const DetailCard = async ({ title, items }: { title: string, items: { label: string, body: string }[] }) => {
    return <Card className="p-2 w-full">
        <h3 className="text-lg font-bold uppercase">{title}</h3>
        {items.map((item, i) => (
            <TextDetail key={i} title={item.label}>{item.body}</TextDetail>
        ))}
    </Card>
}

export default Page