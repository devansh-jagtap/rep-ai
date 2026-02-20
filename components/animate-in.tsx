"use client";

import { type ReactNode, type HTMLAttributes } from "react";
import { motion } from "motion/react";

type AnimateInProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  delay?: number;
  duration?: number;
  from?: "bottom" | "left" | "right" | "none";
  amount?: number;
  once?: boolean;
  className?: string;
};

const origins = {
  bottom: { opacity: 0, y: 40 },
  left: { opacity: 0, x: -40 },
  right: { opacity: 0, x: 40 },
  none: { opacity: 0 },
} as const satisfies Record<string, { opacity: number; x?: number; y?: number }>;

export function AnimateIn({
  children,
  delay = 0,
  duration = 0.6,
  from = "bottom",
  amount = 0.15,
  once = true,
  className,
}: AnimateInProps) {
  return (
    <motion.div
      initial={origins[from]}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerChildren({
  children,
  className,
  stagger = 0.1,
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode; stagger?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  from = "bottom",
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode; from?: "bottom" | "left" | "right" | "none" }) {
  return (
    <motion.div
      variants={{
        hidden: origins[from],
        visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
