"use client";

import {motion} from "framer-motion";

const shimmerTransition = {
  repeat: Infinity,
  repeatType: "loop" as const,
  duration: 1.6,
  ease: "easeInOut" as const,
};

export function ProductCardSkeleton() {
  return (
    <div className="h-full">
      <div className="flex h-full flex-col gap-5 rounded-3xl border border-white/5 bg-[rgba(12,27,30,0.55)] p-5 md:gap-6 md:p-6">
        <div className="relative overflow-hidden rounded-2xl">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-background-800/80">
            <motion.span
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-brand-700/20 to-transparent"
              initial={{x: "-100%"}}
              animate={{x: "100%"}}
              transition={shimmerTransition}
            />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <SkeletonLine className="h-5 w-3/4" />
          <SkeletonLine className="h-4 w-1/2" />
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <SkeletonLine className="h-4 w-20" />
            <SkeletonLine className="h-4 w-14" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonLine({className}: {className: string}) {
  return (
    <div className={`relative overflow-hidden rounded-full bg-background-800/70 ${className}`}>
      <motion.span
        aria-hidden
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-brand-600/30 to-transparent"
        initial={{x: "-100%"}}
        animate={{x: "100%"}}
        transition={shimmerTransition}
      />
    </div>
  );
}
