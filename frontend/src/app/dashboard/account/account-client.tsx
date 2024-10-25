"use client"
import { checkAndAddAddress, getAddressSuggestions, getSuggestedAddress } from "@/actions/auth";
import { addAddress, deleteAddress, resetPassword, updateUserName } from "@/actions/firebase";
import { Button, ButtonProps } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2, Mail, MapPinIcon, PenLine, Plus, Trash, Trash2 } from "lucide-react";
import { Tokens } from "next-firebase-auth-edge";
import { useRouter } from "next/navigation";
import { ForwardRefExoticComponent, ReactNode, useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const updateNameSchema = z.object({
    name: z.string().min(3, { message: "Il nome è troppo breve" }).max(60, { message: "L'indirizzo email è troppo lungo" }),
});

export const UpdateName = ({ handleClose, setIsLoading }: { handleClose: () => void, setIsLoading: (o: boolean) => void }) => {
    const { control, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
        resolver: zodResolver(updateNameSchema),
        mode: 'onBlur',
    });

    const router = useRouter()

    const onSubmit = async (data) => {
        setError('root', { type: 'manual', message: "" });
        setIsLoading(true)
        try {
            await updateUserName(data.name);
            router.refresh()
            setIsLoading(false)
            handleClose()
        } catch (err) {
            setError('root', { type: 'manual', message: (err as Error).message });
            setIsLoading(false)
        }
    };

    return (<div>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            id="name"
                            type="text"
                            placeholder="Alessio Antonucci"
                            className={errors.name ? 'border-red-500' : ''}
                        />
                    )}
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>
            {errors.root && <p className="text-red-500 text-sm">{errors.root.message}</p>}
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="secondary">
                        Annulla
                    </Button>
                </DialogClose>
                <Button type="submit" className="" disabled={isSubmitting}>
                    {!isSubmitting ? "Aggiorna" : <Loader2 className="animate-spin" />}
                </Button>
            </DialogFooter>
        </form>
    </div >
    );
};

