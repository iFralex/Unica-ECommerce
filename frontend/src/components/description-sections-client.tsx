"use client"
import { Card } from '@/components/ui/card';
import { CardDescriptionType } from '@/types/types';
import { gsap } from 'gsap';
import { useEffect, useRef, useState } from 'react';
import { FrontSide } from 'three';
import { ShineBorder } from './magicui/shine-border';
import Image from 'next/image';

export const FlipCard = ({ card }: { card: CardDescriptionType }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardFrontRef = useRef<HTMLDivElement>(null);
  const cardBackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardFrontRef.current) return;

    gsap.to(cardFrontRef.current, {
      rotationY: isFlipped ? 180 : 0,
      duration: 0.6,
      ease: "power2.inOut"
    });
    gsap.to(cardBackRef.current, {
      rotationY: isFlipped ? 0 : 180,
      duration: 0.6,
      ease: "power2.inOut"
    });
  }, [isFlipped]);

  return (
    <div
      className="h-32 perspective-1000 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="relative w-full h-full">
        <div ref={cardFrontRef} className="absolute w-full h-full transform-style-preserve-3d overflow-hidden" style={{ backfaceVisibility: "hidden" }}>
          <div className="absolute bottom-[3px] right-[3px] w-1/2 h-1/2">
            <Image src={"/rainbow_stripe.gif"} alt='g' layout="fill" objectFit="cover" />
          </div>
          <Card className="absolute inset-0 flex items-center justify-center border-blue-500 border-[3px] z-1 bg-[00000000]">
            <h2 className="text-xl font-bold">{card.title}</h2>
          </Card>
        </div>
        <div ref={cardBackRef} className="absolute inset-0 rotate-y-180 transform-style-preserve-3d" style={{ backfaceVisibility: "hidden" }}>
          <ShineBorder className='w-full h-full' borderWidth={3} color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}>
            <div className="w-full h-full flex items-center justify-center p-4">
              <p>{card.description}</p>
            </div>
          </ShineBorder>
        </div>
      </div>
    </div>
  );
};

const RainbowStripe = () => {
  const stripesRef = useRef<(HTMLDivElement | null)[]>(new Array(3).fill(null));

  useEffect(() => {
    const stripes = stripesRef.current;
    const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
    const angle = Math.atan((stripes[0]?.parentElement?.offsetHeight ?? 0) / (stripes[0]?.parentElement?.offsetWidth ?? 1)) * 180 / Math.PI

    const animateStripe = (stripe, delay = 0, offset = 0) => {
      let currentColorIndex = 0;

      const animateColor = () => {
        gsap.to(stripe, {
          backgroundColor: colors[currentColorIndex],
          duration: 1,
          onComplete: () => {
            gsap.to(stripe, {
              backgroundColor: 'white',
              duration: 0.5,
              onComplete: () => {
                currentColorIndex = (currentColorIndex + 1) % colors.length;
                animateColor();
              }
            });
          }
        });
      };

      const animatePosition = () => {
        gsap.fromTo(stripe,
          {
            top: 0 + offset + "%",
            right: '-50%',
            rotate: -angle,
          },
          {
            top: 150 + offset + "%",
            right: '100%',
            rotate: -angle,
            duration: 2,
            ease: 'none',
            onComplete: () => {
              gsap.set(stripe, { top: '-70%', right: '-60%' });
              animatePosition();
            }
          }
        );
      };

      gsap.delayedCall(delay, () => {
        animateColor();
        animatePosition();
      });
    };

    stripes.map((s, i) => animateStripe(s, i / 3, i * 15))

    return () => {
      gsap.killTweensOf(stripes);
    };
  }, []);

  return (
    <>
      {stripesRef.current.map((_, i) => (
        <div
          key={i}
          ref={r => (stripesRef.current[i] = r)}
          className="absolute w-full h-4 rounded-lg"
          style={{
            transform: "translateX(50%)",
          }}
        />))}
    </>
  );
};

export const AnimatedBackgroundDiv = ({children}) => {
  return <section className='mt-5 py-5 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 animate-gradient-x'>
    <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% {
            background-size: 400% 400%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        .animate-gradient-x {
          animation: gradient-x 15s ease infinite;
        }
      `}</style>
      {children}
  </section>
}