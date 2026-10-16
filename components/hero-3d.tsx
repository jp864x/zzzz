"use client"

import { motion } from "framer-motion"

export default function Hero3D() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={{
        WebkitMaskImage: "radial-gradient(60% 60% at 80% 50%, black 40%, transparent 100%)",
        maskImage: "radial-gradient(60% 60% at 80% 50%, black 40%, transparent 100%)",
      }}
      aria-hidden="true"
    >
      {/* Simple animated gradient instead of 3D */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/20 via-violet-500/10 to-fuchsia-500/20"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Floating orbs */}
      <motion.div
        className="absolute top-1/4 right-1/4 h-32 w-32 rounded-full bg-gradient-to-br from-primary/30 to-violet-500/30 blur-xl"
        animate={{
          y: [-20, 20, -20],
          x: [-10, 10, -10],
        }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-1/2 right-1/3 h-24 w-24 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 blur-lg"
        animate={{
          y: [20, -20, 20],
          x: [10, -10, 10],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </div>
  )
}
