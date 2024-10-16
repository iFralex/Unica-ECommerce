import { Signup } from "@/components/auth"
import { AuthDialog } from "@/components/auth-structure"

const Page = async () => {
    return (
        <AuthDialog type="signup">
            <Signup />
        </AuthDialog>
    )
}

export default Page