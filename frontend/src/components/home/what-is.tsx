"use client"

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const collections = [
  {
    id: 1,
    name: "Collezione Primavera",
    description: "Gioielli ispirati ai fiori primaverili",
    image: "/images/spring-collection.jpg",
    backgroundColor: "bg-green-100",
    backgroundImage: "https://th.bing.com/th/id/OIG1.NxvGmn1UjtgwIdsTYG8.?w=1024&h=1024&rs=1&pid=ImgDetMain",
    centralImages: [
      "https://storage.googleapis.com/unica-3d18c.appspot.com/Image/images_ce531d2497_c3e96f0258/images_ce531d2497_c3e96f0258.jpeg",
      "https://storage.googleapis.com/unica-3d18c.appspot.com/Image/istockphoto_1348247616_612x612_29573a26ba_522ec2b7c1/istockphoto_1348247616_612x612_29573a26ba_522ec2b7c1.jpg",
      "https://storage.googleapis.com/unica-3d18c.appspot.com/Image/Minimalist_Banner_desktop_f58d6dbc64_c302ef8de0/Minimalist_Banner_desktop_f58d6dbc64_c302ef8de0.webp"
    ]
  },
  {
    id: 2,
    name: "Collezione Estate",
    description: "Eleganza leggera per le giornate calde",
    image: "/images/summer-collection.jpg",
    backgroundColor: "bg-blue-100",
    backgroundImage: "https://th.bing.com/th/id/OIG1.WgSAKblapXjw4GHuiXpi?pid=ImgGn",
    centralImages: [
      "https://storage.googleapis.com/unica-3d18c.appspot.com/Image/images_ce531d2497_c3e96f0258/images_ce531d2497_c3e96f0258.jpeg",
      "https://storage.googleapis.com/unica-3d18c.appspot.com/Image/istockphoto_1348247616_612x612_29573a26ba_522ec2b7c1/istockphoto_1348247616_612x612_29573a26ba_522ec2b7c1.jpg",
      "https://storage.googleapis.com/unica-3d18c.appspot.com/Image/J13_E_SWEETESCAPE_GOLD_M_jpg_c216503cbb_8c3e5eb451/J13_E_SWEETESCAPE_GOLD_M_jpg_c216503cbb_8c3e5eb451.webp",
      "https://storage.googleapis.com/unica-3d18c.appspot.com/Image/Minimalist_Banner_desktop_f58d6dbc64_c302ef8de0/Minimalist_Banner_desktop_f58d6dbc64_c302ef8de0.webp"
    ]
  }
]

gsap.registerPlugin(ScrollTrigger);

