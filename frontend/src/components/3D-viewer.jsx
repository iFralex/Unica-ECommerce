"use client"

import { useRef, useEffect, useState, useContext } from "react";
import { Canvas } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Environment, OrbitControls, useEnvironment } from '@react-three/drei'
import { ProductContext } from "./context"
import { Grab, Hand } from "lucide-react"
import "../app/[category]/[productId]/style.css";

const ModelViewer = ({ productModel, materials }) => {
  const mesh = useRef(null);
  const [glb, setGlb] = useState(null);
  const [productContext, _] = useContext(ProductContext)
  const [overlayVisible, setOverlayVisible] = useState(true);

  useEffect(() => {
    const fetchGltf = async () => {
      try {
        const response = await fetch("http://localhost:1337" + productModel.url);
        const data = await response.blob();
        const url = URL.createObjectURL(data);

        const gltfLoader = new GLTFLoader();
        gltfLoader.load(url, (loadedGltf) => {
          setGlb(applyMaterials(loadedGltf));
        }, undefined, (error) => {
          console.error("Error loading GLTF:", error);
        });
      } catch (error) {
        console.error("Error fetching GLTF:", error);
      }
    };

    fetchGltf();
  }, [productModel.url]);

  useEffect(() => {
    if (glb !== null) {
      setGlb(applyMaterials(glb))
    }
  }, [productContext.variantIndex]);

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
      console.log(obj.material.color, mat.color);
    });

    return model;
  }

  const handleOverlayClick = () => {
    setOverlayVisible(false);
  };

  const Env = () => {
    const envMap = useEnvironment({ files: "/environmentMap.hdr" })
    return <Environment map={envMap} background />
  }

  
    return (
      <div className="flex justify-center items-center h-[100vw] max-h-[90vh] relative">
        {true && <>{glb && overlayVisible && (
          <div
            className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10 cursor-pointer"
            onClick={handleOverlayClick}
          >
            <Hand color="white" className="animate-swipe" />
            <span className="text-white text-center">Tocca e scorri per guardare meglio il gioiello</span>
          </div>
        )}
          <Canvas className="h-2xl w-2xl">
            {glb && <>
              <Env />
              <mesh ref={mesh} rotation={[0, -0.4, 0]}>
                <primitive object={glb.scene.clone()} scale={[0.7, 0.7, 0.7]} position={[1, -2, 0]} />
                <primitive object={glb.scene.clone()} scale={[0.7, 0.7, 0.7]} position={[-1, -1.5, 0]} rotation={[0, Math.PI * 4 / 3, 0]} />
              </mesh>
              <OrbitControls target={[0, 0, 0]} />
            </>}
          </Canvas>
        </>}
      </div>
    );
};

export { ModelViewer };