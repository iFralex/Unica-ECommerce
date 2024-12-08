"use client"

import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import Image from 'next/image';
import { Button } from './ui/button';

// Registra il plugin ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Interfaccia per la tipologia di collezione
interface Collection {
    id: number;
    name: string;
    description: string;
    image: string;
    backgroundColor?: string;
    backgroundImage?: string;
    centralImages: string[];
}

// Dati delle collezioni (da sostituire con i tuoi)
const collections: Collection[] = [
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
    },
    {
        id: 3,
        name: "Collezione Autunno",
        description: "Toni caldi e profondi",
        image: "/images/autumn-collection.jpg",
        backgroundColor: "bg-orange-100",
        backgroundImage: "https://th.bing.com/th/id/OIG1.feQvUZj.54tMlGLry8O9?pid=ImgGn",
        centralImages: [
            "https://storage.googleapis.com/unica-3d18c.appspot.com/Image/istockphoto_1348247616_612x612_29573a26ba_522ec2b7c1/istockphoto_1348247616_612x612_29573a26ba_522ec2b7c1.jpg",
            "https://storage.googleapis.com/unica-3d18c.appspot.com/Image/J13_E_SWEETESCAPE_GOLD_M_jpg_c216503cbb_8c3e5eb451/J13_E_SWEETESCAPE_GOLD_M_jpg_c216503cbb_8c3e5eb451.webp",
        ]
    },
    {
        id: 4,
        name: "Collezione Inverno",
        description: "Gioielli che scaldano l'animo",
        image: "/images/winter-collection.jpg",
        backgroundColor: "bg-gray-100",
        backgroundImage: "https://th.bing.com/th/id/OIG1.pMb6qWsSQMf_BKD7dqfx?pid=ImgGn",
        centralImages: [
            "https://storage.googleapis.com/unica-3d18c.appspot.com/Image/images_ce531d2497_c3e96f0258/images_ce531d2497_c3e96f0258.jpeg",
            "https://storage.googleapis.com/unica-3d18c.appspot.com/Image/J13_E_SWEETESCAPE_GOLD_M_jpg_c216503cbb_8c3e5eb451/J13_E_SWEETESCAPE_GOLD_M_jpg_c216503cbb_8c3e5eb451.webp",
            "https://storage.googleapis.com/unica-3d18c.appspot.com/Image/Minimalist_Banner_desktop_f58d6dbc64_c302ef8de0/Minimalist_Banner_desktop_f58d6dbc64_c302ef8de0.webp"
        ]
    }
];

// Interface for photo placement metadata
interface PhotoPlacement {
    zIndex: number;
    rotation: number;
    scale: number;
    top: number;
    left: number;
    width: number;
    height: number;
}

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

