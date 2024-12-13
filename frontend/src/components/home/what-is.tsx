"use client"

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { sections } from '@/app/page';

gsap.registerPlugin(ScrollTrigger);

const sortSec = ["bellezza", "unicità", "significato"]

gsap.registerPlugin(ScrollTrigger);

export const WhatIs = ({ allRows, allColors, allBorderColors }) => {
  const sectionRef = useRef(null);
  const triggerRef = useRef(null);

  // Refs per contenuti
  const contentRefs = {
    ...Object.fromEntries(
      sections.map(section => [section.key, {
        container: useRef(null),
        title: useRef(null),
        paragraph: useRef(null),
        bricks: useRef([])
      }])
    ),
    all: {
      multipleBricks: sections.map(() => useRef([])),
      container: useRef(null),
      title: useRef(null),
      paragraph: useRef(null)
    }
  };

  useEffect(() => {
    const trigger = triggerRef.current;

    // Disattiva animazioni precedenti
    ScrollTrigger.getAll().forEach(t => t.kill());

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: trigger,
        start: 'top top',
        end: '+=400%',
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      }
    });

    // Funzione per creare animazione di una sezione
    const createSectionAnimation = (section) => {
      const tl = gsap.timeline();

      // Animazione mattoncini
      (section.bricks ? [section.bricks] : section.multipleBricks).map(b => tl.fromTo(
        b.current,
        {
          scaleY: 0,
          transformOrigin: 'bottom',
          opacity: 0
        },
        {
          scaleY: 1,
          opacity: 1,
          stagger: section.multipleBricks ? 0.1 : 0.1,
          duration: section.multipleBricks ? 1 : 1,
          ease: "bounce.inOut"
        },
        '<'
      ))

      // Animazione contenuto 
      tl.fromTo(
        [section.title.current, section.paragraph.current],
        {
          y: '50%',
          opacity: 0
        },
        {
          y: '0%',
          opacity: 1,
          duration: 1
        },
        '<' // Inizia contemporaneamente all'animazione dei mattoncini
      );

      // Uscita contenuto e mattoncini
      tl.to(
        [...(section.bricks?.current || section.multipleBricks.map(b => b.current)), section.title.current, section.paragraph.current],
        {
          y: '50%',
          opacity: 0,
          duration: 1
        }
      );

      return tl;
    };

    // Aggiungi animazioni per ogni sezione
    sections.reduce((timeline, section) =>
      timeline.add(createSectionAnimation(contentRefs[section.key])),
      timeline
    ).add(createSectionAnimation(contentRefs.all))

    return () => {
      timeline.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Componente per generare i mattoncini
  const Bricks = ({ bricksRef, rows, colors, borderColors }) => {

    return (
      <div className="flex flex-col items-center origin-bottom" style={{ transform: "rotateX(60deg)" }}>
        {rows.map((row, rowIndex, self) => (
          <div key={rowIndex} className="flex justify-center">
            {row.map((brick, brickIndex) => (
              <div
                key={brickIndex}
                ref={el => bricksRef.current[brickIndex + self.reduce((prev, curr, i) => i < rowIndex ? curr.length + prev : prev, 0)] = el}
                className="shadow-md"
                style={{
                  width: `${brick.width}px`,
                  height: `${brick.height}px`,
                  backgroundColor: colors[rowIndex][brickIndex],
                  border: `1px solid ${borderColors[rowIndex][brickIndex]}`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div ref={triggerRef} className="w-full h-screen bg-white relative overflow-hidden">
      <div ref={sectionRef} className="w-full h-full absolute top-0 left-0 flex flex-col justify-center items-center">
        {sections.map((section, i) => (
          <div
            key={section.key}
            ref={contentRefs[section.key].container}
            className="text-center absolute w-full px-4 flex flex-col items-center"
          >
            <div className="flex mb-4 mt-[-20%]" style={{ perspective: "1500px" }}>
              <Bricks
                rows={allRows[i]}
                bricksRef={contentRefs[section.key].bricks}
                colors={allColors[i]}
                borderColors={allBorderColors[i]}
              />
            </div>
            <h2
              ref={contentRefs[section.key].title}
              className="text-4xl font-bold mb-4"
            >
              {section.title}
            </h2>
            <p
              ref={contentRefs[section.key].paragraph}
              className="text-xl max-w-2xl"
            >
              {section.description}
            </p>
          </div>
        ))}

        <div
          ref={contentRefs.all.container}
          className="text-center absolute w-full px-4 flex flex-col items-center"
        >
          <div className="flex items-end gap-3 mb-4 mt-[-20%] justify-center" style={{ perspective: "2000px" }}>
            {sortSec.map(key => {
              const index = sections.findIndex(section => section.key === key);
              const section = sections[index];
              return (
                <Bricks
                  key={key}
                  rows={allRows[index]}
                  bricksRef={contentRefs.all.multipleBricks[index]}
                  colors={allColors[index]}
                  borderColors={allBorderColors[index]}
                />
              );
            })}
          </div>
          <h2
            ref={contentRefs.all.title}
            className="text-4xl font-bold mb-4"
          >
            Unica è te!
          </h2>
          <p
            ref={contentRefs.all.paragraph}
            className="text-xl max-w-2xl"
          >
            Descrizione del quarto blocco che entra e termina.
          </p>
        </div>
      </div>
    </div>
  );
};