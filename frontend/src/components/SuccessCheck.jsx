import { motion } from "framer-motion";
import React from "react";

const SuccessCheck = ({ text = "Success" }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 180, damping: 12 }}
      className="flex flex-col items-center justify-center gap-4 py-6"
    >
      <motion.svg
        width="90"
        height="90"
        viewBox="0 0 52 52"
        className="stroke-cyan-400"
      >
        <motion.circle
          cx="26"
          cy="26"
          r="24"
          fill="none"
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6 }}
        />
        <motion.path
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14 27 L22 34 L38 18"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        />
      </motion.svg>

      <p className="text-cyan-400 font-semibold tracking-wide">
        {text}
      </p>
    </motion.div>
  );
};

export default SuccessCheck;
