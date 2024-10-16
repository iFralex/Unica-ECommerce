import { Login } from "@/components/auth"
import { AuthFullScreenWrapper } from "@/components/auth-structure"

const Page = async () => {
    return (
        <AuthFullScreenWrapper type="login">
            <Login />
        </AuthFullScreenWrapper>
    )
}

export default Page