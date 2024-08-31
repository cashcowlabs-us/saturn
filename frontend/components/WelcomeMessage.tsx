"use client";

import React from "react";
import { motion } from "framer-motion";

const WavingHand: React.FC = () => (
  <motion.span
    className="text-4xl inline-block"
    animate={{ rotate: [0, 14, -8, 14, 0] }}
    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
  >
    👋
  </motion.span>
);

const WelcomeMessage: React.FC = () => (
  <motion.div
    className="text-center p-4 lg:p-8"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <WavingHand />
    <motion.p
      className="text-lg lg:text-xl font-semibold mb-2 lg:mb-4 mt-2 lg:mt-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      Hello!
    </motion.p>
    <motion.p
      className="text-gray-600 text-sm lg:text-base"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      You don&apos;t have any projects yet. Upload a CSV file to get started.
    </motion.p>
  </motion.div>
);

export default WelcomeMessage;