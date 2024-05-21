import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { NavBarStyled } from "@/components/ui/nav-bar"
import { getCategories } from "@/actions/get-data"

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Unica Jewelry",
  description: "Ecommerce di Unica",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <NavBar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

async function NavBar() {
  const categories = await getCategories()
  return <NavBarStyled categories={categories} />
}