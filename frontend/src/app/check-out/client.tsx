"use client"
import { getAddressesFromAddressesLight, getAuthToken } from "@/actions/auth";
import { checkSignInEmailLink, deleteAddress, getAddresses, sendSignupLinkViaEmail, updateUserName } from "@/actions/firebase";
import { LoginFunction, Signup } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlarmClock, CreditCard, House, Link as LinkIcon, Loader2, Pencil, Plus, ShoppingCart, Store, TriangleAlert, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { AddressForm, DeleteAddressLoadingDialog } from "../dashboard/account/account-client";
import { AddressDetails } from "@/types/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Tokens } from "next-firebase-auth-edge";
import { createShipping, getCarriers, getDropOffPoints } from "@/actions/shipping";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import Price from "@/components/ui/price";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Link from "next/link";

const updateNameSchema = z.object({
    firstName: z.string()
        .min(4, { message: "Il nome deve essere di almeno 4 caratteri" })
        .max(30, { message: "Il nome è troppo lungo" }),
    lastName: z.string()
        .min(4, { message: "Il cognome deve essere di almeno 4 caratteri" })
        .max(30, { message: "Il cognome è troppo lungo" }),
});

const LoginOrSignup = ({ }: {}) => {
    return (
        <Signup targetPageForEmailLink="check-out" />
    );
};

