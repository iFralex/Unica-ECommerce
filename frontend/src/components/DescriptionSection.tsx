import { Separator } from "./ui/separator"

export const DescriptionSection = ({}: {}) => {
    return <div className="text-center">
        <Separator className="my-5"/>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground my-4">Tutti i dettagli</h1>
    </div>
}