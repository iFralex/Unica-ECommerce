"use client"

import { useRef, useEffect, useState, useContext, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { Environment, CameraControls, useEnvironment } from '@react-three/drei'
import { ProductContext } from "./context"
import { Fullscreen, Hand, Menu, RotateCcw } from "lucide-react"
import "../app/[category]/[productId]/style.css";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import Image from "next/image";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { APIResponseData, Materials3D } from "@/types/strapi-types";
import { Transform, Vector } from "@/types/types";
import { Box3, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { getCartVisualizzationData } from "@/actions/get-data";
import { GainMapLoader } from '@monogrid/gainmap-js'

type MultipleModelType = {
  model: GLTF;
  index: number;
}[]

const ModelViewer = ({ product, materials, productId }: { product: APIResponseData<"api::product.product">, materials: Materials3D[], productId: number }) => {
  const viewer = product.attributes.Viewer?.[0];
  if (!viewer) return <></>

  const multiple = viewer?.__component === "product.multiple-item3-d-link"
  const mesh = useRef(null);
  const [glb, setGlb] = useState<MultipleModelType | GLTF>(multiple ? [] : null as unknown as GLTF);
  const [productContext, _] = useContext(ProductContext)
  const [selectedModels, setSelectedModels] = useState(multiple ? (viewer.SelectedViewer?.data.attributes.Items3D?.map((item, index) => item.RelativeProduct?.data.id === productId ? index : null).filter<number>(item => item !== null) ?? [0]) : []);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const sheetContainer = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<CameraControls>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null);

  let productModel = !multiple
    ? viewer.Model3D?.data.attributes
    : viewer.SelectedViewer?.data.attributes.Items3D?.[selectedModels[(selectedModels.length ?? 1) - 1] ?? 0].Model3D?.data.attributes
  if (!productModel) return <></>

  useEffect(() => {
    if (multiple && (glb as MultipleModelType)?.[(glb as MultipleModelType).length - 1]?.index === selectedModels[selectedModels.length - 1])
      return
    const fetchGlb = async () => {
      try {
        const response = await fetch(process.env.DOMAIN_URL + productModel.url);
        const data = await response.blob();
        const url = URL.createObjectURL(data);

        const gltfLoader = new GLTFLoader();
        gltfLoader.load(url, (loadedGltf) => {
          setGlb(Array.isArray(glb) ? glb.concat({ model: applyMaterials(loadedGltf), index: selectedModels[selectedModels.length - 1] }) : applyMaterials(loadedGltf));
        }, undefined, (error) => {
          console.error("Error loading GLTF:", error);
        });
      } catch (error) {
        console.error("Error fetching GLTF:", error);
      }
    };

    fetchGlb();
  }, [productModel.url]);

  useEffect(() => {
    if (glb && (!Array.isArray(glb) || glb.length > 0)) {
      setGlb(applyMaterials(glb as GLTF))
    }
  }, [productContext.variantIndex]);

  useEffect(() => {
    const rotationX = multiple
      ? (viewer.SelectedViewer?.data.attributes.InitialCameraRotation as Vector)?.[0] ?? Math.PI / 60
      : (viewer.InitialCameraRotation as Vector)?.[0] ?? Math.PI / 60;

    const rotationY = multiple
      ? (viewer.SelectedViewer?.data.attributes.InitialCameraRotation as Vector)?.[1] ?? -Math.PI / 4
      : (viewer.InitialCameraRotation as Vector)?.[1] ?? -Math.PI / 4;

    cameraRef.current?.rotate(rotationX, rotationY, true);
    cameraRef.current?.saveState()
  }, [cameraRef.current])

  const applyMaterials = (model: GLTF) => {
    materials[productContext.variantIndex || 0].forEach(mat => {
      let obj = model.scene.children[mat.object[0]] as Mesh;
      for (let i = 1; i < mat.object.length; i++) {
        obj = obj.children[mat.object[i]] as Mesh;
      }
      //if (obj.material instanceof Material) return
      (obj.material as MeshStandardMaterial).color.r = mat.color[0];
      (obj.material as MeshStandardMaterial).color.g = mat.color[1];
      (obj.material as MeshStandardMaterial).color.b = mat.color[2];
      (obj.material as MeshStandardMaterial).metalness = mat.metalness;
      (obj.material as MeshStandardMaterial).roughness = mat.roughness;
    });
    return model;
  }

  const handleOverlayClick = () => {
    setOverlayVisible(false);
  };

  return (
    <div className="flex justify-center items-center h-[100vw] max-h-[90vh] relative overflow-hidden md:rounded-r-md">
      <div ref={sheetContainer} className="dark" />
      {!loaded && <Skeleton className="absolute inset-0" />}
      <Suspense>
        {loaded && (
          <Sheet modal={false}>
            <ButtonsSection show={multiple} cameraRef={cameraRef.current} canvasRef={canvasRef.current} />
            {multiple && sheetContainer.current && viewer.SelectedViewer && <ModelsSelector selectedViewer={viewer.SelectedViewer.data} sheetContainer={sheetContainer.current} productId={productId} selectedModels={selectedModels} setSelectedModels={setSelectedModels} glb={glb as MultipleModelType} setGlb={setGlb as React.Dispatch<React.SetStateAction<MultipleModelType>>} />}
            {overlayVisible && <ExplainedOverlay handleOverlayClick={handleOverlayClick} />}
          </Sheet>
        )}
        <Canvas ref={canvasRef} className="h-2xl w-2xl">
          <Env setLoaded={setLoaded} />
          {glb && loaded && <>
            <mesh ref={mesh} rotation={[0, -0.4, 0]}>
              {!multiple
                ? SingleModel(viewer.Transforms as Transform[], glb as GLTF)
                : viewer.SelectedViewer && MultipleModels(glb as MultipleModelType, viewer.SelectedViewer.data)
              }
            </mesh>
          </>}
          <CameraControls ref={cameraRef} />
        </Canvas>
      </Suspense>
    </div>
  );
};

const ButtonsSection = ({ show, canvasRef, cameraRef }: { show: boolean, canvasRef: HTMLCanvasElement | null, cameraRef: CameraControls | null }) => {
  const handleResetCamera = () => cameraRef?.reset(true)

  const handleFullscreen = () => {
    if (!canvasRef)
      return

    if (canvasRef.requestFullscreen) {
      canvasRef.requestFullscreen();
    } else if (canvasRef.webkitRequestFullscreen) {
      // Safari
      canvasRef.webkitRequestFullscreen();
    } else if (canvasRef.msRequestFullscreen) {
      // IE11
      canvasRef.msRequestFullscreen();
    }
  }

  return <div className={"absolute flex space-x-2 top-0 right-0 m-2 z-20"}>
    <Button onClick={handleResetCamera} variant={"default"}><span className="sr-only">Reimposta posizione della camera</span><RotateCcw /></Button>
    <Button onClick={handleFullscreen} variant={"default"}><span className="sr-only">Imposta schermo intero</span><Fullscreen /></Button>
    {show &&
      <SheetTrigger asChild>
        <Button variant={"default"}>Visualizza... <Menu className="ml-2" /></Button>
      </SheetTrigger>}
  </div>
}

const ModelsSelector = ({ selectedViewer, sheetContainer, productId, selectedModels, setSelectedModels, glb, setGlb }: { selectedViewer: APIResponseData<"api::viewer3d.viewer3d">, sheetContainer: HTMLDivElement, productId, selectedModels: number[], setSelectedModels: React.Dispatch<React.SetStateAction<number[]>>, glb: MultipleModelType, setGlb: React.Dispatch<React.SetStateAction<MultipleModelType>> }) => {
  return <SheetContent side="bottom" position="absolute" container={sheetContainer}>
    <SheetHeader>
      <SheetTitle>Seleziona i gioielli che vuoi visualizzare</SheetTitle>
      <SheetDescription>Guarda i vari gioielli come appaiono insieme!</SheetDescription>
    </SheetHeader>
    <div>
      <ScrollArea>
        <div className="flex justify-start items-center space-x-3">
          {selectedViewer.attributes.Items3D?.map((item, index) => (
            <Card key={index} onClick={() => {
              if (selectedViewer.attributes.Items3D?.[selectedModels[0]].id === item.id)
                return
              if (!selectedModels.includes(index))
                setSelectedModels(selectedModels.concat(index))
              else {
                setSelectedModels(selectedModels.filter(n => n !== index))
                setGlb((glb as MultipleModelType).filter(g => g.index !== index))
              }
            }} className={"cursor-pointer flex flex-col justify-center p-3 text-center " + (productId === item.id ? "dark:bg-accent dark:border-white" : selectedModels.includes(index) ? "dark:bg-accent" : "")}>
              <span className="sr-only">{(productId === item.id ? "" : !selectedModels.includes(index) ? "Visualizza " : "Rimuovi dalla visualizzazione ") + item.RelativeProduct?.data.attributes.Name}</span>
              <figure aria-hidden={true}>
                {item.Thumbnail?.data && <Image src={process.env.DOMAIN_URL + item.Thumbnail.data.attributes.formats?.thumbnail.url} width={item.Thumbnail.data.attributes.formats?.thumbnail.width} height={item.Thumbnail.data.attributes.formats?.thumbnail.height} alt={item.Thumbnail.data.attributes.caption ?? "Mignatura"} aria-hidden={true} />}
                <figcaption aria-hidden={true}>
                  <span>{item.RelativeProduct?.data.attributes.Name}</span>
                </figcaption>
              </figure>
            </Card>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  </SheetContent>
}

const ExplainedOverlay = ({ handleOverlayClick }: { handleOverlayClick: () => void }) => {
  return (
    <div
      className="absolute inset-0 bg-white bg-opacity-50 flex justify-center items-center z-20 cursor-pointer"
      onClick={handleOverlayClick}
    >
      <Hand color="black" className="animate-swipe" />
      <span className="text-black text-center">Tocca e scorri per guardare meglio il gioiello</span>
    </div>
  )
}

const SingleModel = (transforms: Transform[], glb: GLTF) => (
  transforms.map((transform, index) => (
    <primitive key={index} object={glb.scene.clone()} position={transform.Position || [0, 0, 0]} rotation={transform.Rotation || [0, 0, 0]} scale={transform.Scale || [1, 1, 1]} />
  ))
)

const MultipleModels = (glb: MultipleModelType, selectedViewer: APIResponseData<"api::viewer3d.viewer3d">) => {
  let effectiveIndex = 0
  return glb.map((item, index) => {
    if (!selectedViewer.attributes.Items3D)
      return <></>
    const baseTransform = selectedViewer.attributes.Items3D[item.index].MainTransform as Transform || {};
    const effectiveTransform = selectedViewer.attributes.Transforms?.[effectiveIndex] as Transform || {};

    const transform: Transform = glb.length === 1 || item.index === 0
      ? baseTransform
      : {
        Position: effectiveTransform.Position ?? baseTransform.Position,
        Rotation: effectiveTransform.Rotation ?? baseTransform.Rotation,
        Scale: effectiveTransform.Scale ?? selectedViewer.attributes.Transforms?.[0].Scale ?? baseTransform.Scale,
      };

    if (item.index !== 0)
      effectiveIndex++
    return <primitive key={index} object={item.model.scene.clone()} position={transform.Position || [0, 0, 0]} rotation={transform.Rotation || [0, 0, 0]} scale={transform.Scale || [1, 1, 1]} />
  })
}

const Env = ({ setLoaded }: { setLoaded: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const { scene, gl } = useThree()

  useEffect(() => {
    (async () => new GainMapLoader(gl).load(["/environmentMap.webp", "/environmentMap-gainmap.webp", "/environmentMap.json"], (texture) => {
      scene.environment = texture.renderTarget.texture
      scene.environment.mapping = 303
      setLoaded(true)
    }, undefined, err => console.log("errore", err)))()
  }, [])

  return (<>{scene.environment && <Environment map={scene.environment} background />}</>)
}

export { ModelViewer };