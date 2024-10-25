"use client"

import { getCookie, setCookie } from "@/actions/get-data"
import { payOrder } from "@/actions/payment"
import { CharityBadge } from "@/components/charity-blind"
import { AddItemToCart, AddOrRemoveItemToFavorites, useMedia } from "@/components/client-components"
import { CartContext, FavoritesContext, UserContext } from "@/components/context"
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import Price from "@/components/ui/price"
import QuantitySelection from "@/components/ui/quantity-selection"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useToast } from "@/components/ui/use-toast"
import { CartType } from "@/types/types"
import { GainMapLoader } from '@monogrid/gainmap-js'
import { AlertDialogAction } from "@radix-ui/react-alert-dialog"
import { CameraControls, Environment, OrbitControls, Shadow, useEnvironment } from "@react-three/drei"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import gsap from "gsap"
import { CircleCheck, CircleX, Loader2 } from "lucide-react"
import { Rock_3D } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { title } from "process"
import { useCallback, useContext, useEffect, useRef, useState } from "react"
import { Box3, BoxGeometry, CanvasTexture, ClampToEdgeWrapping, LinearFilter, Mesh, MeshStandardMaterial, Object3D, PlaneGeometry, Quaternion, Raycaster, RepeatWrapping, Sprite, SpriteMaterial, Texture, TextureLoader, Vector3 } from "three"
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