export const ResetPassword = ({ tokens, handleClose, setIsLoading }: { tokens?: Tokens, handleClose: () => void, setIsLoading: (o: boolean) => void }) => {
    const { control, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm();

    const router = useRouter()

    const onSubmit = async (data, event) => {
        event.preventDefault();
        setError('root', { type: 'manual', message: "" });
        setIsLoading(true)
        try {
            if (!tokens?.decodedToken.email) {
                setIsLoading(false)
                throw new Error("L'email non è definita.")
            }
            await resetPassword(tokens.decodedToken.email);
            setIsLoading(false)
            handleClose()
            router.refresh()
        } catch (err) {
            setError('root', { type: 'manual', message: (err as Error).message });
            setIsLoading(false)
        }
    };

    return (<div>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            {errors.root && <p className="text-red-500 text-sm">{errors.root.message}</p>}
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="secondary">
                        Annulla
                    </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                    {!isSubmitting ? <>Invia email <Mail className="ml-1" size={16} /></> : <Loader2 className="animate-spin" />}
                </Button>
            </DialogFooter>
        </form>
    </div >
    );
};

export const AccountAction = ({ action, tokens }: { action?: "update name" | "reset password", tokens?: Tokens }) => {
    if (!action)
        return <></>
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    return (
        <Dialog open={isLoading || open} onOpenChange={(o) => setOpen(o)}>
            <DialogTrigger asChild>
                {action === "update name" ? <Button size="icon" variant="outline" onClick={() => setOpen(true)}><PenLine /></Button> : action === "reset password" ? <Button>Reimposta password <KeyRound className='ml-2' size={16} /></Button> : <></>}
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>
                    {action === "update name" ? "Aggiorna il tuo Nome" : action === "reset password" ? "Reimposta la Password" : ""}
                </DialogTitle>
                {action === "reset password" && <DialogDescription>
                    Ti invieremo una mail per reimpostare la password.
                </DialogDescription>}
                {action === "update name" ? <UpdateName handleClose={() => setOpen(false)} setIsLoading={setIsLoading} /> : action === "reset password" ? <ResetPassword tokens={tokens} handleClose={() => setOpen(false)} setIsLoading={setIsLoading} /> : <></>}
            </DialogContent>
        </Dialog>
    )
}


const schema = z.object({
    fullAddress: z.string().max(180, { message: "Troppo lungo" }).optional(),
    street: z.string().min(1, { message: "La via è obbligatoria" }).max(100, { message: "Troppo lungo" }),
    houseNumber: z.string().max(10, { message: "Troppo lungo" }).refine(val => val === '' || !isNaN(val), {
        message: "Il numero civico deve essere, beh, un numero."
    }),
    city: z.string().min(1, { message: "La città è obbligatoria" }).max(80, { message: "Troppo lungo" }),
    province: z.string().min(1, { message: "Lo stato/provincia è obbligatorio" }).max(30, { message: "Troppo lungo" }),
    postalCode: z.string().min(1, { message: "Il CAP è obblicatorio" }).max(15, { message: "Troppo lungo" }).refine(val => !isNaN(val), {
        message: "Il CAP deve essere un numero"
    }),
    country: z.string().min(1, { message: "Il paese è obbligatorio" }).max(30, { message: "Troppo lungo" }).default("Italia"),
    other: z.string().max(250, { message: "Troppo lungo" }).optional(),
});

export function AddressForm({ trigger }: { trigger?: ReactNode }) {
    const [suggestions, setSuggestions] = useState([]);
    const [addressId, setAddressId] = useState('');
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [suggestsInputFocused, setSuggestsInputFocused] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { control, handleSubmit, setValue, formState: { errors }, setError, reset } = useForm({
        resolver: zodResolver(schema),
    });

    const handleAddressChange = async (value) => {
        setValue('fullAddress', value);

        if (value.length > 3) {
            try {
                setSuggestions(await getAddressSuggestions(value));
            } catch (error) {
                console.error('Errore nel recupero dei suggerimenti:', error);
            }
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionSelect = async (suggestion) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setSuggestsInputFocused(true);
        setValue('fullAddress', suggestion.address.label);

        try {
            const address = await getSuggestedAddress(suggestion.id)
            console.log(address)
            setValue('street', address.street || '');
            setValue('houseNumber', address.houseNumber || '');
            setValue('city', address.city || '');
            setValue('province', address.county || address.state || '');
            setValue('postalCode', address.postalCode || '');
            setValue('country', address.countryName || '');

            // Salva l'ID dell'indirizzo
            setAddressId(suggestion.id);
        } catch (error) {
            console.error('Errore nel recupero dei dettagli dell\'indirizzo:', error);
        }

        setSuggestions([]);
    };

    const handleInputFocus = () => {
        console.log("a")
        setSuggestsInputFocused(true);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    const handleInputBlur = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            setSuggestsInputFocused(false);
        }, 150);
    }, []);

    const onSubmit = async (data, event) => {
        event.preventDefault();
        try {
            setIsLoading(true)
            await checkAndAddAddress(data)
            setIsLoading(false)
            setOpen(false)
            reset()
            router.refresh();
        } catch (err) {
            setError("root", { type: "manual", message: (err as Error).message })
            setIsLoading(false)
        }
    };

    return (
        <Dialog open={open || isLoading} onOpenChange={o => { setOpen(o); if (!o) reset() }}>
            <DialogTrigger asChild>
                {!trigger ?
                <Button>
                    Aggiungi <Plus size={16} className="ml-1" />
                </Button> : trigger}
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>
                    Aggiungi indirizzo
                </DialogTitle>
                <DialogDescription>
                    Aggiungi il tuo indirizzo di spedizione.
                </DialogDescription>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <ScrollArea className="h-[65vh] max-h-[500px]">
                        <div className="grid gap-4 p-1">
                            <div className="grid gap-2">
                                <Label htmlFor="fullAddress">Indirizzo completo</Label>
                                <div className="relative">
                                    <Controller
                                        name="fullAddress"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                id="fullAddress"
                                                placeholder="Inizia a digitare il tuo indirizzo"
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    handleAddressChange(e.target.value);
                                                }}
                                                className={errors.fullAddress ? 'border-red-500' : ''}
                                                onFocus={handleInputFocus}
                                                onBlur={handleInputBlur}
                                            />
                                        )}
                                    />
                                    {errors.fullAddress && <p className="text-red-500 text-xs mt-1">{errors.fullAddress.message}</p>}
                                    {suggestions.length > 0 && suggestsInputFocused && (
                                        <ul className="absolute z-10 w-full bg-white border rounded mt-1 max-h-60 overflow-auto">
                                            {suggestions.map((suggestion, index) => (
                                                <li
                                                    key={suggestion.id}
                                                    onClick={() => handleSuggestionSelect(suggestion)}
                                                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center gap-1"
                                                >
                                                    <MapPinIcon color="red" />
                                                    {suggestion.address.label}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 items-start">
                                <div className="grid gap-2 col-span-2">
                                    <Label htmlFor="street">Via</Label>
                                    <Controller
                                        name="street"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                id="street"
                                                placeholder="Via"
                                                className={errors.street ? 'border-red-500' : ''}
                                            />
                                        )}
                                    />
                                    {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="houseNumber">Numero civico</Label>
                                    <Controller
                                        name="houseNumber"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                id="houseNumber"
                                                placeholder="Numero"
                                                className={errors.houseNumber ? 'border-red-500' : ''}
                                            />
                                        )}
                                    />
                                    {errors.houseNumber && <p className="text-red-500 text-xs mt-1">{errors.houseNumber.message}</p>}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="city">Città</Label>
                                <Controller
                                    name="city"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            id="city"
                                            placeholder="Città"
                                            className={errors.city ? 'border-red-500' : ''}
                                        />
                                    )}
                                />
                                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="province">Provincia</Label>
                                <Controller
                                    name="province"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            id="province"
                                            placeholder="Provincia"
                                            className={errors.province ? 'border-red-500' : ''}
                                        />
                                    )}
                                />
                                {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4 items-start">
                                <div className="grid gap-2">
                                    <Label htmlFor="postalCode">CAP</Label>
                                    <Controller
                                        name="postalCode"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                id="postalCode"
                                                placeholder="CAP"
                                                className={errors.postalCode ? 'border-red-500' : ''}
                                            />
                                        )}
                                    />
                                    {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="country">Paese</Label>
                                    <Controller
                                        name="country"
                                        control={control}
                                        defaultValue="Italia"
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                id="country"
                                                placeholder="Paese"
                                                className={errors.country ? 'border-red-500' : ''}
                                            />
                                        )}
                                    />
                                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="other">Altri dettagli</Label>
                                <Controller
                                    name="other"
                                    control={control}
                                    render={({ field }) => (
                                        <Textarea
                                            {...field}
                                            id="other"
                                            placeholder="Interno... scala... consegnare al portinaio..."
                                            className={errors.country ? 'border-red-500' : ''}
                                        />
                                    )}
                                />
                                {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                            </div>
                        </div>
                        <ScrollBar />
                    </ScrollArea>
                    {errors.root && <p className="text-red-500 text-xs mt-1">{errors.root.message}</p>}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="secondary">
                                Annulla
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : <>Aggiungi <Plus size={16} className="ml-1" /></>}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    );
}

