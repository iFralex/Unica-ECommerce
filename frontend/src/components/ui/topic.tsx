import { Badge } from "@/components/ui/badge"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { CircleHelp } from "lucide-react"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"

import { CircleDotDashed } from "lucide-react"

const TopicsList = ({ topics }) => {
    if (topics.length == 0)
        return <></>
    else
        return (
            <Accordion type="single" orientation="horizontal" defaultValue="item-1" collapsible>
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-foreground" infoToolTip={
                        <HoverCard>
                            <HoverCardTrigger><CircleHelp className="ml-2 text-foreground" /></HoverCardTrigger>
                            <HoverCardContent className="text-left">
                                <p>Questi Badge indicano gli aspetti personali che il gioiello può rappresentare al meglio.</p>
                                <p>Premi su un Badge per avere più informazioni su quello specifico.</p>
                            </HoverCardContent>
                        </HoverCard>
                    }>Perfetto per...</AccordionTrigger>
                    <AccordionContent>
                        {topics.map((b, i) => (
                            <HoverCard>
                                <HoverCardTrigger><Badge key={i} className="my-1 ml-3 mr-2 bg-background border border-primary" variant="outline">
                                    <CircleTag color={b.Color} absolute />
                                    <span className="ml-2">{b.Name}</span>
                                </Badge></HoverCardTrigger>
                                <HoverCardContent className="w-80">
                                    <div className="flex justify-start space-x-4">
                                        <div className="h-8 w-8">
                                            <CircleTag color={b.Color} size={8} />
                                        </div>
                                        <div className="space-y-1 text-left">
                                            <h4 className="text-sm font-semibold">{b.Name}</h4>
                                            <p className="text-sm">{b.Description}</p>
                                        </div>
                                    </div>
                                </HoverCardContent>
                            </HoverCard>
                        ))}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        )
}

const CircleTag = ({ color, absolute, size = 6 }) => (
    <div className={(absolute ? "absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2" : " ") + " w-" + size + " h-" + size + " rounded-full flex items-center justify-center"} style={{ backgroundColor: "#" + color }}>
        <CircleDotDashed className={"text-foreground w-" + (size - 1) + " h-" + (size - 1)} />
    </div>
)

export { TopicsList, CircleTag }