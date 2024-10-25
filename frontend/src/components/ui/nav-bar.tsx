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
import { CartContext } from "../context";
import { Heart, Loader2 } from "lucide-react"
import { DecodedIdToken } from "next-firebase-auth-edge/lib/auth/token-verifier";
import { Button } from "./button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut } from "../auth";

export function NavBarStyled({ categories, account }: { categories: CategoryInfo[], account?: DecodedIdToken }) {
    const [cartContext, _] = useContext(CartContext)
    const router = useRouter()

    return (
        <NavigationMenu className="">
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
                    <Link href="/carrello" legacyBehavior passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Cart: {cartContext !== null ? cartContext.reduce((acc, curr) => curr.quantity + acc, 0) : <Loader2 className="animate-spin" />}
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/preferiti" legacyBehavior passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            <Heart fill="red" strokeWidth={0} />
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    {account
                        ? <Link href="/dashboard" legacyBehavior passHref>
                            <div className="flex space-x-2">
                                <Image src={account.picture ?? ""} width={32} height={32} alt="Immagine profilo" className="rounded-full"/>
                                <Link href="/dashboard">{account.name ?? account.email}</Link>
                                <Button variant="destructive" onClick={async () => await LogOut(router)}>Esci</Button>
                            </div>
                        </Link>
                        : <div className="flex space-x-2">
                            <Link href="/login" legacyBehavior passHref>
                                <Button>Accedi</Button>
                            </Link>
                            <Link href="/registrazione" legacyBehavior passHref>
                                <Button variant="outline">Registrati</Button>
                            </Link>
                        </div>}
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