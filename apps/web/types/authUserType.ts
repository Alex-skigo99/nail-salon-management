export type AuthUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  image: string | null;
  isGoogleAuth: boolean;
  last_login: string | null;
  created_at: string;
};

export type UpdateMeInput = {
  name?: string;
  email?: string;
  phone?: string;
  oldPassword?: string;
  newPassword?: string;
};
