export type ServiceCategory = "manicure" | "pedicure" | "other";

export type Service = {
  id: number;
  name: string;
  description?: string | null;
  category: ServiceCategory;
  price: string;
  duration_minutes: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateServiceInput = {
  name: string;
  description?: string | null;
  category: ServiceCategory;
  price: string;
  duration_minutes: number;
};

export type UpdateServiceInput = Partial<CreateServiceInput>;