const Addresses = ({ addresses, userId, name, handleSubmit }: { addresses: AddressDetails[], userId: string, name: string, handleSubmit: (addrId: string, courrId: string) => void }) => {
    const [addressId, setAddressId] = useState(addresses.length > 0 ? addresses[0].id : "")
    const [courrier, setCourrier] = useState(null)
    const [courriers, setCourriers] = useState(null)
    const [dropOffPoint, setDropOffPoint] = useState(null)
    const [dropOffPoints, setDropOffPoints] = useState(null)
    const [isLoading, setIsLoading] = useState<null | "courrier" | "dropoff" | "closed">(null)
    const { control, formState: { errors }, getValues, setValue, trigger } = useForm({
        resolver: zodResolver(updateNameSchema),
        mode: 'onChange',
        defaultValues: { firstName: name.split(" ")?.[0].trim(), lastName: name.split(" ")?.[1].trim() }
    })

    const calculateShipping = async (addrId) => {
        setCourriers(null)
        setCourrier(null)
        const addressSel = addresses.find(addr => addr.id === addrId)
        if (!addressSel)
            return
        const results = await getCarriers("IT", "04012", "IT", addressSel.postalCode, [{ height: 5, width: 6, length: 6, weight: 0.1 }])
        setCourriers(results)
        setIsLoading(prevIsLoading => {
            if (prevIsLoading !== "closed") {
                return "courrier"
            }
            return prevIsLoading
        })
    }

    const onDropOffPoints = async () => {
        if (!courrier)
            return
        const r = await getDropOffPoints(courrier.carrier_name, addresses.find(addr => addr.id === addressId)?.position)
        console.log("points", r)
        setDropOffPoints(r)
        setIsLoading(prevIsLoading => {
            if (prevIsLoading !== "closed") {
                return "dropoff"
            }
            return prevIsLoading
        })
    }

    useEffect(() => {
        setDropOffPoint(null)
        setDropOffPoints(null)
        setIsLoading(null)
    }, [courrier?.carrier_name])

    useEffect(() => { trigger() }, [trigger])

    const ItemSelectionDialog = ({ title, buttonLabel, openAction, dialogTitle, items, itemIdKey, labelChildren, finalValue, setFinalValue, displaiedSel, startSelChildren, defaultOpen }: { title: string, buttonLabel: string, openAction: () => void, dialogTitle: string, items: any[] | null, itemIdKey: string, labelChildren: (item: any, index: number) => ReactNode, finalValue: any, setFinalValue: (item: any) => void, displaiedSel: (ChangeBtn: ReactNode) => ReactNode, startSelChildren?: () => ReactNode, defaultOpen?: boolean }) => {
        const [tmpItem, setTmpItem] = useState<any | null>(finalValue || items?.[0] || null)
        const [isOpen, setIsOpen] = useState<boolean>(defaultOpen || false)

        const handleOpenChange = (open: boolean) => {
            if (open) {
                if (!items) {
                    openAction()
                }
                
                setIsOpen(true)
            } else {
                if (tmpItem) {
                    setFinalValue(tmpItem)
                }
                setIsLoading(prevIsLoading => {
                    if (prevIsLoading) {
                        return null
                    } else
                    return "closed"
                    return prevIsLoading
                })
                setIsOpen(false)
            }
        }

        return <div className="mt-8">
            <h2 className="mb-4 text-2xl font-bold text-center">
                {title}
            </h2>
            <Card className={"flex items-center justify-center p-3 " + (!finalValue && "min-h-[150px]")}>
                {(startSelChildren && startSelChildren()) || (
                    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                        {!finalValue &&
                            <DialogTrigger asChild>
                                <Button>{buttonLabel}</Button>
                            </DialogTrigger>
                        }
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{dialogTitle}</DialogTitle>
                            </DialogHeader>
                            {!items ? <div className="flex items-center justify-center h-64">
                                <Loader2 className="animate-spin" />
                            </div> :
                                <div>
                                    <ScrollArea className="h-[75vh] p-1">
                                        <RadioGroup defaultValue={tmpItem?.[itemIdKey]} onValueChange={tmpId => setTmpItem(items.find(i => i[itemIdKey] === tmpId))}>
                                            {items.map((item, index) => (
                                                <div key={index}>
                                                    <div className="flex items-center gap-2">
                                                        <RadioGroupItem value={item[itemIdKey]} id={item[itemIdKey]} />
                                                        <Label htmlFor={item[itemIdKey]} className="flex-1">
                                                            {labelChildren(item, index)}
                                                        </Label>
                                                    </div>
                                                    {index < items.length - 1 && <Separator className="my-4" />}
                                                </div>
                                            ))}
                                        </RadioGroup>
                                        <ScrollBar />
                                    </ScrollArea>
                                    <DialogFooter className="mt-2">
                                        <Button disabled={!tmpItem}>Seleziona</Button>
                                    </DialogFooter>
                                </div>}
                        </DialogContent>
                    </Dialog>
                )}
                {finalValue && (<div className="w-full">
                    {displaiedSel(<div className="flex justify-center w-full mt-2"><Button onClick={() => { setIsOpen(true) }} variant="outline" className="w-full"><Pencil size={20} className="mr-2" /> Cambia</Button></div>)}
                </div>)}
            </Card>
        </div>
    }

    const CourrierComponent = (courier) => <div className="flex items-center justify-center gap-4 flex-wrap">
        <div className="flex flex-grow flex-1">
            <div className="flex gap-2">
                <div>
                    <Image src={courier.logo} width={100} height={60} alt="" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-lg">{courier.carrier_name}</p>
                        <Badge variant="outline" className={courier.category === "express" ? "bg-[#FFD700]" : ""}>{courier.category.charAt(0).toUpperCase() + courier.category.slice(1)}</Badge>
                    </div>
                    <div className="flex gap-1">
                        {courier.delivery_to_parcelshop ? <Store size={30} className="pt-1" /> : <House size={30} className="pt-1" />}
                        <p className="text-sm text-gray-500 w-[100px] leading-tight">
                            {courier.delivery_to_parcelshop ? "In punto di Raccolta" : "Consegna a casa"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <div className="flex gap-3">
            <div className="min-w-[110px]">
                <p className="text-[0.70rem] text-muted-foreground w-[100px]">Data Stimata</p>
                <p className="text-3xl font-bold">{new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' }).format(new Date(...courier.first_estimated_delivery_date.split('/').map((v, i) => v - (i === 1))))}</p>
            </div>
            <div className="flex  justify-end min-w-[100px]">
                <div className="">
                    <Price price={courier.price.total_price} size={3} mb4={false} />
                </div>
            </div>
        </div>
    </div>

    const DropOffComponent = (dropoff) => <div className="flex gap-2">
        <Store size={48} />
        <div>
            <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold">{dropoff.location_description.charAt(0).toUpperCase()}{dropoff.location_description.slice(1)}</p>
                <div className="flex items-center gap-1">
                    <Badge variant="outline" style={{ backgroundColor: `hsl(${Math.max(0, Math.min(120 - (dropoff.distance / 5000) * 120, 120))}, 100%, 75%)` }}>{dropoff.distance >= 1000 ? `${(dropoff.distance / 1000).toFixed(1).replace('.', ',')} km` : `${Math.round(dropoff.distance / 10) * 10}m`}</Badge>
                    <Popover modal>
                        <PopoverTrigger>
                            <Badge variant="outline" className="p-1"><AlarmClock size={21} /></Badge>
                        </PopoverTrigger>
                        <PopoverContent>
                            {dropoff.operating_hours_extended?.customer
                                ? [dropoff.operating_hours_extended.customer].map(obj => Object.entries(obj).map(([day, slots]) => slots.length > 0 && <p key={day}>{`${day.slice(0, 3).charAt(0).toUpperCase() + day.slice(1, 3)}: ${slots.map(s => `${String(Math.floor(s.start / 60)).padStart(2, '0')}:${String(s.start % 60).padStart(2, '0')} - ${String(Math.floor(s.end / 60)).padStart(2, '0')}:${String(s.end % 60).padStart(2, '0')}`).join(', ')}`}</p>))
                                : dropoff.opening_hours ? <p>{dropoff.opening_hours}</p> : <p>Orari non disponibili per questo punto di ritiro</p>}
                        </PopoverContent>
                    </Popover>
                    {dropoff.location_type && <Badge variant="outline">{dropoff.location_type}</Badge>}
                </div>
            </div>
            <p className="">{dropoff.address.line1} - {dropoff.address_details.city} {dropoff.address_details.province}</p>
        </div>
    </div>

    const PuntoPosteUnavailable = () => {
        const [dropoffPointInfo, setDropoffPointInfo] = useState(courrier.DropoffPointInfo || "")
        return <div>
            <div className="flex items-center gap-2 mb-1">
                <TriangleAlert size={35} />
                <h3 className="text-2xl font-bold">Non è disponibile la selezione del Punto Poste</h3>
            </div>
            <p>Poste Italiane non offre un modo per ottenere una lista dei suoi Punto Poste, quindi non possiamo mostrarteli per consentirti di scegliere facilmente.</p>
            <p>Se selezioni la consegna presso un Punto Poste, verrà automaticamente scelto quello più vicino all’indirizzo indicato. Se preferisci un altro punto di ritiro, inserisci il nome e le informazioni del Punto Poste desiderato nel campo di testo sottostante.</p>
            <p>In ogni caso, dopo il pagamento dell’ordine, riceverai un’email con i dettagli del Punto Poste selezionato.</p>
            <Button variant="link" className="flex items-center gap-1 mt-1">
                <LinkIcon size={15} />
                <Link href="https://www.poste.it/cerca/index.html#/vieni-in-poste">Trova Punto Poste</Link>
            </Button>
            <Input value={dropoffPointInfo} onChange={e => setDropoffPointInfo(e.target.value)} onBlur={e => setCourrier({ ...courrier, DropoffPointInfo: e.target.value })} onFocus={(e) => e.target.select()} placeholder="[Nome Punto Poste], [Indirizzo], [Città]..." className="mt-1" />
            {console.log("courrier.DropoffPointInfo", dropoffPointInfo, courrier.DropoffPointInfo)}
        </div>
    }

    return <div>
        <h2 className="mb-4 text-2xl font-bold text-center">
            Il tuo Nome
        </h2>
        <form>
            <div className="grid grid-cols-2 gap-4 items-start">
                <div className="grid gap-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Controller
                        name="firstName"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                id="firstName"
                                placeholder="Giulia"
                                className={errors.firstName ? 'border-red-500' : ''}
                                onBlur={e => setValue("firstName", e.target.value.trim(), { shouldValidate: true })}
                            />
                        )}
                    />
                    {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="lastName">Cognome</Label>
                    <Controller
                        name="lastName"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                id="lastName"
                                placeholder="Antonucci"
                                className={errors.lastName ? 'border-red-500' : ''}
                                onBlur={e => setValue("lastName", e.target.value.trim(), { shouldValidate: true })}
                            />
                        )}
                    />
                    {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}
                </div>
            </div>
        </form>
        <h2 className="mb-4 text-2xl font-bold text-center mt-8">
            I tuoi indirizzi
        </h2>
        {addresses.length === 0 ? (
            <p className="text-muted-foreground italic mb-3 text-center">Nessun indirizzo salvato. Premi il pulsante per aggiungerne uno.</p>
        ) : (
            <RadioGroup defaultValue={addresses[0].id} onValueChange={(v) => { setAddressId(v); setCourrier(null); setCourriers(null) }}>
                {addresses.map((address, index) => (
                    <div key={address.key} className="flex items-start gap-2">
                        <RadioGroupItem value={address.id} id={address.key} />
                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start">
                                    <div>
                                        <Label htmlFor={address.key}>
                                            <p className="font-bold">{address.street} {address.houseNumber}</p>
                                            <p className="text-sm text-gray-600">
                                                {address.postalCode} {address.city}, {address.state}
                                            </p>
                                            <p className="text-sm text-gray-600">{address.country}</p>
                                            {address.details && <p className="text-sm">
                                                Altre info: <span className='text-muted-foreground'>{address.details}</span>
                                            </p>}
                                        </Label>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <DeleteAddressLoadingDialog userId={userId} address={address} />
                                </div>
                            </div>
                            {index < addresses.length - 1 && <Separator className="my-4" />}
                        </div>
                    </div>
                ))}
            </RadioGroup>
        )}
        <div className="flex justify-end w-full mt-4 mb-8 gap-2">
            <AddressForm trigger={<Button size="icon"><Plus /></Button>} />
        </div>
        <ItemSelectionDialog title="Corrieri disponibili" buttonLabel={"Seleziona Metodo di spedizione"} openAction={() => calculateShipping(addressId)} dialogTitle="Scegli il metodo di Spedizione" items={courriers} itemIdKey="id" labelChildren={(_courrier, index) => (
            CourrierComponent(_courrier)
        )} finalValue={courrier} setFinalValue={setCourrier} displaiedSel={changeBtn => (
            <>
                {CourrierComponent(courrier)}
                {changeBtn}
            </>
        )} defaultOpen={isLoading === "courrier"} />
        {courrier && courrier.delivery_to_parcelshop &&
            <ItemSelectionDialog title="Punto di Ritiro" buttonLabel={"Seleziona Punto di Ritiro di " + courrier.carrier_name} openAction={onDropOffPoints} dialogTitle="Cerca Punto di Raccolta" items={dropOffPoints} itemIdKey="name" labelChildren={(point, index) => (
                <div className="flex items-center justify-center gap-4 flex-wrap">
                    <div className="flex flex-grow flex-1">
                        {DropOffComponent(point)}
                    </div>
                </div>
            )} finalValue={dropOffPoint} setFinalValue={setDropOffPoint} displaiedSel={changeBtn => (
                <>
                    {DropOffComponent(dropOffPoint)}
                    {changeBtn}
                </>
            )} startSelChildren={courrier.carrier_name === "Poste Italiane" && PuntoPosteUnavailable} defaultOpen={isLoading === "dropoff"} />
        }
        <Button disabled={!addressId || !courrier || Object.keys(errors).length} onClick={() => handleSubmit(addressId, { ...courrier, firstName: getValues("firstName"), lastName: getValues("lastName") })} className="w-full mt-8">Continua</Button>
    </div>
}

