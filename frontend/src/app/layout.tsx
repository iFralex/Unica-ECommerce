import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider, CartProvider, UserProvider, ContextListeners } from "@/components/context"
import { NavBarStyled } from "@/components/ui/nav-bar"
import { getCategories, getCookie } from "@/actions/get-data"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Unica Jewelry",
  description: "Ecommerce di Unica",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
              <ContextListeners />
              <Toaster />
              <NavBar />
              {children}
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