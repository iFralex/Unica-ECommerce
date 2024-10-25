"use client"
import { Dispatch, ReactNode, SetStateAction, useContext, useState } from "react"
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { createUserEmailAndPassowrd, deleteDataFromId, loginEmailAndPassword, logout, transferDataFromCookieToUserId, loginWithGoogle, loginWithFacebook, loginWithMicrosoft, loginWithTwitter, resetPassword, checkSignInEmailLink, sendSignupLinkViaEmail } from "@/actions/firebase" // Assicurati che questo path sia corretto
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { UserContext } from "./context"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { deleteCookie } from "@/actions/get-data"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { CircleCheck, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

type LoginProvidersType = 'email' | "email link" | 'google' | "meta" | "microsoft" | "twitter"

const loginSocials: ({ provider: LoginProvidersType, name?: string, iconName?: string, padding?: number })[] = [
    {
        provider: "google",
        name: "Google"
    },
    {
        provider: "meta",
        name: "Meta",
        padding: 5
    },
    {
        provider: "microsoft",
        name: "Microsoft",
        padding: 5
    },
    {
        provider: "twitter",
        iconName: "x",
        padding: 4
    },
]

const loginSchema = z.object({
    email: z.string().email({ message: "Indirizzo email non valido" }),
    loginType: z.enum(['email-link', 'email-password']),
    password: z.union([
        z.string().min(6, { message: "La password deve essere di almeno 6 caratteri" }),
        z.undefined()
    ])
}).superRefine((data, ctx) => {
    if (data.loginType === 'email-password' && !data.password) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La password è obbligatoria per il login con email e password",
            path: ["password"]
        });
    } else if (data.loginType === 'email-link' && data.password) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La password non deve essere fornita per il login con link",
            path: ["password"]
        });
    }
});

const signupSchema = z
    .object({
        firstName: z.string()
            .min(2, { message: "Il nome deve essere di almeno 2 caratteri" })
            .max(30, { message: "Il nome è troppo lungo" }),
        lastName: z.string()
            .min(2, { message: "Il cognome deve essere di almeno 2 caratteri" })
            .max(30, { message: "Il cognome è troppo lungo" }),
        email: z.string()
            .email({ message: "Indirizzo email non valido" })
            .max(60, { message: "L'indirizzo email è troppo lungo" }),
        registrationType: z.enum(['email-link', 'email-password']),
        password: z.union([
            z.string()
                .min(6, { message: "La password deve essere di almeno 6 caratteri" })
                .max(40, { message: "La password è troppo lunga" })
                .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, {
                    message: "La password deve contenere almeno una lettera minuscola, una maiuscola e un numero",
                }),
            z.undefined()
        ])
    })
    .superRefine((data, ctx) => {
        if (data.registrationType === 'email-password') {
            if (!data.password) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "La password è obbligatoria per la registrazione con email e password",
                    path: ["password"]
                });
            }
        } else if (data.registrationType === 'email-link') {
            if (data.password) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "La password non deve essere fornita per la registrazione con link",
                    path: ["password"]
                });
            }
        }
    });


const retrievePasswordSchema = z.object({
    email: z.string().email({ message: "Indirizzo email non valido" }).max(60, { message: "L'indirizzo email è troppo lungo" }),
});

export const LoginFunction = async (
    method: LoginProvidersType,
    credentials: { email?: string, password?: string },
    setError: (err: string) => void,
    router: AppRouterInstance,
    endFunction?: (id: string) => void,
    redirectTo: string | undefined = "/dashboard"
) => {
    try {
        let credential;

        if (method === 'email') {
            credential = await loginEmailAndPassword(credentials.email!, credentials.password!)
        } else if (method === 'email link') {
            credential = await checkSignInEmailLink()
            if (!credential)
                throw new Error("Impossibile accedere con il link via email")
        } else if (method === 'google') {
            credential = await loginWithGoogle()
        } else if (method === 'meta') {
            credential = await loginWithFacebook()
        } else if (method === 'microsoft') {
            credential = await loginWithMicrosoft()
        } else if (method === 'twitter') {
            credential = await loginWithTwitter()
        }

        if (!credential) throw new Error("Credenziali non valide")

        const idToken = await credential.user.getIdToken();

        await fetch("/api/login", {
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
        });
        if (endFunction) await endFunction(credential.user.uid)

        if (redirectTo) router.push(redirectTo)
        router.refresh()
        return true
    } catch (e) {
        const knewErrors = {
            "invalid-credential": "Le credenziali non sono valide",
            "email-already-in-use": "L'indirizzo email è già in uso",
            "wrong-password": "La password inserita è errata",
            "user-not-found": "Utente non trovato",
            "user-disabled": "L'utente è disabilitato",
            "too-many-requests": "Troppi tentativi di accesso, riprova più tardi",
            "network-request-failed": "Errore di rete, controlla la tua connessione",
            "operation-not-allowed": "Operazione non consentita",
            "requires-recent-login": "L'operazione richiede un nuovo accesso",
            "account-exists-with-different-credential": "L'account esiste già con una credenziale diversa",
            "popup-closed-by-user": "La finestra popup è stata chiusa dall'utente",
            "credential-already-in-use": "Le credenziali sono già in uso da un altro account",
            "invalid-email": "L'indirizzo email non è valido",
            "missing-email": "Manca l'indirizzo email",
            "weak-password": "La password inserita è troppo debole",
            "user-token-expired": "Il token dell'utente è scaduto",
            "invalid-verification-code": "Il codice di verifica non è valido",
            "invalid-verification-id": "L'ID di verifica non è valido",
            "missing-verification-code": "Manca il codice di verifica",
            "timeout": "La richiesta ha superato il tempo limite",
            "popup-blocked": "Il browser ha bloccato il popup per l'autenticazione. Per risolvere, permetti al sito di aprire popup"
        };
        setError(Object.keys(knewErrors).includes((e as Error).message.slice(22, -2)) ? knewErrors[(e as Error).message.slice(22, -2)] : (e as Error).message)
    }
}

