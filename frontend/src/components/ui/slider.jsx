"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"
import { NeonGradientCard } from "../magicui/neon-gradient-card"

const Slider = React.forwardRef(({ className, height = 0, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("h-[" + Math.floor(height * 1.5).toString() + "px] relative flex w-full touch-none select-none items-center", className)}
    {...props}>
    <SliderPrimitive.Track
      className={"relative h-[" + height.toString() + "px] w-full grow overflow-hidden rounded-full bg-slate-100 dark:bg-slate-950"}>
      <SliderPrimitive.Range className="absolute h-full bg-slate-900 dark:bg-slate-50">
        <NeonGradientCard className="absolute inset-0 z-0 overflow-hidden" backgroundColor="[#]" />
      </SliderPrimitive.Range>
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={cn("size-[" + Math.floor(height * 1.5).toString() + "px]", "block rounded-full border-2 border-slate-900 bg-white ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-50 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300")} />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
