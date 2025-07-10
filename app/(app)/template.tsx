"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useNavigationDirection } from "@/context/NavigationDirectionContext";
import { usePathname } from "next/navigation";

const MAIN_ROUTES = [
  "/practice",
  "/selection",
  "/performance",
  "/community",
  "/appSettings",
];

const EXCLUDED_ROUTES = [
  "/skele"
];

export default function Template({ children }: { children: React.ReactNode }) {
  const { direction } = useNavigationDirection();
  const pathname = usePathname();

  const isMainRoute = MAIN_ROUTES.includes(pathname);
  const isExcluded = EXCLUDED_ROUTES.includes(pathname);
  
  // Use sweep animation for main routes when direction is set
  const shouldUseSweep = isMainRoute && (direction === "forward" || direction === "backward");

  let initial, animate, exit, transition, style;
  
  if (isExcluded) {
    // No animation for excluded routes
    initial = { opacity: 1 };
    animate = { opacity: 1 };
    exit = { opacity: 1 };
    transition = { duration: 0 };
    style = { height: "100%" };
  } else if (shouldUseSweep) {
    if (direction === "forward") {
      initial = { x: "100vw", rotateY: -45, opacity: 0 };
      animate = { x: 0, rotateY: 0, opacity: 1 };
      exit = { x: "-100vw", rotateY: 45, opacity: 0 };
    } else if (direction === "backward") {
      initial = { x: "-100vw", rotateY: 45, opacity: 0 };
      animate = { x: 0, rotateY: 0, opacity: 1 };
      exit = { x: "100vw", rotateY: -45, opacity: 0 };
    }
    transition = { duration: 0.7 };
    style = { height: "100%", perspective: 1200 };
  } else {
    // Default fade for everything else
    initial = { opacity: 0 };
    animate = { opacity: 1 };
    exit = { opacity: 0 };
    transition = { duration: 0.2 };
    style = { height: "100%" };
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={initial}
        animate={animate}
        exit={exit}
        transition={transition}
        style={style}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}