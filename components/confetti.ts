"use client"

export async function celebrate(x?: number, y?: number) {
  if (typeof window === "undefined") return

  try {
    const { default: confetti } = await import("canvas-confetti")
    const ox = typeof x === "number" ? x : window.innerWidth / 2
    const oy = typeof y === "number" ? y : window.innerHeight / 2

    confetti({
      particleCount: 120,
      spread: 65,
      startVelocity: 45,
      ticks: 200,
      origin: {
        x: ox / window.innerWidth,
        y: oy / window.innerHeight,
      },
      colors: ["#f0abfc", "#c4b5fd", "#a78bfa", "#a855f7"],
    })
  } catch (error) {
    console.log("Confetti not available")
  }
}
