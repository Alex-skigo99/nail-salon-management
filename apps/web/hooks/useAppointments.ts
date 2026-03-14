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
} from "@/types/appointmentTypes";

// ─── Queries ──────────────────────────────────────────

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
      const res = await apiClient.get<MasterSuggestion[]>(`${apiRoutes.appointment}/suggestions`, {
        params: masterId ? { masterId } : undefined,
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
    },
  });
}
