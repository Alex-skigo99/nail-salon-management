export type SelectedSlot = {
  id: string;
  master: {
    id: number;
    name: string;
    description?: string | null;
  };
  date: string;
  time: string;
};
