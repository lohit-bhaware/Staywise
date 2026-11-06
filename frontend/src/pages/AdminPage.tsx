import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import {
  Building2,
  BedDouble,
  CalendarDays,
  Users,
  Plus,
  Edit2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { adminApi, UserSummary } from '../api/admin';
import { hotelsApi } from '../api/hotels';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { Hotel, Room, Booking, CreateHotelRequest, CreateRoomRequest, RoomType } from '../types';

// ── Tab type ─────────────────────────────────────────────────────────────────

type Tab = 'hotels' | 'rooms' | 'bookings' | 'users';

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'hotels', label: 'Hotels', icon: <Building2 size={16} /> },
  { key: 'rooms', label: 'Rooms', icon: <BedDouble size={16} /> },
  { key: 'bookings', label: 'Bookings', icon: <CalendarDays size={16} /> },
  { key: 'users', label: 'Users', icon: <Users size={16} /> },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const statusVariant = (status: string) => {
  switch (status) {
    case 'CONFIRMED': return 'success';
    case 'COMPLETED': return 'info';
    case 'CANCELLED': return 'error';
    default: return 'warning';
  }
};

const AMENITY_OPTIONS = [
  'Free WiFi', 'Swimming Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Room Service',
  'Valet Parking', 'Airport Shuttle', 'Business Center', 'Concierge', 'Laundry',
  'Pet Friendly', 'Kids Club', 'Beachfront',
];

const ROOM_TYPE_OPTIONS: RoomType[] = ['STANDARD', 'DELUXE', 'SUITE', 'FAMILY'];

// ── Hotel Form ────────────────────────────────────────────────────────────────

interface HotelFormProps {
  initial?: Hotel;
  onSave: (data: CreateHotelRequest) => void;
  onClose: () => void;
  saving: boolean;
  error?: string;
}

