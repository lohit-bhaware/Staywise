import api from './axios';
import { Booking, CreateBookingRequest, PagedResponse } from '../types';

export const bookingsApi = {
  create: async (data: CreateBookingRequest): Promise<Booking> => {
    const response = await api.post<Booking>('/bookings', data);
    return response.data;
  },

  getMyBookings: async (): Promise<Booking[]> => {
    const response = await api.get<Booking[]>('/bookings/my');
    return response.data;
  },

  getById: async (id: number): Promise<Booking> => {
    const response = await api.get<Booking>(`/bookings/${id}`);
    return response.data;
  },

  cancel: async (id: number): Promise<Booking> => {
    const response = await api.put<Booking>(`/bookings/${id}/cancel`);
    return response.data;
  },

  getAllBookings: async (page = 0, size = 20): Promise<PagedResponse<Booking>> => {
    const response = await api.get<PagedResponse<Booking>>('/bookings', { params: { page, size } });
    return response.data;
  },
};
