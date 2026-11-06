import api from './axios';
import { Hotel, HotelSearchResult, Room, PagedResponse, HotelSearchParams, CreateHotelRequest, CreateRoomRequest } from '../types';

export const hotelsApi = {
  search: async (params: HotelSearchParams): Promise<PagedResponse<HotelSearchResult>> => {
    const response = await api.get<HotelSearchResult[]>('/hotels', { params });
    // Backend returns a plain array; normalize to PagedResponse shape for the UI
    const content = Array.isArray(response.data) ? response.data : [];
    return { content, page: 0, size: content.length, totalElements: content.length, totalPages: 1 };
  },

  getById: async (id: number): Promise<Hotel> => {
    const response = await api.get<Hotel>(`/hotels/${id}`);
    return response.data;
  },

  getRooms: async (id: number, checkIn?: string, checkOut?: string): Promise<Room[]> => {
    const response = await api.get<Room[]>(`/hotels/${id}/rooms`, {
      params: { checkIn, checkOut },
    });
    return response.data;
  },

  getRoomById: async (id: number): Promise<Room> => {
    const response = await api.get<Room>(`/rooms/${id}`);
    return response.data;
  },

  getAll: async (page = 0, size = 20): Promise<PagedResponse<Hotel>> => {
    const response = await api.get<PagedResponse<Hotel>>('/hotels/all', { params: { page, size } });
    return response.data;
  },

  create: async (data: CreateHotelRequest): Promise<Hotel> => {
    const response = await api.post<Hotel>('/hotels', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateHotelRequest>): Promise<Hotel> => {
    const response = await api.put<Hotel>(`/hotels/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/hotels/${id}`);
  },

  createRoom: async (data: CreateRoomRequest): Promise<Room> => {
    const response = await api.post<Room>('/rooms', data);
    return response.data;
  },

  updateRoom: async (id: number, data: Partial<CreateRoomRequest>): Promise<Room> => {
    const response = await api.put<Room>(`/rooms/${id}`, data);
    return response.data;
  },

  deleteRoom: async (id: number): Promise<void> => {
    await api.delete(`/rooms/${id}`);
  },

  getAllRooms: async (page = 0, size = 20): Promise<PagedResponse<Room>> => {
    const response = await api.get<PagedResponse<Room>>('/rooms', { params: { page, size } });
    return response.data;
  },
};
