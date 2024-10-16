import { Signup } from "@/components/auth"
import { AuthFullScreenWrapper } from "@/components/auth-structure"

const Page = async () => {
    return (
        <AuthFullScreenWrapper type="signup">
            <Signup />
        </AuthFullScreenWrapper>
    )
}

export default Page