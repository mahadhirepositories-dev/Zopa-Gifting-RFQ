"use client";

import React from "react";

interface TruncateTextProps {
  text: string;
  expanded: boolean;
  onToggle: () => void;
  charLimit?: number;
}

export function TruncateText({
  text,
  expanded,
  onToggle,
  charLimit = 50,
}: TruncateTextProps) {
  if (!text || text.length <= charLimit) {
    return <span>{text}</span>;
  }

  return (
    <span>
      {expanded ? text : `${text.slice(0, charLimit)}...`}
      <button
        onClick={onToggle}
        className="ml-1 text-xs text-blue-600 hover:underline focus:outline-none"
        type="button"
      >
        {expanded ? "Show less" : "Show more"}
      </button>
    </span>
  );
}
