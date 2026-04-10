"use client";

import { useState, useCallback, useMemo } from "react";
import { CalendarCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAllAppointments } from "@/hooks/useAppointments";
import type { UseAllAppointmentsParams } from "@/hooks/useAppointments";
import { useMasters } from "@/hooks/useMasters";
import type { AppointmentRetrieveFull } from "@/types/appointmentTypes";
import type { Slot } from "@/types/appointmentTypes";
import GeneralTable from "@/components/tables/GeneralTable";
import { appointmentsColumns } from "./_components/appointmentsColumns";
import { AppointmentSearchFilterSection } from "./_components/AppointmentSearchFilterSection";
import { AdminAppointmentDialog } from "@/components/modals/adminAppointmentDialog/AdminAppointmentDialog";
import type { Row, PaginationState } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AppointmentsPage() {
  const [filterParams, setFilterParams] = useState<UseAllAppointmentsParams>({ sort: "created_desc" });
  const { data: session } = useSession();
  const isMobile = useIsMobile();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const handleFilterChange = useCallback((params: UseAllAppointmentsParams) => {
    setFilterParams(params);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const { data, isLoading, error } = useAllAppointments(
    { ...filterParams, page: pagination.pageIndex + 1, perPage: pagination.pageSize },
    !!session?.user?.id
  );
  const appointments = data?.data ?? [];
  const paginationData = data?.pagination;

  const { data: masters = [] } = useMasters(!!session?.user?.id);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMasterId, setSelectedMasterId] = useState(0);

  const handleRowClick = useCallback((row: Row<AppointmentRetrieveFull>) => {
    const appt = row.original;
    const slot: Slot = {
      start_time: appt.time,
      end_time: appt.time,
      status: "book",
      appointment_data: {
        ...appt,
        user_data: appt.user_data,
      },
    };
    setSelectedSlot(slot);
    setSelectedDate(appt.date);
    setSelectedMasterId(appt.master_id);
    setDialogOpen(true);
  }, []);

  const columns = useMemo(
    () =>
      appointmentsColumns(masters, filterParams.sort, {
        status: filterParams.status,
        master_id: filterParams.master_id,
        hasDateFilter: !!filterParams.from || !!filterParams.to,
      }),
    [masters, filterParams.sort, filterParams.status, filterParams.master_id, filterParams.from, filterParams.to]
  );

  return (
    <div className={cn("flex flex-1 flex-col", { "overflow-hidden": !isMobile })}>
      <div className={cn("border-b px-6 py-5", { "border-b-0 py-2": isMobile })}>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Appointments</h1>
            {!isMobile && <p className="text-muted-foreground text-sm">View and manage all appointments</p>}
          </div>
        </div>
      </div>

      <div className={cn("flex-1 p-6", { "px-0 py-2": isMobile })}>
        <AppointmentSearchFilterSection params={filterParams} onChange={handleFilterChange} masters={masters} />

        {error ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
            <p className="text-destructive font-medium">Failed to load appointments</p>
            <p className="text-muted-foreground text-sm">Please try refreshing the page</p>
          </div>
        ) : (
          <GeneralTable<AppointmentRetrieveFull, AppointmentRetrieveFull, unknown>
            columns={columns}
            data={appointments}
            isPending={isLoading}
            handleRowClick={handleRowClick}
            customNoResultsMessage="No appointments found"
            isPaginationNeeded
            pagination={pagination}
            setPagination={setPagination}
            totalRows={paginationData?.total ?? 0}
          />
        )}
      </div>

      {selectedSlot && (
        <AdminAppointmentDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          slot={selectedSlot}
          date={selectedDate}
          masterId={selectedMasterId}
        />
      )}
    </div>
  );
}
