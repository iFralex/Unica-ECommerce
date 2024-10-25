import Link from "next/link"
import {
    CircleUser,
    GlobeLock,
    LineChart,
    LucideProps,
    Package,
    ShoppingCart,
    User,
    Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { usePathname } from "next/navigation";
import { headers } from "next/headers";
import { ForwardRefExoticComponent, ReactNode, RefAttributes } from "react";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "Unica Jewelry Dashboard",
    description: "Ecommerce di Unica",
};

const navItems: { url: string, lable: string, icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>> }[] = [{
    url: "/ordini",
    lable: "Ordini",
    icon: ShoppingCart
},
{
    url: "/account",
    lable: "Account",
    icon: User
}]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid h-full w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex-1">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                            {navItems.map((item, i) => (
                                <Link
                                    href={"/dashboard" + item.url}
                                    className={"flex items-center gap-3 px-3 py-2 transition-all hover:text-primary hover:border-y hover:border-r"}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.lable}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>
            <main>
                <ScrollArea className="h-screen flex flex-col p-4 lg:p-6">
                    {children}
                    <ScrollBar />
                </ScrollArea>
            </main>
        </div>
    );
}