export const Login = () => {
    const { control, handleSubmit, formState: { errors, isSubmitting }, setError, watch } = useForm({
        resolver: zodResolver(loginSchema),
        mode: 'onBlur',
        defaultValues: {
            loginType: 'email-link'
        }
    });

    const loginType = watch('loginType');
    const router = useRouter();
    const [userContext, setUserContext] = useContext(UserContext);
    const [isLoadingSocial, setIsLoadingSocial] = useState<LoginProvidersType | null>(null);

    const onSubmit = async (data, event) => {
        event.preventDefault();
        try {
            await deleteDataFromId(userContext.id);
            await deleteCookie("cookieID");

            if (loginType === 'email-link') {
                await sendSignupLinkViaEmail(data.email, userContext.id);
            } else {
                await LoginFunction("email", { email: data.email, password: data.password }, (err: string) => setError('root', { type: 'manual', message: err }), router);
            }
        } catch (e) {
            setError('root', { type: 'manual', message: (e as Error).message });
        }
    };

    const handleSocialLogin = async (event: React.FormEvent, method: LoginProvidersType) => {
        event.preventDefault();
        setIsLoadingSocial(method);
        try {
            await deleteDataFromId(userContext.id)
            await deleteCookie("cookieID")
            await LoginFunction(method, {}, (err: string) => setError('root', { type: 'manual', message: err }), router);
            setIsLoadingSocial(null);
        } catch (e) {
            setError('root', { type: 'manual', message: (e as Error).message });
            setIsLoadingSocial(null);
        }
    };

    const handleLinkClick = (e: MouseEvent, url: string) => {
        e.preventDefault();
        router.replace(url);
    };

    return (<div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {loginSocials.map((item, index) => (
                <SocialLoginButton
                    key={index}
                    method={item.provider}
                    name={item.name}
                    iconName={item.iconName ?? item.provider}
                    handleSubmit={(e) => handleSocialLogin(e, item.provider)}
                    padding={item.padding}
                    disabled={isSubmitting || isLoadingSocial !== null}
                    isLoading={isLoadingSocial === item.provider}
                />
            ))}
        </div>
        <div className="relative">
            <Separator className="my-[30px]" />
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="uppercase px-2 bg-background text-muted-foreground text-center text-sm">o continua con</span>
            </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-4 mt-2">
                <Controller
                    name="loginType"
                    control={control}
                    render={({ field }) => (
                        <div className="grid gap-4">
                            <RadioGroup onValueChange={field.onChange} defaultValue="email-link">
                                <div className="flex items-start space-x-3">
                                    <RadioGroupItem
                                        id="email-link"
                                        value="email-link"
                                        className="mt-1"
                                    />
                                    <div>
                                        <Label htmlFor="email-link">Accedi con link via mail</Label>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Riceverai un link sicuro via email per accedere direttamente.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <RadioGroupItem
                                        id="email-password"
                                        value="email-password"
                                        className="mt-1"
                                    />
                                    <div>
                                        <Label htmlFor="email-password">Accedi con mail e password</Label>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Effettua l'accesso tramite la tua email e la password sicura.
                                        </p>
                                    </div>
                                </div>
                            </RadioGroup>
                        </div>
                    )}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            id="email"
                            type="email"
                            placeholder="esempio@gmail.com"
                            className={errors.email ? 'border-red-500' : ''}
                        />
                    )}
                />
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>
            {loginType === 'email-password' && (
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                id="password"
                                type="password"
                                placeholder="••••••••••••••"
                                className={errors.password ? 'border-red-500' : ''}
                            />
                        )}
                    />
                    {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                </div>
            )}
            <div>
                <Button type="submit" className="w-full" disabled={isSubmitting || isLoadingSocial !== null}>
                    {!isSubmitting ? (loginType === 'email-link' ? "Invia link di accesso" : "Accedi") : <Loader2 className="animate-spin" />}
                </Button>
                {errors.root && <p className="text-red-500 text-medium">{errors.root.message}</p>}
            </div>
            <div className="text-center text-sm">
                Non hai ancora un account?{" "}
                <Link href="/registrazione" onClick={(e) => handleLinkClick(e, "/registrazione")} className="underline">
                    Registrati
                </Link>
            </div>
        </form>
    </div>
    );
};


