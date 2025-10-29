"use client";

import {FaCheck} from "react-icons/fa6";

type Props = {
  items: string[];
};

export function CheckList({items}: Props) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-white/80">
          <FaCheck aria-hidden className="mt-0.5 text-[#38b2ac]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
