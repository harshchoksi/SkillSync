// src/components/3d/AnimatedBackground.js - Subtle animated mesh gradient background
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ── Animated gradient mesh plane ───────────────────────────────────── */
const GradientPlane = () => {
  const meshRef = useRef();
  
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color('#0c0a2a') },
      uColor2: { value: new THREE.Color('#1a0e3e') },
      uColor3: { value: new THREE.Color('#0a1628') },
    }),
    []
  );

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    varying vec2 vUv;

    void main() {
      float t = uTime * 0.15;
      
      // Create flowing gradient
      float noise1 = sin(vUv.x * 3.0 + t) * cos(vUv.y * 2.0 + t * 0.7);
      float noise2 = cos(vUv.x * 2.5 - t * 0.8) * sin(vUv.y * 3.5 + t * 0.5);
      float blend = (noise1 + noise2) * 0.25 + 0.5;
      
      vec3 color = mix(uColor1, uColor2, blend);
      color = mix(color, uColor3, sin(vUv.y * 1.5 + t * 0.3) * 0.3 + 0.3);
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -5]} scale={[20, 20, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

/* ── Main Background ────────────────────────────────────────────────── */
const AnimatedBackground = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}
      gl={{ antialias: false, alpha: false }}
      dpr={1}
    >
      <GradientPlane />
    </Canvas>
  );
};

export default AnimatedBackground;