export const Signup = ({ targetPageForEmailLink = "dashboard" }: { targetPageForEmailLink?: string }) => {
    const { control, handleSubmit, formState: { errors, isSubmitting }, setError, watch } = useForm({
        resolver: zodResolver(signupSchema),
        mode: 'onBlur',
        defaultValues: {
            registrationType: 'email-link'
        }
    });

    const registrationType = watch('registrationType');
    const router = useRouter();
    const [userContext, setUserContext] = useContext(UserContext);
    const [isLoadingSocial, setIsLoadingSocial] = useState<LoginProvidersType | null>(null);
    const [sentEmail, setSentEmail] = useState(false)

    const onSubmit = async (data, event) => {
        event.preventDefault();
        try {
            if (registrationType === 'email-link') {
                await sendSignupLinkViaEmail(data.email, targetPageForEmailLink, `${data.firstName.trim()} ${data.lastName.trim()}`, userContext.id !== "noid" ? userContext.id : undefined)
                setSentEmail(true)
                return
            }
            const credential = await createUserEmailAndPassowrd(data.email, data.password, `${data.firstName.trim()} ${data.lastName.trim()}`)
            await transferDataFromCookieToUserId(userContext.id, credential.user.uid);
            await deleteCookie("cookieID");
            await LoginFunction("email", { email: data.email, password: data.password },
                (err: string) => setError('root', { type: 'manual', message: err }), router);
        } catch (e) {
            setError('root', { type: 'manual', message: (e as Error).message })
        }
    };

    const handleSocialLogin = async (event: React.FormEvent, method: LoginProvidersType) => {
        event.preventDefault();
        setIsLoadingSocial(method)
        try {
            await LoginFunction(method, {}, (err: string) => setError('root', { type: 'manual', message: err }), router, async (userId: string) => {
                await transferDataFromCookieToUserId(userContext.id, userId);
                await deleteCookie("cookieID");
            }, (targetPageForEmailLink ? "/" + targetPageForEmailLink : "/dashboard"))
            setIsLoadingSocial(null)
        } catch (e) {
            setError('root', { type: 'manual', message: (e as Error).message })
            setIsLoadingSocial(null)
        }
    };

    const handleLinkClick = (e: MouseEvent, url: string) => {
        e.preventDefault();
        router.replace(url);
    };

    return (<div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {loginSocials.map((item, index) => (
                <SocialLoginButton
                    key={index}
                    method={item.provider}
                    name={item.name}
                    iconName={item.iconName ?? item.provider}
                    handleSubmit={handleSocialLogin}
                    padding={item.padding}
                    disabled={isSubmitting || !userContext.id || isLoadingSocial !== null}
                    isLoading={isLoadingSocial === item.provider}
                />
            ))}
        </div>
        <div className="relative">
            <Separator className="my-[30px]" />
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="uppercase px-2 bg-background text-muted-foreground text-center text-sm">o continua con</span>
            </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
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
                            />
                        )}
                    />
                    {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}
                </div>
            </div>

            <div className="grid gap-4 mt-2">
                <Controller
                    name="registrationType"
                    control={control}
                    render={({ field }) => (
                        <div className="grid gap-4">
                            <RadioGroup onValueChange={field.onChange} defaultValue="email-link">
                                <div className="flex items-start space-x-3">
                                    <RadioGroupItem
                                        id="email-link"
                                        value="email-link"
                                        className="mt-1"
                                    />
                                    <div>
                                        <Label htmlFor="email-link">Registrati con link via mail</Label>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Riceverai un link sicuro via email per completare la registrazione.
                                            Non sarà necessario ricordare una password.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <RadioGroupItem
                                        id="email-password"
                                        value="email-password"
                                        className="mt-1"
                                    />
                                    <div>
                                        <Label htmlFor="email-password">Registrati con mail e password</Label>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Crea un account con la tua email e una password sicura.
                                            Potrai accedere quando vuoi usando queste credenziali.
                                        </p>
                                    </div>
                                </div>
                            </RadioGroup>
                        </div>
                    )}
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            id="email"
                            type="email"
                            placeholder="esempio@gmail.com"
                            className={errors.email ? 'border-red-500' : ''}
                        />
                    )}
                />
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            {
                registrationType === 'email-password' && (
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Controller
                            name="password"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id="password"
                                    type="password"
                                    placeholder="••••••••••••••"
                                    className={errors.password ? 'border-red-500' : ''}
                                />
                            )}
                        />
                        {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                    </div>
                )
            }

            <div>
                <Button type="submit" className="w-full" disabled={isSubmitting || !userContext.id || isLoadingSocial !== null}>
                    {!isSubmitting ? (
                        registrationType === 'email-link' ? "Invia link di registrazione" : "Crea un Account"
                    ) : (
                        <Loader2 className="animate-spin" />
                    )}
                </Button>
                {errors.root && <p className="text-red-500 text-medium ">{errors.root.message}</p>}
            </div>

            <div className="text-center text-sm">
                Hai già un account?{" "}
                <Link href="/login" onClick={(e) => handleLinkClick(e, "/login")} className="underline">
                    Accedi
                </Link>
            </div>
        </form>
        {sentEmail && <SentEmail />}
    </div>
    );
};

