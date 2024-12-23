"use client"

import { Canvas, useThree } from "@react-three/fiber"
import { applyMaterials, Env, fetchGlb, SingleModel } from "./3D-viewer"
import { useEffect, useRef, useState } from "react"
import { SpotLight } from "@react-three/drei"
import { Euler, Mesh, MeshBasicMaterial, Vector3 } from "three"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import gsap from "gsap"
import { APIResponseData } from "@/types/strapi-types"
import { Matrix4 } from "three"
import { Box3 } from "three"
import { SlowMo } from "gsap/EasePack";

const AnimatedModel = ({
    glb,
    transform = {},
    onAnimationComplete
}) => {
    const meshRef = useRef<Mesh>(null);
    const animRef = useRef(null);
    const { viewport } = useThree();

    useEffect(() => {
        if (!meshRef.current) return;
        if (animRef.current)
            animRef.current.kill()

        function calculateModelProjection(model: GLTF, transform: {} = {}) {
            // Calcola il bounding box del modello
            const box = new Box3().setFromObject(model.scene);
            // Dimensioni del bounding box originale
            const size = new Vector3();
            box.getSize(size);
            // Applica trasformazioni
            const scale = new Vector3(...(transform.Scale || [0.5, 0.5, 0.5])) || new Vector3();
            const rotation = new Euler(...(transform?.Rotation || [0, 0, 0])) || new Vector3();
            // Scala le dimensioni
            const scaledSize = size.multiply(scale);
            // Crea una matrice di rotazione
            const rotationMatrix = new Matrix4().makeRotationFromEuler(rotation);
            // Punti del bounding box
            const points = [
                new Vector3(0, 0, 0),
                new Vector3(scaledSize.x, 0, 0),
                new Vector3(0, scaledSize.y, 0),
                new Vector3(scaledSize.x, scaledSize.y, 0),
                new Vector3(0, 0, scaledSize.z),
                new Vector3(scaledSize.x, 0, scaledSize.z),
                new Vector3(0, scaledSize.y, scaledSize.z),
                new Vector3(scaledSize.x, scaledSize.y, scaledSize.z)
            ];
            // Ruota i punti
            const rotatedPoints = points.map(point => point.applyMatrix4(rotationMatrix));
            // Crea un nuovo bounding box dai punti ruotati
            const rotatedBox = new Box3().setFromPoints(rotatedPoints);
            // Ricalcola le dimensioni dopo rotazione
            const rotatedSize = new Vector3();
            rotatedBox.getSize(rotatedSize);
            return {
                width: rotatedSize.x,
                height: rotatedSize.y
            };
        }
        function calculateParabolaParameters(vertex: { x: number, y: number }, point: { x: number, y: number }) {
            const h = vertex.x; // x del vertice
            const k = vertex.y; // y del vertice
            const x = point.x; // x del punto esterno
            const y = point.y; // y del punto esterno
            // Calcolo del parametro a
            const a = (y - k) / Math.pow(x - h, 2);
            // Calcolo dei parametri b e c usando il vertice
            const b = -2 * a * h;
            const c = k + a * h * h;
            return { a, b, c };
        }
        // Punti iniziali e finali
        const size = calculateModelProjection(glb, { ...transform, Scale: transform.Scale?.map(s => s / 4) })
        const startX = viewport.width / 2;
        const startY = -viewport.height / 2 - size.height;
        const endX = -viewport.width / 2;
        const middleY = viewport.height / 4;
        const params = calculateParabolaParameters({ x: 0, y: middleY }, { x: startX, y: startY })
        // Funzione per calcolare y dato x
        const parabolaY = (x: number, params: { a: number, b: number, c: number }) => params.a * x * x + params.b * x + params.c;
        // Imposta posizione iniziale
        meshRef.current.position.set(startX, startY, 0);
        meshRef.current.rotation.set(...(transform.Rotation || [0, 0, 0]))
        gsap.to(meshRef.current.position, {
            x: endX,
            duration: 5,
            ease: SlowMo,
            onUpdate: () => { meshRef.current.position.y = parabolaY(meshRef.current.position.x, params) },
            onComplete: onAnimationComplete
        });
        // Animazione separata per la rotazione
        animRef.current = gsap.to(meshRef.current.rotation, {
            y: Math.PI * 2 + (transform.Rotation?.[1] || 0),
            duration: 4,
            delay: 0.5, // Inizia a metà animazione
            ease: "sine.inOut"
        });

        return () => {
            animRef.current?.kill()
        }
    }, [glb])

    return (
        <mesh ref={meshRef} scale={new Vector3(0.25, 0.25, 0.25)}>
            <SingleModel glb={glb} transforms={[transform]} />
        </mesh>
    );
};

