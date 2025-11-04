"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Minus } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type MetricCardProps = {
  title: string;
  value: React.ReactNode | string | number;
  changeLabel?: string;
  trend?: "up" | "down" | "neutral";
  href?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
};

const trendIconMap: Record<NonNullable<MetricCardProps["trend"]>, typeof ChevronUp> = {
  up: ChevronUp,
  down: ChevronDown,
  neutral: Minus,
};

const trendColorMap: Record<NonNullable<MetricCardProps["trend"]>, string> = {
  up: "text-emerald-500",
  down: "text-rose-500",
  neutral: "text-muted-foreground",
};

export function MetricCard({
  title,
  value,
  changeLabel,
  trend = "neutral",
  href,
  icon,
  isLoading,
  className,
}: MetricCardProps) {
  const TrendIcon = trendIconMap[trend];
  const cardBody = isLoading ? (
    <Card className={cn("pointer-events-none", className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0">
        <div className="space-y-2">
          <div className="h-4 w-28 animate-pulse rounded bg-muted/30" />
          <div className="h-3 w-20 animate-pulse rounded bg-muted/20" />
        </div>
        <div className="h-10 w-10 animate-pulse rounded-full bg-muted/20" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-8 w-32 animate-pulse rounded bg-muted/30" />
        <div className="h-3 w-24 animate-pulse rounded bg-muted/20" />
      </CardContent>
    </Card>
  ) : (
    <Card
      className={cn(
        "transition-all duration-200",
        href && "cursor-pointer hover:-translate-y-0.5 hover:border-white/20",
        className
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0">
        <div className="space-y-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {changeLabel ? (
            <div
              className={cn(
                "inline-flex items-center text-xs font-medium",
                trendColorMap[trend]
              )}
            >
              <TrendIcon className="mr-1 h-4 w-4" />
              <span>{changeLabel}</span>
            </div>
          ) : null}
        </div>
        {icon ? <div className="text-muted-foreground">{icon}</div> : null}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );

  if (href && !isLoading) {
    return (
      <Link
        href={href}
        className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {cardBody}
      </Link>
    );
  }

  return cardBody;
}
