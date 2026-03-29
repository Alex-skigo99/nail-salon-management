"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { HistoryTable } from "@/components/tables/HistoryTable";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type HistoryUserApptsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userName?: string;
};

export function HistoryUserApptsModal({ open, onOpenChange, userId, userName }: HistoryUserApptsModalProps) {
  const isMobile = useIsMobile();

  const translations = {
    date: "Date",
    time: "Time",
    master: "Master",
    duration: "Duration",
    minutes: "min",
    services: "Services",
    status: "Status",
    comments: "Comments",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(isMobile ? "max-w-[95vw] p-3" : "sm:max-w-6xl")}>
        <DialogHeader>
          <DialogTitle>Appointment History{userName ? `: ${userName}` : ""}</DialogTitle>
          <DialogDescription>View all appointments for this user</DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-auto">
          <HistoryTable
            userId={userId ?? undefined}
            isMobile={isMobile}
            noResultsMessage="No appointments found"
            translations={translations}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
