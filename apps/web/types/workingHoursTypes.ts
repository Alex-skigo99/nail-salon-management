export type WorkingHours = {
  id: number;
  master_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

export type WorkingHoursRecord = {
  day_of_week: number;
  start_time: string;
  end_time: string;
};

export type ReplaceWorkingHoursInput = {
  master_id: number;
  records: WorkingHoursRecord[];
};
