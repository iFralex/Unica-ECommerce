"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText, Heart, ChevronDown, ExternalLink,
    Gift, Info, Check, Calendar, DollarSign,
    Map, Mail, Phone, User, Clock
} from 'lucide-react';

export const GioielliDiLuce = () => {
    const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
    const [activeCharm, setActiveCharm] = useState(null);
    const [donationAmount, setDonationAmount] = useState(127850);
    const [dogsHelped, setDogsHelped] = useState(5);

    // Simulazione donazioni in crescita
    useEffect(() => {
        const interval = setInterval(() => {
            setDonationAmount(prev => prev + Math.floor(Math.random() * 100));
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const charms = [
        {
            id: 1,
            name: "Speranza",
            description: "Un sole nascente in oro rosa, simbolo di rinascita e nuovo inizio",
            price: 290,
            story: "Ispirato al momento in cui ho incontrato Rasta per la prima volta, rappresenta la luce che può nascere anche nei momenti più bui."
        },
        {
            id: 2,
            name: "Fedeltà",
            description: "Una piccola impronta di zampa in argento e zaffiri blu",
            price: 320,
            story: "Dedicato alla fedeltà incondizionata dei cani guida, compagni instancabili di vita e libertà."
        },
        {
            id: 3,
            name: "Coraggio",
            description: "Un cuore intrecciato in oro bianco con diamanti",
            price: 450,
            story: "Simboleggia il coraggio dei giovani non vedenti che affrontano ogni giorno con determinazione."
        },
        {
            id: 4,
            name: "Libertà",
            description: "Ali spiegate in oro giallo con dettagli in platino",
            price: 380,
            story: "Rappresenta la libertà ritrovata grazie al proprio cane guida, ali che permettono di volare oltre ogni limite."
        },
        {
            id: 5,
            name: "Amicizia",
            description: "Due cerchi intrecciati in oro bianco e rosa",
            price: 340,
            story: "Celebra il legame unico che si crea tra una persona non vedente e il suo cane guida."
        }
    ];

    const impactStats = [
        {
            number: dogsHelped,
            label: "Cani guida donati",
            icon: Gift
        },
        {
            number: 15,
            label: "Famiglie coinvolte",
            icon: User
        },
        {
            number: 3,
            label: "Paesi raggiunti",
            icon: Map
        }
    ];

    const transparencyDocs = [
        {
            title: "Contratto di Collaborazione",
            description: "Accordo ufficiale con la Fondazione Frederic Gailanne",
            date: "15/01/2024",
            type: "PDF"
        },
        {
            title: "Preventivi Produzione",
            description: "Dettaglio costi di produzione dei gioielli",
            date: "20/01/2024",
            type: "Excel"
        },
        {
            title: "Ricevute Donazioni",
            description: "Registro mensile delle donazioni effettuate",
            date: "Aggiornato mensilmente",
            type: "PDF"
        },
        {
            title: "Certificazioni Materiali",
            description: "Documenti autenticità e provenienza materiali",
            date: "10/01/2024",
            type: "PDF"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
            {/* Hero Section Migliorata */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-black/40 z-10" />
                <img
                    src="/api/placeholder/1920/1080"
                    alt="Bracciale DNA con ciondoli"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl font-serif mb-6"
                    >
                        Gioielli di Luce
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl mb-8"
                    >
                        Un bracciale che trasforma la bellezza in opportunità
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-4"
                    >
                        <p className="text-lg mb-8">
                            Ogni acquisto finanzia la formazione di cani guida per giovani non vedenti
                        </p>
                        <button className="bg-white text-black px-8 py-3 rounded-full hover:bg-opacity-90 transition">
                            Scopri la collezione
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* La Nostra Storia */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-serif mb-6">Una Storia di Gratitudine</h2>
                        <p className="text-xl text-gray-600">
                            Dal dono ricevuto al desiderio di donare
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                        <div>
                            <img
                                src="/api/placeholder/600/400"
                                alt="Rasta, il mio cane guida"
                                className="rounded-lg shadow-xl"
                            />
                        </div>
                        <div className="space-y-6">
                            <p className="text-lg text-gray-700">
                                Nel 2018, la Fondazione Frederic Gailanne mi ha fatto il dono più prezioso:
                                Rasta, il mio cane guida. Questo magnifico labrador non ha solo cambiato la
                                mia vita, ma mi ha insegnato il vero significato della libertà e dell'indipendenza.
                            </p>
                            <p className="text-lg text-gray-700">
                                Oggi, attraverso "Gioielli di Luce", voglio trasformare la mia gratitudine in
                                opportunità per altri giovani non vedenti. Ogni bracciale venduto contribuisce
                                direttamente alla formazione di nuovi cani guida.
                            </p>
                            <p className="text-lg text-gray-700">
                                Ho scelto di coprire personalmente tutti i costi di produzione, garantendo che
                                il 100% del ricavato vada alla fondazione. Questa è la mia promessa di trasparenza
                                e impegno verso la causa.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Il Bracciale DNA */}
            <section className="py-20 px-4 bg-slate-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-serif mb-6">Il Bracciale DNA</h2>
                        <p className="text-xl text-gray-600">
                            Un simbolo di vita, unicità e connessione
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <p className="text-lg text-gray-700">
                                Il bracciale base, realizzato in argento sterling 925 con bagno in oro rosa,
                                rappresenta la doppia elica del DNA - il codice della vita che ci rende tutti
                                unici eppure profondamente connessi.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-center">
                                    <Check className="mr-2 text-green-600" />
                                    <span>Realizzato a mano in Italia</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="mr-2 text-green-600" />
                                    <span>Materiali certificati e sostenibili</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="mr-2 text-green-600" />
                                    <span>Design brevettato ed esclusivo</span>
                                </li>
                            </ul>
                            <p className="text-lg text-gray-700">
                                Prezzo base: €190 (costo di produzione €85)
                            </p>
                        </div>
                        <div>
                            <img
                                src="/api/placeholder/600/400"
                                alt="Bracciale DNA dettaglio"
                                className="rounded-lg shadow-xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* I Ciondoli */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-serif mb-6">I Ciondoli del Cuore</h2>
                        <p className="text-xl text-gray-600">
                            Ogni ciondolo racconta una storia di speranza
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {charms.map((charm) => (
                            <motion.div
                                key={charm.id}
                                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition"
                                whileHover={{ y: -5 }}
                            >
                                <img
                                    src={`/api/placeholder/300/300`}
                                    alt={charm.name}
                                    className="w-full h-48 object-cover rounded-lg mb-4"
                                />
                                <h3 className="text-xl font-serif mb-2">{charm.name}</h3>
                                <p className="text-gray-600 mb-4">{charm.description}</p>
                                <p className="text-sm text-gray-500 mb-4">{charm.story}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold">€{charm.price}</span>
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition">
                                        Aggiungi
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Impatto e Numeri */}
            <section className="py-20 px-4 bg-slate-900 text-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-serif mb-6">Il Nostro Impatto</h2>
                        <p className="text-xl text-slate-300">
                            Insieme stiamo creando un cambiamento reale
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        {impactStats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2 }}
                                className="text-center"
                            >
                                <div className="mb-4 flex justify-center">
                                    <stat.icon size={40} />
                                </div>
                                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                                <div className="text-slate-300">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-center">
                        <div className="text-5xl font-bold mb-4">
                            €{donationAmount.toLocaleString()}
                        </div>
                        <p className="text-xl text-slate-300 mb-8">
                            raccolti per la Fondazione Frederic Gailanne
                        </p>
                        <button className="bg-white text-slate-900 px-8 py-3 rounded-full hover:bg-opacity-90 transition">
                            Scopri come contribuire
                        </button>
                    </div>
                </div>
            </section>

            {/* Trasparenza Totale */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-serif mb-6">Trasparenza Totale</h2>
                        <p className="text-xl text-gray-600">
                            Ogni centesimo tracciabile, ogni processo verificabile
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-2xl font-serif mb-6">Documenti Pubblici</h3>
                            <div className="space-y-4">
                                {transparencyDocs.map((doc, index) => (
                                    <div
                                        key={index}
                                        className="bg-slate-50 p-4 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-semibold">{doc.title}</h4>
                                            <span className="text-sm text-gray-500">{doc.type}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Calendar size={14} className="mr-1" />
                                            <span>{doc.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}