import { Button } from "@/components/ui/button";
import { PaymentProgress } from "./client";
import { checkSignInEmailLink, getAddresses } from "@/actions/firebase";
import { getAddressesFromAddressesLight, getAuthToken } from "@/actions/auth";

const Page = async () => {
    //const [payState, setPayState] = useState<"loading" | "error" | "success" | null>(null)

    const handlePay = async () => {
        /*setPayState("loading")
        const payRes = await payOrder()
        if (!payRes)
            return setPayState("error")
        setCart([])
        setPayState("success")
        */
    }
    const auth = await getAuthToken()
    let addresses
    if (auth !== null) {
        addresses = await getAddressesFromAddressesLight(auth.decodedToken.uid, (await getAddresses(auth.decodedToken.uid) || []))
    }
    console.log("ciao", auth)
    return <PaymentProgress auth={auth} startedStep={auth === null ? "login" : "shipping"} addresses={addresses} />
}

export default Page