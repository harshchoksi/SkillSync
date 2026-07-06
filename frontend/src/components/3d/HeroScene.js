// src/components/3d/HeroScene.js - Interactive 3D hero with fluid shapes
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus } from '@react-three/drei';
import * as THREE from 'three';

/* ── Main Fluid Sphere ──────────────────────────────────────────────── */
const FluidSphere = () => {
  const meshRef = useRef();
  const materialRef = useRef();

  useFrame(({ clock, pointer }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.15;
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.2;
      // Subtle follow of cursor
      meshRef.current.position.x = THREE.MathUtils.lerp(
        meshRef.current.position.x,
        pointer.x * 0.5,
        0.02
      );
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        pointer.y * 0.3,
        0.02
      );
    }
    if (materialRef.current) {
      materialRef.current.distort = 0.4 + Math.sin(clock.getElapsedTime() * 0.5) * 0.15;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1.8, 128, 128]} position={[0, 0, 0]}>
      <MeshDistortMaterial
        ref={materialRef}
        color="#6366f1"
        attach="material"
        distort={0.45}
        speed={1.5}
        roughness={0.2}
        metalness={0.8}
        emissive="#4338ca"
        emissiveIntensity={0.3}
        envMapIntensity={1}
      />
    </Sphere>
  );
};

/* ── Orbiting Rings ─────────────────────────────────────────────────── */
const OrbitRing = ({ radius, speed, color, thickness, tilt }) => {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = clock.getElapsedTime() * speed;
      meshRef.current.rotation.x = tilt;
    }
  });

  return (
    <Torus ref={meshRef} args={[radius, thickness, 16, 100]}>
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.25}
        emissive={color}
        emissiveIntensity={0.5}
        side={THREE.DoubleSide}
      />
    </Torus>
  );
};

/* ── Floating Particles (Orbs) ──────────────────────────────────────── */
const FloatingOrbs = ({ count = 40 }) => {
  const meshRef = useRef();
  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < count; i++) {
      pos.push({
        x: (Math.random() - 0.5) * 12,
        y: (Math.random() - 0.5) * 8,
        z: (Math.random() - 0.5) * 8,
        scale: Math.random() * 0.06 + 0.02,
        speed: Math.random() * 0.5 + 0.2,
        offset: Math.random() * Math.PI * 2,
      });
    }
    return pos;
  }, [count]);

  return (
    <group ref={meshRef}>
      {positions.map((p, i) => (
        <FloatingOrb key={i} {...p} />
      ))}
    </group>
  );
};

const FloatingOrb = ({ x, y, z, scale, speed, offset }) => {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = y + Math.sin(clock.getElapsedTime() * speed + offset) * 0.5;
      meshRef.current.position.x = x + Math.cos(clock.getElapsedTime() * speed * 0.5 + offset) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={[x, y, z]} scale={scale}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial
        color="#a78bfa"
        emissive="#7c3aed"
        emissiveIntensity={2}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
};

/* ── Glass Shard (floating decorative element) ──────────────────────── */
const GlassShard = ({ position, rotation, scale }) => {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = rotation[0] + clock.getElapsedTime() * 0.3;
      meshRef.current.rotation.y = rotation[1] + clock.getElapsedTime() * 0.2;
      meshRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.8) * 0.15;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#818cf8"
        transparent
        opacity={0.15}
        emissive="#6366f1"
        emissiveIntensity={0.3}
        wireframe
      />
    </mesh>
  );
};

/* ── Main Hero Scene ────────────────────────────────────────────────── */
const HeroScene = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
      }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#e0e7ff" />
      <directionalLight position={[-5, -3, 2]} intensity={0.5} color="#a78bfa" />
      <pointLight position={[0, 3, 3]} intensity={1.5} color="#6366f1" distance={10} />
      <pointLight position={[-3, -2, 2]} intensity={0.8} color="#c084fc" distance={8} />

      {/* Main sphere */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
        <FluidSphere />
      </Float>

      {/* Orbiting rings */}
      <OrbitRing radius={2.8} speed={0.3} color="#818cf8" thickness={0.015} tilt={1.2} />
      <OrbitRing radius={3.2} speed={-0.2} color="#c084fc" thickness={0.01} tilt={0.8} />
      <OrbitRing radius={3.6} speed={0.15} color="#6366f1" thickness={0.012} tilt={1.5} />

      {/* Floating orbs */}
      <FloatingOrbs count={35} />

      {/* Glass shards */}
      <GlassShard position={[3, 1.5, -1]} rotation={[0.5, 0.3, 0]} scale={0.4} />
      <GlassShard position={[-3.5, -1, -2]} rotation={[1.2, 0.8, 0]} scale={0.3} />
      <GlassShard position={[2.5, -2, 0]} rotation={[0.8, 1.5, 0]} scale={0.25} />
      <GlassShard position={[-2, 2.5, -1.5]} rotation={[0.3, 0.6, 0]} scale={0.35} />
    </Canvas>
  );
};

export default HeroScene;
