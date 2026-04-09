"use client";

import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type TruncatedTextProps = {
  text: string | null | undefined;
  maxWidth?: string;
  isTooltipDisabled?: boolean;
  minSymbolsForTooltip?: number;
  className?: string;
};

/**
 * Renders text truncated to one line with a tooltip showing the full text on hover.
 */
export function TruncatedText({
  text,
  maxWidth = "max-w-[160px]",
  isTooltipDisabled = false,
  minSymbolsForTooltip = 6,
  className = "",
}: TruncatedTextProps) {
  if (!text) return <span className="text-muted-foreground">—</span>;

  if (isTooltipDisabled || text.length < minSymbolsForTooltip) {
    return <span className={cn("block truncate", maxWidth, className)}>{text}</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("block truncate", maxWidth, className)}>{text}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs whitespace-pre-wrap">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
