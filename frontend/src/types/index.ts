// ─── Core Entities ───────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
}

export interface Hotel {
  id: number;
  name: string;
  city: string;
  area: string;
  address: string;
  description: string;
  stars: number;
  mainImageUrl: string;
  amenities: string[];
  avgRating: number;
  reviewCount: number;
}

export interface HotelSearchResult {
  hotel: Hotel;
  score: number;
  rankReason: string;
}

export interface Room {
  id: number;
  hotelId: number;
  name: string;
  type: string;
  pricePerNight: number;
  capacity: number;
  description: string;
  imageUrl: string;
  amenities: string[];
  isActive: boolean;
  available?: boolean;
}

export interface Booking {
  id: number;
  room: Room;
  hotel: Hotel;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'PENDING';
  guestCount: number;
  createdAt: string;
}

export interface Review {
  id: number;
  userId: number;
  userName: string;
  hotelId: number;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
}

// ─── Paged Response ───────────────────────────────────────────────────────────

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// ─── Booking Requests ─────────────────────────────────────────────────────────

export interface CreateBookingRequest {
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
}

// ─── Review Requests ──────────────────────────────────────────────────────────

export interface CreateReviewRequest {
  hotelId: number;
  rating: number;
  title: string;
  body: string;
}

// ─── Search / Filter ──────────────────────────────────────────────────────────

export interface HotelSearchParams {
  query?: string;
  city?: string;
  page?: number;
  size?: number;
  sortBy?: 'relevance' | 'price_asc' | 'rating_desc';
  stars?: number[];
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface CreateHotelRequest {
  name: string;
  city: string;
  area: string;
  address: string;
  description: string;
  stars: number;
  mainImageUrl: string;
  amenities: string[];
}

export interface CreateRoomRequest {
  hotelId: number;
  name: string;
  type: string;
  pricePerNight: number;
  capacity: number;
  description: string;
  imageUrl: string;
  amenities: string[];
}