const generatePhotoPlacements = (count: number): PhotoPlacement[] => {
    const placements: PhotoPlacement[] = [];
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Definizione dell'area esclusa per il testo
    const marginTop = screenHeight * 0.2; // 20% per il titolo
    const marginBottom = screenHeight * 0.1; // 10% per margini aggiuntivi
    const availableWidth = screenWidth * 0.9; // 10% margini laterali
    const availableHeight = screenHeight - marginTop - marginBottom;

    // Area disponibile
    const area = availableWidth * availableHeight;

    // Dimensione base per le immagini
    const baseSize = Math.sqrt(area / count);

    const maxAttempts = 50; // Numero massimo di tentativi per evitare sovrapposizioni
    const minSizeRatio = 0.4; // Limite minimo delle dimensioni in base a baseSize

    // Suddivisione in griglia per il calcolo della densità
    const gridRows = 5;
    const gridCols = 5;
    const gridCellWidth = availableWidth / gridCols;
    const gridCellHeight = availableHeight / gridRows;
    const densityGrid: number[][] = Array.from({ length: gridRows }, () =>
        Array(gridCols).fill(0)
    );

    const updateDensityGrid = (left: number, top: number, width: number, height: number) => {
        const startCol = Math.floor(left / gridCellWidth);
        const endCol = Math.floor((left + width) / gridCellWidth);
        const startRow = Math.floor((top - marginTop) / gridCellHeight);
        const endRow = Math.floor((top + height - marginTop) / gridCellHeight);

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                if (row >= 0 && row < gridRows && col >= 0 && col < gridCols) {
                    densityGrid[row][col]++;
                }
            }
        }
    };

    const findLeastDenseArea = (): { left: number; top: number } => {
        let minDensity = Infinity;
        let bestCell = { row: 0, col: 0 };

        for (let row = 0; row < gridRows; row++) {
            for (let col = 0; col < gridCols; col++) {
                if (densityGrid[row][col] < minDensity) {
                    minDensity = densityGrid[row][col];
                    bestCell = { row, col };
                }
            }
        }

        return {
            left: bestCell.col * gridCellWidth,
            top: marginTop + bestCell.row * gridCellHeight,
        };
    };

    for (let i = 0; i < count; i++) {
        let width, height, top, left;
        let attempts = 0;
        let sizeMultiplier = 1; // Fattore di riduzione della dimensione in caso di fallback

        do {
            // Dimensioni casuali basate su una proporzione del baseSize e sizeMultiplier
            width = baseSize * randomBetween(0.8, 1.5) * sizeMultiplier;
            height = baseSize * randomBetween(0.8, 1.5) * sizeMultiplier;

            // Posizioni casuali nello spazio disponibile
            top = marginTop + randomBetween(0, availableHeight - height);
            left = randomBetween(0, availableWidth - width);

            attempts++;

            // Controlla se c'è sovrapposizione con altre immagini
            if (
                placements.some(
                    (placement) =>
                        Math.abs((placement.top / 100) * screenHeight - top) <
                            (placement.height + height) * 0.5 &&
                        Math.abs((placement.left / 100) * screenWidth - left) <
                            (placement.width + width) * 0.5
                )
            ) {
                // Riduci le dimensioni se non riesci a trovare una posizione valida
                if (attempts % 10 === 0 && sizeMultiplier > minSizeRatio) {
                    sizeMultiplier *= 0.9; // Riduce del 10% ogni 10 tentativi
                }
            }
        } while (
            attempts < maxAttempts &&
            placements.some(
                (placement) =>
                    Math.abs((placement.top / 100) * screenHeight - top) <
                        (placement.height + height) * 0.5 &&
                    Math.abs((placement.left / 100) * screenWidth - left) <
                        (placement.width + width) * 0.5
            )
        );

        // Fallback finale se non trovi una posizione valida
        if (attempts === maxAttempts) {
            console.warn(`Impossibile trovare una posizione valida per l'immagine ${i}, applico il fallback.`);

            const leastDenseArea = findLeastDenseArea();
            left = leastDenseArea.left;
            top = leastDenseArea.top;
            width = baseSize * 0.5; // Riduci ulteriormente le dimensioni
            height = baseSize * 0.5;
        }

        placements.push({
            zIndex: i + 1,
            rotation: randomBetween(-15, 15), // Rotazione per naturalezza
            scale: 1,
            top: (top / screenHeight) * 100, // Percentuale per la posizione verticale
            left: (left / screenWidth) * 100, // Percentuale per la posizione orizzontale
            width,
            height,
        });

        // Aggiorna la griglia di densità
        updateDensityGrid(left, top, width, height);
    }

    return placements;
};

