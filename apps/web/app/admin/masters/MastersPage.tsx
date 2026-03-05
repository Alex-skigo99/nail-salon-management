"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useMasters } from "@/hooks/useMasters";
import { MasterCard } from "./_components/MasterCard";
import { MasterForm } from "./_components/MasterForm";
import AddMasterButton from "./_components/AddMasterButton";

export default function MastersPage() {
  const { data: masters, isLoading, error } = useMasters();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Masters</h1>
              <p className="text-muted-foreground text-sm">Manage studio staff and their working schedules</p>
            </div>
          </div>
          <AddMasterButton onClick={() => setAddOpen(true)} />
        </div>
      </div>

      <div className="flex-1 p-6">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner className="h-6 w-6" />
          </div>
        ) : error ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
            <p className="text-destructive font-medium">Failed to load masters</p>
            <p className="text-muted-foreground text-sm">Please try refreshing the page</p>
          </div>
        ) : masters && masters.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {masters.map((master) => (
              <MasterCard key={master.id} master={master} />
            ))}
          </div>
        ) : (
          <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
            <div className="bg-muted flex h-14 w-14 items-center justify-center rounded-full">
              <Users className="text-muted-foreground h-7 w-7" />
            </div>
            <div>
              <p className="font-medium">No masters yet</p>
              <p className="text-muted-foreground text-sm">Add your first master to get started</p>
            </div>
            <AddMasterButton onClick={() => setAddOpen(true)} variant="outline" className="mt-1" />
          </div>
        )}
      </div>

      <MasterForm open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
