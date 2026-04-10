'use client';

import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { SHADER_SOURCES } from '@/shaders/sources';

interface ShaderCanvasProps {
  activeIndex: number;
  mouse: { x: number; y: number };
}

// Per-shader internal resolution scale. Noise Landscape (index 3) is an
// expensive ray-marched terrain — rendering it at 0.6x the pixel count
// (CSS still fills the viewport) drops GPU load ~2.8x with no visible
// quality loss on a low-frequency landscape. All other shaders are cheap
// enough to render at full resolution.
const SHADER_RES_SCALE: Record<number, number> = {
  3: 0.6,
};
const getResScale = (index: number) => SHADER_RES_SCALE[index] ?? 1.0;

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
    const initialScale = getResScale(0);
    renderer.setSize(
      Math.round(window.innerWidth * initialScale),
      Math.round(window.innerHeight * initialScale),
      false
    );
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

    // Resize handler — respects the current shader's resolution scale
    const handleResize = () => {
      const scale = getResScale(state.currentIndex);
      renderer.setSize(
        Math.round(window.innerWidth * scale),
        Math.round(window.innerHeight * scale),
        false
      );
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
    if (!state.mesh || !state.renderer) return;

    const material = getOrCreateMaterial(activeIndex);
    // Preserve time continuity but reset for new shader
    material.uniforms.uTime.value = 0;
    state.time = 0;
    state.mesh.material = material;
    state.currentIndex = activeIndex;

    // Resize the drawing buffer to the new shader's resolution scale
    // (CSS stays at 100vw/100vh so the canvas still fills the viewport).
    const scale = getResScale(activeIndex);
    state.renderer.setSize(
      Math.round(window.innerWidth * scale),
      Math.round(window.innerHeight * scale),
      false
    );
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
