import { RetrivePassword } from "@/components/auth"
import { AuthFullScreenWrapper } from "@/components/auth-structure"

const Page = async () => {
    return (
        <AuthFullScreenWrapper type="password-forgot">
            <RetrivePassword />
        </AuthFullScreenWrapper>
    )
}

export default Page