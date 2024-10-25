"use client"
import { getAddressesFromAddressesLight, getAuthToken } from "@/actions/auth";
import { checkSignInEmailLink, deleteAddress, getAddresses, sendSignupLinkViaEmail, updateUserName } from "@/actions/firebase";
import { LoginFunction, Signup } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, CreditCard, Loader2, MapPin, Plus, ShoppingCart, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { AddressForm, DeleteAddressLoadingDialog } from "../dashboard/account/account-client";
import { AddressDetails } from "@/types/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Tokens } from "next-firebase-auth-edge";

const updateNameSchema = z.object({
    name: z.string().min(3, { message: "Il nome è troppo breve" }).max(60, { message: "L'indirizzo email è troppo lungo" }),
});

const LoginOrSignup = ({ }: {}) => {
    const { control, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
        resolver: zodResolver(updateNameSchema),
        mode: 'onBlur',
    });

    const router = useRouter()

    return (
        <Signup targetPageForEmailLink="check-out" />
    );
};

const Addresses = ({ addresses, userId, handleSubmit }: { addresses: AddressDetails[], userId: string, handleSubmit: (id: string) => void }) => {
    const [addressId, setAddressId] = useState("")
    console.log(userId, addresses[0])
    return <div>
        <h2 className="mb-4 text-2xl font-bold text-center">
            I tuoi indirizzi
        </h2>
        {addresses.length === 0 ? (
            <p className="text-muted-foreground italic mb-3 text-center">Nessun indirizzo salvato. Premi il pulsante per aggiungerne uno.</p>
        ) : (
            <RadioGroup defaultValue={addresses[0].id} onValueChange={setAddressId}>
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
        <div className="flex justify-end w-full mt-4 gap-2">
            <AddressForm trigger={<Button size="icon"><Plus /></Button>} />
            <Button disabled={!addresses.length && !addressId} onClick={() => handleSubmit(addressId)}>Continua</Button>
        </div>
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

    const handleSelectedAddress = (id: string) => {
        setSelectedAddress(id)
        step.next()
    }

    return <div className="container size-full flex items-center justify-center">
        <Card className="p-5 mx-auto grid grid-cols-1 md:grid-cols-2">
            <div className="p-5 relative">
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
            <div className="p-5 size-full">
                {!loading
                    ? (() => {
                        switch (step.value) {
                            case "login":
                                return <LoginOrSignup />
                            case "shipping":
                                return <Addresses addresses={addresses || []} userId={auth?.decodedToken.uid} handleSubmit={handleSelectedAddress}/>
                            default:
                                return <p>non definito</p>
                        }
                    })() : <div className="size-full flex items-center justify-center"><Loader2 size={48} className="animate-spin" /></div>}
                {error.signin && <p>{error.signin}</p>}
            </div>
        </Card>
    </div>
}