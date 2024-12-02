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
import { ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { AddressForm, DeleteAddressLoadingDialog } from "../dashboard/account/account-client";
import { AddressDetails, CartType } from "@/types/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Tokens } from "next-firebase-auth-edge";
import { createShipping, getCarriers, getDropOffPoints } from "@/actions/shipping";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import Price from "@/components/ui/price";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Link from "next/link";
import { CartContext } from "@/components/context";
import { CharityBadge } from "@/components/charity-blind";
import { GainMapLoader } from "@monogrid/gainmap-js";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Canvas, useThree } from "@react-three/fiber";
import { CameraControls, Environment, OrbitControls } from "@react-three/drei";
import { BoxGeometry, ClampToEdgeWrapping, LinearFilter, LineBasicMaterial, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, RepeatWrapping, Texture, TextureLoader, Vector3 } from "three";
import { formattedPrice } from "@/lib/utils";
import { ShineBorder } from "@/components/magicui/shine-border";

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
                                        <DialogClose asChild>
                                            <Button disabled={!tmpItem}>Seleziona</Button>
                                        </DialogClose>
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
        {addressId && <ItemSelectionDialog title="Corrieri disponibili" buttonLabel={"Seleziona Metodo di spedizione"} openAction={() => calculateShipping(addressId)} dialogTitle="Scegli il metodo di Spedizione" items={courriers} itemIdKey="id" labelChildren={(_courrier, index) => (
            CourrierComponent(_courrier)
        )} finalValue={courrier} setFinalValue={setCourrier} displaiedSel={changeBtn => (
            <>
                {CourrierComponent(courrier)}
                {changeBtn}
            </>
        )} defaultOpen={isLoading === "courrier"} /> }
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

