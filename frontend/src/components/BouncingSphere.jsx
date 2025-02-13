import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion, useAnimation } from "framer-motion";
import React, { useEffect, useState } from "react";

const Model = () => {
  const [rotation, setRotation] = useState(0);
  const { scene } = useGLTF("/sphere.glb");

  scene.traverse((child) => {
    if (child.isMesh) {
      child.material.transparent = true;
      child.material.opacity = 0.3; // ✅ Make it slightly transparent
    }
  });
  useFrame(() => {
    setRotation((prev) => prev + 0.003); // ✅ Adjust speed as needed
  });

  return <primitive object={scene} scale={2} rotation={[0, rotation, 0]} />;
};

const BouncingSphere = () => {
  const controls = useAnimation();
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth / 2,
    height: window.innerHeight / 2,
  });

  useEffect(() => {
    let x = Math.random() * windowSize.width / 2;
    let y = Math.random() * -windowSize.height / 2;
    let dx = Math.random() > 0.5 ? 1 : -1;
    let dy = Math.random() > 0.5 ? 1 : -1;
    const speed = 5;

    const interval = setInterval(() => {
      x += dx * speed;
      y += dy * speed;

      // Reverse direction when hitting an edge
      if (x > windowSize.width || x < -windowSize.width / 2) dx *= -1;
      if (y > windowSize.height / 2 || y < -windowSize.height / 2) dy *= -1;

      controls.start({
        x,
        y,
        transition: { duration: 0.05, ease: "linear" },
      });
    }, 50); // ✅ Updates every 50ms

    return () => clearInterval(interval); // ✅ Cleanup on unmount
  }, [windowSize]);

  return (
    <motion.div
      animate={controls}
      style={{
        position: "absolute",
        zIndex: -1, // ✅ Keeps it in the background
      }}
    >
      <Canvas
        style={{ height: "100vh", width: "100vh" }}
        camera={{ position: [0, 2, 5] }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={3} />
        <directionalLight position={[-5, -5, -5]} intensity={3} />
        {/* ✅ Render the semi-transparent model in the background */}
        <Model />
        <OrbitControls
          enableZoom={false}
          enableRotate={true}
          enablePan={false}
        />{" "}
        {/* ✅ Keeps model interactive but prevents zooming */}
      </Canvas>
    </motion.div>
  );
};
export default BouncingSphere;
