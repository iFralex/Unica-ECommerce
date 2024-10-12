import { Sheet, SheetContent } from "@/components/ui/sheet";
import { FavoritesList } from "@/components/favorites"

export default function Page() {
    return (<div className="p-2">
        <h1 className="text-lg font-semibold text-slate-950">
            Lista dei Preferiti
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
            I tuoi prodotti preferiti.
        </p>
        <FavoritesList />
    </div>
    )
}