export const CartClient = () => {
    const [cart, setCart] = useContext(CartContext)
    const [{ id: userId }, setUserId] = useContext(UserContext)
    const [favorites, setFavorites] = useContext(FavoritesContext)
    const [selectedItem, setSelectedItem] = useState<CartType | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const isWiderThanMobile = useMedia('(min-width: 768px)');
    const router = useRouter()
    const { toast } = useToast()

    const handleQuantity = (incr: number) => {
        if (!selectedItem)
            return
        (async () => {
            setLoading(true)
            await AddItemToCart(userId, setUserId, selectedItem.variant.id, selectedItem.id, incr, selectedItem.variantIndex, cart, setCart, selectedItem.name)
            setLoading(false)
        })()
    }

    const handlePay = () => {
        router.push("/check-out")
    }

    return (
        <div className="w-full h-full">
            <Canvas camera={{ fov: 25 }}>
                {userId && <Renderer
                    handleSelectItem={item =>
                        setSelectedItem(prevSelectedItem => {
                            if (prevSelectedItem !== null && item !== null && item.id !== prevSelectedItem.id) {
                                gsap.to(null, {
                                    duration: 0.25,
                                    onStart: () => setSelectedItem(null),
                                    onComplete: () => setSelectedItem(item)
                                });
                            } else if (prevSelectedItem === null || item === null || item.id === prevSelectedItem.id) {
                                return item;
                            }
                            return prevSelectedItem; // Default fallback
                        })}
                />}
            </Canvas>
            <Sheet open={selectedItem !== null} modal={false}>
                <SheetContent side="bottom" onClickCloseButton={() => setSelectedItem(null)} className="left-1/2 transform -translate-x-1/2 max-w-xl w-full rounded-t-lg">
                    {selectedItem && <div className="flex justify-start space-x-5">
                        {isWiderThanMobile && <div className="flex-shrink-0"><Image src={process.env.DOMAIN_URL + selectedItem.variant.Images?.data[0].attributes.formats?.thumbnail.url} width={selectedItem.variant.Images?.data[0].attributes.formats?.thumbnail.width} height={selectedItem.variant.Images?.data[0].attributes.formats?.thumbnail.height} alt="Immagine della variante scelta" /></div>}
                        <div className="w-full text-center md:text-left">
                            <SheetTitle asChild>
                                <Button variant={"link"} className="m-0 p-0" onClick={() => router.push("/" + selectedItem.urlPath)}>
                                    <h1 className="font-bold text-2xl">{selectedItem.name}</h1>
                                </Button>
                            </SheetTitle>
                            <SheetDescription asChild>
                                <p className="text-sm line-clamp-2">{selectedItem.shortDescription}</p>
                            </SheetDescription>
                            <div className="flex space-x-3 flex-wrap my-3">
                                <Badge variant="outline" className="bg-white min-h-8">
                                    <div className="flex items-center justify-start flex-no-wrap">
                                        <div className="w-4 h-4 rounded-full inline-block mr-1" style={{ backgroundColor: "#" + selectedItem.variant.Material?.data.attributes.Color }} />
                                        <span>{selectedItem.variant.Material?.data.attributes.Name}</span>
                                    </div>
                                </Badge>
                                <Badge variant="outline" className="min-h-8">
                                    <div className="flex items-center justify-center flex-wrap space-x-2">
                                        {selectedItem.variant.Platings?.data.map((p, i) => <span key={i} className="flex items-center justify-center">
                                            <div className="w-4 h-4 rounded-full inline-block" style={{ backgroundColor: "#" + p.attributes.Color }} />
                                        </span>)}
                                    </div>
                                </Badge>
                            </div>
                            {selectedItem.charity && selectedItem.charity.CharityCampaign && <CharityBadge CampaignName={selectedItem.charity.CharityCampaign.data.attributes.Name} DonatedMoney={selectedItem.charity.DonatedMoney} productName={selectedItem.name} url={"/" + selectedItem.charity.CharityCampaign.data.attributes.SKU} />}
                            <div className={false ? "grid grid-col" : "flex items-start justify-center md:justify-start flex-wrap space-x-5"}>
                                <QuantitySelection handleQuantity={handleQuantity} quantity={selectedItem.quantity} disabled={loading} removeEnable={true} dialogTitle={"Rimuovere " + selectedItem.name + "?"} dialogDescription={"Sei sicuro di voler rimuovere " + selectedItem.name + " dal carrello? In alternativa, aggiungilo alla lista dei preferiti!"} handleAddToWishList={!favorites.find(f => f.variant.id === selectedItem.variant.id) ? () => { AddOrRemoveItemToFavorites(userId, setUserId, selectedItem.variant.id, selectedItem.id, favorites, setFavorites, selectedItem.name, selectedItem.urlPath, selectedItem.shortDescription, selectedItem.variant, selectedItem.variantIndex, selectedItem.charity, toast, router) } : () => { toast({ description: "Questa variante di " + selectedItem.name + " è già nella lista dei preferiti" }) }} />
                                <Price price={selectedItem.variant.Price ?? 0} size={4} />
                            </div>
                        </div>
                    </div>}
                </SheetContent>
            </Sheet>
            {/*false !== null && <AlertDialog open={true}>
                <AlertDialogContent className="flex flex-col justify-center gap-4 text-center">
                    {payState !== "loading" ? <>
                        <div className="flex justify-center">
                            {payState === "success" ? <CircleCheck color={"green"} className="size-32" /> : <CircleX color={"red"} className="size-32" />}
                        </div>
                        <div>
                            <AlertDialogTitle className="upper">
                                <h1>{payState === "success"
                                    ? "Ordine completato!"
                                    : "Ops, qualcosa è andato storto..."}
                                </h1>
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {payState === "success"
                                    ? "Grazie per il tuo ordine! Ti abbiamo mandato una mail di riepilogo."
                                    : "Il processo di pagamento non è andato a buon fine. Riprova o contatta l'assistenza di Unica per maggior supporto. Ci spiace per il disagio."}
                            </AlertDialogDescription>
                        </div>
                        <AlertDialogFooter className="mx-auto">
                            <AlertDialogAction className="mt-2">
                                <Button onClick={() => { router.push("/"); router.refresh(); }}>
                                    Torna alla home
                                </Button>
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </>
                        : <>
                            <div className="flex justify-center">
                                <Loader2 size={48} className="animate-spin" />
                            </div>
                            <AlertDialogTitle className="upper">
                                <h1>Pagamento in corso</h1>
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Non chiudere la pagina
                            </AlertDialogDescription>
                        </>}
                </AlertDialogContent>
            </AlertDialog>*/}
            {cart?.length ? <div className="absolute top-4 left-4 bg-white border border-gray-200 rounded-lg shadow-md p-4 z-1">
                {cart.find(c => c.charity) && <Price price={cart.reduce((acc, curr) => acc + (curr.charity ? (curr.charity?.DonatedMoney ?? 0) * curr.quantity : 0), 0)} size={3} title={"Donato in beneficienza"} />}
                <Price price={cart.reduce((acc, curr) => acc + (curr.variant.Price ?? 0) * curr.quantity, 0)} size={3} title={"Totale"} />
                <Button size={"lg"} onClick={handlePay}>Paga ora</Button>
            </div> : <div />}
        </div>
    )
}

