"use client"

import { CartContext } from "@/components/context"
import { GainMapLoader, HDRJPGLoader, QuadRenderer } from '@monogrid/gainmap-js'
import { CameraControls, Environment, OrbitControls, Shadow, useEnvironment } from "@react-three/drei"
import { sRGBEncoding } from "@react-three/drei/helpers/deprecated"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useContext, useEffect, useRef, useState } from "react"
import { ACESFilmicToneMapping, AmbientLight, BoxGeometry, ClampToEdgeWrapping, EllipseCurve, EquirectangularReflectionMapping, Euler, Group, LightShadow, LinearFilter, MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, Quaternion, RepeatWrapping, TextureLoader, Vector3 } from "three"
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

export const CartClient = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="fixed inset-0">
            <Canvas camera={{ fov: 25 }}>
                <Renderer />
            </Canvas>
        </div>
    )
}

const Renderer = () => {
    const { gl, scene, camera } = useThree()
    const [{ cart }, _] = useContext(CartContext)
    const [model, setModel] = useState<GLTF>(null!)
    const [endAnimation, setEndAnimation] = useState(false)
    const controlsRef = useRef<CameraControls>(null)
    const downQuad = new Quaternion().setFromUnitVectors(new Vector3(0, 0, -1), new Vector3(0, -1, 0))
    const defaultSize = 5
    const [size, setSize] = useState(5)
    const [materials, setMaterials] = useState({material: new MeshBasicMaterial({color: 0xff0000})})

    useEffect(() => {
        new GainMapLoader(gl).load(["/environmentMap.webp", "/environmentMap-gainmap.webp", "/environmentMap.json"], (texture) => {
            scene.environment = texture.renderTarget.texture
            scene.environment.mapping = 303
        }, undefined, err => console.log("errore", err))

        new GLTFLoader().load("/packaging_divided.glb", (loadedGltf) => {
            for (let i = 0; i < loadedGltf.scene.children.length; i++)
                (loadedGltf.scene.children[i] as Mesh).material = new MeshStandardMaterial({ color: 0x0000ff, metalness: 0.2, roughness: 0.3 })
            loadedGltf.scene.getObjectByName("container_left")?.position.set(0, 0, (size - defaultSize) / 2)
            loadedGltf.scene.getObjectByName("container_right")?.position.set(0, 0, -(size - defaultSize) / 2)
            loadedGltf.scene.getObjectByName("drawer_left")?.position.set(0, 0, (size - defaultSize) / 2)
            loadedGltf.scene.getObjectByName("drawer_right")?.position.set(0, 0, -(size - defaultSize) / 2)
            loadedGltf.scene.getObjectByName("drawer_center")?.scale.set(1, 1, 2 + (size - defaultSize))
            const containerLink = new Mesh(new BoxGeometry(0.5, 0.38, size - defaultSize), new MeshStandardMaterial({ color: 0x0000ff, metalness: 0.2, roughness: 0.3 }))
            containerLink.position.set(2.7499, -1.060, 0)

            const drawerLinks = [
                new Mesh(new BoxGeometry(0.5, 0.38, size - defaultSize), new MeshStandardMaterial({ color: 0x0000ff, metalness: 0.2, roughness: 0.3 })),
                new Mesh(new BoxGeometry(0.5, 0.38, size - defaultSize), new MeshStandardMaterial({ color: 0x0000ff, metalness: 0.2, roughness: 0.3 }))
            ]
            drawerLinks[0].position.set(2.7499, -1.060, 0)
            drawerLinks[0].name = "drawer_link_0"
            drawerLinks[1].position.set(2.7499, -1.060, 0)
            drawerLinks[1].name = "drawer_link_1"

            const woodMaterial = WoodMaterial(size / defaultSize * 2)
            const woods = [
                new Mesh(new BoxGeometry(5.64, 0.35, 5.2 + size - defaultSize), woodMaterial),
                new Mesh(new BoxGeometry(5.64, 0.35, 5.67 + size - defaultSize), woodMaterial),
                new Mesh(new BoxGeometry(0.31, 2.33, 5.4 + size - defaultSize), woodMaterial),
                new Mesh(new PlaneGeometry(size, 5.64), TreeMaterial("/tree_textures/tree_up.png", 1.6, size / 5.64)),
                new Mesh(new PlaneGeometry(size, 5.64), TreeMaterial("/tree_textures/tree_down.png", 1.6, size / 5.64)),
                new Mesh(new PlaneGeometry(size, 2.33), TreeMaterial("/tree_textures/tree_middle.png", 3.733, size / 2.4)),
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
            woods.map(m => m.name = "wood")
            loadedGltf.scene.add(...woods, containerLink, ...drawerLinks)
            loadedGltf.scene.rotateOnWorldAxis(new Vector3(0, -1, 0), Math.PI / 2.7)
            setModel(loadedGltf)
        }, undefined, (error) => {
            console.error("Error loading GLTF:", error);
        })
        window.addEventListener("keydown", () => setMaterials(new MeshBasicMaterial({color: 0x00ff00})))
    }, [])

    useEffect(() => {
        if (cart.length > 0 && model) {
            const space = 0.5;
            (async () => {
                const meshes: Mesh[] = []
                for (let i = 0; i < cart.length; i++) {
                    const mesh = new Mesh(new PlaneGeometry((cart[i].variant.CartVisualizzation.Size as [number, number])[0], (cart[i].variant.CartVisualizzation.Size as [number, number])[1]), new MeshStandardMaterial({ map: await new TextureLoader().loadAsync("http://localhost:1337" + cart[i].variant.CartVisualizzation.Texture?.data.attributes.formats?.small.url ?? ""), metalness: 0.8, roughness: 0.1, transparent: true }))
                    mesh.position.set(0, 0, meshes.length > 0 ? -(meshes[meshes.length - 1].geometry.boundingBox?.max.x ?? 0) - (cart[i].variant.CartVisualizzation.Size as [number, number])[0] / 2 - space : 0)
                    mesh.rotateOnWorldAxis(new Vector3(0, 1, 0), Math.PI / 2)
                    mesh.rotateOnWorldAxis(new Vector3(0, 0, 1), Math.PI / 2)
                    mesh.geometry.computeBoundingBox()
                    mesh.name = "jewel_" + i
                    meshes.push(mesh)
                }
                model.scene.add(...meshes)
            })()
            let cartSize = 0
            cart.map(c => cartSize += (c.variant.CartVisualizzation.Size as [number, number])[0])
            cartSize += space * cart.length - 1
            startAnimation()
        }
    }, [cart, model])

    const TreeMaterial = (url: string, textureAspectRatio: number, planeAspectRatio: number) => {
        const t = new TextureLoader().load(url);
        t.center.set(0.5, 0.5); // Centra la texture
        t.wrapS = ClampToEdgeWrapping; // Le parti fuori dai bordi verranno tagliate
        t.wrapT = ClampToEdgeWrapping;
        t.minFilter = LinearFilter; // Filtraggio per evitare artefatti
        t.magFilter = LinearFilter;

        if (planeAspectRatio > textureAspectRatio) {
            // Se il piano è più largo della texture, taglia la larghezza della texture
            t.repeat.set(planeAspectRatio / textureAspectRatio, 1);
        } else {
            // Se il piano è più alto della texture, taglia l'altezza della texture
            t.repeat.set(planeAspectRatio / textureAspectRatio, 1);
        }
        return new MeshStandardMaterial({ map: t, transparent: true, opacity: 0.75, roughness: 1, metalness: 0 })
    }

    const WoodMaterial = (repeatRatioY: number) => {
        // Carica le texture
        const textureLoader = new TextureLoader();
        const baseColorTexture = textureLoader.load('wood_textures/brown_planks_09_diff_1k.jpg');
        const roughnessTexture = textureLoader.load('wood_textures/brown_planks_09_rough_1k.jpg');
        const normalMapTexture = textureLoader.load('wood_textures/brown_planks_09_nor_gl_1k.jpg');

        // Imposta la ripetizione delle texture (equivalente alla scala del mapping in Blender)
        baseColorTexture.wrapS = baseColorTexture.wrapT = RepeatWrapping;
        roughnessTexture.wrapS = roughnessTexture.wrapT = RepeatWrapping;
        normalMapTexture.wrapS = normalMapTexture.wrapT = RepeatWrapping;

        // Imposta quante volte devono essere ripetute
        baseColorTexture.repeat.set(2, repeatRatioY);
        roughnessTexture.repeat.set(2, repeatRatioY);
        normalMapTexture.repeat.set(2, repeatRatioY);

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
        let totalTime = 4000; // Durata totale della fase 1 in millisecondi
        let phase2Time = 2000; // Durata della fase 2 in millisecondi
        let phase2 = false;
        let finalPosition = new Vector3(0, 10, 0); // Posizione finale
        let initialTimePhase2 = 0;
        let objectPosition = new Vector3(0, 0, 0); // Oggetto al centro della scena

        const drawer = model.scene.children.filter(m => m.name.includes("wood") || m.name.includes("container"))
        const initialPositionMeshes = drawer.map(m => m.position.clone().x)

        // Avvia l'animazione
        animate(0);

        function animate(time: number) {
            requestAnimationFrame(animate);

            if (time > totalTime + phase2Time) {
                setEndAnimation(true)
                return
            }

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

    useFrame(() => {
        if (controlsRef.current) {
            // Fissa la camera per guardare sempre verso il basso
            camera.position.z = 0;
            camera.position.x = Math.min(Math.max(camera.position.x, -size / 2 + 1), size / 2 - 1);
            console.log(camera.position.x)
            camera.quaternion.set(downQuad.x, downQuad.y, downQuad.z, downQuad.w);
            controlsRef.current.mouseButtons.left = 0
        }
    });

    return <>
        <mesh rotation={[0, -0.4, 0]}>
            {model && cart.length && <primitive object={model.scene} />}
        </mesh>
        {scene.environment && <Environment map={scene.environment} />}
        {endAnimation && <CameraControls ref={controlsRef} minDistance={4} maxDistance={30} />}
    </>
}