const PolaroidPhoto = ({ 
    src, 
    placement 
  }: { 
    src: string, 
    placement: PhotoPlacement
  }) => {
    return (
      <div 
        className="absolute transform shadow-xl bg-white p-2 rounded-lg"
        style={{
          zIndex: placement.zIndex,
          transform: `rotate(${placement.rotation}deg) scale(${placement.scale})`,
          top: `${placement.top}%`,
          left: `${placement.left}%`,
          width: `${placement.width}px`,
          height: `${placement.height}px`,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        <div className="w-full h-full relative">
          <Image
            src={src}
            alt="Collection Photo"
            fill
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div>
    );
  };

const JewelryCollectionsSlider: React.FC = () => {
    const sliderRef = useRef<HTMLDivElement>(null);
    const collectionsRefs = useRef<(HTMLDivElement | null)[]>([]);
    const imagesRefs = useRef<(HTMLDivElement | null)[]>([]);

    const [photoPlacementsPerCollection, setPhotoPlacementsPerCollection] = useState<{ [key: number]: PhotoPlacement[] }>({});

    useEffect(() => {
        // Generate photo placements for each collection
        const placements = collections.reduce((acc, _, index) => {
            console.log(index, generatePhotoPlacements(collections[index].centralImages.length))
            acc[index] = generatePhotoPlacements(collections[index].centralImages.length);
            return acc;
        }, {});

        setPhotoPlacementsPerCollection(placements);

        const slider = sliderRef.current;
        const collectionElements = collectionsRefs.current;
        const imageElements = imagesRefs.current;

        if (!slider || collectionElements.length === 0) return;

        ScrollTrigger.create({
            trigger: slider,
            start: "top top",
            end: `+=${(collectionElements.length - 1) * 100}%`,
            pin: true,
            scrub: 0,
            onUpdate: (self) => {
                const progress = self.progress;

                collectionElements.forEach((collection, index) => {
                    const cardProgress = Math.min(Math.max(progress * collectionElements.length - index, 0), 1);

                    // Modifica per creare pause tra le card
                    const pauseDuration = 0.5;
                    const adjustedProgress = cardProgress < pauseDuration
                        ? 0
                        : (cardProgress - pauseDuration) / (1 - pauseDuration);

                    const imageElement = imageElements[index];

                    // Impedisci l'animazione dell'ultima card
                    if (index === collectionElements.length - 1) {
                        gsap.set(collection, {
                            x: '0%',
                            rotateX: 0,
                        });

                        if (imageElement) {
                            const imageProgress = Math.min(Math.max(adjustedProgress * 2, 0), 1); // Raddoppia la velocità
                            gsap.set(imageElement, {
                                y: `${(imageProgress) * 100}%`, // Scende e sale
                                opacity: Math.min((1 - imageProgress) * 2, 1)
                            });
                        }

                        return;
                    }

                    // Anima la card
                    gsap.set(collection, {
                        x: `-${adjustedProgress * 100}%`,
                        rotateX: adjustedProgress * -20,
                        transformOrigin: "top center",
                        zIndex: collectionElements.length - index,
                    });

                    // Anima l'immagine centrale
                    if (imageElement) {
                        const imageProgress = Math.min(Math.max(adjustedProgress * 2, 0), 1); // Raddoppia la velocità
                        gsap.set(imageElement, {
                            y: `${(imageProgress) * 100}%`, // Scende e sale
                            opacity: Math.min((1 - imageProgress) * 2, 1)
                        });
                    }
                });
            },
        });

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    // Rest of the component remains the same as in previous version
    return (
        <div
            ref={sliderRef}
            className="w-screen h-screen overflow-hidden relative perspective-1000"
        >
            <div className="relative w-full h-full overflow-hidden">
                {collections.map((collection, index) => (
                    <div
                        key={index}
                        ref={el => collectionsRefs.current[index] = el}
                        className={`
                            absolute top-0 left-0 w-full h-full 
                            transform origin-top-center 
                            will-change-transform 
                            overflow-hidden
                            ${collection.backgroundColor}
                        `}
                        style={{
                            willChange: 'transform, box-shadow',
                            perspective: '1000px',
                            zIndex: !index ? 1 : 0
                        }}
                    >
                        <div className="w-full h-full relative shadow-xl">
                            {/* Scattered Polaroid Photos */}
                            {collection.centralImages && photoPlacementsPerCollection[index] &&
                                collection.centralImages.map((imageSrc, photoIndex) => (
                                    <PolaroidPhoto
                                        key={photoIndex}
                                        src={imageSrc}
                                        placement={photoPlacementsPerCollection[index][photoIndex]}
                                    />
                                ))
                            }

                            {/* Immagine principale animata */}
                            <Image
                                ref={el => imagesRefs.current[index] = el}
                                src={collection.centralImage || 'https://storage.googleapis.com/unica-3d18c.appspot.com/Image/sig_1_3219974fd3_c13a57beaa/sig_1_3219974fd3_c13a57beaa.png'}
                                width={collectionsRefs.current[0]?.offsetWidth ? (Math.log2(collectionsRefs.current[0].offsetWidth) + collectionsRefs.current[0].offsetWidth * 0.03) * 10 + 70 : 250}
                                height={collectionsRefs.current[0]?.offsetWidth ? (Math.log2(collectionsRefs.current[0].offsetWidth) + collectionsRefs.current[0].offsetWidth * 0.03) * 10 + 70 : 250}
                                alt=''
                                className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
                                style={{
                                    willChange: 'transform, opacity',
                                    zIndex: Math.max(...photoPlacementsPerCollection[index]?.map(i => i.zIndex) || [0])
                                }}
                            />

                            {/* Dettagli della collezione */}
                            <div className="relative p-6 text-center z-50">
                                <h2 className="text-3xl font-bold mb-4">
                                    {collection.name}
                                </h2>
                                <p className="mb-4">
                                    {collection.description}
                                </p>

                                <Button className="z-50">
                                    Esplora Collezione
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JewelryCollectionsSlider;