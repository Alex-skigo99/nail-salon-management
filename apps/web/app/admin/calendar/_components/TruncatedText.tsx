"use client";

import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

type TruncatedTextProps = {
  text: string | null | undefined;
  maxWidth?: string;
};

/**
 * Renders text truncated to one line with a tooltip showing the full text on hover.
 */
export function TruncatedText({ text, maxWidth = "max-w-[160px]" }: TruncatedTextProps) {
  if (!text) return <span className="text-muted-foreground">—</span>;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`block truncate ${maxWidth}`}>{text}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs whitespace-pre-wrap">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
