import Link from "next/link"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Separator } from "./ui/separator"
import Image from "next/image"
import { PawPrint } from "lucide-react"
import { NeonGradientCard } from "./magicui/neon-gradient-card"
import { Slider } from "@/components/ui/slider"
import { ProductCharityLink } from "@/types/components"
import { APIResponse } from "@/types/strapi-types"
import { formattedPrice } from "@/lib/utils"

export const CharitySection = ({ CharityCampaign, DonatedMoney }: { CharityCampaign: APIResponse<"api::charity-campaign.charity-campaign">["data"]["attributes"], DonatedMoney: number }) => {
    return (
        <section id="charity">
            <Separator className="my-5" />
            <Card className="dark my-5 bg-black size-full overflow-hidden">
                <div className="relative">
                    <Image src={CharityCampaign.Name === "Gioielli di Luce" ? process.env.DOMAIN_URL + "/uploads/IMG_1258_Medium_2e6a5e1f09.jpeg" : ""}
                        alt="Sfondo sezione beneficenza"
                        width={100}
                        height={100}
                        className="absolute inset-0 size-full object-cover"
                        sizes="100vw"
                        quality={100} />
                    <div className="relative z-5 flex-col">
                        <div className="overflow-hidden flex flex-col md:flex-row pt-[100px] md:py-[50px]">
                            <div className="w-full max-w-[384px] relative">
                                <NeonGradientCard coloredShadow={false} borderRadius={500} borderSize={10} backgroundColor="white" className="absolute top-[-260px] right-[-30%] md:top-[-30%] md:right-0 rounded-full size-[512px] z-0" />
                                <div className="absolute inset-0 pt-[50px] flex items-center justify-center">
                                    <div className="text-black text-center">
                                        <div className="my-[-55px]">
                                            <span className="text-[200px] font-bold">{Math.floor(DonatedMoney)}</span>
                                            <span className="text-3xl ml-[-10px]"><span className="font-bold text-6xl">,{(`${DonatedMoney}`.split('.')[1] || '00').padEnd(2, '0').slice(0, 2)}</span> €</span>
                                        </div>
                                        <span className="text-4xl font-bold">IN BENEFICIENZA</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-[270px] md:mt-0 md:mr-2 md:ml-4 text-white flex-1 px-5 pb-5 pt-3 md:rounded-md bg-[#00000080]">
                                <h2 className="text-4xl font-bold">{CharityCampaign.Name}</h2>
                                <p className="mb-4 mt-2">{CharityCampaign.Name === "Gioielli di Luce" && "Curabitur ac turpis vel tellus accumsan sagittis et ac mi. Morbi in nulla tempus, imperdiet urna ut, tempus ligula. Morbi mollis cursus magna, at dapibus libero facilisis non. Nunc et nulla a lorem tempor tincidunt ut sit amet nulla. Proin eu elementum arcu. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In aliquet neque sit amet lorem auctor, ac accumsan lacus condimentum. Integer elementum ante vel pharetra aliquet."}</p>
                                <Button variant="default" >
                                    <Link href={"/" + CharityCampaign.SKU}>
                                        Scopri di più
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-5 pt-[50px] text-white text-center">
                    <h2 className="text-3xl font-bold mb-3">Fin'ora abbiamo raccolto</h2>
                    <span className="text-[60px] font-bold leading-10">{CharityCampaign.MoneyCollected}/<span className="text-[0px]"> </span>{CharityCampaign.MoneyTarget}€</span>
                    <div className="relative overflow-idden w-full border border-white rounded-full h-[20px] mt-3">
                        <div className={"absolute bg-white h-full border-buy border-[0px] top-1/2 rounded-l-full"} style={{ transform: "TranslateY(-50%) Rotate(0deg)", width: "calc(" + ((CharityCampaign.MoneyCollected || 0) / (CharityCampaign.MoneyTarget || 1) * 100) + "%)" }}>
                            <div className="absolute rounded-full bg-buy size-[30px] top-1/2 right-0" style={{ transform: "Translate(50%, -50%) Rotate(0deg)" }} />
                        </div>
                    </div>
                </div>
            </Card>
        </section>
    )
}

export const CharityBadge = ({ CampaignName, DonatedMoney, productName, url }: { CampaignName: APIResponse<"api::charity-campaign.charity-campaign">["data"]["attributes"]["Name"], DonatedMoney: number, productName: string, url: string }) => {
    return <Link href={url}>
        <Card className="dark bg-[#000000c0] mb-5 relative w-full h-[65px] overflow-hidden flex-1">
            <div className="relative flex items-center h-full">
                <div className="w-full max-w-[55px] bg-white relative">
                    <div className="absolute top-1/2 rounded-full bg-white size-[120px]" style={{ transform: "Translate(-55%, -50%)" }} />
                    <div className="absolute opacity-60 inset-0 flex items-center justify-center">
                        {CampaignName === "Gioielli di Luce" && <PawPrint size={48} fill="black" />}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-[#FFD700]">
                            <span className="text-[50px] font-bold text-stroke-2 text-stroke-[#00000080]" style={{ WebkitTextStroke: '1px #00000050', }}>{Math.floor(DonatedMoney)}</span>
                        </div>
                    </div>
                </div>
                <div className="mx-2 text-white flex-col flex flex-1 px-2 rounded-md">
                    <span className="line-clamp-2 text-sm leading-snug">
                        <span className="text-sm font-bold underline">{CampaignName}</span>
                        : {CampaignName === "Gioielli di Luce" && "Acquistando " + productName + ", donerai " + formattedPrice(DonatedMoney) + " in sostegno di ragazzi ciechi per dargli un cane guida."}
                    </span>
                </div>
            </div>
        </Card>
    </Link>
}