import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider, CartProvider, UserProvider, ContextListeners, FavoritesProvider } from "@/components/context"
import { NavBarStyled } from "@/components/ui/nav-bar"
import { getCategories, getCookie } from "@/actions/get-data"
import { Toaster } from "@/components/ui/toaster"
import { DecodedIdToken } from "next-firebase-auth-edge/lib/auth/token-verifier";
import { getAuthToken } from "@/actions/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Unica Jewelry",
  description: "Ecommerce di Unica",
};

export default async function RootLayout({ favorite, auth, children }: { favorite: React.ReactNode, auth: React.ReactNode, children: React.ReactNode }) {
  const tokens = await getAuthToken()

  return (
    <html lang="it" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            <CartProvider>
              <FavoritesProvider>
                <ContextListeners loggedUserId={tokens?.decodedToken.uid} />
                <Toaster />
                <div className="flex flex-col h-screen">
                  <div>
                    <NavBar user={tokens?.decodedToken} />
                  </div>
                  <div className="flex-grow h-full relative">
                    {children}
                  </div>
                </div>
                {favorite}
                {auth}
              </FavoritesProvider>
            </CartProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

async function NavBar({ user }: { user?: DecodedIdToken }) {
  const categories = await getCategories()
  if (categories instanceof Error)
    return <div>Errore: {categories.message}</div>

  //const itemsInCart = await getCookie<CartType[]>("cart")
  return <NavBarStyled categories={categories} account={user} />
}