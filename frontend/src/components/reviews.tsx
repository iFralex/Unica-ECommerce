import { cn } from "@/lib/utils";
import { Marquee } from "@/components/magicui/marquee";
import { APIResponse } from "@/types/strapi-types";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "./ui/button";
import Link from "next/link";

const reviews = [
    {
        name: "Jack",
        username: "@jack",
        body: "I've never seen anything like this before. It's amazing. I love it.",
        img: "https://avatar.vercel.sh/jack",
    },
    {
        name: "Jill",
        username: "@jill",
        body: "I don't know what to say. I'm speechless. This is amazing.",
        img: "https://avatar.vercel.sh/jill",
    },
    {
        name: "John",
        username: "@john",
        body: "I'm at a loss for words. This is amazing. I love it.",
        img: "https://avatar.vercel.sh/john",
    },
    {
        name: "Jane",
        username: "@jane",
        body: "I'm at a loss for words. This is amazing. I love it.",
        img: "https://avatar.vercel.sh/jane",
    },
    {
        name: "Jenny",
        username: "@jenny",
        body: "I'm at a loss for words. This is amazing. I love it.",
        img: "https://avatar.vercel.sh/jenny",
    },
    {
        name: "James",
        username: "@james",
        body: "I'm at a loss for words. This is amazing. I love it.",
        img: "https://avatar.vercel.sh/james",
    },
];

const ReviewCard = ({ review, avatarBgColor }: { review: Extract<NonNullable<APIResponse<"api::product.product">["data"]["attributes"]["Description"]>[number], { __component: "product.review" }>, avatarBgColor: string }) => {
    if (!review)
        return <></>
    return (
        <Dialog>
            <DialogTrigger asChild>
                <figure
                    className={cn(
                        "relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
                        // light styles
                        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
                        // dark styles
                        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
                    )}
                >
                    <div className="flex flex-row items-center gap-2">
                        {review.AvatarURL ? <Image className={"rounded-full"} width="32" height="32" alt="Immagine profilo" src={review.AvatarURL} /> : <div className={cn("rounded-full size-[32px]", avatarBgColor)} />}
                        <div className="flex flex-col">
                            <figcaption className="text-sm font-medium dark:text-white">
                                {review.UserName}
                            </figcaption>
                        </div>
                        <div className="flex-1 flex justify-end space-x-2">
                            {review.InstagramURL && <Image src={"/icons/instagram.svg"} width={20} height={20} alt="logo di Instagram" />}
                            {review.TikTokURL && <Image src={"/icons/tiktok.svg"} width={20} height={20} alt="logo di Instagram" />}
                        </div>
                    </div>
                    <blockquote className="mt-2 text-sm line-clamp-3">{review.Text}</blockquote>
                </figure>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <div className="flex flex-row items-center gap-2">
                        {review.AvatarURL ? <Image className={"rounded-full"} width="32" height="32" alt="Immagine profilo" src={review.AvatarURL} /> : <div className={cn("rounded-full size-[32px]", avatarBgColor)} />}
                        <div className="flex flex-col">
                            <DialogTitle>
                                <figcaption className="text-sm font-medium dark:text-white">
                                    {review.UserName}
                                </figcaption>
                            </DialogTitle>
                        </div>
                        <div className="flex-1 flex justify-end space-x-2">
                            {review.InstagramURL && <Button className="p-0" variant="link"><Link href={review.InstagramURL}><Image src={"/icons/instagram.svg"} width={20} height={20} alt="Vai al profilo Instagram" /></Link></Button>}
                            {review.TikTokURL && <Button className="p-0" variant="link"><Link href={review.TikTokURL}><Image src={"/icons/tiktok.svg"} width={20} height={20} alt="Vai al profilo TikTok" /></Link></Button>}
                        </div>
                    </div>
                </DialogHeader>
                <blockquote className="mt-2">{review.Text}</blockquote>
            </DialogContent>
        </Dialog>
    );
};

export function Reviews({ reviews }: { reviews: Extract<NonNullable<APIResponse<"api::product.product">["data"]["attributes"]["Description"]>[number], { __component: "product.review" }>[] }) {
    const colors = [{ firstColor: 'from-purple-500', middleColor: "", lastColor: 'to-pink-500' },
    { firstColor: 'from-cyan-500', middleColor: "", lastColor: 'to-blue-500' },
    { firstColor: 'from-emerald-500', middleColor: "", lastColor: 'to-lime-600' },
    { firstColor: 'from-rose-400', middleColor: "via-fuchsia-500", lastColor: 'to-indigo-500' },
    { firstColor: 'from-yellow-200', middleColor: "via-green-200", lastColor: 'to-green-500' }
    ]
    const firstRow = reviews.slice(0, reviews.length / 2);
    const secondRow = reviews.slice(reviews.length / 2);
    return (
        <div className={"relative flex h-[" + (((firstRow.length && 1) + (secondRow.length && 1)) * 175).toString() + "px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-md"}>
            <Marquee pauseOnHover className="[--duration:20s]">
                {firstRow.map((review, i) => (
                    <ReviewCard key={i} review={review} avatarBgColor={"bg-gradient-to-r " + colors[i % colors.length].firstColor + " " + colors[i % colors.length].middleColor + " " + colors[i % colors.length].lastColor} />
                ))}
            </Marquee>
            <Marquee reverse pauseOnHover className="[--duration:20s]">
                {secondRow.map((review, i) => (
                    <ReviewCard key={i} review={review} avatarBgColor={"bg-gradient-to-r " + colors[colors.length - 1 - (i % colors.length)].firstColor + " " + colors[colors.length - 1 - (i % colors.length)].middleColor + " " + colors[colors.length - 1 - (i % colors.length)].lastColor} />
                ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
        </div>
    );
}