const Summary = ({ cart, shippingCost, handleSubmit }: { cart: CartType[], shippingCost: number, handleSubmit: (price: number) => void }) => {
    const colors = ["#ff0000", "#00ff00", "#0000cc"]
    const [colorSel, setColorSel] = useState<string | null>(null)

    const PackageRender = ({ color }: { color: string | null }) => {
        const { gl, scene, camera } = useThree()
        const [model, setModel] = useState<GLTF>(null!)
        const [randomColor, setRandomColor] = useState<string>(colors[Math.floor(Math.random() * colors.length)])

        useEffect(() => {
            new GainMapLoader(gl).load(["/environmentMap.webp", "/environmentMap-gainmap.webp", "/environmentMap.json"], (texture) => {
                scene.environment = texture.renderTarget.texture
                scene.environment.mapping = 303
            }, undefined, err => console.log("errore", err))

            new GLTFLoader().load("/packaging_divided.glb", (loadedGltf) => {
                for (let i = 0; i < loadedGltf.scene.children.length; i++)
                    (loadedGltf.scene.children[i] as Mesh).material = new MeshStandardMaterial({ color: color || randomColor, metalness: 0.2, roughness: 0.3 })
                const containerLink = new Mesh(new PlaneGeometry(0, 0), new MeshStandardMaterial({ color: color || randomColor, metalness: 0.2, roughness: 0.3 }))
                containerLink.name = "container_link"
                containerLink.position.set(2.7499, -1.060, 0)

                const drawerLinks = [
                    new Mesh(new PlaneGeometry(0, 0), new MeshStandardMaterial({ color: color || randomColor, metalness: 0.2, roughness: 0.3 })),
                    new Mesh(new PlaneGeometry(0, 0), new MeshStandardMaterial({ color: color || randomColor, metalness: 0.2, roughness: 0.3 }))
                ]
                drawerLinks[0].position.set(2.7499, -1.060, 0)
                drawerLinks[0].name = "drawer_link_0"
                drawerLinks[1].position.set(2.7499, -1.060, 0)
                drawerLinks[1].name = "drawer_link_1"

                const woodMaterial = WoodMaterial()
                const woods = [
                    new Mesh(new PlaneGeometry(0, 0), woodMaterial),
                    new Mesh(new PlaneGeometry(0, 0), woodMaterial),
                    new Mesh(new PlaneGeometry(0, 0), woodMaterial),
                    new Mesh(new PlaneGeometry(0, 0), TreeMaterial("/tree_textures/tree_up.png")),
                    new Mesh(new PlaneGeometry(0, 0), TreeMaterial("/tree_textures/tree_down.png")),
                    new Mesh(new PlaneGeometry(0, 0), TreeMaterial("/tree_textures/tree_middle.png")),
                ]
                woods[0].position.set(-0.03, 1, 0)
                woods[1].position.set(-0.03, -1, 0)
                woods[2].position.set(-2.745, -0, 0)
                woods[3].position.set(-0, 1.18, 0)
                woods[3].rotateOnAxis(new Vector3(0, 0, -1), Math.PI / 2)
                woods[3].rotateOnAxis(new Vector3(0, -1, 0), Math.PI / 2)
                woods[4].position.set(-0, -1.18, 0)
                woods[4].rotateOnAxis(new Vector3(0, 0, -1), Math.PI / 2)
                woods[4].rotateOnAxis(new Vector3(0, 1, 0), Math.PI / 2)
                woods[4].rotateOnAxis(new Vector3(0, 0, 1), Math.PI)
                woods[5].position.set(-2.901, -0, 0)
                woods[5].rotateOnAxis(new Vector3(0, -1, 0), Math.PI / 2)
                woods.map((m, i) => m.name = "wood_" + i)

                const defaultSize = 5, size = 5
                loadedGltf.scene.getObjectByName("container_left")?.position.set(0, 0, (size - defaultSize) / 2)
                loadedGltf.scene.getObjectByName("container_right")?.position.set(0, 0, -(size - defaultSize) / 2)
                loadedGltf.scene.getObjectByName("drawer_left")?.position.set(0, 0, (size - defaultSize) / 2)
                loadedGltf.scene.getObjectByName("drawer_right")?.position.set(0, 0, -(size - defaultSize) / 2)
                loadedGltf.scene.getObjectByName("drawer_center")?.scale.set(1, 1, 2 + (size - defaultSize));
                containerLink.geometry = new BoxGeometry(0.5, 0.38, size - defaultSize);

                drawerLinks[0].geometry = new BoxGeometry(0.5, 0.38, size - defaultSize);
                drawerLinks[1].geometry = new BoxGeometry(0.5, 0.38, size - defaultSize);

                const repeatRatioY = size / defaultSize * 2;
                (woods[0].material as MeshStandardMaterial).map?.repeat.set(2, repeatRatioY);
                (woods[0].material as MeshStandardMaterial).roughnessMap?.repeat.set(2, repeatRatioY);
                (woods[0].material as MeshStandardMaterial).normalMap?.repeat.set(2, repeatRatioY);
                woods[1].material = woods[2].material = woods[0].material;
                (woods[3].material as MeshStandardMaterial).map = SetRepeatTreeMaterial((woods[3].material as MeshStandardMaterial).map ?? null!, 1.6, size / 5.64);
                (woods[4].material as MeshStandardMaterial).map = SetRepeatTreeMaterial((woods[4].material as MeshStandardMaterial).map ?? null!, 1.6, size / 5.64);
                (woods[5].material as MeshStandardMaterial).map = SetRepeatTreeMaterial((woods[5].material as MeshStandardMaterial).map ?? null!, 3.733, size / 2.4);

                woods[0].geometry = new BoxGeometry(5.64, 0.35, 5.2 + size - defaultSize);
                woods[1].geometry = new BoxGeometry(5.64, 0.35, 5.67 + size - defaultSize)
                woods[2].geometry = new BoxGeometry(0.31, 2.33, 5.4 + size - defaultSize)
                woods[3].geometry = woods[4].geometry = new PlaneGeometry(size, 5.64)
                woods[5].geometry = new PlaneGeometry(size, 2.33)
                loadedGltf.scene.add(...woods, containerLink, ...drawerLinks)
                loadedGltf.scene.rotateOnWorldAxis(new Vector3(0, -1, 0), Math.PI / 2.7)
                setModel(loadedGltf)
                if (!color)
                    setRandomColor(null)
            }, undefined, (error) => {
                console.error("Error loading GLTF:", error);
            })
        }, [])

        const TreeMaterial = (url: string) => {
            const t = new TextureLoader().load(url);
            t.center.set(0.5, 0.5); // Centra la texture
            t.wrapS = ClampToEdgeWrapping; // Le parti fuori dai bordi verranno tagliate
            t.wrapT = ClampToEdgeWrapping;
            t.minFilter = LinearFilter; // Filtraggio per evitare artefatti
            t.magFilter = LinearFilter;

            return new MeshStandardMaterial({ map: t, transparent: true, opacity: 0.75, roughness: 1, metalness: 0 })
        }

        const WoodMaterial = () => {
            // Carica le texture
            const textureLoader = new TextureLoader();
            const baseColorTexture = textureLoader.load('wood_textures/brown_planks_09_diff_1k.jpg');
            const roughnessTexture = textureLoader.load('wood_textures/brown_planks_09_rough_1k.jpg');
            const normalMapTexture = textureLoader.load('wood_textures/brown_planks_09_nor_gl_1k.jpg');

            // Imposta la ripetizione delle texture (equivalente alla scala del mapping in Blender)
            baseColorTexture.wrapS = baseColorTexture.wrapT = RepeatWrapping;
            roughnessTexture.wrapS = roughnessTexture.wrapT = RepeatWrapping;
            normalMapTexture.wrapS = normalMapTexture.wrapT = RepeatWrapping;

            // Crea il materiale usando MeshStandardMaterial
            return new MeshStandardMaterial({
                map: baseColorTexture, // Base Color
                roughnessMap: roughnessTexture, // Roughness
                normalMap: normalMapTexture, // Normal Map
                roughness: 1.0, // Rugosità base
                metalness: 0.0 // Assumi che non ci sia metallicità se non definita nell'immagine
            });
        }

        const SetRepeatTreeMaterial = (t: Texture, textureAspectRatio: number, planeAspectRatio: number) => {
            if (planeAspectRatio > textureAspectRatio) {
                // Se il piano è più largo della texture, taglia la larghezza della texture
                t.repeat.set(planeAspectRatio / textureAspectRatio, 1);
            } else {
                // Se il piano è più alto della texture, taglia l'altezza della texture
                t.repeat.set(planeAspectRatio / textureAspectRatio, 1);
            }
            return t
        }

        useEffect(() => {
            if (!model)
                return
            setTimeout(() => {
                function RandomColor() {
                    let c = colors[Math.floor(Math.random() * colors.length)]
                    if (c === randomColor)
                        return RandomColor()
                    return c
                }
                let c = RandomColor()
                model.scene.children = model.scene.children.map(m => {
                    if (!m.name.includes("wood"))
                        (m as Mesh).material = new MeshStandardMaterial({ color: c, metalness: 0.2, roughness: 0.3 })
                    return m
                })
                setModel(model)
                setRandomColor(c)
            }, 1000)
        }, [randomColor])

        return <>
            <mesh rotation={[0, -0.4, 0]}>
                {model && <primitive object={model.scene} />}
            </mesh>
            {scene.environment && <Environment map={scene.environment} />}
            <OrbitControls minDistance={4} maxDistance={35} enablePan={false} />
        </>
    }

    return <div className="mt-8">
        <h2 className="mb-4 text-2xl font-bold text-center">
            Stai acquistando
        </h2>
        <Card className={"p-3 grid grid-cols-2 lg:grid-cols-3 gap-3"}>
            {cart.map((item, index) => (
                <div key={index} className="flex flex-col gap-2">
                    {item.variant.Images?.data[0].attributes.formats?.thumbnail &&
                        <div className="relative flex justify-center">
                            <Image src={item.variant.Images.data[0].attributes.formats.small.url} width={item.variant.Images.data[0].attributes.formats.small.width} height={item.variant.Images.data[0].attributes.formats.small.height} alt="" className="h-[150px]" />
                            <div className="absolute top-0 right-0 bg-[#00000099] size-5 rounded-full flex items-center justify-center transform translate-x-1/2 translate-y-[-50%] font-bold">
                                <span className="text-white">{item.quantity}</span>
                            </div>
                        </div>}
                    <div>
                        <Button variant="link">
                            <Link href={"/" + item.urlPath} className="font-bold text-lg">{item.name}</Link>
                        </Button>
                        <div className="flex space-x-3 flex-wrap">
                            <Badge variant="outline" className="bg-white min-h-8 mb-1">
                                <div className="flex items-center justify-start flex-no-wrap">
                                    <div className="w-4 h-4 rounded-full inline-block mr-1" style={{ backgroundColor: "#" + item.variant.Material?.data.attributes.Color }} />
                                    <span>{item.variant.Material?.data.attributes.Name}</span>
                                </div>
                            </Badge>
                            <Badge variant="outline" className="min-h-8  mb-1">
                                <div className="flex items-center justify-center flex-wrap space-x-2">
                                    {item.variant.Platings?.data.map((p, i) => <span key={i} className="flex items-center justify-center">
                                        <div className="w-4 h-4 rounded-full inline-block" style={{ backgroundColor: "#" + p.attributes.Color }} />
                                    </span>)}
                                </div>
                            </Badge>
                        </div>
                        {item.charity?.CharityCampaign && <CharityBadge CampaignName={item.charity.CharityCampaign.data.attributes.Name} productName={item.name} DonatedMoney={item.charity.DonatedMoney} url={"/" + item.charity.CharityCampaign.data.attributes.SKU} />}
                    </div>
                </div>
            ))}
        </Card>
        <h2 className="mb-4 mt-8 text-2xl font-bold text-center">
            Packaging
        </h2>
        <Card className={"p-3 flex gap-3 flex-wrap"}>
            <div className="md:w-1/3 w-full">
                <Canvas camera={{ fov: 25, position: new Vector3(-11.33, 13.08, 10.02) }}>
                    <PackageRender color={colorSel} />
                </Canvas>
            </div>
            <div className="flex-grow flex flex-col gap-2">
                <RadioGroup defaultValue="random" onValueChange={v => v === "random" ? setColorSel(null) : !colorSel && setColorSel(colors[0])}>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="random" id="random_color" />
                        <Label htmlFor="random_color" className="flex items-center gap-1 flex-grow">
                            <ShineBorder borderWidth={12} color={["#A07CFE", "#FE8FB5", "#FFBE7B"]} borderRadius={100} className=""><div className="size-[24px]" /></ShineBorder>
                            <h3 className="font-bold text-lg">Colore casuale</h3>
                            <div className="flex-grow flex justify-end">
                                <span className="text-lg font-bold">GRATIS</span>
                            </div>
                        </Label>
                    </div>
                    <div className="flex items-center gap-2 w-full">
                        <RadioGroupItem value="precise" id="precise_color" />
                        <Label htmlFor="precise_color" className="flex items-center gap-1 flex-grow flex-wrap">
                            <div className="relative rounded-full size-[24px] border border-black border-1" style={{ backgroundColor: colorSel || "#ffffff" }}>{!colorSel && <div className="absolute w-[24px] h-[2px] bg-red-500 left-[-2px] top-[48%]" style={{ transform: "rotate(45deg)" }} />}</div>
                            <h3 className="font-bold text-lg">Colore selezionato</h3>
                            <div className="flex-grow flex justify-end text-lg font-bold">{formattedPrice(1)}</div>
                            <Card className="w-full flex flex-wrap gap-1 p-1">
                                {colors.map((color, i) => (
                                    colorSel === color ?
                                        <ShineBorder key={i} borderWidth={3} color={["#A07CFE", "#FE8FB5", "#FFBE7B"]} borderRadius={100}>
                                            <button className="rounded-full size-[20px]" style={{ backgroundColor: color }} onClick={() => setColorSel(color)} />
                                        </ShineBorder>
                                        : <button key={i} className="rounded-full size-[20px] border border-black border-1" style={{ backgroundColor: color }} onClick={() => setColorSel(color)} />
                                ))}
                            </Card>
                        </Label>
                    </div>
                </RadioGroup>
            </div>
        </Card >
        <h2 className="mb-4 mt-8 text-2xl font-bold text-center">
            Riepilogo di Pagamento
        </h2>
        <Card className={"p-3 flex gap-3 flex-wrap"}>
            {[["Costo dei prodotti", cart.reduce((acc, item) => acc + (item.quantity * (item.variant.Price || 0)), 0)], ["Spedizione", shippingCost], ["Costo Packaging", colorSel ? 1 : 0]].map((a, i) => (
                <div key={i} className="flex justify-between w-full">
                    <span>{a[0]}:</span>
                    <span className="font-bold">{formattedPrice(a[1])}</span>
                </div>
            ))}
            <div className="flex justify-between w-full text-xl font-bold">
                <span>Totale:</span>
                <span>{formattedPrice(cart.reduce((acc, item) => acc + (item.quantity * (item.variant.Price || 0)), shippingCost + (colorSel ? 1 : 0)))}</span>
            </div>
        </Card>
        <Button onClick={() => handleSubmit(cart.reduce((acc, item) => acc + (item.quantity * (item.variant.Price || 0)), shippingCost + (colorSel ? 1 : 0)))} className="w-full mt-8">Paga ora</Button>
    </div >
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
                                <StepIcon className={`w-6 h-6 ${isComplete ? 'text-white' : isCurrent ? 'text-blue-500' : 'text-gray-400'}`} />
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



const steps: ({ value: "login" | "shipping" | "confirm" | "summary", label: string, icon: typeof ShoppingCart, title: string, desc: string })[] = [
    { value: "login", label: "Accesso", icon: ShoppingCart, title: "Crea un account", desc: "Per aggiornarti sui tuoi ordini e per tenere registrati i tuoi ordini è necessario un account. Tranquillo: è semplice e veloce, e magari in futuro ti becchi pure un codice sconto!" },
    { value: "shipping", label: "Spedizione", icon: Truck, title: "Aggiungi o seleziona il tuo indirizzo", desc: "Per aggiornarti sui tuoi ordini e per tenere registrati i tuoi ordini è necessario un account. Tranquillo: è semplice e veloce, e magari in futuro ti becchi pure un codice sconto!" },
    { value: "summary", label: "Riepilogo", icon: CreditCard, title: "Stai per ottenere...", desc: "Per aggiornarti sui tuoi ordini e per tenere registrati i tuoi ordini è necessario un account. Tranquillo: è semplice e veloce, e magari in futuro ti becchi pure un codice sconto!" }
]

export const PaymentProgress = ({ startedStep, auth, addresses }: { startedStep: typeof steps[number]["value"] | number, auth: Tokens | null, addresses?: AddressDetails[] }) => {
    const [stepIndex, setStepIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<{}>({})
    const [addressSelected, setSelectedAddress] = useState("")
    const [courrierSelected, setSelectedCourrier] = useState({})
    const [cart, _] = useContext(CartContext)

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
        setSelectedCourrier(courrier)
        console.log(courrier)
        /*const r = await createShipping({
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
        console.log(r)*/
        step.next()
    }

    const handlePay = (price: number) => {
        console.log(price)
    }

    useEffect(() => {
        if (step.value === "summary" && loading)
            setLoading(false)
    }, [cart])

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
                                case "summary":
                                    if (cart)
                                        return <Summary cart={cart} shippingCost={courrierSelected.price.total_price} handleSubmit={handlePay} />
                                    setLoading(false)
                                    return <></>
                            }
                        })() : <div className="size-full flex items-center justify-center"><Loader2 size={48} className="animate-spin" /></div>}
                    {error.signin && <p>{error.signin}</p>}
                </div>
                <ScrollBar />
            </ScrollArea>
        </Card>
    </div>
}