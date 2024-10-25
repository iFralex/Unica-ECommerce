import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"
import { ReactNode } from "react"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"

type AuthType = "login" | "signup" | "password-forgot"

export const AuthDialog = async ({ type, children }: { type: AuthType, children: ReactNode }) => {
    return (
        <Dialog defaultOpen={true} goBackIsClosed={true}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {type === "login" ? "Accedi" : type === "signup" ? "Registrati" : "Reimposta password"}
                    </DialogTitle>
                    <DialogDescription>
                        {type !== "password-forgot" ? "Accedi velocemente con i tuoi social" : "Inserisci l'email per ripristinare la password del tuo account."}
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh]">
                    <div className="px-1">
                    {children}
                    </div>
                    <ScrollBar />
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

export const AuthFullScreenWrapper = ({ type, children }: { type: AuthType, children: ReactNode }) => {
    return <div className="w-full lg:grid min-h-full lg:grid-cols-2">
        <div className="flex items-center justify-center py-12">
            <div className="mx-auto grid w-[350px] gap-6">
                <div className="grid gap-2 text-center">
                    <h1 className="text-3xl font-bold">{type === "login" ? "Accedi" : type === "signup" ? "Registrati" : "Reimposta password"}</h1>
                    <p className="text-balance text-muted-foreground">
                        {type !== "password-forgot" ? "Accedi velocemente con i tuoi social" : "Inserisci l'email per ripristinare la password del tuo account."}
                    </p>
                </div>
                {children}
            </div>
        </div>
        <div className="hidden bg-muted lg:block">
            <Image
                src="/placeholder.svg"
                alt="Immagine"
                width="1920"
                height="1080"
                className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
        </div>
    </div>
}