const Renderer = ({ handleSelectItem }: { handleSelectItem: (item: CartType | null) => void }) => {
    const { gl, scene, camera } = useThree()
    const [cart, _] = useContext(CartContext)
    const [model, setModel] = useState<GLTF>(null!)
    const [endAnimation, setEndAnimation] = useState(false)
    const controlsRef = useRef<CameraControls>(null)
    const downQuad = new Quaternion().setFromUnitVectors(new Vector3(0, 0, -1), new Vector3(0, -1, 0))
    const defaultSize = 5
    const [size, setSize] = useState(0)
    const animationFrameId = useRef(0)
    const cartVisualizzedCount = useRef(0)

    function updateLabelNumber(model, newNumber) {
        // Cerca l'etichetta esistente tra i figli del modello
        const label = model.children.find(child => child instanceof Sprite);

        if (label) {
            // Se l'etichetta esiste, aggiorna il suo contenuto
            const newLabel = createCircularLabelSprite(newNumber);
            label.material = newLabel.material;
            label.name = label.name.split("x")[0] + newNumber
        } else {
            // Se l'etichetta non esiste, creane una nuova
            addLabelToModel(model, newNumber);
        }
    }

    function createCircularLabelSprite(number: string, textColor = 'black', backgroundColor = 'rgba(255, 255, 255, 0.5', arrowColor = 'rgba(0, 0, 0, 0.5)') {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 90; // Ridotto per lasciare spazio alla freccia

        // Disegna il cerchio di sfondo
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        context.fillStyle = backgroundColor;
        context.fill();

        // Imposta il testo
        context.font = 'Bold 80px Arial'; // Ridotto leggermente per adattarsi al cerchio più piccolo
        context.fillStyle = textColor;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(number.toString(), centerX, centerY);

        // Crea la texture e lo sprite
        const texture = new CanvasTexture(canvas);
        const spriteMaterial = new SpriteMaterial({ map: texture });
        const sprite = new Sprite(spriteMaterial);

        // Scala lo sprite
        sprite.scale.set(0.75, 0.75, 0.75);

        return sprite;
    }

    function addLabelToModel(model: Mesh, number: string) {
        const boundingBox = new Box3().setFromObject(model);
        const size = boundingBox.getSize(new Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z);

        const label = createCircularLabelSprite(number);
        console.log("pos", -boundingBox.min.z, boundingBox.max.x, "quantity_" + model.name.split("_")[1] + number)
        // Posiziona l'etichetta nell'angolo in alto a destra del modello
        label.position.set(
            (boundingBox.max.z - boundingBox.min.z) / 2,
            (boundingBox.max.x - boundingBox.min.x) / 2,
            0
        );

        // Scala l'etichetta in base alla dimensione del modello
        label.name = "quantity_" + model.name.split("_")[1] + number
        model.add(label);
    }

    const calculateOptimalCameraPosition = (object, camera) => {
        const boundingBox = new Box3().setFromObject(object);
        const center = boundingBox.getCenter(new Vector3());
        const size = boundingBox.getSize(new Vector3());

        // Calcola la dimensione massima dell'oggetto
        const maxDimension = Math.max(size.x, size.y, size.z);

        // Ottieni l'aspect ratio dello schermo
        const aspectRatio = gl.domElement.clientWidth / gl.domElement.clientHeight;

        // Calcola il campo visivo verticale in radianti
        const vFov = camera.fov * Math.PI / 180

        // Calcola la distanza necessaria per inquadrare l'oggetto completamente
        let distance = maxDimension / (2 * Math.tan(vFov / 2));

        // Aggiungi un po' di spazio extra (puoi regolare questo valore)
        distance *= 1.5;

        // Calcola la posizione della camera
        const direction = new Vector3(0, 0, 1).applyQuaternion(camera.quaternion);
        const position = center.clone().add(direction.multiplyScalar(distance));

        return position
    }

    const handleInteraction = useCallback((event) => {
        if (!endAnimation)
            return
        event.preventDefault()
        const raycaster = new Raycaster()
        const mouse = new Vector3()

        const clientX = event.clientX || (event.touches && event.touches[0].clientX)
        const clientY = event.clientY || (event.touches && event.touches[0].clientY)

        mouse.x = (clientX / gl.domElement.clientWidth) * 2 - 1
        mouse.y = -(clientY / gl.domElement.clientHeight) * 2 + 1

        raycaster.setFromCamera(mouse, camera)

        const intersects = raycaster.intersectObjects(scene.children, true)

        if (intersects.length > 0) {
            const clickedObject = intersects.find(obj => obj.object.name && obj.object.name.includes("jewel"))
            if (clickedObject) {
                // Calcola la posizione ottimale della camera
                const targetPosition = calculateOptimalCameraPosition(clickedObject.object, camera)//clickedObject.object.position.clone()
                //targetPosition.y = calculateOptimalCameraPosition(clickedObject.object, camera).y
                handleSelectItem(cart.find(c => c.variant.id === parseInt(clickedObject.object.name.split("_")[1])) ?? null)
                setEndAnimation(false)

                gsap.to(camera.position, {
                    duration: 0.5,
                    x: targetPosition.x,
                    y: targetPosition.y,
                    z: 0, // Sposta la camera leggermente indietro
                    onComplete: () => setEndAnimation(true)
                })
            }
            else
                handleSelectItem(null)
        }
        else
            handleSelectItem(null)
    }, [camera, scene, endAnimation, gl.domElement])

    useEffect(() => {
        const canvas = gl.domElement

        // Aggiungi event listener per mouse e touch
        canvas.addEventListener('click', handleInteraction)
        canvas.addEventListener('touchstart', handleInteraction)

        return () => {
            // Rimuovi event listener quando il componente viene smontato
            canvas.removeEventListener('click', handleInteraction)
            canvas.removeEventListener('touchstart', handleInteraction)
        }
    }, [handleInteraction, gl])


    useEffect(() => {
        getCookie<string>("cartVisualizzedCount").then(count => {
            let newCount = parseInt(count ?? 0) + 1
            setCookie("cartVisualizzedCount", newCount.toString(), { maxAge: 31536000 })
            cartVisualizzedCount.current = newCount
        })

        new GainMapLoader(gl).load(["/environmentMap.webp", "/environmentMap-gainmap.webp", "/environmentMap.json"], (texture) => {
            scene.environment = texture.renderTarget.texture
            scene.environment.mapping = 303
        }, undefined, err => ie.log("errore", err))

        new GLTFLoader().load("/packaging_divided.glb", (loadedGltf) => {
            for (let i = 0; i < loadedGltf.scene.children.length; i++)
                (loadedGltf.scene.children[i] as Mesh).material = new MeshStandardMaterial({ color: 0x0000ff, metalness: 0.2, roughness: 0.3 })
            const containerLink = new Mesh(new PlaneGeometry(0, 0), new MeshStandardMaterial({ color: 0x0000ff, metalness: 0.2, roughness: 0.3 }))
            containerLink.name = "container_link"
            containerLink.position.set(2.7499, -1.060, 0)

            const drawerLinks = [
                new Mesh(new PlaneGeometry(0, 0), new MeshStandardMaterial({ color: 0x0000ff, metalness: 0.2, roughness: 0.3 })),
                new Mesh(new PlaneGeometry(0, 0), new MeshStandardMaterial({ color: 0x0000ff, metalness: 0.2, roughness: 0.3 }))
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
            loadedGltf.scene.add(...woods, containerLink, ...drawerLinks)
            loadedGltf.scene.rotateOnWorldAxis(new Vector3(0, -1, 0), Math.PI / 2.7)
            loadedGltf.scene.scale.set(0, 0, 0)
            setModel(loadedGltf)
        }, undefined, (error) => {
            console.error("Error loading GLTF:", error);
        })
    }, [])

    useEffect(() => {
        if (model && !size && cart) {
            const space = 0.5;
            let cartSize = 0
            cart.map(c => cartSize += c.size[0])
            cartSize += space * (cart.length - 1) + 3;
            cartSize = Math.max(cartSize, 5);
            (async () => {
                const meshes: Mesh[] = []
                let totalWidth = 0
                for (let i = 0; i < cart.length; i++)
                    totalWidth += cart[i].size[0] + space;
                totalWidth -= space
                let currentPosition = -totalWidth / 2
                for (let i = 0; i < cart.length; i++) {
                    const [width, height] = cart[i].size;
                    const mesh = new Mesh(new PlaneGeometry(cart[i].size[0], cart[i].size[1]), new MeshStandardMaterial({ map: await new TextureLoader().loadAsync(process.env.DOMAIN_URL + cart[i].textureURL), metalness: 0.8, roughness: 0.1, transparent: true }))
                    mesh.position.set(0, 0, currentPosition + width / 2)
                    currentPosition += width + space; // Aggiorna la posizione corrente

                    mesh.rotateOnWorldAxis(new Vector3(0, 1, 0), Math.PI / 2)
                    mesh.rotateOnWorldAxis(new Vector3(0, 0, 1), Math.PI / 2)
                    mesh.geometry.computeBoundingBox()
                    mesh.name = "jewel_" + cart[i].variant.id
                    addLabelToModel(mesh, "x" + cart[i].quantity)
                    console.log("added", mesh.name, mesh.position, currentPosition, width, -totalWidth / 2)
                    meshes.push(mesh)
                }
                if (meshes.length)
                    model.scene.add(...meshes)
            })()
            setSize(cartSize)
        }
    }, [cart, model, size])

    useEffect(() => {
        if (!model || !size || !cartVisualizzedCount.current)
            return
        model.scene.getObjectByName("container_left")?.position.set(0, 0, (size - defaultSize) / 2)
        model.scene.getObjectByName("container_right")?.position.set(0, 0, -(size - defaultSize) / 2)
        model.scene.getObjectByName("drawer_left")?.position.set(0, 0, (size - defaultSize) / 2)
        model.scene.getObjectByName("drawer_right")?.position.set(0, 0, -(size - defaultSize) / 2)
        model.scene.getObjectByName("drawer_center")?.scale.set(1, 1, 2 + (size - defaultSize));
        (model.scene.getObjectByName("container_link") as Mesh).geometry = new BoxGeometry(0.5, 0.38, size - defaultSize);

        (model.scene.getObjectByName("drawer_link_0") as Mesh).geometry = new BoxGeometry(0.5, 0.38, size - defaultSize);
        (model.scene.getObjectByName("drawer_link_1") as Mesh).geometry = new BoxGeometry(0.5, 0.38, size - defaultSize);

        const repeatRatioY = size / defaultSize * 2
        const woods = model.scene.children.filter(m => m.name.includes("wood")).sort((a, b) => parseInt(a.name.split("_")[1]) - parseInt(b.name.split("_")[1])) as Mesh[];
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

        startAnimation()

        return () => {
            cancelAnimationFrame(animationFrameId.current);
        }
    }, [size, cartVisualizzedCount.current])

    const TreeMaterial = (url: string) => {
        const t = new TextureLoader().load(url);
        t.center.set(0.5, 0.5); // Centra la texture
        t.wrapS = ClampToEdgeWrapping; // Le parti fuori dai bordi verranno tagliate
        t.wrapT = ClampToEdgeWrapping;
        t.minFilter = LinearFilter; // Filtraggio per evitare artefatti
        t.magFilter = LinearFilter;

        return new MeshStandardMaterial({ map: t, transparent: true, opacity: 0.75, roughness: 1, metalness: 0 })
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

    const startAnimation = () => {
        const speedFactor = cartVisualizzedCount.current >= 3 ? 1 / Math.log(cartVisualizzedCount.current) : 1
        let totalTime = Math.max(speedFactor * 4000, 1000); // Durata totale della fase 1 in millisecondi
        let phase2Time = Math.max(speedFactor * 2000, 700); // Durata della fase 2 in millisecondi
        let phase2 = false;
        let finalPosition = new Vector3(0, 10, 0); // Posizione finale
        let initialTimePhase2 = 0;
        let objectPosition = new Vector3(0, 0, 0); // Oggetto al centro della scena

        const drawer = model.scene.children.filter(m => m.name.includes("wood") || m.name.includes("container"))
        const initialPositionMeshes = drawer.map(m => m.position.clone().x)
        let startedTime = -1
        console.log("nim", model.scene.children.find(m => m.name.includes("jewel"))?.position)
        // Avvia l'animazione
        animationFrameId.current = requestAnimationFrame(animate);

        function animate(time: number) {
            if (startedTime === -1) {
                startedTime = time
                model.scene.scale.set(1, 1, 1)
            }

            if (startedTime > 0)
                time -= startedTime

            if (time > totalTime + phase2Time) {
                setEndAnimation(true)
                return
            }
            animationFrameId.current = requestAnimationFrame(animate);

            // Fase 1: Movimento orbitale a spirale fino a quando la distanza dall'oggetto è minore di 1
            if (!phase2) {
                // Calcolo del progresso globale della fase 1 con easing
                let progress = Math.min(time / totalTime, 1);
                let easedProgress = easeInOutQuad(progress);

                let angle = easedProgress * Math.PI * 4; // Angolo per il movimento a spirale
                let radius = 150 * (1 - easedProgress); // Diminuisce il raggio per avvicinarsi
                let height = -70 + easedProgress * 100; // Si alza gradualmente

                // Posizione della camera su una traiettoria a spirale
                camera.position.x = radius * Math.cos(angle);
                camera.position.z = radius * Math.sin(angle);
                camera.position.y = height;

                // La camera guarda sempre l'oggetto
                camera.lookAt(objectPosition);

                // Passa alla fase 2 quando la distanza è minore di 1
                if (radius < 1) {
                    initialTimePhase2 = time; // Memorizza il tempo di inizio della fase 2
                    phase2 = true;
                }
            }
            // Fase 2: Movimento verso la posizione finale e rotazione
            else {
                // Calcolo del progresso per la fase 2 basato sul tempo da quando è iniziata la fase 2
                let phase2Progress = Math.min((time - initialTimePhase2) / phase2Time, 1);
                let easedPhase2Progress = easeInOutQuad(phase2Progress);

                // Lerp per spostare la camera verso la posizione finale
                camera.position.lerp(finalPosition, easedPhase2Progress);
                drawer.map((m, i) => m.position.lerp(new Vector3(initialPositionMeshes[i] - 5.1, m.position.y, m.position.z), easedPhase2Progress))

                // Utilizziamo i quaternions per interpolare la rotazione in modo fluido
                camera.quaternion.slerp(downQuad, easedPhase2Progress);

                // Continua a guardare l'oggetto
                //camera.lookAt(objectPosition);
            }

            // Funzione di easing (easeInOutQuad)
            function easeInOutQuad(t: number) {
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            }
        }
    }

    useEffect(() => {
        if (!model || !cart)
            return
        let removed: Object3D | null = null
        model.scene.children.find(m => {
            if (!m.name.includes("jewel"))
                return false
            let id = parseInt(m.name.split("_")[1])
            let index = -1
            cart.find((c, i) => {
                if (id === c.variant.id) {
                    index = i;
                    return true
                } else return false
            })
            console.log(index, id, cart)
            if (index === -1 || cart[index].quantity <= 0) {
                removed = m
                return true
            }
            else if (!m.getObjectByName("quantity_" + id + "x" + cart[index].quantity)) {
                updateLabelNumber(m, "x" + cart[index].quantity)
                return true
            }
            return false
        })
        if (removed) {
            model.scene.remove(removed)
            handleSelectItem(null)
        }
    }, [cart?.reduce((acc, curr) => curr.quantity + acc, 0)])

    useFrame(() => {
        if (controlsRef.current) {
            // Fissa la camera per guardare sempre verso il basso
            camera.position.z = 0;
            camera.position.x = Math.min(Math.max(camera.position.x, -size / 2 + 1), size / 2 - 1);
            camera.quaternion.set(downQuad.x, downQuad.y, downQuad.z, downQuad.w);
            controlsRef.current.mouseButtons.left = 0
        }
    });

    return <>
        <mesh rotation={[0, -0.4, 0]}>
            {model && <primitive object={model.scene} />}
        </mesh>
        {scene.environment && <Environment map={scene.environment} />}
        {endAnimation && <CameraControls ref={controlsRef} minDistance={4} maxDistance={30} />}
    </>
}