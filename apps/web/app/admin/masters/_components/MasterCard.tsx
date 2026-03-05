"use client";

import { useState } from "react";
import { Pencil, Trash2, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card";
import type { Master } from "@/types/masterTypes";
import { MasterForm } from "./MasterForm";
import { DeleteMasterDialog } from "./DeleteMasterDialog";
import { WorkingHoursSection } from "./WorkingHoursSection";

type Props = {
  master: Master;
};

export function MasterCard({ master }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Card className="shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex w-full items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <UserCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="truncate font-semibold">{master.name}</CardTitle>
                {master.description ? (
                  <CardDescription className="mt-0.5 line-clamp-2 text-sm">{master.description}</CardDescription>
                ) : (
                  <CardDescription className="mt-0.5 text-sm italic">No description</CardDescription>
                )}
              </div>
            </div>
            <CardAction>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setEditOpen(true)}
                  title="Edit master"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive h-8 w-8"
                  onClick={() => setDeleteOpen(true)}
                  title="Delete master"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardAction>
          </div>
        </CardHeader>

        <Separator className="mb-3" />

        <CardContent>
          <WorkingHoursSection masterId={master.id} masterName={master.name} />
        </CardContent>
      </Card>

      <MasterForm open={editOpen} onOpenChange={setEditOpen} master={master} />
      <DeleteMasterDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        masterId={master.id}
        masterName={master.name}
      />
    </>
  );
}