const ProgressBar = ({ currentStep }: { currentStep: typeof steps[number]["value"] }) => {
    const getStepState = (stepValue: string) => {
        const currentIndex = steps.findIndex(s => s.value === currentStep);
        const stepIndex = steps.findIndex(s => s.value === stepValue);
        return {
            isComplete: stepIndex < currentIndex,
            isCurrent: stepValue === currentStep,
        };
    };


    return (
        <div className="relative mt-2">
            <div className="absolute top-5 left-0 w-full h-2 bg-gradient-to-r from-gray-200 via-gray-200 to-gray-200 rounded-full" />
            <div
                className="absolute top-5 left-0 h-2 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 rounded-full transition-all duration-500"
                style={{
                    width: `${(steps.findIndex(s => s.value === currentStep) / (steps.length - 1)) * 100}%`
                }}
            />
            <div className="relative flex justify-between">
                {steps.map((step, index) => {
                    const { isComplete, isCurrent } = getStepState(step.value);
                    const StepIcon = step.icon;
                    return (
                        <div key={step.value} className="flex flex-col items-center">
                            <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    transition-all duration-300 shadow-lg
                    ${isComplete ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                    isCurrent ? 'bg-white border-2 border-blue-500' :
                                        'bg-white border-2 border-gray-200'}`}>
                                <StepIcon className={`
                      w-6 h-6
                      ${isComplete ? 'text-white' :
                                        isCurrent ? 'text-blue-500' :
                                            'text-gray-400'}
                    `} />
                            </div>
                            <span className={`
                    mt-3 text-sm font-medium
                    ${isComplete || isCurrent ? 'text-blue-600' : 'text-gray-400'}
                  `}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};



const steps: ({ value: "login" | "shipping" | "confirm" | "payment", label: string, icon: typeof ShoppingCart, title: string, desc: string })[] = [
    { value: "login", label: "Accesso", icon: ShoppingCart, title: "Crea un account", desc: "Per aggiornarti sui tuoi ordini e per tenere registrati i tuoi ordini è necessario un account. Tranquillo: è semplice e veloce, e magari in futuro ti becchi pure un codice sconto!" },
    { value: "shipping", label: "Spedizione", icon: Truck, title: "Aggiungi o seleziona il tuo indirizzo", desc: "Per aggiornarti sui tuoi ordini e per tenere registrati i tuoi ordini è necessario un account. Tranquillo: è semplice e veloce, e magari in futuro ti becchi pure un codice sconto!" },
    { value: "payment", label: "Pagamento", icon: CreditCard, title: "Paga,", desc: "Per aggiornarti sui tuoi ordini e per tenere registrati i tuoi ordini è necessario un account. Tranquillo: è semplice e veloce, e magari in futuro ti becchi pure un codice sconto!" }
]

export const PaymentProgress = ({ startedStep, auth, addresses }: { startedStep: typeof steps[number]["value"] | number, auth: Tokens | null, addresses?: AddressDetails[] }) => {
    const [stepIndex, setStepIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<{}>({})
    const [addressSelected, setSelectedAddress] = useState("")
    const [courrierSelected, setSelectedCourrier] = useState({})

    const router = useRouter()

    const useStep = () => {
        const currentStep = steps[stepIndex];

        const setStep = (step: typeof steps[number]["value"]) => {
            const newIndex = steps.findIndex(s => s.value === step);
            if (newIndex !== -1) {
                setStepIndex(newIndex);
            }
        };

        const next = (loading?: boolean) => {
            if (stepIndex < steps.length - 1) {
                setStepIndex(stepIndex + 1);
                if (loading !== undefined)
                    setLoading(loading)
            }
        };

        return {
            ...currentStep,
            index: stepIndex,
            setValue: setStep,
            next,
        };
    };

    const step = useStep();

    useEffect(() => {
        (async () => {
            try {
                setLoading(false)
            } catch (err) {
                setError({ 'signin': (err as Error).message });
                step.setValue("login")
                console.log(err)
            }
        })()
    }, [])

    useEffect(() => {
        step.setValue(startedStep)
    }, [startedStep])

    const handleSelectedAddress = async (addrId: string, courrier: {}) => {
        const addr = addresses?.find(a => a.id === addrId)
        setSelectedAddress(addrId)
        setSelectedCourrier(courrier.id)
        console.log(courrier)
        const r = await createShipping({
            "user_id": null,
            "client_id": null,
            "service": courrier.courrier_name + ' - ' + courrier.transit_time + " | " + (courrier.dropoff ? 'In punto di raccolta' : 'Ritiro a casa'),
            "carrier": courrier.carrier_name,
            "service_id": courrier.id,
            "collection_date": null,
            "collection_time": null,
            "dropoff_point_id": courrier.name,
            "content": "1 The adventure begins Framed poster",
            "contentvalue": Math.random() * 70,
            "content_second_hand": false,
            "shipment_custom_reference": null,
            "priority": false,
            "contentValue_currency": "EUR",
            "from": {
                "name": "Alessio",
                "surname": "Antonucci",
                "company": "Antonucci Alessio",
                "street1": "Via delle Orchidee 2",
                "street2": courrier.DropoffPointInfo,
                "zip_code": "04012",
                "city": "Cisterna di Latina",
                "country": "IT",
                "phone": "328 885 7297",
                "email": "ifralex.business@gmail.com"
            },
            "to": {
                "name": courrier.firstName,
                "surname": courrier.lastName,
                "company": null,
                "street1": addr?.street + " " + addr?.houseNumber,
                "street2": null,
                "zip_code": addr?.postalCode,
                "city": addr?.city,
                "country": "IT",
                "phone": "02 3056 7684",
                "email": "dev@mwspace.com"
            },
            "additional_data": {
                "postal_zone_id_from": null,
                "postal_zone_id_to": null,
                "shipping_service_name": null,
                "zip_code_id_from": null,
                "zip_code_id_to": null,
                "selectedWarehouseId": null,
                "parcel_Ids": [
                ],
                "postal_zone_name_to": null,
                "order_id": null,
                "seller_user_id": null,
                "items": [
                    {
                        "price": 35.38,
                        "title": "The adventure begins Framed poster",
                        "picture_url": "prestashop.mwspace.ovh\/4-home_default\/the-adventure-begins-framed-poster.jpg",
                        "quantity": 1,
                        "category_name": "Art"
                    }
                ]
            },
            "packages": [
                {
                    "width": 5,
                    "height": 5,
                    "length": 6,
                    "weight": 0.1
                }
            ]
        })
        console.log(r)
        step.next()
    }

    return <div className="container px-1 md:px-5 size-full flex items-center justify-center">
        <Card className="py-5 px-0 md:px-5 mx-auto grid grid-cols-1 md:grid-cols-2">
            <div className="py-5 px-5 md:px- relative">
                <h1 className="font-bold text-xl">{step.title}</h1>
                <p className="text-muted-foreground">{step.desc}</p>
                <ProgressBar
                    currentStep={step.value}
                />
                <div className="absolute hidden md:block top-0 bottom-0 right-0">
                    <Separator orientation="vertical" />
                </div>
                <div className="absolute md:hidden block left-0 bottom-0 right-0">
                    <Separator />
                </div>
            </div>
            <ScrollArea className="max-h-[75vh] p-1">
                <div className="p-5 size-full">
                    {!loading
                        ? (() => {
                            switch (step.value) {
                                case "login":
                                    return <LoginOrSignup />
                                case "shipping":
                                    return <Addresses addresses={addresses || []} userId={auth?.decodedToken.uid} name={auth?.decodedToken.name} handleSubmit={handleSelectedAddress} />
                                default:
                                    return <p>non definito</p>
                            }
                        })() : <div className="size-full flex items-center justify-center"><Loader2 size={48} className="animate-spin" /></div>}
                    {error.signin && <p>{error.signin}</p>}
                </div>
                <ScrollBar />
            </ScrollArea>
        </Card>
    </div>
}