"use client"

import { CartContext } from "@/components/context"
import { GainMapLoader, HDRJPGLoader, QuadRenderer } from '@monogrid/gainmap-js'
import { Environment, Shadow, useEnvironment } from "@react-three/drei"
import { sRGBEncoding } from "@react-three/drei/helpers/deprecated"
import { Canvas } from "@react-three/fiber"
import { useContext, useEffect, useRef, useState } from "react"
import { ACESFilmicToneMapping, AmbientLight, BoxGeometry, EllipseCurve, EquirectangularReflectionMapping, LightShadow, Mesh, MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera, PMREMGenerator, Scene, Vector3, WebGLRenderer } from "three"
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export const CartClient = ({ children }: { children: React.ReactNode }) => {
    const [cart, _] = useContext(CartContext)
    const [model, setModel] = useState<GLTF>(null!)
    const render = useRef<HTMLDivElement>(null)
    let envTexture: QuadRenderer<any, any> | null = null

    useEffect(() => {
        (async () => {
            const renderer = new WebGLRenderer()

            //const result = await new GainMapLoader(renderer).loadAsync(["/environmentMap.webp", "/environmentMap-gainmap.webp", "/environmentMap.json"])
            renderer.setSize(window.innerWidth, window.innerHeight);

            // `result` can be used to populate a Texture
            const scene = new Scene()

            const loadedGltf = await new GLTFLoader().loadAsync("/packaging.glb")
            console.log(loadedGltf)
            for (let i = 0; i < loadedGltf.scene.children.length; i++)
                (loadedGltf.scene.children[i] as Mesh).material = new MeshStandardMaterial({ color: 0x0000ff, metalness: 0.2, roughness: 0.3 })
            const woodUp = new Mesh(new BoxGeometry(5.64, 0.35, 5.2), new MeshStandardMaterial({ color: 0xff0000, metalness: 0, roughness: 0.7 }))
            woodUp.position.set(-0.03, 1.005, 0)
            const woodDown = new Mesh(new BoxGeometry(5.64, 0.35, 5.67), new MeshStandardMaterial({ color: 0xff0000, metalness: 0, roughness: 0.7 }))
            woodDown.position.set(-0.03, -1.005, 0)
            const woodSide = new Mesh(new BoxGeometry(0.31, 2.33, 5.4), new MeshStandardMaterial({ color: 0xff0000, metalness: 0, roughness: 0.7 }))
            woodSide.position.set(-2.745, -0.005, 0)
            scene.add(...(loadedGltf.scene.children as Mesh[]), woodUp, woodDown, woodSide, new AmbientLight())

            renderer.setClearColor(0xEEEEEE);
            const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

            camera.position.z = 30
            renderer.render(scene, camera)
            const controls = new OrbitControls(camera, renderer.domElement)
            controls.update()
            // Starting from three.js r159
            // `result.renderTarget.texture` can
            // also be used as Equirectangular scene background
            //
            // it was previously needed to convert it
            // to a DataTexture with `result.toDataTexture()`
            //scene.background = result.renderTarget.texture
            //scene.background.mapping = EquirectangularReflectionMapping

            // result must be manually disposed
            // when you are done using it
            //result.dispose()
            render.current?.appendChild(renderer.domElement);
        })()
        /*
                new GainMapLoader().load(["/environmentMap.webp", "/environmentMap-gainmap.webp", "/environmentMap.json"], (texture) => {
                    console.log("t", texture)
                    envTexture = texture
                }, undefined, err => console.log("errore", err))
        
                new GLTFLoader().load("/packaging.glb", (loadedGltf) => {
                    console.log(loadedGltf)
                    for (let i = 0; i < loadedGltf.scene.children.length; i++)
                        (loadedGltf.scene.children[i] as Mesh).material = new MeshStandardMaterial({ color: 0x0000ff, metalness: 0.2, roughness: 0.3 })
                    const woodUp = new Mesh(new BoxGeometry(5.64, 0.35, 5.2), new MeshStandardMaterial({ color: 0xff0000, metalness: 0, roughness: 0.7 }))
                    woodUp.position.set(-0.03, 1.005, 0)
                    const woodDown = new Mesh(new BoxGeometry(5.64, 0.35, 5.67), new MeshStandardMaterial({ color: 0xff0000, metalness: 0, roughness: 0.7 }))
                    woodDown.position.set(-0.03, -1.005, 0)
                    const woodSide = new Mesh(new BoxGeometry(0.31, 2.33, 5.4), new MeshStandardMaterial({ color: 0xff0000, metalness: 0, roughness: 0.7 }))
                    woodSide.position.set(-2.745, -0.005, 0)
                    loadedGltf.scene.add(woodUp, woodDown, woodSide)
                    loadedGltf.scene.background
                    setModel(loadedGltf)
                }, undefined, (error) => {
                    console.error("Error loading GLTF:", error);
                });*/
    }
        , [])

    const Env = () => {
        //const envMap = useEnvironment({ files: "/environmentMap_low.hdr" })
        if (envTexture)
            return <Environment map={envTexture.toDataTexture()} background />
        else
            return <></>
    }

    return (
        <div ref={render} className="fixed inset-0">
            {/*<Canvas>
                <mesh rotation={[0, -0.4, 0]}>
                    <primitive object={model?.scene.clone()} />
                </mesh>
                <Env />
                <OrbitControls />
            </Canvas>*/}
        </div>
    )
}