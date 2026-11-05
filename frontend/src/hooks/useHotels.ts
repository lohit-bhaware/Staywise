import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { hotelsApi } from '../api/hotels';
import { HotelSearchParams } from '../types';

export function useHotelSearch(params: HotelSearchParams, enabled = true) {
  return useQuery({
    queryKey: ['hotels', 'search', params],
    queryFn: () => hotelsApi.search(params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
  });
}

export function useHotel(id: number) {
  return useQuery({
    queryKey: ['hotels', id],
    queryFn: () => hotelsApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useHotelRooms(id: number, checkIn?: string, checkOut?: string) {
  return useQuery({
    queryKey: ['hotels', id, 'rooms', checkIn, checkOut],
    queryFn: () => hotelsApi.getRooms(id, checkIn, checkOut),
    enabled: !!id,
    staleTime: 1000 * 60 * 1,
  });
}

export function useAllHotels(page = 0, size = 20) {
  return useQuery({
    queryKey: ['hotels', 'all', page, size],
    queryFn: () => hotelsApi.getAll(page, size),
    staleTime: 1000 * 60 * 5,
  });
}

export function useDeleteHotel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => hotelsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
    },
  });
}