export const DeleteAddressLoadingDialog = ({ userId, address }: { userId: string, address: { key: string, fullAddress: string } }) => <LoadingDialog handleClick={async () => await deleteAddress(userId, address.key)} title="Eliminare l'indirizzo?" desc={"Stai per eliminare l'indirizzo: " + address.fullAddress} buttonProps={{ variant: "destructive", children: "Elimina" }} trigger={<Button variant="outline" size="sm" className="text-red-500 hover:text-red-700"><Trash2 size={16} className="mr-1" /> Elimina</Button>} />

export const LoadingDialog = ({ title, desc, handleClick, buttonProps, trigger, children }: { title: string, desc: string, handleClick: () => void, buttonProps: ButtonProps, trigger: ReactNode, children?: ReactNode }) => {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    return <Dialog open={open || isLoading} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            {trigger}
        </DialogTrigger>
        <DialogContent>
            <DialogTitle>
                {title}
            </DialogTitle>
            <DialogDescription>
                {desc}
            </DialogDescription>
            {children}
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="secondary">
                        Annulla
                    </Button>
                </DialogClose>
                <Button type="submit" {...buttonProps} disabled={isLoading} onClick={async () => {
                    setIsLoading(true)
                    await handleClick()
                    setIsLoading(false)
                    setOpen(false)
                    router.refresh();
                }}>{isLoading ? <Loader2 className="animate-spin" /> : buttonProps.children}</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}