export const RetrivePassword = () => {
    const { control, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
        resolver: zodResolver(retrievePasswordSchema),
        mode: 'onBlur',
    });

    const router = useRouter()
    const [opened, setOpened] = useState(false);

    const onSubmit = async (data) => {
        setError('root', { type: 'manual', message: "" });

        try {
            await resetPassword(data.email);
            setOpened(true);
        } catch (err) {
            setError('root', { type: 'manual', message: (err as Error).message });
        }
    };

    const handleLinkClick = (e: MouseEvent, url: string) => {
        e.preventDefault();
        router.replace(url);
    };

    return (<div>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            id="email"
                            type="email"
                            placeholder="esempio@gmail.com"
                            className={errors.email ? 'border-red-500' : ''}
                        />
                    )}
                />
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>
            {errors.root && <p className="text-red-500 text-sm">{errors.root.message}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {!isSubmitting ? "Invia email" : <Loader2 className="animate-spin" />}
            </Button>
            <div className="text-center text-sm">
                Torna al{" "}
                <Link href="/login" onClick={(e) => handleLinkClick(e, "/login")} className="underline">
                    Login
                </Link>
            </div>
        </form>
        {opened && <AlertDialog defaultOpen={true}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Mail inviata</AlertDialogTitle>
                    <AlertDialogDescription>
                        Ti abbiamo mandato l'email con cui puoi reimpostare la password del tuo account.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction>
                        <Link href="/login" onClick={(e) => handleLinkClick(e, "/login")}>Torna al Login</Link>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>}
    </div>
    );
};

const SentEmail = () => {
    const router = useRouter()

    return <AlertDialog open={true}>
        <AlertDialogContent className="flex flex-col justify-center gap-4 text-center">
            <div className="flex justify-center">
                <CircleCheck color={"green"} className="size-32" />
            </div>
            <div>
                <AlertDialogTitle className="upper">
                    <h1>Email Inviata!</h1>
                </AlertDialogTitle>
                <AlertDialogDescription>
                    Hai appena creato il tuo account: non è stato difficile, vero?
                    Ora vai sulla tua mail e premi il link all'interno per effettuare il primo accesso.
                </AlertDialogDescription>
            </div>
            <AlertDialogFooter className="mx-auto">
                <AlertDialogAction className="mt-2">
                    <Button onClick={() => router.push("/")}>
                        Torna alla home
                    </Button>
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
}

export const LogOut = async (router: AppRouterInstance) => {
    await logout();
    await fetch("/api/logout");
    await deleteCookie("cookieID")
    router.refresh()
    router.push("/")
}

const SocialLoginButton = ({ method, name, iconName, handleSubmit, padding, disabled, isLoading }: { method: LoginProvidersType, name?: string, iconName: string, handleSubmit: (event: any, method: LoginProvidersType) => void, padding?: number, disabled: boolean, isLoading: boolean }) => {
    return <Button variant="outline" className="w-full relative" onClick={(e) => handleSubmit(e, method)} disabled={disabled}>
        <Image src={"/icons/" + iconName + ".svg"} width={32} height={32} alt={"Accedi con " + (!name ? iconName : "")} style={{ padding: padding + "px" }} />
        {name && <span>{name}</span>}
        {isLoading &&
            <Loader2 className="animate-spin ml-3" />
        }
    </Button>
}