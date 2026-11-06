import api from './axios';
import { Hotel, Room, Booking, PagedResponse, CreateHotelRequest, CreateRoomRequest } from '../types';

export interface UserSummary {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export const adminApi = {
  // Hotels
  getHotels: async (): Promise<Hotel[]> => {
    const response = await api.get<Hotel[]>('/admin/hotels');
    return response.data;
  },

  createHotel: async (data: CreateHotelRequest): Promise<Hotel> => {
    const response = await api.post<Hotel>('/admin/hotels', data);
    return response.data;
  },

  updateHotel: async (id: number, data: Partial<CreateHotelRequest>): Promise<Hotel> => {
    const response = await api.put<Hotel>(`/admin/hotels/${id}`, data);
    return response.data;
  },

  // Rooms
  addRoom: async (hotelId: number, data: CreateRoomRequest): Promise<Room> => {
    const response = await api.post<Room>(`/admin/hotels/${hotelId}/rooms`, data);
    return response.data;
  },

  updateRoom: async (id: number, data: Partial<CreateRoomRequest>): Promise<Room> => {
    const response = await api.put<Room>(`/admin/rooms/${id}`, data);
    return response.data;
  },

  // Bookings
  getBookings: async (page = 0, size = 20): Promise<PagedResponse<Booking>> => {
    const response = await api.get<PagedResponse<Booking>>('/admin/bookings', {
      params: { page, size },
    });
    return response.data;
  },

  // Users
  getUsers: async (): Promise<UserSummary[]> => {
    const response = await api.get<UserSummary[]>('/admin/users');
    return response.data;
  },
};

