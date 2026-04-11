"use client";

import * as React from "react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { createDateOutOfString } from "@/utils/dateUtils";
import { useIsMobile } from "@/hooks/use-mobile";

type IDatePickerWithRange = {
  className?: string;
  buttonClass?: string;
  onChange: React.Dispatch<React.SetStateAction<{ from: string | null; to: string | null }>>;
  setTimeOptionRange: React.Dispatch<React.SetStateAction<string | undefined>>;
  value: { from: string | null; to: string | null };
  disabled: (date: Date) => boolean;
};

export default function DatePickerWithRange({
  className,
  buttonClass,
  onChange,
  setTimeOptionRange,
  value,
  disabled,
}: IDatePickerWithRange) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState<boolean>(false);

  const [date, setDate] = React.useState<DateRange | undefined>(() => ({
    from: createDateOutOfString(value.from),
    to: createDateOutOfString(value.to),
  }));

  React.useEffect(() => {
    setDate({
      from: createDateOutOfString(value.from),
      to: createDateOutOfString(value.to),
    });
  }, [value]);

  const getDateLabel = () => {
    if (date?.from) {
      if (date.to) {
        return `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`;
      }
      return format(date.from, "LLL dd, y");
    }
    return "Pick a date range";
  };

  const handleSelect = React.useCallback(
    (newDateRange: DateRange | undefined) => {
      setDate(newDateRange);
      setTimeOptionRange(undefined);

      if (newDateRange?.from) {
        const utcFrom = new Date(
          newDateRange.from.getTime() - newDateRange.from.getTimezoneOffset() * 60000
        ).toISOString();
        onChange((prev) => ({ ...prev, from: utcFrom }));
      } else {
        onChange((prev) => ({ ...prev, from: null }));
      }

      if (newDateRange?.to) {
        const utcTo = new Date(newDateRange.to.getTime() - newDateRange.to.getTimezoneOffset() * 60000).toISOString();
        onChange((prev) => ({ ...prev, to: utcTo }));
      } else {
        onChange((prev) => ({ ...prev, to: null }));
      }
    },
    [onChange, setDate, setTimeOptionRange]
  );

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover modal open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start bg-transparent px-2 text-left font-normal",
              `${buttonClass} ${!date && "text-muted-foreground"}`
            )}
          >
            <CalendarIcon className="mr-1 h-4 w-4" />
            {getDateLabel()}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side="bottom"
          className={cn(
            "z-1000 overflow-visible p-0",
            isMobile ? "max-h-[35vh] w-screen max-w-xs overflow-auto" : "w-auto"
          )}
        >
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={isMobile ? 1 : 2}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
