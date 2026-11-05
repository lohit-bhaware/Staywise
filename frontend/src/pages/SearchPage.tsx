import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search, SlidersHorizontal, X, Building2, ChevronDown, ChevronUp, LayoutGrid, List,
} from 'lucide-react';
import { useHotelSearch } from '../hooks/useHotels';
import { HotelCard } from '../components/hotel/HotelCard';
import { HotelCardSkeleton } from '../components/hotel/HotelCardSkeleton';
import { Button } from '../components/ui/Button';
import { HotelSearchParams } from '../types';

const AMENITY_OPTIONS = [
  'Free WiFi', 'Parking', 'Pool', 'Gym', 'Restaurant',
  'Spa', 'Room Service', 'Pet Friendly', 'Breakfast',
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'rating_desc', label: 'Top Rated' },
];

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [localQuery, setLocalQuery] = useState(searchParams.get('query') || '');
  const [filterOpen, setFilterOpen] = useState(false);

  const [filters, setFilters] = useState<HotelSearchParams>({
    query: searchParams.get('query') || '',
    city: searchParams.get('city') || '',
    sortBy: (searchParams.get('sortBy') as HotelSearchParams['sortBy']) || 'relevance',
    stars: [],
    minPrice: undefined,
    maxPrice: undefined,
    amenities: [],
    page: 0,
    size: 20,
  });

  const { data, isLoading, isFetching } = useHotelSearch(filters);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      query: searchParams.get('query') || '',
      city: searchParams.get('city') || '',
    }));
    setLocalQuery(searchParams.get('query') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ query: localQuery, ...(filters.city ? { city: filters.city } : {}) });
    setFilters((prev) => ({ ...prev, query: localQuery, page: 0 }));
  };

  const toggleStar = (star: number) => {
    setFilters((prev) => ({
      ...prev,
      page: 0,
      stars: prev.stars?.includes(star)
        ? prev.stars.filter((s) => s !== star)
        : [...(prev.stars || []), star],
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFilters((prev) => ({
      ...prev,
      page: 0,
      amenities: prev.amenities?.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...(prev.amenities || []), amenity],
    }));
  };

  const clearFilters = () => {
    setFilters((prev) => ({
      ...prev,
      stars: [],
      amenities: [],
      minPrice: undefined,
      maxPrice: undefined,
      page: 0,
    }));
  };

  const hasActiveFilters =
    (filters.stars?.length ?? 0) > 0 ||
    (filters.amenities?.length ?? 0) > 0 ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined;

  const results = data?.content || [];
  const total = data?.totalElements || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Search Header ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-border sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
              />
              <input
                type="text"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Search hotels, cities..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm
                  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                  hover:border-slate-300 transition-all"
              />
              {localQuery && (
                <button
                  type="button"
                  onClick={() => { setLocalQuery(''); setFilters((p) => ({ ...p, query: '', page: 0 })); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <Button type="submit" size="md">
              Search
            </Button>
            {/* Mobile filter toggle */}
            <Button
              type="button"
              variant="outline"
              size="md"
              className="lg:hidden"
              leftIcon={<SlidersHorizontal size={15} />}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              Filters
              {hasActiveFilters && (
                <span className="ml-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                  {(filters.stars?.length || 0) + (filters.amenities?.length || 0)}
                </span>
              )}
            </Button>
          </form>

          {/* Sort + results count */}
          <div className="flex items-center justify-between mt-3">
            <p className="text-sm text-text-secondary">
              {isLoading ? (
                'Searching...'
              ) : (
                <>
                  <span className="font-semibold text-text-primary">{total}</span> hotel
                  {total !== 1 ? 's' : ''} found
                  {filters.query && (
                    <> for "<span className="font-medium text-primary">{filters.query}</span>"</>
                  )}
                  {filters.city && (
                    <> in <span className="font-medium text-primary">{filters.city}</span></>
                  )}
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              <label className="text-xs text-text-secondary whitespace-nowrap">Sort by:</label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sortBy: e.target.value as HotelSearchParams['sortBy'],
                    page: 0,
                  }))
                }
                className="text-sm border border-border rounded-lg px-2 py-1.5 text-text-primary
                  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* ── Sidebar Filters ──────────────────────────────────────── */}
          <aside
            className={[
              'lg:block flex-shrink-0 w-64',
              filterOpen ? 'block' : 'hidden',
            ].join(' ')}
          >
            <div className="bg-white rounded-2xl border border-border p-5 sticky top-40">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-text-primary">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-primary hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Star Rating */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-text-primary mb-3">Star Rating</h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <label
                      key={star}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={filters.stars?.includes(star) || false}
                        onChange={() => toggleStar(star)}
                        className="rounded border-border text-primary focus:ring-primary/20 w-4 h-4"
                      />
                      <div className="flex items-center gap-1">
                        {Array.from({ length: star }).map((_, i) => (
                          <span key={i} className="text-accent text-sm">★</span>
                        ))}
                        {Array.from({ length: 5 - star }).map((_, i) => (
                          <span key={i} className="text-slate-200 text-sm">★</span>
                        ))}
                      </div>
                      <span className="text-sm text-text-secondary group-hover:text-text-primary">
                        {star} star{star !== 1 ? 's' : ''}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-text-primary mb-3">Price per Night</h4>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-text-secondary mb-1 block">Min (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={filters.minPrice ?? ''}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          minPrice: e.target.value ? Number(e.target.value) : undefined,
                          page: 0,
                        }))
                      }
                      className="w-full px-2.5 py-2 text-sm border border-border rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-text-secondary mb-1 block">Max (₹)</label>
                    <input
                      type="number"
                      placeholder="Any"
                      value={filters.maxPrice ?? ''}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          maxPrice: e.target.value ? Number(e.target.value) : undefined,
                          page: 0,
                        }))
                      }
                      className="w-full px-2.5 py-2 text-sm border border-border rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-3">Amenities</h4>
                <div className="space-y-2">
                  {AMENITY_OPTIONS.map((amenity) => (
                    <label key={amenity} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.amenities?.includes(amenity) || false}
                        onChange={() => toggleAmenity(amenity)}
                        className="rounded border-border text-primary focus:ring-primary/20 w-4 h-4"
                      />
                      <span className="text-sm text-text-secondary group-hover:text-text-primary">
                        {amenity}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ── Results ──────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {isLoading || isFetching ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <HotelCardSkeleton key={i} />
                ))}
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {results.map((result) => (
                    <HotelCard
                      key={result.hotel.id}
                      hotel={result.hotel}
                      rankReason={result.rankReason}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={(filters.page || 0) === 0}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, page: (prev.page || 0) - 1 }))
                      }
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-text-secondary px-3">
                      Page {(filters.page || 0) + 1} of {data.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={(filters.page || 0) >= data.totalPages - 1}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, page: (prev.page || 0) + 1 }))
                      }
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-border">
                <Building2 size={48} className="text-slate-200 mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">No hotels found</h3>
                <p className="text-text-secondary text-sm max-w-sm">
                  Try adjusting your search terms or filters to discover more properties.
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
