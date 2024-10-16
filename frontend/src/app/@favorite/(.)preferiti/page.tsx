import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FavoritesList } from "@/components/favorites"
import { redirect } from 'next/navigation'


export default function Page() {
  return (
    <Sheet defaultOpen={true} goBackIsClosed={true}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            Lista dei Preferiti
          </SheetTitle>
          <SheetDescription>
            I tuoi prodotti preferiti.
          </SheetDescription>
        </SheetHeader>
        <FavoritesList />
      </SheetContent>
    </Sheet>
  )
}