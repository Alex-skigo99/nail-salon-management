export type Master = {
  id: number;
  name: string;
  description?: string | null;
  image?: string | null;
};

export type CreateMasterInput = {
  name: string;
  description?: string;
  image?: string | null;
};

export type UpdateMasterInput = {
  name?: string;
  description?: string | null;
  image?: string | null;
};
