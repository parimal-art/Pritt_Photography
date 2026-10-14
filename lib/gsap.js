"use client";

import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Safe GSAP hook for React.
 *
 * - Scopes selectors to `scope.current`
 * - Runs inside gsap.matchMedia, so animations only exist when the visitor has
 *   NOT asked for reduced motion (`conditions.motion`), and hover/pointer effects
 *   only exist on fine pointers (`conditions.fine`).
 * - Everything created inside `setup` (tweens AND ScrollTriggers) is reverted on
 *   unmount / dependency change, so route changes never leave duplicate triggers.
 *
 * @param {(conditions: {motion: boolean, fine: boolean}) => void | (() => void)} setup
 * @param {React.RefObject<HTMLElement>} scope
 * @param {any[]} deps
 */
export function useGsap(setup, scope, deps = []) {
  useIsoLayoutEffect(() => {
    const mm = gsap.matchMedia(scope && scope.current ? scope.current : undefined);
    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        fine: "(hover: hover) and (pointer: fine)",
      },
      (context) => setup(context.conditions)
    );
    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
