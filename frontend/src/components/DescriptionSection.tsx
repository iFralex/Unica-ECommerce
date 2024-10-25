import { CardDescriptionType } from "@/types/types";
import { AnimatedBackgroundDiv, FlipCard } from "./description-sections-client";
import { Separator } from "./ui/separator"
import BlurFade from "./magicui/blur-fade";
import ShimmerButton from "@/components/magicui/shimmer-button";
import { NeonGradientCard } from "./magicui/neon-gradient-card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { ShineBorder } from "./magicui/shine-border";
import { APIResponse } from "@/types/strapi-types";
import { Card } from "./ui/card";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";

export const Testimonial = ({ data }: { data?: APIResponse<"api::testimonial.testimonial">["data"]["attributes"] }) => {
  if (!data)
    return <></>
  return <div className="text-center">
    <Separator className="my-5" />
    <Card className="flex flex-col md:md:flex-row items-center overflow-hidden">
      <div className="md:w-2/3 relative z-10">
        <h1 className="text-xl md:text-xl text-foreground my-4">In collaborazione con <span className="font-bold text-5xl block">{data.Name}</span></h1>
        <p>{data.Description}</p>
        {data.LinkURL && data.LinkText && <Button className="mt-3">
          <Link href={data.LinkURL}>
            {data.LinkText}
          </Link>
        </Button>
        }
      </div>
      <div>
        <Image src={process.env.DOMAIN_URL + data.Image?.data.attributes.formats?.medium.url} width={data.Image?.data.attributes.formats?.medium.width} height={data.Image?.data.attributes.formats?.medium.height} alt="immagine del testimonial" className="transform md:translate-x-[-15%] translate-y-[15%] scale-[130%]" />
      </div>
    </Card>
  </div>
}

export const CardGrid = ({ cards }: { cards: CardDescriptionType[] }) => {
  if (!cards.length)
    return <></>

  return (
    <div className="text-center">
      <Separator className="my-5" />
      <h1 className="text-3xl md:text-4xl font-bold text-foreground my-4">Come sei</h1>
      <div className={"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 " + (cards.length % 2 !== 0 ? 3 : 2) + " lg:grid-cols-" + (cards.length % 2 === 0 ? 4 : 3) + " gap-4 px-4"}>
        {cards.map((card, index) => (
          <BlurFade key={index} delay={0.25 + index % 25 * 0.1} inView>
            <FlipCard card={card} />
          </BlurFade>
        ))}
      </div>
    </div>
  );
};

export const DetailsDescription = ({ cards }: { cards: CardDescriptionType[] }) => {
  let colors = [{ firstColor: '#FF416C', secondColor: '#00E5FF' },
  { firstColor: '#FFB75E', secondColor: '#8A2BE2' },
  { firstColor: '#00FFA3', secondColor: '#FF6B6B' },
  { firstColor: '#1A2980', secondColor: '#FAFB52' },
  { firstColor: '#FF5F6D', secondColor: '#00FFF0' }
  ]

  return <section>
    <Separator className="my-5" />
    <h1 className="text-3xl md:text-4xl font-bold text-foreground my-4 text-center">Dettagli</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 h-full gap-4 px-4 w-full">
      {cards.map((c, i) => (
        <div className="mx-auto size-full py-5">
          <div className="mx-auto w-full max-w-96 h-full max-h-96">
            <div className="w-full max-w-96 h-96 max-h-96">
              <NeonGradientCard neonColors={colors[i % colors.length]} coloredShadow={false} borderRadius={500} borderSize={10} className="relative">
                <ShimmerButton shimmerColor={colors[i % colors.length].firstColor} borderRadius="50%" shimmerSize="10px" background="white" className="size-full" />
                <div className="absolute inset-0 z-1 flex items-center justify-center text-center h-full">
                  <div className="p-16">
                    <h2 className="text-3xl">{c.title}</h2>
                  </div>
                </div>
              </NeonGradientCard>
            </div>
          </div>
          <div className="w-64 mx-auto mt-[-50px]">
            <NeonGradientCard neonColors={colors[i % colors.length]} coloredShadow={false} borderSize={10}>
              <div className="bg-white rounded-md">
                <p>{c.description}</p>
              </div>
            </NeonGradientCard>
          </div>
        </div>
      ))}
    </div>
  </section>
}

export const FAQ = ({ faqs }: { faqs?: APIResponse<"api::faq.faq">["data"][] }) => {
  if (!faqs || !faqs.length)
    return <></>

  let colors = [{ firstColor: '#FF416C', secondColor: '#00E5FF' },
  { firstColor: '#FFB75E', secondColor: '#8A2BE2' },
  { firstColor: '#00FFA3', secondColor: '#FF6B6B' },
  { firstColor: '#1A2980', secondColor: '#FAFB52' },
  { firstColor: '#FF5F6D', secondColor: '#00FFF0' }
  ]
  return (
    <section>
      <Separator className="my-5" />
      <h1 className="text-3xl md:text-4xl font-bold text-foreground my-4 text-center">FAQ</h1>
      <div>
        <Accordion type="multiple" className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {faqs.map((faq, i) =>
            <BlurFade key={i} delay={0.25 + i % 25 * 0.1} inView>
              <ShineBorder borderWidth={5} borderRadius={3} color={[colors[i % colors.length].firstColor, colors[i % colors.length].secondColor, colors[(i + 1) % colors.length].firstColor]} className="px-5">
                <AccordionItem value={"item-" + i}>
                  <AccordionTrigger fullWidth={true}>{faq.attributes.Question}</AccordionTrigger>
                  <AccordionContent>
                    {faq.attributes.Answer}
                  </AccordionContent>
                </AccordionItem>
              </ShineBorder>
            </BlurFade>
          )}
        </Accordion>
      </div>
    </section>
  )
}