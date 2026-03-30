"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { ImageUpload } from "@/components/ImageUpload";
import { useCreateMaster, useUpdateMaster } from "@/hooks/useMasters";
import type { Master } from "@/types/masterTypes";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  master?: Master | null;
};

export function MasterForm({ open, onOpenChange, master }: Props) {
  const isEditing = !!master;
  const createMaster = useCreateMaster();
  const updateMaster = useUpdateMaster();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (open) {
      setName(master?.name ?? "");
      setDescription(master?.description ?? "");
      setImage(master?.image ?? null);
    }
  }, [open, master]);

  const isPending = createMaster.isPending || updateMaster.isPending;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEditing && master) {
      await updateMaster.mutateAsync({
        id: master.id,
        data: { name: name.trim(), description: description.trim() || null, image },
      });
    } else {
      await createMaster.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        image,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={`${open ? "open" : "closed"}-${master?.id ?? "new"}`} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Master" : "Add Master"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center">
            <ImageUpload
              currentImageUrl={isEditing ? master?.image : image ? undefined : null}
              name={name}
              entityType="master-photo"
              entityId={master?.id}
              onUpload={(key) => setImage(key)}
              size="lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="master-name">Name</Label>
            <Input
              id="master-name"
              placeholder="Master's name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="master-description">Description</Label>
            <Textarea
              id="master-description"
              placeholder="Specialization, bio, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              rows={3}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending && <Spinner className="mr-2 h-4 w-4" />}
              {isEditing ? "Save Changes" : "Add Master"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
