"use client";

import { useState } from "react";
import { Pencil, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Service } from "@/types/serviceTypes";
import { ServiceForm } from "./ServiceForm";
import { DeleteServiceDialog } from "./DeleteServiceDialog";

type Props = {
  service: Service;
};

export function ServiceRow({ service }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="group bg-card flex items-center gap-4 rounded-lg border px-4 py-3 transition-shadow hover:shadow-sm">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-medium">{service.name}</span>
            {service.description && (
              <span className="text-muted-foreground truncate text-sm">{service.description}</span>
            )}
          </div>
          <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
            <Clock className="h-3 w-3" />
            <span>{service.duration_minutes} min</span>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <span className="text-lg font-semibold">₪{service.price}</span>
        </div>

        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:cursor-pointer"
            onClick={() => setEditOpen(true)}
            title="Edit service"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive h-8 w-8 hover:cursor-pointer"
            onClick={() => setDeleteOpen(true)}
            title="Delete service"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ServiceForm open={editOpen} onOpenChange={setEditOpen} service={service} />
      <DeleteServiceDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        serviceId={service.id}
        serviceName={service.name}
      />
    </>
  );
}
