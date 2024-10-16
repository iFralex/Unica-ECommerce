import { RetrivePassword } from "@/components/auth"
import { AuthDialog } from "@/components/auth-structure"

const Page = async () => {
    console.log("login dialog")
    return (
        <AuthDialog type="password-forgot">
            <RetrivePassword />
        </AuthDialog>
    )
}

export default Page