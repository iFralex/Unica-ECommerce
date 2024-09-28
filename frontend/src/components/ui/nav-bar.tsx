"use client"
import { useContext, useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { CartType, CategoryInfo } from '@/types/types';
import { cookies } from 'next/headers';
import { cn } from "@/lib/utils";
import { getCookie } from "@/actions/get-data";
import { CartContext } from "../context";
import {Loader2} from "lucide-react"

export function NavBarStyled({ categories }: { categories: CategoryInfo[] }) {
    let [cartContext, setCartContext] = useContext(CartContext)
    
    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Gioielli</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                            {categories.map(category => (
                                <ListItem key={category.sku} href={"/" + category.sku} title={category.name}>{category.description}</ListItem>
                            ))}
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/docs" legacyBehavior passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Chi siamo
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/cart" legacyBehavior passHref>
                         <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Cart: {cartContext.cartQuantity !== -1 ? cartContext.cartQuantity : <Loader2 />}
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
}

const ListItem = ({ className, title, href, children }: { className?: string | undefined, title: string, href: string, children: React.ReactNode }) => {
    const ref = useRef(null);

    return (
        <li>
            <NavigationMenuLink asChild>
                <Link
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    href={href}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </Link>
            </NavigationMenuLink>
        </li>
    );
};