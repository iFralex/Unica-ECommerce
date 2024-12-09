"use client"

import { NeonGradientCard } from "../magicui/neon-gradient-card"


export const WhatIs = () => {
  const colors = [
    { firstColor: '#FF416C', secondColor: '#00E5FF' },
    { firstColor: '#FFB75E', secondColor: '#8A2BE2' },
    { firstColor: '#00FFA3', secondColor: '#FF6B6B' },
  ];
  
  const texts = ["Unicità", "Significato", "Bellezza"];
  
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center w-full uppercase">
        {/* Largest circular card at the top */}
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mb-4">
          <div className="aspect-square w-full">
            <NeonGradientCard 
              neonColors={colors[0]} 
              coloredShadow={false} 
              borderRadius={1000} 
              borderSize={10} 
              className="relative w-full h-full"
            >
              <div className="absolute inset-0 z-1 flex items-center justify-center text-center h-full w-full">
                <div className="p-8 sm:p-12 text-center">
                  <h2 className="text-4xl sm:text-3xl md:text-6xl fond-bold">{texts[0]}</h2>
                </div>
              </div>
            </NeonGradientCard>
          </div>
        </div>
        
        {/* Bottom two circular cards */}
        <div className="flex justify-between md:justify-around space-x-4 w-full">
          {texts.slice(1).map((t, i) => (
            <div 
              key={t} 
              className="w-full max-w-[calc(100%/3)] sm:max-w-[calc(100%/4)] "
            >
              <div className="aspect-square w-full">
                <NeonGradientCard 
                  neonColors={colors[i + 1]} 
                  coloredShadow={false} 
                  borderRadius={1000} 
                  borderSize={10} 
                  className="relative w-full h-full"
                >
                  <div className="absolute inset-0 z-1 flex items-center justify-center text-center h-full w-full">
                    <div className="p-4 sm:p-6 text-center">
                      <h2 className="text-xl sm:text-2xl">{t}</h2>
                    </div>
                  </div>
                </NeonGradientCard>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhatIs;