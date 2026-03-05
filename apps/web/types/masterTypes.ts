export type Master = {
  id: number;
  name: string;
  description?: string | null;
};

export type CreateMasterInput = {
  name: string;
  description?: string;
};

export type UpdateMasterInput = {
  name?: string;
  description?: string | null;
};
