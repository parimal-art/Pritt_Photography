"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * Re-mounts on every navigation: a restrained fade/rise between pages, then a
 * ScrollTrigger refresh so trigger positions are correct for the new page.
 */
export default function Template({ children }) {
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}
