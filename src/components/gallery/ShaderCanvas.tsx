'use client';

import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { SHADER_SOURCES } from '@/shaders/sources';

interface ShaderCanvasProps {
  activeIndex: number;
  mouse: { x: number; y: number };
}

export default function ShaderCanvas({ activeIndex, mouse }: ShaderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer | null;
    scene: THREE.Scene | null;
    camera: THREE.Camera | null;
    materials: Map<number, THREE.ShaderMaterial>;
    mesh: THREE.Mesh | null;
    currentIndex: number;
    time: number;
    animId: number;
    mouse: { x: number; y: number };
  }>({
    renderer: null,
    scene: null,
    camera: null,
    materials: new Map(),
    mesh: null,
    currentIndex: 0,
    time: 0,
    animId: 0,
    mouse: { x: 0.5, y: 0.5 },
  });

  // Keep mouse ref fresh
  stateRef.current.mouse = mouse;

  const getOrCreateMaterial = useCallback((index: number): THREE.ShaderMaterial => {
    const state = stateRef.current;
    if (state.materials.has(index)) {
      return state.materials.get(index)!;
    }

    const source = SHADER_SOURCES[index];
    if (!source) return state.materials.values().next().value!;

    const material = new THREE.ShaderMaterial({
      vertexShader: `void main() { gl_Position = vec4(position, 1.0); }`,
      fragmentShader: source,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uMouseInfluence: { value: 1.0 },
      },
    });

    state.materials.set(index, material);
    return material;
  }, []);

  // Initialize Three.js — single renderer, single context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0d0d0d);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = getOrCreateMaterial(0);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const state = stateRef.current;
    state.renderer = renderer;
    state.scene = scene;
    state.camera = camera;
    state.mesh = mesh;

    // Animation loop — plain rAF, no THREE.Clock
    let lastTime = performance.now();

    const animate = () => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      state.time += delta;

      const mat = mesh.material as THREE.ShaderMaterial;
      if (mat.uniforms) {
        mat.uniforms.uTime.value = state.time;
        mat.uniforms.uMouse.value.set(state.mouse.x, state.mouse.y);
        mat.uniforms.uResolution.value.set(
          renderer.domElement.width,
          renderer.domElement.height
        );
      }

      renderer.render(scene, camera);
      state.animId = requestAnimationFrame(animate);
    };

    state.animId = requestAnimationFrame(animate);

    // Resize handler
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(state.animId);
      window.removeEventListener('resize', handleResize);
      state.materials.forEach((m) => m.dispose());
      geometry.dispose();
      renderer.dispose();
    };
  }, [getOrCreateMaterial]);

  // Swap shader when activeIndex changes
  useEffect(() => {
    const state = stateRef.current;
    if (!state.mesh) return;

    const material = getOrCreateMaterial(activeIndex);
    // Preserve time continuity but reset for new shader
    material.uniforms.uTime.value = 0;
    state.time = 0;
    state.mesh.material = material;
    state.currentIndex = activeIndex;
  }, [activeIndex, getOrCreateMaterial]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
      }}
    />
  );
}
