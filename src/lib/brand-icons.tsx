import * as React from "react";
import type {LucideIcon, LucideProps} from "lucide-react";

type IconNode = [string, Record<string, string | number>];

function toNumber(value: string | number | undefined, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function createCustomIcon(displayName: string, iconNode: IconNode[]): LucideIcon {
  const Component = React.forwardRef<SVGSVGElement, LucideProps>(
    (
      {
        color = "currentColor",
        size = 24,
        strokeWidth = 2,
        absoluteStrokeWidth = false,
        children,
        ...rest
      },
      ref,
    ) => {
      const sizeNumber = typeof size === "number" ? size : toNumber(size, 24);
      const strokeWidthNumber = toNumber(strokeWidth, 2);
      const computedStrokeWidth = absoluteStrokeWidth
        ? (strokeWidthNumber * 24) / sizeNumber
        : strokeWidthNumber;

      return (
        <svg
          ref={ref}
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={computedStrokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          {...rest}
        >
          {iconNode.map(([tag, attrs], index) => (
            React.createElement(tag, {key: `${displayName}-${index}`, ...attrs})
          ))}
          {children}
        </svg>
      );
    },
  );

  Component.displayName = displayName;

  return Component;
}

export const Facebook = createCustomIcon("Facebook", [[
  "path",
  {d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"},
]]);

export const Instagram = createCustomIcon("Instagram", [
  ["rect", {width: "20", height: "20", x: "2", y: "2", rx: "5", ry: "5"}],
  ["path", {d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"}],
  ["line", {x1: "17.5", x2: "17.51", y1: "6.5", y2: "6.5"}],
]);

export const Twitter = createCustomIcon("Twitter", [[
  "path",
  {d: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"},
]]);

export const Youtube = createCustomIcon("Youtube", [
  [
    "path",
    {
      d: "M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17",
    },
  ],
  ["path", {d: "m10 15 5-3-5-3z"}],
]);
