// Safari / macOS short-video style animation

export const safariVideoAnimation = {
  hidden: {
    opacity: 0,
    scale: 0.7,
  },

  pop: {
    opacity: 1,
    scale: 1.1,
    transition: {
      duration: 0.22,
      ease: [0.22, 1.4, 0.36, 1], // strong pop
    },
  },

  settle: {
    scale: 1,
    transition: {
      duration: 0.14,
      ease: "easeOut",
    },
  },

  exit: {
    opacity: 0,
    scale: 0.85,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};