const HotelForm: React.FC<HotelFormProps> = ({ initial, onSave, onClose, saving, error }) => {
  const [form, setForm] = useState<CreateHotelRequest>({
    name: initial?.name ?? '',
    city: initial?.city ?? '',
    area: initial?.area ?? '',
    address: initial?.address ?? '',
    description: initial?.description ?? '',
    stars: initial?.stars ?? 3,
    mainImageUrl: initial?.mainImageUrl ?? '',
    amenities: initial?.amenities ?? [],
  });

  const set = (k: keyof CreateHotelRequest) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((p) => ({ ...p, [k]: k === 'stars' ? Number(e.target.value) : e.target.value }));
  };

  const toggleAmenity = (a: string) =>
    setForm((p) => ({
      ...p,
      amenities: p.amenities.includes(a)
        ? p.amenities.filter((x) => x !== a)
        : [...p.amenities, a],
    }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      {error && (
        <p className="text-sm text-error bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-text-primary mb-1.5">Hotel Name</label>
          <input value={form.name} onChange={set('name')} required placeholder="e.g. The Grand Hyatt"
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">City</label>
          <input value={form.city} onChange={set('city')} required placeholder="Mumbai"
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Area</label>
          <input value={form.area} onChange={set('area')} required placeholder="Bandra Kurla Complex"
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-text-primary mb-1.5">Address</label>
          <input value={form.address} onChange={set('address')} required placeholder="123, MG Road…"
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Star Rating</label>
          <select value={form.stars} onChange={set('stars')}
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
            {[1, 2, 3, 4, 5].map((s) => (
              <option key={s} value={s}>{s} Star{s > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Main Image URL</label>
          <input value={form.mainImageUrl} onChange={set('mainImageUrl')} placeholder="https://…"
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-text-primary mb-1.5">Description</label>
          <textarea value={form.description} onChange={set('description')} rows={3}
            placeholder="Describe the hotel…"
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-text-primary mb-2">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {AMENITY_OPTIONS.map((a) => (
              <button key={a} type="button" onClick={() => toggleAmenity(a)}
                className={[
                  'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                  form.amenities.includes(a)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-text-secondary border-border hover:border-primary',
                ].join(' ')}>
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" className="flex-1" onClick={onClose} type="button">Cancel</Button>
        <Button className="flex-1" type="submit" loading={saving}>
          {initial ? 'Update Hotel' : 'Create Hotel'}
        </Button>
      </div>
    </form>
  );
};

// ── Room Form ─────────────────────────────────────────────────────────────────

interface RoomFormProps {
  hotelId: number;
  initial?: Room;
  onSave: (data: CreateRoomRequest) => void;
  onClose: () => void;
  saving: boolean;
  error?: string;
}

const RoomForm: React.FC<RoomFormProps> = ({ hotelId, initial, onSave, onClose, saving, error }) => {
  const [form, setForm] = useState<CreateRoomRequest>({
    hotelId,
    name: initial?.name ?? '',
    type: initial?.type ?? 'STANDARD',
    pricePerNight: initial?.pricePerNight ?? 5000,
    capacity: initial?.capacity ?? 2,
    description: initial?.description ?? '',
    imageUrl: initial?.imageUrl ?? '',
    amenities: initial?.amenities ?? [],
  });

  const set = (k: keyof CreateRoomRequest) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = ['pricePerNight', 'capacity'].includes(k as string) ? Number(e.target.value) : e.target.value;
    setForm((p) => ({ ...p, [k]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(form); };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      {error && (
        <p className="text-sm text-error bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-text-primary mb-1.5">Room Name</label>
          <input value={form.name} onChange={set('name')} required placeholder="e.g. Deluxe King Room"
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Type</label>
          <select value={form.type} onChange={set('type')}
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
            {ROOM_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Capacity</label>
          <input type="number" min={1} max={10} value={form.capacity} onChange={set('capacity')}
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-text-primary mb-1.5">Price per Night (₹)</label>
          <input type="number" min={500} value={form.pricePerNight} onChange={set('pricePerNight')}
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-text-primary mb-1.5">Image URL</label>
          <input value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://…"
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-text-primary mb-1.5">Description</label>
          <textarea value={form.description} onChange={set('description')} rows={2}
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" className="flex-1" onClick={onClose} type="button">Cancel</Button>
        <Button className="flex-1" type="submit" loading={saving}>
          {initial ? 'Update Room' : 'Add Room'}
        </Button>
      </div>
    </form>
  );
};

// ── Hotels Tab ────────────────────────────────────────────────────────────────

const HotelsTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Hotel | null>(null);
  const [formError, setFormError] = useState('');

  const { data: hotels, isLoading } = useQuery({
    queryKey: ['admin-hotels'],
    queryFn: adminApi.getHotels,
  });

  const createMutation = useMutation({
    mutationFn: adminApi.createHotel,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-hotels'] }); closeModal(); },
    onError: (e: { response?: { data?: { message?: string } } }) =>
      setFormError(e?.response?.data?.message || 'Failed to create hotel'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateHotelRequest> }) =>
      adminApi.updateHotel(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-hotels'] }); closeModal(); },
    onError: (e: { response?: { data?: { message?: string } } }) =>
      setFormError(e?.response?.data?.message || 'Failed to update hotel'),
  });

  const closeModal = () => { setModalOpen(false); setEditTarget(null); setFormError(''); };

  const handleSave = (data: CreateHotelRequest) => {
    setFormError('');
    if (editTarget) updateMutation.mutate({ id: editTarget.id, data });
    else createMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-text-secondary">{hotels?.length ?? 0} hotels</p>
        <Button size="sm" leftIcon={<Plus size={15} />} onClick={() => { setEditTarget(null); setModalOpen(true); }}>
          Add Hotel
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-border">
              <th className="text-left px-4 py-3 font-semibold text-text-primary">Hotel</th>
              <th className="text-left px-4 py-3 font-semibold text-text-primary">City</th>
              <th className="text-left px-4 py-3 font-semibold text-text-primary">Stars</th>
              <th className="text-left px-4 py-3 font-semibold text-text-primary">Rating</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {hotels?.map((hotel, idx) => (
              <tr key={hotel.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                <td className="px-4 py-3 font-medium text-text-primary">{hotel.name}</td>
                <td className="px-4 py-3 text-text-secondary">{hotel.city}</td>
                <td className="px-4 py-3 text-text-secondary">{'★'.repeat(hotel.stars)}</td>
                <td className="px-4 py-3 text-text-secondary">
                  {hotel.avgRating > 0 ? `${hotel.avgRating} (${hotel.reviewCount})` : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => { setEditTarget(hotel); setModalOpen(true); }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-text-secondary hover:text-primary transition-colors"
                  >
                    <Edit2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editTarget ? 'Edit Hotel' : 'Add Hotel'}
        size="lg"
      >
        <HotelForm
          initial={editTarget ?? undefined}
          onSave={handleSave}
          onClose={closeModal}
          saving={createMutation.isPending || updateMutation.isPending}
          error={formError}
        />
      </Modal>
    </div>
  );
};

// ── Rooms Tab ─────────────────────────────────────────────────────────────────

const RoomsTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Room | null>(null);
  const [formError, setFormError] = useState('');

  const { data: hotels, isLoading: hotelsLoading } = useQuery({
    queryKey: ['admin-hotels'],
    queryFn: adminApi.getHotels,
  });

  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['hotel-rooms', selectedHotelId],
    queryFn: () => hotelsApi.getRooms(selectedHotelId!),
    enabled: !!selectedHotelId,
  });

  const addMutation = useMutation({
    mutationFn: (data: CreateRoomRequest) => adminApi.addRoom(selectedHotelId!, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['hotel-rooms', selectedHotelId] }); closeModal(); },
    onError: (e: { response?: { data?: { message?: string } } }) =>
      setFormError(e?.response?.data?.message || 'Failed to add room'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateRoomRequest> }) =>
      adminApi.updateRoom(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['hotel-rooms', selectedHotelId] }); closeModal(); },
    onError: (e: { response?: { data?: { message?: string } } }) =>
      setFormError(e?.response?.data?.message || 'Failed to update room'),
  });

  const closeModal = () => { setModalOpen(false); setEditTarget(null); setFormError(''); };

  const handleSave = (data: CreateRoomRequest) => {
    setFormError('');
    if (editTarget) updateMutation.mutate({ id: editTarget.id, data });
    else addMutation.mutate(data);
  };

  return (
    <div>
      {/* Hotel selector */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-text-primary mb-2">Select Hotel</label>
        {hotelsLoading ? (
          <Skeleton className="h-10 w-64 rounded-xl" />
        ) : (
          <select
            value={selectedHotelId ?? ''}
            onChange={(e) => setSelectedHotelId(Number(e.target.value) || null)}
            className="w-64 rounded-xl border border-border px-3 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
          >
            <option value="">— Choose a hotel —</option>
            {hotels?.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        )}
      </div>

      {selectedHotelId && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-text-secondary">{rooms?.length ?? 0} rooms</p>
            <Button size="sm" leftIcon={<Plus size={15} />} onClick={() => { setEditTarget(null); setModalOpen(true); }}>
              Add Room
            </Button>
          </div>

          {roomsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-border">
                    <th className="text-left px-4 py-3 font-semibold text-text-primary">Room</th>
                    <th className="text-left px-4 py-3 font-semibold text-text-primary">Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-text-primary">Price/night</th>
                    <th className="text-left px-4 py-3 font-semibold text-text-primary">Capacity</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {rooms?.map((room, idx) => (
                    <tr key={room.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="px-4 py-3 font-medium text-text-primary">{room.name}</td>
                      <td className="px-4 py-3"><Badge variant="info" size="sm">{room.type}</Badge></td>
                      <td className="px-4 py-3 text-text-secondary font-medium">₹{room.pricePerNight.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-text-secondary">{room.capacity} guests</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => { setEditTarget(room); setModalOpen(true); }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-text-secondary hover:text-primary transition-colors"
                        >
                          <Edit2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {selectedHotelId && (
        <Modal
          isOpen={modalOpen}
          onClose={closeModal}
          title={editTarget ? 'Edit Room' : 'Add Room'}
          size="md"
        >
          <RoomForm
            hotelId={selectedHotelId}
            initial={editTarget ?? undefined}
            onSave={handleSave}
            onClose={closeModal}
            saving={addMutation.isPending || updateMutation.isPending}
            error={formError}
          />
        </Modal>
      )}
    </div>
  );
};

// ── Bookings Tab ──────────────────────────────────────────────────────────────

const BookingsTab: React.FC = () => {
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-bookings', page],
    queryFn: () => adminApi.getBookings(page, PAGE_SIZE),
    placeholderData: (prev) => prev,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-text-secondary">
          {data?.totalElements ?? 0} total bookings
          {isFetching && <RefreshCw size={12} className="inline ml-2 animate-spin" />}
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-border">
              <th className="text-left px-4 py-3 font-semibold text-text-primary">#</th>
              <th className="text-left px-4 py-3 font-semibold text-text-primary">Hotel</th>
              <th className="text-left px-4 py-3 font-semibold text-text-primary">Room</th>
              <th className="text-left px-4 py-3 font-semibold text-text-primary">Check-in</th>
              <th className="text-left px-4 py-3 font-semibold text-text-primary">Check-out</th>
              <th className="text-left px-4 py-3 font-semibold text-text-primary">Total</th>
              <th className="text-left px-4 py-3 font-semibold text-text-primary">Status</th>
            </tr>
          </thead>
          <tbody>
            {data?.content.map((booking: Booking, idx: number) => (
              <tr key={booking.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                <td className="px-4 py-3 text-text-secondary">#{booking.id}</td>
                <td className="px-4 py-3 font-medium text-text-primary">{booking.hotel?.name ?? '—'}</td>
                <td className="px-4 py-3 text-text-secondary">{booking.room?.name ?? '—'}</td>
                <td className="px-4 py-3 text-text-secondary">
                  {booking.checkInDate ? format(parseISO(booking.checkInDate), 'MMM d, yyyy') : '—'}
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {booking.checkOutDate ? format(parseISO(booking.checkOutDate), 'MMM d, yyyy') : '—'}
                </td>
                <td className="px-4 py-3 font-semibold text-text-primary">
                  ₹{booking.totalPrice?.toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant(booking.status)} size="sm">{booking.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-text-secondary">
            Page {page + 1} of {data.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ChevronLeft size={14} />}
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              rightIcon={<ChevronRight size={14} />}
              disabled={page >= data.totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Users Tab ─────────────────────────────────────────────────────────────────

const UsersTab: React.FC = () => {
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminApi.getUsers,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <p className="text-sm text-text-secondary">{users?.length ?? 0} registered users</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-border">
              <th className="text-left px-4 py-3 font-semibold text-text-primary">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-text-primary">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-text-primary">Role</th>
              <th className="text-left px-4 py-3 font-semibold text-text-primary">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user: UserSummary, idx: number) => (
              <tr key={user.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                <td className="px-4 py-3 font-medium text-text-primary">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-4 py-3 text-text-secondary">{user.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={user.role === 'ADMIN' ? 'warning' : 'info'} size="sm">
                    {user.role}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {user.createdAt ? format(parseISO(user.createdAt), 'MMM d, yyyy') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Admin Page ────────────────────────────────────────────────────────────────

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('hotels');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-text-primary">Curator & Property Console</h1>
          <p className="text-text-secondary text-sm mt-1">Manage luxury properties, suites, bookings, and member accounts</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar nav */}
          <aside className="lg:w-56 flex-shrink-0">
            <nav className="bg-white rounded-2xl border border-border shadow-card p-2 space-y-1">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={[
                    'w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs uppercase tracking-wider font-medium transition-all duration-150',
                    activeTab === tab.key
                      ? 'bg-primary text-white shadow-xs font-semibold'
                      : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary',
                  ].join(' ')}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 bg-white rounded-2xl border border-border shadow-card p-6 sm:p-8 min-h-[600px]">
            {activeTab === 'hotels' && <HotelsTab />}
            {activeTab === 'rooms' && <RoomsTab />}
            {activeTab === 'bookings' && <BookingsTab />}
            {activeTab === 'users' && <UsersTab />}
          </main>
        </div>
      </div>
    </div>
  );
};

