'use client';

import { useRef, useMemo, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, Environment, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';

function DocumentMesh({ scanning }: { scanning: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const { mouse } = useThree();

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Subtle float + mouse parallax
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        -0.15 + mouse.x * 0.25,
        0.05,
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        0.12 + mouse.y * 0.12,
        0.05,
      );
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.06;
    }

    // Scanning beam
    if (beamRef.current) {
      const t = state.clock.elapsedTime;
      const beamY = ((t * 0.5) % 2) - 1;
      beamRef.current.position.y = beamY;
      (beamRef.current.material as THREE.MeshBasicMaterial).opacity =
        scanning ? 0.35 : 0.15 + Math.sin(t * 2) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.3, 0]} rotation={[-0.1, -0.15, 0]}>
      {/* Document card */}
      <RoundedBox args={[2.2, 1.4, 0.02]} radius={0.02} smoothness={4} castShadow>
        <meshStandardMaterial
          color="#f7f6f3"
          roughness={0.65}
          metalness={0.05}
        />
      </RoundedBox>

      {/* Photo area */}
      <mesh position={[-0.7, 0.15, 0.012]}>
        <planeGeometry args={[0.55, 0.65]} />
        <meshStandardMaterial color="#d4d8de" roughness={0.4} />
      </mesh>
      {/* Photo silhouette */}
      <mesh position={[-0.7, 0.05, 0.014]}>
        <circleGeometry args={[0.16, 32]} />
        <meshStandardMaterial color="#8a93a3" roughness={0.5} />
      </mesh>
      <mesh position={[-0.7, -0.12, 0.014]}>
        <planeGeometry args={[0.4, 0.25]} />
        <meshStandardMaterial color="#8a93a3" roughness={0.5} />
      </mesh>

      {/* Identity field lines (left side) */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={`field-${i}`} position={[0.05, -0.05 - i * 0.13, 0.013]}>
          <planeGeometry args={[0.7 - i * 0.05, 0.03]} />
          <meshStandardMaterial color="#3a4458" roughness={0.6} />
        </mesh>
      ))}

      {/* Header text bar */}
      <mesh position={[0.25, 0.55, 0.013]}>
        <planeGeometry args={[1.0, 0.06]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>

      {/* Right side: MRZ-like lines */}
      {[0, 1, 2].map((i) => (
        <mesh key={`mrz-${i}`} position={[0.35, -0.42 - i * 0.08, 0.013]}>
          <planeGeometry args={[1.3, 0.05]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
      ))}

      {/* Security pattern (guilloché-like circles) */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={`sec-${i}`} position={[0.7, 0.2, 0.012]}>
          <ringGeometry args={[0.08 + i * 0.05, 0.09 + i * 0.05, 48]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#3b82c4' : '#60a5fa'}
            transparent
            opacity={0.12}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* Holographic strip */}
      <mesh position={[0.85, -0.15, 0.013]}>
        <planeGeometry args={[0.35, 0.5]} />
        <meshStandardMaterial
          color="#60a5fa"
          transparent
          opacity={0.08}
          roughness={0.1}
          metalness={0.8}
          emissive="#3b82c4"
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Chip symbol */}
      <mesh position={[0.5, 0.15, 0.014]}>
        <planeGeometry args={[0.18, 0.13]} />
        <meshStandardMaterial color="#c4a04a" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Chip contacts */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={`chip-${i}`} position={[0.5, 0.1 + i * 0.025, 0.016]}>
          <planeGeometry args={[0.12, 0.008]} />
          <meshStandardMaterial color="#8a7233" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* Microtext-like dots */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={`micro-${i}`} position={[-0.9 + (i % 5) * 0.06, -0.5 - Math.floor(i / 5) * 0.04, 0.013]}>
          <planeGeometry args={[0.04, 0.008]} />
          <meshStandardMaterial color="#475569" roughness={0.5} />
        </mesh>
      ))}

      {/* Scanning beam */}
      <mesh ref={beamRef} position={[0, 0, 0.02]}>
        <planeGeometry args={[2.3, 0.08]} />
        <meshBasicMaterial
          color="#22d3ee"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function ScannerBase() {
  return (
    <group position={[0, -0.9, 0]}>
      {/* Scanner base plate */}
      <RoundedBox args={[3.2, 0.12, 2.0]} radius={0.03} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color="#2a3340" metalness={0.6} roughness={0.35} />
      </RoundedBox>

      {/* Scanner glass surface */}
      <mesh position={[0, 0.065, 0]} receiveShadow>
        <boxGeometry args={[2.8, 0.02, 1.6]} />
        <meshPhysicalMaterial
          color="#1a2030"
          metalness={0.2}
          roughness={0.05}
          transmission={0.1}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Edge accent strip */}
      <mesh position={[0, 0.08, 0.82]}>
        <boxGeometry args={[2.9, 0.01, 0.02]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.08, -0.82]}>
        <boxGeometry args={[2.9, 0.01, 0.02]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.2} />
      </mesh>

      {/* Side indicators */}
      {[-1.45, 1.45].map((x) => (
        <mesh key={x} position={[x, 0.08, 0]}>
          <boxGeometry args={[0.02, 0.01, 1.4]} />
          <meshStandardMaterial color="#3b82c4" emissive="#3b82c4" emissiveIntensity={0.15} />
        </mesh>
      ))}

      {/* Status LED */}
      <mesh position={[1.3, 0.09, 0.7]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

function Scene({ scanning }: { scanning: boolean }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[3, 5, 3]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-3, 2, -2]} intensity={0.3} />
      <Environment preset="studio" />

      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
        <DocumentMesh scanning={scanning} />
      </Float>

      <ScannerBase />

      <ContactShadows
        position={[0, -0.95, 0]}
        opacity={0.35}
        scale={6}
        blur={2.5}
        far={3}
        color="#1e293b"
      />
    </>
  );
}

export default function Hero3D({ scanning }: { scanning: boolean }) {
  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.5, 5], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene scanning={scanning} />
        </Suspense>
      </Canvas>
    </div>
  );
}
