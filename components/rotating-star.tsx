"use client"

import { Canvas } from "@react-three/fiber"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { Mesh } from "three"
import * as THREE from "three"

function Star() {
  const meshRef = useRef<Mesh>(null)

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5
      meshRef.current.rotation.y += delta * 0.3
      meshRef.current.rotation.z += delta * 0.2
    }
  })

  // Create star shape using multiple triangular faces
  const starPoints = []
  const outerRadius = 1
  const innerRadius = 0.4
  const spikes = 5

  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i * Math.PI) / spikes
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    starPoints.push(Math.cos(angle) * radius, Math.sin(angle) * radius, 0)
  }

  return (
    <mesh ref={meshRef}>
      <extrudeGeometry
        args={[
          new THREE.Shape().setFromPoints(
            Array.from({ length: spikes * 2 }, (_, i) => {
              const angle = (i * Math.PI) / spikes
              const radius = i % 2 === 0 ? outerRadius : innerRadius
              return new THREE.Vector2(Math.cos(angle) * radius, Math.sin(angle) * radius)
            }),
          ),
          { depth: 0.2, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05 },
        ]}
      />
      <meshStandardMaterial
        color="#fbbf24"
        emissive="#f59e0b"
        emissiveIntensity={0.6}
        metalness={0.3}
        roughness={0.1}
      />
    </mesh>
  )
}

export default function RotatingStar() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, 10]} intensity={0.8} color="#fbbf24" />
        <Star />
      </Canvas>
    </div>
  )
}
