import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider, CartProvider, UserProvider, ContextListeners, FavoritesProvider } from "@/components/context"
import { NavBarStyled } from "@/components/ui/nav-bar"
import { getCategories, getCookie } from "@/actions/get-data"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Unica Jewelry",
  description: "Ecommerce di Unica",
};

export default function RootLayout({ favorite, children }: { favorite: React.ReactNode, children: React.ReactNode }) {
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
                <ContextListeners />
                <Toaster />
                <div className="flex flex-col h-screen">
                  <div>
                    <NavBar />
                  </div>
                  <div className="flex-grow h-full relative">
                    {children}
                  </div>
                </div>
                {favorite}
              </FavoritesProvider>
            </CartProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

async function NavBar() {
  const categories = await getCategories()
  if (categories instanceof Error)
    return <div>Errore: {categories.message}</div>

  //const itemsInCart = await getCookie<CartType[]>("cart")
  return <NavBarStyled categories={categories} />
}