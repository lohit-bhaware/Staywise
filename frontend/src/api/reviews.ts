import api from './axios';
import { Review, CreateReviewRequest, PagedResponse } from '../types';

export const reviewsApi = {
  getByHotel: async (hotelId: number, page = 0, size = 10): Promise<PagedResponse<Review>> => {
    const response = await api.get<PagedResponse<Review>>(`/hotels/${hotelId}/reviews`, {
      params: { page, size },
    });
    return response.data;
  },

  create: async (data: CreateReviewRequest): Promise<Review> => {
    const response = await api.post<Review>('/reviews', data);
    return response.data;
  },

  getMyReviews: async (): Promise<Review[]> => {
    const response = await api.get<Review[]>('/reviews/my');
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/reviews/${id}`);
  },
};
