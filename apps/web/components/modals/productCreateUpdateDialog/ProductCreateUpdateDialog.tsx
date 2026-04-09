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
import InfoUserDialog from "@/components/modals/InfoUserDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import SelectInput from "@/components/inputs/SelectInput";
import { ImagePreview } from "@/components/elements/ImagePreview";
import { useProduct, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { Trash2 } from "lucide-react";
import type { ProductType } from "@/types/productTypes";
import { PRODUCT_TYPE_OPTIONS } from "@/const/productTypeOptions";
import { CURRENCY_SYMBOL } from "@/const/currency";
import { fetchPresignedUrl, uploadFileToS3 } from "@/utils/s3Utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  price: z.string().min(1, `Price is required (${CURRENCY_SYMBOL})`),
  discount: z.string().optional(),
  type: z.enum(PRODUCT_TYPE_OPTIONS.map((option) => option.value) as [ProductType, ...ProductType[]]),
  quantity: z.number().int().min(0, "Quantity must be 0 or more"),
  is_available: z.boolean(),
  is_home_display: z.boolean(),
  home_sorting: z.number().int().min(0, "Sort order must be 0 or more"),
  comment: z.string().optional(),
});

type FormValues = z.infer<typeof productSchema>;

type ProductCreateUpdateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string | null;
};

export function ProductCreateUpdateDialog({ open, onOpenChange, productId }: ProductCreateUpdateDialogProps) {
  const isEditMode = !!productId;
  const { data: product, isLoading: productLoading } = useProduct(productId);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      discount: "",
      type: "other",
      quantity: 0,
      is_available: true,
      is_home_display: false,
      home_sorting: 100,
      comment: "",
    },
  });

  useEffect(() => {
    if (isEditMode && product) {
      reset({
        title: product.title,
        description: product.description ?? "",
        price: product.price,
        discount: product.discount ?? "",
        type: product.type,
        quantity: product.quantity,
        is_available: product.is_available,
        is_home_display: product.is_home_display,
        home_sorting: product.home_sorting ?? 100,
        comment: product.comment ?? "",
      });
      setSelectedFile(null);
      setCurrentImageUrl(product.image);
    } else if (!isEditMode && open) {
      reset({
        title: "",
        description: "",
        price: "",
        discount: "",
        type: "other",
        quantity: 0,
        is_available: true,
        is_home_display: false,
        home_sorting: 100,
        comment: "",
      });
      setSelectedFile(null);
      setCurrentImageUrl(null);
    }
  }, [isEditMode, product, open, reset]);

  const onSubmit = async (data: FormValues) => {
    if (selectedFile) {
      if (!ALLOWED_MIME_TYPES.includes(selectedFile.type)) {
        toast.error("Only JPEG, PNG and WebP images are allowed");
        return;
      }
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast.error("Image must be smaller than 5 MB");
        return;
      }
    }

    try {
      const payload = {
        ...data,
        description: data.description || null,
        discount: data.discount || null,
        comment: data.comment || null,
      };

      if (isEditMode && productId) {
        if (selectedFile) {
          setIsUploadingImage(true);
          try {
            // Update product data and get presigned URL in parallel
            const [, presigned] = await Promise.all([
              updateMutation.mutateAsync({ id: productId, data: payload }),
              fetchPresignedUrl(productId, selectedFile),
            ]);
            await uploadFileToS3(presigned.uploadUrl, selectedFile);
            await updateMutation.mutateAsync({ id: productId, data: { image: presigned.key } });
          } finally {
            setIsUploadingImage(false);
          }
        } else {
          await updateMutation.mutateAsync({ id: productId, data: payload });
        }
        toast.success("Product updated");
      } else {
        const created = await createMutation.mutateAsync(payload);
        if (selectedFile) {
          setIsUploadingImage(true);
          try {
            const presigned = await fetchPresignedUrl(created.id, selectedFile);
            await uploadFileToS3(presigned.uploadUrl, selectedFile);
            await updateMutation.mutateAsync({ id: created.id, data: { image: presigned.key } });
          } finally {
            setIsUploadingImage(false);
          }
        }
        toast.success("Product created");
      }
      onOpenChange(false);
    } catch {
      toast.error(isEditMode ? "Failed to update product" : "Failed to create product");
    }
  };

  const handleDelete = async () => {
    if (!productId) return;
    try {
      await deleteMutation.mutateAsync(productId);
      toast.success("Product deleted");
      setDeleteConfirmOpen(false);
      onOpenChange(false);
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || isUploadingImage;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] w-full max-w-lg overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update product details" : "Fill in the details to add a new product"}
            </DialogDescription>
          </DialogHeader>

          {isEditMode && productLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Spinner className="h-6 w-6" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="py-2">
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-12">
                {/* Image column */}
                <div className="mx-auto w-full shrink-0 sm:mx-0 sm:w-96">
                  <ImagePreview
                    file={selectedFile}
                    currentImageUrl={currentImageUrl}
                    name={watch("title") || "Product"}
                    onFileSelect={setSelectedFile}
                  />
                </div>

                {/* Fields column */}
                <div className="flex flex-1 flex-col gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="product-title">Title</Label>
                    <Input id="product-title" {...register("title")} />
                    {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="product-description">Description</Label>
                    <Textarea id="product-description" rows={3} {...register("description")} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="product-price">Price ({CURRENCY_SYMBOL})</Label>
                      <Input id="product-price" type="number" step="0.01" min="0" {...register("price")} />
                      {errors.price && <p className="text-xs text-red-600">{errors.price.message}</p>}
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="product-discount">Discount ({CURRENCY_SYMBOL})</Label>
                      <Input id="product-discount" type="number" step="0.01" min="0" {...register("discount")} />
                    </div>
                  </div>

                  <div className="grid gap-1.5">
                    <Label>Type</Label>
                    <SelectInput
                      value={watch("type")}
                      onValueChange={(val) => setValue("type", val as ProductType)}
                      options={PRODUCT_TYPE_OPTIONS}
                      placeholder="Select type"
                      triggerClassName="w-full cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="product-quantity">Quantity</Label>
                      <Input
                        id="product-quantity"
                        type="number"
                        min="0"
                        {...register("quantity", { valueAsNumber: true })}
                      />
                      {errors.quantity && <p className="text-xs text-red-600">{errors.quantity.message}</p>}
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="product-home-sorting">Home Sort Order</Label>
                      <Input
                        id="product-home-sorting"
                        type="number"
                        min="0"
                        {...register("home_sorting", { valueAsNumber: true })}
                      />
                      {errors.home_sorting && <p className="text-xs text-red-600">{errors.home_sorting.message}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="product-available"
                        checked={watch("is_available")}
                        onCheckedChange={(checked) => setValue("is_available", !!checked)}
                      />
                      <Label htmlFor="product-available" className="cursor-pointer text-sm">
                        Available
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="product-home-display"
                        checked={watch("is_home_display")}
                        onCheckedChange={(checked) => setValue("is_home_display", !!checked)}
                      />
                      <Label htmlFor="product-home-display" className="cursor-pointer text-sm">
                        Show on Home
                      </Label>
                    </div>
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="product-comment">Admin Comment</Label>
                    <Textarea id="product-comment" rows={2} placeholder="Internal notes..." {...register("comment")} />
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row">
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
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Spinner className="mr-2 h-4 w-4" />}
                  {isEditMode ? "Save Changes" : "Add Product"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <InfoUserDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        type="confirm"
        title="Delete Product"
        infoText="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel={deleteMutation.isPending ? "Deleting..." : "Delete"}
        onConfirm={handleDelete}
      />
    </>
  );
}
