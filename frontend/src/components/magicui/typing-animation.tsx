"use client";

import { createElement, DetailedHTMLProps, HTMLAttributes, useEffect, useState } from "react";

import { cn } from "@/lib/utils";
interface TypingAnimationProps {
    text: string;
    duration?: number;
    className?: string;
    as: keyof JSX.IntrinsicElements;
  }
  
  export function TypingAnimation({
    text,
    duration = 200,
    as,
    className,
  }: TypingAnimationProps) {
    const [displayedText, setDisplayedText] = useState<string>("");
    const [i, setI] = useState<number>(0);
  
    useEffect(() => {
      const typingEffect = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(text.substring(0, i + 1));
          setI(i + 1);
        } else {
          clearInterval(typingEffect);
        }
      }, duration);
  
      return () => {
        clearInterval(typingEffect);
      };
    }, [text, duration, i]);
  
    const Element = createElement(
      as,
      {
        className: cn(
          "font-display leading-[5rem] tracking-[-0.02em] drop-shadow-sm",
          className
        )
      },
      displayedText || text[0]
    );
  
    return Element;
  }