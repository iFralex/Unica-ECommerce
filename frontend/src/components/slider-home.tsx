"use client"
import React, { useEffect, useRef } from 'react';
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
    backgroundImage?: string
}

// Dati delle collezioni (da sostituire con i tuoi)
const collections: Collection[] = [
    {
        id: 1,
        name: "Collezione Primavera",
        description: "Gioielli ispirati ai fiori primaverili",
        image: "/images/spring-collection.jpg",
        backgroundColor: "bg-green-100",
        backgroundImage: "https://th.bing.com/th/id/OIG1.NxvGmn1UjtgwIdsTYG8.?w=1024&h=1024&rs=1&pid=ImgDetMain"
    },
    {
        id: 2,
        name: "Collezione Estate",
        description: "Eleganza leggera per le giornate calde",
        image: "/images/summer-collection.jpg",
        backgroundColor: "bg-blue-100",
        backgroundImage: "https://th.bing.com/th/id/OIG1.WgSAKblapXjw4GHuiXpi?pid=ImgGn"
    },
    {
        id: 3,
        name: "Collezione Autunno",
        description: "Toni caldi e profondi",
        image: "/images/autumn-collection.jpg",
        backgroundColor: "bg-orange-100",
        backgroundImage: "https://th.bing.com/th/id/OIG1.feQvUZj.54tMlGLry8O9?pid=ImgGn"
    },
    {
        id: 4,
        name: "Collezione Inverno",
        description: "Gioielli che scaldano l'animo",
        image: "/images/winter-collection.jpg",
        backgroundColor: "bg-gray-100",
        backgroundImage: "https://th.bing.com/th/id/OIG1.pMb6qWsSQMf_BKD7dqfx?pid=ImgGn"
    }
];

const JewelryCollectionsSlider: React.FC = () => {
    const sliderRef = useRef<HTMLDivElement>(null);
    const collectionsRefs = useRef<(HTMLDivElement | null)[]>([]);
    const imagesRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
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
                    const pauseDuration = 0.2;
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

        // Cleanup
        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

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
                            ${collection.backgroundColor}
                        `}
                        style={{
                            willChange: 'transform, box-shadow',
                            perspective: '1000px',
                            zIndex: !index ? 1 : 0
                        }}
                    >
                        <div className="w-full h-full relative shadow-xl">
                            {/* Immagine di sfondo */}
                            <div className="absolute top-0 left-0 w-full h-full">
                                {false && <Image
                                    src={collection.backgroundImage}
                                    alt={`Background of ${collection.name}`}
                                    fill
                                    className={"object-cover " + collection.backgroundColor}
                                />}
                            </div>

                            {/* Immagine principale animata */}
                            <div
                                ref={el => imagesRefs.current[index] = el}
                                className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
                                style={{
                                    width: '200px',
                                    height: '200px',
                                    backgroundImage: `url(${collection.centralImage || 'https://storage.googleapis.com/unica-3d18c.appspot.com/Image/sig_1_3219974fd3_c13a57beaa/sig_1_3219974fd3_c13a57beaa.png'})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    willChange: 'transform, opacity',
                                }}
                            ></div>

                            {/* Dettagli della collezione */}
                            <div className="relative p-6 text-center">
                                <h2 className="text-3xl font-bold mb-4">
                                    {collection.name}
                                </h2>
                                <p className="">
                                    {collection.description}
                                </p>

                                {/* Bottone per esplorare la collezione */}
                                <Button>
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
