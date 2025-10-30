import Link from "next/link";
import {ReactNode} from "react";

import {cn} from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: ReactNode;
  description?: string;
  href?: string;
  className?: string;
};

export function MetricCard({label, value, description, href, className}: MetricCardProps) {
  const baseClasses = cn(
    "rounded-xl border border-white/10 bg-muted p-6 shadow-soft",
    className,
  );

  const content = (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-white/80">{label}</p>
      <div className="text-4xl font-semibold text-foreground">{value}</div>
      {description ? <p className="text-sm text-white/60">{description}</p> : null}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "block transition-all duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "hover:-translate-y-1 hover:bg-muted/90 hover:shadow-card",
          baseClasses,
        )}
      >
        {content}
      </Link>
    );
  }

  return <div className={baseClasses}>{content}</div>;
}