export const Hero3D = ({ modelDatas }: {
    modelDatas: {
        url: string,
        transform?: Extract<NonNullable<APIResponseData<"api::product.product">["attributes"]["Viewer"]>[number], { __component: "pr.single-item3-d" }>["HeroPreview"],
        materials: NonNullable<APIResponseData<"api::product.product">["attributes"]["ProductDetails"]>[number]["Materials3D"][],
        material: NonNullable<APIResponseData<"api::product.product">["attributes"]["ProductDetails"]>[number]["Materials3D"]
    }[]
}) => {
    const models = useRef<({ model: GLTF, transform: typeof modelDatas[number]["transform"] })[] | null>(null);
    const tmpModelDatas = useRef<typeof modelDatas>(modelDatas);
    const [isEnvLoaded, setIsEnvLoaded] = useState<boolean>(false);
    const [animatingModel, setAnimatingModel] = useState<({ model: GLTF, transform: typeof modelDatas[number]["transform"], material: typeof modelDatas[number]["materials"][number] })>([]);
    const canvasRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(true);
    const paused = useRef(false)
    const ended = useRef(false)

    // Intersection Observer for viewport visibility
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (paused.current && ended.current)
                    handleModelAnimationComplete(true)
                paused.current = !entries[0].isIntersecting
            },
            {
                threshold: 0.1 // Trigger when at least 10% of the component is visible
            }
        );

        if (canvasRef.current) {
            observer.observe(canvasRef.current);
        }

        return () => {
            if (canvasRef.current) {
                observer.unobserve(canvasRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (models.current) return
        models.current = []
        tmpModelDatas.current = modelDatas.map(data => data.materials.map(mat => ({ ...data, material: mat })).flat()).flat().sort(() => Math.floor(Math.random() * 2 - 1))
        tmpModelDatas.current.forEach(async (data, index) => {
            const a = tmpModelDatas.current.find((i, idx, self) => i.url === data.url && i.model)
            if (a) {
                models.current = models.current.concat([{ model: applyMaterials(a.model, data.material), transform: data.transform, url: data.url }])
            } else
                await fetchGlb(data.url, newModel => {
                    newModel.scene.children.map(m => m.position.set(0, 0, 0))
                    models.current = models.current.concat([{ model: applyMaterials(newModel, data.material), transform: data.transform, url: data.url }])
                    tmpModelDatas.current[index].model = newModel
                    index === 0 && !isEnvLoaded && setAnimatingModel({ model: newModel, transform: data.transform });
                });
        });
    }, [])

    const handleModelAnimationComplete = (p = false) => {
        if (!paused.current || p) {
            ended.current = false
            setAnimatingModel(am => models.current[(models.current.findIndex(m => m.model.scene.id === am.model.scene.id) + 1) % models.current.length]);
        }
        else
            ended.current = true
    };

    return (
        <div ref={canvasRef} style={{ width: '100%', height: '100%' }}>
            <Canvas camera={{ fov: 25 }}>
                {animatingModel.model && <AnimatedModel
                    glb={animatingModel.model}
                    transform={animatingModel.transform}
                    onAnimationComplete={() => handleModelAnimationComplete()}
                />}
                <Env setLoaded={setIsEnvLoaded} environmentIntensity={0.05} />

                {/* Existing SpotLight components remain the same */}
                <SpotLight
                    position={[-2, -2, 1]}
                    angle={0.1}
                    penumbra={0.5}
                    intensity={15}
                    color="white"
                    distance={10}
                    castShadow
                    opacity={0.25}
                    target-position={[-0.5, 0.5, 0]}
                />

                <SpotLight
                    position={[0, -2, 1]}
                    angle={0.1}
                    penumbra={1}
                    intensity={15}
                    color="white"
                    castShadow
                    opacity={0.25}
                    target-position={[0, 0.5, 0]}
                />

                <SpotLight
                    position={[2, -2, 1]}
                    angle={0.1}
                    penumbra={0.5}
                    intensity={15}
                    color="white"
                    distance={10}
                    castShadow
                    opacity={0.25}
                    target-position={[0.5, 0.5, 0]}
                />
            </Canvas>
        </div>
    );
};