export const WhatIs = () => {
  const sectionRef = useRef(null);
  const triggerRef = useRef(null);

  // Refs per contenuti
  const contentRefs = {
    one: {
      container: useRef(null),
      title: useRef(null),
      paragraph: useRef(null),
      bricks: useRef([])
    },
    two: {
      container: useRef(null),
      title: useRef(null),
      paragraph: useRef(null),
      bricks: useRef([])
    },
    three: {
      container: useRef(null),
      title: useRef(null),
      paragraph: useRef(null),
      bricks: useRef([])
    },
    four: {
      container: useRef(null),
      title: useRef(null),
      paragraph: useRef(null),
      bricks: useRef([])
    }
  };

  useEffect(() => {
    const sections = Object.values(contentRefs).map(ref => ref.container.current);
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
      tl.fromTo(
        section.bricks.current,
        {
          scaleY: 0,
          transformOrigin: 'bottom',
          opacity: 0
        },
        {
          scaleY: 1,
          opacity: 1,
          stagger: 0.1,
          duration: 1
        }
      );

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
        [...section.bricks.current, section.title.current, section.paragraph.current],
        {
          y: '50%',
          opacity: 0,
          duration: 1
        }
      );

      return tl;
    };

    // Aggiungi animazioni per ogni sezione
    timeline
      .add(createSectionAnimation(contentRefs.one))
      .add(createSectionAnimation(contentRefs.two))
      .add(createSectionAnimation(contentRefs.three))
      .add(createSectionAnimation(contentRefs.four));

    return () => {
      timeline.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Componente per generare i mattoncini
  const Bricks = ({ bricksRef, totalHeight, baseColor }) => {

    // Calculate rows based on totalHeight and random heights of bricks
    const calculateRows = () => {
      let rows = [];
      let currentHeight = 0;
      const rowWidth = 100; // Fixed width for each row

      while (currentHeight < totalHeight) {
        const bricksPerRow = Math.floor(Math.random() * 3) + 2; // Random between 2 and 4
        const rowHeight = 30//Math.random() * 20 + 30; // Random height between 30px and 50px

        if (currentHeight + rowHeight > totalHeight) break;

        // Generate bricks with random widths summing up to rowWidth
        let remainingWidth = rowWidth;
        const row = Array.from({ length: bricksPerRow }).map((_, index) => {
          const isLastBrick = index === bricksPerRow - 1;
          const width = isLastBrick
            ? remainingWidth
            : Math.random() * (remainingWidth / (bricksPerRow - index)) * 0.8 + 20;
          remainingWidth -= width;
          return {
            width,
            height: rowHeight,
          };
        });

        if (Math.random() > 0.5)
          rows.push(row);
        else
          rows.push(row.reverse());

        currentHeight += rowHeight;
      }

      return rows;
    };

    const rows = calculateRows();

    const generateColorVariation = (_baseColor, variationRange = 30) => {
      const randomize = (value) =>
        Math.min(255, Math.max(0, value + Math.floor(Math.random() * (2 * variationRange + 1)) - variationRange));
    
      return `rgb(${randomize(_baseColor[0])}, ${randomize(_baseColor[1])}, ${randomize(_baseColor[2])})`;
    };

    return (
      <div className="flex flex-col items-center origin-bottom" style={{transform: "rotateX(60deg)"}}>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center" style={{ width: "400px" }}>
            {row.map((brick, brickIndex) => (
              <div
                key={brickIndex}
                ref={el => bricksRef.current[brickIndex + rows.reduce((prev, curr, i) => i < rowIndex ? curr.length + prev : prev, 0)] = el}
                className="shadow-md"
                style={{
                  width: `${brick.width}px`,
                  height: `${brick.height}px`,
                  backgroundColor: generateColorVariation(baseColor),
                  border: `1px solid ${generateColorVariation(baseColor, 10)}`,
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
      <div
        ref={sectionRef}
        className="w-full h-full absolute top-0 left-0 flex flex-col justify-center items-center"
      >
        {/* Prima sezione */}
        <div
          ref={contentRefs.one.container}
          className="text-center absolute w-full px-4 flex flex-col items-center"
        >
          <div className="flex mb-4" style={{perspective: "1500px"}}>
            <Bricks
              totalHeight={150}
              bricksRef={contentRefs.one.bricks}
              baseColor={[66, 170, 245]}
            />
          </div>
          <h2
            ref={contentRefs.one.title}
            className="text-4xl font-bold mb-4"
          >
            Unicità
          </h2>
          <p
            ref={contentRefs.one.paragraph}
            className="text-xl max-w-2xl"
          >
            Descrizione del primo blocco che entra e esce.
          </p>
        </div>

        {/* Seconda sezione */}
        <div
          ref={contentRefs.two.container}
          className="text-center absolute w-full px-4 flex flex-col items-center"
        >
          <div className="flex mb-4"  style={{perspective: "1500px"}}>
            <Bricks
              totalHeight={220}
              bricksRef={contentRefs.two.bricks}
              baseColor={[252, 161, 3]}
            />
          </div>
          <h2
            ref={contentRefs.two.title}
            className="text-4xl font-bold mb-4"
          >
            Significato
          </h2>
          <p
            ref={contentRefs.two.paragraph}
            className="text-xl max-w-2xl"
          >
            Descrizione del secondo blocco che entra e esce.
          </p>
        </div>

        {/* Terza sezione */}
        <div
          ref={contentRefs.three.container}
          className="text-center absolute w-full px-4 flex flex-col items-center"
        >
          <div className="flex mb-4" style={{perspective: "1500px"}}>
            <Bricks
              totalHeight={300}
              bricksRef={contentRefs.three.bricks}
              baseColor={[50, 168, 82]}
            />
          </div>
          <h2
            ref={contentRefs.three.title}
            className="text-4xl font-bold mb-4"
          >
            Bellezza
          </h2>
          <p
            ref={contentRefs.three.paragraph}
            className="text-xl max-w-2xl"
          >
            Descrizione del terzo blocco che entra e esce.
          </p>
        </div>

        {/* Quarta sezione */}
        <div
          ref={contentRefs.four.container}
          className="text-center absolute w-full px-4 flex flex-col items-center"
        >
          <div className="flex mb-4">
            <Bricks
              count={5}
              bricksRef={contentRefs.four.bricks}
            />
          </div>
          <h2
            ref={contentRefs.four.title}
            className="text-4xl font-bold mb-4"
          >
            Quarto Titolo
          </h2>
          <p
            ref={contentRefs.four.paragraph}
            className="text-xl max-w-2xl"
          >
            Descrizione del quarto blocco che entra e termina.
          </p>
        </div>
      </div>
    </div>
  );
};