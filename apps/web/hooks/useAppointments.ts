import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { queryKeys } from "./queryKeys";
import { apiRoutes } from "@/const/apiRouts";
import type {
  Appointment,
  AppointmentCreate,
  AppointmentUpdate,
  AppointmentReschedule,
  DaySlots,
  MasterSuggestion,
  AppointmentRetrieve,
  PaginatedAppointmentsOfUser,
} from "@/types/appointmentTypes";

// ─── Queries ──────────────────────────────────────────

export function useMasterEmptySlots(masterId: number | null, date: string) {
  return useQuery({
    queryKey: [queryKeys.emptySlots, masterId, date],
    queryFn: async () => {
      const res = await apiClient.get<DaySlots[]>(`${apiRoutes.appointment}/master/${masterId}/empty_slots`, {
        params: { from: date, to: date },
      });
      return res.data;
    },
    enabled: !!masterId && !!date,
  });
}

export function useMasterSlots(masterId: number | null, from: string, to: string) {
  return useQuery({
    queryKey: [queryKeys.slots, masterId, from, to],
    queryFn: async () => {
      const res = await apiClient.get<DaySlots[]>(`${apiRoutes.appointment}/master/${masterId}/slots`, {
        params: { from, to },
      });
      return res.data;
    },
    enabled: !!masterId && !!from && !!to,
  });
}

export function useMasterAppointments(masterId: number | null, from: string, to: string) {
  return useQuery({
    queryKey: [queryKeys.appointments, masterId, from, to],
    queryFn: async () => {
      const res = await apiClient.get<Appointment[]>(`${apiRoutes.appointment}/master/${masterId}`, {
        params: { from, to },
      });
      return res.data;
    },
    enabled: !!masterId && !!from && !!to,
  });
}

export function useAppointmentSuggestions(masterId?: number) {
  return useQuery({
    queryKey: [queryKeys.appointmentSuggestions, masterId ?? null],
    queryFn: async () => {
      const now = new Date();
      const NowDate = now.toISOString().slice(0, 10);
      const NowTime = now.toISOString().slice(11, 16);
      const res = await apiClient.get<MasterSuggestion[]>(`${apiRoutes.appointment}/suggestions`, {
        params: { NowDate, NowTime, ...(masterId ? { masterId } : {}) },
      });
      return res.data;
    },
  });
}

// ─── Mutations ────────────────────────────────────────

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AppointmentCreate) => {
      const res = await apiClient.post<Appointment>(apiRoutes.appointment, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.slots] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.appointments] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.appointmentSuggestions] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.emptySlots] });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AppointmentUpdate }) => {
      const res = await apiClient.put<Appointment>(`${apiRoutes.appointment}/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.slots] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.appointments] });
    },
  });
}

export function useRescheduleAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AppointmentReschedule }) => {
      const res = await apiClient.put<Appointment>(`${apiRoutes.appointment}/${id}/reschedule`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.slots] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.appointments] });
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${apiRoutes.appointment}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.slots] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.appointments] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.userAppointments] });
    },
  });
}

// ─── User Appointments ────────────────────────────────

export function useUserAppointments(
  userId: string | undefined,
  params: { from?: string; to?: string; page?: number; perPage?: number }
) {
  return useQuery({
    queryKey: [queryKeys.userAppointments, userId, params],
    queryFn: async () => {
      const res = await apiClient.get<PaginatedAppointmentsOfUser>(`${apiRoutes.appointment}/user/${userId}`, {
        params,
      });
      return res.data;
    },
    enabled: !!userId,
  });
}

export function useUpdateAppointmentComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, comments }: { id: number; comments: string }) => {
      const res = await apiClient.patch<Appointment>(`${apiRoutes.appointment}/${id}`, {
        comments,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.userAppointments] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.appointments] });
    },
  });
}
