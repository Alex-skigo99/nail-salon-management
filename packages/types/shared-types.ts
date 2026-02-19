// Shared TypeScript interfaces and types

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'staff' | 'client';
}


export interface Appointment {
  id: number;
  clientId: number;
  staffId: number;
  serviceId: number;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}


export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
}
