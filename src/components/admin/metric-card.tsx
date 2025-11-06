"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type MetricCardProps = {
  title: string;
  value: string;
  description: string;
  icon?: React.ReactNode;
};

let metricCardOrderCounter = 0;
let metricCardMounts = 0;

export function MetricCard({ title, value, description, icon }: MetricCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const [order] = React.useState(() => metricCardOrderCounter++);

  React.useEffect(() => {
    metricCardMounts += 1;

    return () => {
      metricCardMounts -= 1;

      if (metricCardMounts === 0) {
        metricCardOrderCounter = 0;
      }
    };
  }, []);

  const transitionDelay = React.useMemo(() => order * 0.1, [order]);

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={
        prefersReducedMotion
          ? undefined
          : { duration: 0.5, delay: transitionDelay, ease: "easeOut" }
      }
      className="h-full"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon ? <div className="text-muted-foreground">{icon}</div> : null}
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{value}</div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
