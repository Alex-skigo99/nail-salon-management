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
import { useDeleteMaster } from "@/hooks/useMasters";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  masterId: number;
  masterName: string;
};

export function DeleteMasterDialog({ open, onOpenChange, masterId, masterName }: Props) {
  const deleteMaster = useDeleteMaster();

  const handleConfirm = async () => {
    await deleteMaster.mutateAsync(masterId);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Master</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{masterName}</strong>? This action cannot be undone and will also
            remove all their working hours.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMaster.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleteMaster.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMaster.isPending && <Spinner className="mr-2 h-4 w-4" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
