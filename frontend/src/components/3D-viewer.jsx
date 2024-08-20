"use client"

import { useRef, useEffect, useState, useContext, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Environment, CameraControls, useEnvironment } from '@react-three/drei'
import { ProductContext } from "./context"
import { Fullscreen, Hand, Menu, RotateCcw } from "lucide-react"
import "../app/[category]/[productId]/style.css";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetOverlay, SheetPortal, SheetTitle, SheetTrigger } from "./ui/sheet";
import Image from "next/image";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

const ModelViewer = ({ viewer, materials, productId }) => {
  const multiple = viewer.__component === "product.multiple-item3-d-link"
  const mesh = useRef(null);
  const [glb, setGlb] = useState(multiple ? [] : null);
  const [productContext, _] = useContext(ProductContext)
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [selectedModels, setSelectedModels] = useState(multiple ? viewer.SelectedViewer.data.attributes.Items3D.map((item, index) => item.RelativeProduct.data.id === productId ? index : null).filter(item => item !== null) : []);
  const sheetContainer = useRef(null)
  const cameraRef = useRef(null)
  const canvasRef = useRef(null);

  let productModel = null
  if (!multiple)
    productModel = viewer.Model3D.data.attributes
  else
    productModel = viewer.SelectedViewer.data.attributes.Items3D[selectedModels[selectedModels.length - 1]].Model3D.data.attributes
  console.log("model:", productModel)
  useEffect(() => {
    console.log("productModel.url:", productModel.url)
    if (multiple && selectedModels[selectedModels.length - 1] === glb[glb.length - 1]?.index)
      return
    const fetchGlb = async () => {
      try {
        const response = await fetch("http://localhost:1337" + productModel.url);
        const data = await response.blob();
        const url = URL.createObjectURL(data);

        const gltfLoader = new GLTFLoader();
        gltfLoader.load(url, (loadedGltf) => {
          setGlb(multiple ? glb.concat({ model: applyMaterials(loadedGltf), index: selectedModels[selectedModels.length - 1] }) : applyMaterials(loadedGltf));
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
      setGlb(applyMaterials(glb))
    }
  }, [productContext.variantIndex]);

  useEffect(() => {
    const rotationX = multiple
      ? viewer.SelectedViewer.data.attributes.InitialCameraRotation?.[0] ?? Math.PI / 60
      : viewer.InitialCameraRotation?.[0] ?? Math.PI / 60;

    const rotationY = multiple
      ? viewer.SelectedViewer.data.attributes.InitialCameraRotation?.[1] ?? -Math.PI / 4
      : viewer.InitialCameraRotation?.[1] ?? -Math.PI / 4;

    cameraRef.current?.rotate(rotationX, rotationY, true);
    cameraRef.current?.saveState()
  }, [cameraRef.current])

  const applyMaterials = model => {
    materials[productContext.variantIndex || 0].forEach(mat => {
      let obj = model.scene.children[mat.object[0]];
      for (let i = 1; i < mat.object.length; i++) {
        obj = obj.children[mat.object[i]];
      }
      obj.material.color.r = mat.color[0];
      obj.material.color.g = mat.color[1];
      obj.material.color.b = mat.color[2];
      obj.material.metalness = mat.metalness;
      obj.material.roughness = mat.roughness;
    });
    return model;
  }

  const handleOverlayClick = () => {
    setOverlayVisible(false);
  };

  const handleFullscreen = () => {
    if (canvasRef.current) {
      if (canvasRef.current.requestFullscreen) {
        canvasRef.current.requestFullscreen();
      } else if (canvasRef.current.webkitRequestFullscreen) {
        // Safari
        canvasRef.current.webkitRequestFullscreen();
      } else if (canvasRef.current.msRequestFullscreen) {
        // IE11
        canvasRef.current.msRequestFullscreen();
      }
    }
  }

  const Env = () => {
    const envMap = useEnvironment({ files: "/environmentMap.hdr" })
    if (!loaded)
      setLoaded(true)
    return <Environment map={envMap} background />
  }

  return (
    <div className="flex justify-center items-center h-[100vw] max-h-[90vh] relative overflow-hidden">
      <div ref={sheetContainer} className="dark" />
      {!loaded && <Skeleton className="absolute inset-0" />}
      <Suspense>
        {loaded && (
          <Sheet modal={false}>
            <div className={"absolute flex space-x-2 top-0 right-0 m-2 z-20"}>
              <Button onClick={() => cameraRef?.current.reset(true)} variant={"default"}><span className="sr-only">Reimposta posizione della camera</span><RotateCcw /></Button>
              <Button onClick={handleFullscreen} variant={"default"}><span className="sr-only">Imposta schermo intero</span><Fullscreen /></Button>
              {multiple &&
                <SheetTrigger asChild>
                  <Button variant={"default"} size={""}>Visualizza... <Menu className="ml-2" /></Button>
                </SheetTrigger>}
            </div>
            {multiple &&
              <SheetContent side="bottom" position="absolute" container={sheetContainer?.current}>
                <SheetHeader>
                  <SheetTitle>Seleziona i gioielli che vuoi visualizzare</SheetTitle>
                  <SheetDescription>Guarda i vari gioielli come appaiono insieme!</SheetDescription>
                </SheetHeader>
                <div>
                  <ScrollArea>
                    <div className="flex justify-start items-center space-x-3">
                      {viewer.SelectedViewer.data.attributes.Items3D.map((item, index) => (
                        <Card key={index} onClick={() => {
                          if (viewer.SelectedViewer.data.attributes.Items3D[selectedModels[0]].id === item.id)
                            return
                          if (!selectedModels.includes(index))
                            setSelectedModels(selectedModels.concat(index))
                          else {
                            setSelectedModels(selectedModels.filter(n => n !== index))
                            setGlb(glb.filter(g => g.index !== index))
                          }
                        }} className={"cursor-pointer flex flex-col justify-center p-3 text-center " + (productId === item.id ? "dark:bg-accent dark:border-white" : selectedModels.includes(index) ? "dark:bg-accent" : "")}>
                          <span className="sr-only">{(productId === item.id ? "" : !selectedModels.includes(index) ? "Visualizza " : "Rimuovi dalla visualizzazione ") + item.RelativeProduct.data.attributes.Name}</span>
                          <figure aria-hidden={true}>
                            {item.Thumbnail.data && <Image src={"http://localhost:1337" + item.Thumbnail.data.attributes.formats.thumbnail.url} width={item.Thumbnail.data.attributes.formats.thumbnail.width} height={item.Thumbnail.data.attributes.formats.thumbnail.height} alt={item.Thumbnail.data.attributes.caption} aria-hidden={true} />}
                            <figcaption aria-hidden={true}>
                              <span>{item.RelativeProduct.data.attributes.Name}</span>
                            </figcaption>
                          </figure>
                        </Card>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>
              </SheetContent>}
            {overlayVisible && (
              <div
                className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20 cursor-pointer"
                onClick={handleOverlayClick}
              >
                <Hand color="white" className="animate-swipe" />
                <span className="text-white text-center">Tocca e scorri per guardare meglio il gioiello</span>
              </div>
            )}
          </Sheet>
        )}
        <Canvas ref={canvasRef} className="h-2xl w-2xl">
          {glb && <>
            <Env />
            <mesh ref={mesh} rotation={[0, -0.4, 0]}>
              {!multiple ? viewer.Transforms.map((transform, index) => (
                <primitive key={index} object={glb.scene.clone()} position={transform.position || [0, 0, 0]} rotation={transform.rotation || [0, 0, 0]} scale={transform.scale || [1, 1, 1]} />
              )) :
                (() => {
                  let effectiveIndex = 0
                  return glb.map((item, index) => {
                    const baseTransform = viewer.SelectedViewer.data.attributes.Items3D[item.index].MainTransform || {};
                    const effectiveTransform = viewer.SelectedViewer.data.attributes.Transforms[effectiveIndex] || {};

                    const transform = glb.length === 1 || item.index === 0
                      ? baseTransform
                      : {
                        Position: effectiveTransform.Position ?? baseTransform.Position,
                        Rotation: effectiveTransform.Rotation ?? baseTransform.Rotation,
                        Scale: effectiveTransform.Scale ?? viewer.SelectedViewer.data.attributes.Transforms[0].Scale ?? baseTransform.Scale,
                      };

                    if (item.index !== 0)
                      effectiveIndex++
                    return <primitive key={index} object={item.model.scene.clone()} position={transform.Position || [0, 0, 0]} rotation={transform.Rotation || [0, 0, 0]} scale={transform.Scale || [1, 1, 1]} />
                  })
                })()
              }
            </mesh>
          </>}
          <CameraControls ref={cameraRef} />
        </Canvas>
      </Suspense>
    </div>
  );
};

export { ModelViewer };