"use client"

import { transferDataFromCookieToUserId, updateUserName } from "@/actions/firebase"
import { deleteCookie } from "@/actions/get-data"
import { LoginFunction } from "@/components/auth"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const Page = () => {
    const router = useRouter()
    const [error, setError] = useState("")

    useEffect(() => {
        (async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const userNameParam = params.get('username');
                const userId = params.get('userId');
                const targetPage = params.get('target');
                console.log(params, userNameParam, userId, window.location.search)
                await LoginFunction("email link", {}, err => { throw err }, router, () => {}, undefined)
                if (userId)
                    await transferDataFromCookieToUserId(userId);
                await deleteCookie("cookieID");
                if (userNameParam)
                    await updateUserName(userNameParam)
                router.replace("/" + (targetPage || ""))
                router.refresh()
            } catch (err) {
                setError(err)
            }
        })()
    }, [])

    return <div className="size-full flex justify-center items-center">
        {!error
            ? <Loader2 className="animate-spin" size={48} />
            : <div className="flex justify-center gap-2 flex-col text-center">
                <p className="text-red-500">{error}</p>
                <Button onClick={() => router.replace("/login")}>Vai al login</Button>
            </div>}
    </div>
}

export default Page