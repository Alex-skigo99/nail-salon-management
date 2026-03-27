"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import SelectInput from "@/components/inputs/SelectInput";
import { useUser, useCreateUser, useUpdateUser, useDeleteUser } from "@/hooks/useUsers";
import { useMasters } from "@/hooks/useMasters";
import { Trash2 } from "lucide-react";
import { ChangePasswordSection } from "./_components/ChangePasswordSection";

const createSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email"),
    phone: z.string().optional(),
    role: z.enum(["ADMIN", "USER"]),
    master_id: z.string().optional(),
    email_subscribed: z.boolean(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

const updateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email"),
  phone: z.string().optional(),
  role: z.enum(["ADMIN", "USER"]),
  master_id: z.string().optional(),
  email_subscribed: z.boolean(),
});

type CreateFormValues = z.input<typeof createSchema>;
type UpdateFormValues = z.input<typeof updateSchema>;

type UserCreateUpdateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
};

export function UserCreateUpdateDialog({ open, onOpenChange, userId }: UserCreateUpdateDialogProps) {
  const isEditMode = !!userId;
  const { data: user, isLoading: userLoading } = useUser(userId);
  const { data: masters = [] } = useMasters();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);

  const NONE = "__none__";

  const masterOptions = [
    { value: NONE, label: "None" },
    ...masters.map((m) => ({ value: String(m.id), label: m.name })),
  ];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateFormValues | UpdateFormValues>({
    resolver: zodResolver(isEditMode ? updateSchema : createSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "USER",
      master_id: NONE,
      email_subscribed: false,
      ...(isEditMode ? {} : { password: "", confirmPassword: "" }),
    },
  });

  useEffect(() => {
    if (isEditMode && user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        role: user.role,
        master_id: user.master_data?.id ? String(user.master_data.id) : NONE,
        email_subscribed: user.email_subscribed ?? false,
      });
      setNewPassword(null);
    } else if (!isEditMode && open) {
      reset({
        name: "",
        email: "",
        phone: "",
        role: "USER",
        master_id: NONE,
        email_subscribed: false,
        password: "",
        confirmPassword: "",
      });
      setNewPassword(null);
    }
  }, [isEditMode, user, open, reset]);

  const onSubmit = async (data: CreateFormValues | UpdateFormValues) => {
    try {
      const masterId = data.master_id && data.master_id !== NONE ? Number(data.master_id) : null;

      if (isEditMode && userId) {
        await updateMutation.mutateAsync({
          id: userId,
          data: {
            name: data.name,
            email: data.email,
            phone: data.phone || null,
            role: data.role,
            master_id: masterId,
            email_subscribed: data.email_subscribed,
            password: newPassword,
          },
        });
        toast.success("User updated");
      } else {
        const createData = data as CreateFormValues;
        await createMutation.mutateAsync({
          name: createData.name,
          email: createData.email,
          password: createData.password,
          phone: createData.phone || null,
          role: createData.role,
          master_id: masterId,
          email_subscribed: createData.email_subscribed,
        });
        toast.success("User created");
      }
      onOpenChange(false);
    } catch {
      toast.error(isEditMode ? "Failed to update user" : "Failed to create user");
    }
  };

  const handleDelete = async () => {
    if (!userId) return;
    try {
      await deleteMutation.mutateAsync(userId);
      toast.success("User deleted");
      setDeleteConfirmOpen(false);
      onOpenChange(false);
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setNewPassword(null);
    }
    onOpenChange(val);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const role = watch("role") as string;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit User" : "Create User"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update user details" : "Fill in the details to create a new user"}
            </DialogDescription>
          </DialogHeader>

          {isEditMode && userLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Spinner className="h-6 w-6" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 py-2">
              <div className="grid gap-1.5">
                <Label htmlFor="user-name">Name</Label>
                <Input id="user-name" {...register("name")} />
                {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="user-email">Email</Label>
                <Input id="user-email" type="email" {...register("email")} />
                {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="user-phone">Phone</Label>
                <Input id="user-phone" {...register("phone")} />
              </div>

              <div className="grid gap-1.5">
                <Label>Role</Label>
                <SelectInput
                  value={role}
                  onValueChange={(val) => setValue("role", val as "ADMIN" | "USER")}
                  options={[
                    { value: "USER", label: "User" },
                    { value: "ADMIN", label: "Admin" },
                  ]}
                  placeholder="Select role"
                  triggerClassName="w-full cursor-pointer"
                />
              </div>

              <div className="grid gap-1.5">
                <Label>Master</Label>
                <SelectInput
                  value={watch("master_id") ?? NONE}
                  onValueChange={(val) => setValue("master_id", val)}
                  options={masterOptions}
                  placeholder="Select master"
                  triggerClassName="w-full cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="email-subscribed"
                  checked={watch("email_subscribed")}
                  onCheckedChange={(checked) => setValue("email_subscribed", !!checked)}
                />
                <Label htmlFor="email-subscribed" className="cursor-pointer text-sm">
                  Email subscribed
                </Label>
              </div>

              {!isEditMode && (
                <>
                  <div className="grid gap-1.5">
                    <Label htmlFor="user-password">Password</Label>
                    <Input id="user-password" type="password" {...register("password" as keyof CreateFormValues)} />
                    {"password" in errors && errors.password && (
                      <p className="text-xs text-red-600">{errors.password.message}</p>
                    )}
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="user-confirm-password">Confirm Password</Label>
                    <Input
                      id="user-confirm-password"
                      type="password"
                      {...register("confirmPassword" as keyof CreateFormValues)}
                    />
                    {"confirmPassword" in errors && errors.confirmPassword && (
                      <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </>
              )}

              {isEditMode && <ChangePasswordSection value={newPassword} onChange={setNewPassword} />}

              <DialogFooter className="mt-2 flex flex-col gap-2 sm:flex-row">
                {isEditMode && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteConfirmOpen(true)}
                    className="mr-auto"
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Spinner className="mr-2 h-4 w-4" />}
                  {isEditMode ? "Save Changes" : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Spinner className="mr-2 h-4 w-4" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
