"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { useDeleteService } from "@/hooks/useServices";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: number;
  serviceName: string;
};

export function DeleteServiceDialog({ open, onOpenChange, serviceId, serviceName }: Props) {
  const deleteService = useDeleteService();

  const handleConfirm = async () => {
    await deleteService.mutateAsync(serviceId);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Service</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <span className="font-semibold">&quot;{serviceName}&quot;</span>? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteService.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleteService.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteService.isPending && <Spinner className="mr-2 h-4 w-4" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
