import { Login } from "@/components/auth"
import { AuthDialog } from "@/components/auth-structure"

const Page = async () => {
    console.log("login dialog")
    return (
        <AuthDialog type="login">
            <Login />
        </AuthDialog>
    )
}

export default Page