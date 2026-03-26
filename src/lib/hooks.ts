import { useState, useEffect } from "react";

export interface MousePosition {
  x: number;
  y: number;
}

/**
 * Tracks the mouse position normalized to the range [-1, 1] for both axes.
 * (0, 0) is the center of the viewport; (-1, -1) is the top-left corner.
 */
export function useMousePosition(): MousePosition {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      // Invert Y so that positive values point upward, matching WebGL convention.
      const y = -((event.clientY / window.innerHeight) * 2 - 1);
      setPosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return position;
}

export type PerformanceTier = "high" | "medium" | "low";

/**
 * Estimates device GPU/CPU capability and returns a performance tier.
 *
 * Heuristics (applied in order):
 * 1. Mobile user-agent  → "low"
 * 2. WebGL renderer string contains a known low-power GPU keyword → "low"
 * 3. Navigator hardware concurrency ≤ 2 → "medium"
 * 4. Navigator hardware concurrency ≤ 4 → "medium"
 * 5. Otherwise → "high"
 */
export function useDevicePerformance(): PerformanceTier {
  const [tier, setTier] = useState<PerformanceTier>("high");

  useEffect(() => {
    const detected = detectPerformanceTier();
    setTier(detected);
  }, []);

  return tier;
}

function detectPerformanceTier(): PerformanceTier {
  // 1. Mobile device check via user agent.
  const mobileRegex =
    /android|iphone|ipad|ipod|blackberry|windows phone|opera mini|mobile/i;
  if (mobileRegex.test(navigator.userAgent)) {
    return "low";
  }

  // 2. GPU renderer string check via WebGL.
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        const renderer = gl
          .getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
          .toLowerCase() as string;

        const lowPowerKeywords = [
          "intel",
          "mesa",
          "llvmpipe",
          "swiftshader",
          "software",
          "angle",
          "mali",
          "adreno 3",
          "adreno 4",
          "powervr",
        ];

        const isLowPowerGPU = lowPowerKeywords.some((kw) =>
          renderer.includes(kw)
        );

        if (isLowPowerGPU) {
          return "low";
        }
      }
    }
  } catch {
    // WebGL unavailable — degrade gracefully.
    return "low";
  }

  // 3. CPU core count heuristic.
  const cores = navigator.hardwareConcurrency ?? 2;
  if (cores <= 2) return "low";
  if (cores <= 4) return "medium";

  return "high";
}
