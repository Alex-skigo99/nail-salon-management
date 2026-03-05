"use client";

import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateService, useUpdateService } from "@/hooks/useServices";
import type { Service, ServiceCategory } from "@/types/serviceTypes";
import { SERVICE_CATEGORY_LABELS } from "./serviceCategoryConfig";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
  defaultCategory?: ServiceCategory;
};

export function ServiceForm({ open, onOpenChange, service, defaultCategory }: Props) {
  const isEditing = !!service;
  const isMobile = useIsMobile();
  const createService = useCreateService();
  const updateService = useUpdateService();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ServiceCategory>(defaultCategory ?? "manicure");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");

  useEffect(() => {
    if (open) {
      setName(service?.name ?? "");
      setDescription(service?.description ?? "");
      setCategory(service?.category ?? defaultCategory ?? "manicure");
      setPrice(service?.price ?? "");
      setDuration(service ? String(service.duration_minutes) : "");
    }
  }, [open, service, defaultCategory]);

  const isPending = createService.isPending || updateService.isPending;
  const isValid = name.trim() && price.trim() && duration.trim() && Number(duration) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      category,
      price: price.trim(),
      duration_minutes: Number(duration),
    };

    if (isEditing && service) {
      await updateService.mutateAsync({ id: service.id, data: payload });
    } else {
      await createService.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isMobile ? "w-[95vw]" : "sm:max-w-md"}>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Service" : "Add Service"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service-name">Name</Label>
            <Input
              id="service-name"
              placeholder="Service name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ServiceCategory)} disabled={isPending}>
              <SelectTrigger id="service-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SERVICE_CATEGORY_LABELS) as ServiceCategory[]).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {SERVICE_CATEGORY_LABELS[cat].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service-price">Price</Label>
              <Input
                id="service-price"
                placeholder="e.g. 25.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={isPending}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-duration">Duration (min)</Label>
              <Input
                id="service-duration"
                type="number"
                min={1}
                placeholder="e.g. 60"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                disabled={isPending}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-description">Description</Label>
            <Textarea
              id="service-description"
              placeholder="Optional description"
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
            <Button type="submit" disabled={isPending || !isValid}>
              {isPending && <Spinner className="mr-2 h-4 w-4" />}
              {isEditing ? "Save Changes" : "Add Service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
