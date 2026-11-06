import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, SlidersHorizontal, X, Building2,
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
  { value: 'relevance', label: 'Relevance (Explainable)' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'rating_desc', label: 'Top Rated' },
];

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

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

  // Multi-criteria client-side reactive filtering and sorting
  const rawResults = useMemo(() => data?.content || [], [data?.content]);

  const filteredAndSortedResults = useMemo(() => {
    let list = [...rawResults];

    // Star rating filter
    if (filters.stars && filters.stars.length > 0) {
      list = list.filter((r) => filters.stars!.includes(r.hotel.stars));
    }

    // Min price filter
    if (filters.minPrice !== undefined && filters.minPrice > 0) {
      list = list.filter((r) => r.hotel.minPrice !== undefined && r.hotel.minPrice >= filters.minPrice!);
    }

    // Max price filter
    if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
      list = list.filter((r) => r.hotel.minPrice !== undefined && r.hotel.minPrice <= filters.maxPrice!);
    }

    // Amenities filter (hotel must include each selected amenity)
    if (filters.amenities && filters.amenities.length > 0) {
      list = list.filter((r) => {
        const hotelAmenities = (r.hotel.amenities || []).map((a) => a.toLowerCase());
        return filters.amenities!.every((reqAmenity) => {
          const req = reqAmenity.toLowerCase();
          return hotelAmenities.some((ha) => ha.includes(req) || (req === 'pool' && ha.includes('pool')));
        });
      });
    }

    // Sorting
    if (filters.sortBy === 'price_asc') {
      list.sort((a, b) => (a.hotel.minPrice || 0) - (b.hotel.minPrice || 0));
    } else if (filters.sortBy === 'rating_desc') {
      list.sort((a, b) => (b.hotel.avgRating || 0) - (a.hotel.avgRating || 0));
    } else {
      // Relevance (default) - uses explainable ranking score
      list.sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    return list;
  }, [rawResults, filters.stars, filters.minPrice, filters.maxPrice, filters.amenities, filters.sortBy]);

  const pageSize = filters.size || 20;
  const total = filteredAndSortedResults.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = filters.page || 0;
  const results = filteredAndSortedResults.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Search Header ─────────────────────────────────────────────── */}
      <div className="bg-surface/90 backdrop-blur-md border-b border-border sticky top-16 z-30 transition-[background-color,border-color]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative flex items-center">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
              />
              <input
                type="text"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Search properties, cities (e.g. Mumbai, Delhi, Goa), or areas..."
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-border text-sm text-text-primary bg-white
                  focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary
                  hover:border-sand-300 transition-[border-color,box-shadow]"
              />
              {localQuery && (
                <button
                  type="button"
                  onClick={() => { setLocalQuery(''); setFilters((p) => ({ ...p, query: '', page: 0 })); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary cursor-pointer p-0.5"
                  aria-label="Clear search input"
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
                <span className="ml-1.5 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {(filters.stars?.length || 0) + (filters.amenities?.length || 0) + (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0)}
                </span>
              )}
            </Button>
          </form>

          {/* Active filter chips & sort bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2 border-t border-border/40">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs text-text-secondary">
                {isLoading ? (
                  'Searching properties...'
                ) : (
                  <>
                    <span className="font-semibold text-text-primary">{total}</span> {total === 1 ? 'property' : 'properties'} found
                    {filters.query && (
                      <> for "<span className="font-medium text-primary">{filters.query}</span>"</>
                    )}
                    {filters.city && (
                      <> in <span className="font-medium text-primary">{filters.city}</span></>
                    )}
                  </>
                )}
              </p>

              {/* Dismissible filter chips */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-1.5 ml-2">
                  {filters.stars?.map((s) => (
                    <span
                      key={s}
                      onClick={() => toggleStar(s)}
                      className="inline-flex items-center gap-1 text-xs bg-sand-100 text-text-primary px-2.5 py-0.5 rounded-full border border-sand-200/80 hover:bg-sand-200 cursor-pointer transition-colors"
                    >
                      {s}★ <X size={10} />
                    </span>
                  ))}
                  {filters.minPrice && (
                    <span
                      onClick={() => setFilters((p) => ({ ...p, minPrice: undefined, page: 0 }))}
                      className="inline-flex items-center gap-1 text-xs bg-sand-100 text-text-primary px-2.5 py-0.5 rounded-full border border-sand-200/80 hover:bg-sand-200 cursor-pointer transition-colors"
                    >
                      Min ₹{filters.minPrice.toLocaleString('en-IN')} <X size={10} />
                    </span>
                  )}
                  {filters.maxPrice && (
                    <span
                      onClick={() => setFilters((p) => ({ ...p, maxPrice: undefined, page: 0 }))}
                      className="inline-flex items-center gap-1 text-xs bg-sand-100 text-text-primary px-2.5 py-0.5 rounded-full border border-sand-200/80 hover:bg-sand-200 cursor-pointer transition-colors"
                    >
                      Max ₹{filters.maxPrice.toLocaleString('en-IN')} <X size={10} />
                    </span>
                  )}
                  {filters.amenities?.map((a) => (
                    <span
                      key={a}
                      onClick={() => toggleAmenity(a)}
                      className="inline-flex items-center gap-1 text-xs bg-sand-100 text-text-primary px-2.5 py-0.5 rounded-full border border-sand-200/80 hover:bg-sand-200 cursor-pointer transition-colors"
                    >
                      {a} <X size={10} />
                    </span>
                  ))}
                  <button
                    onClick={clearFilters}
                    className="text-xs text-primary hover:underline ml-1 font-medium cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
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
                className="text-xs border border-border rounded-lg px-2.5 py-1.5 text-text-primary
                  focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary bg-white cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* ── Sidebar Filters ──────────────────────────────────────── */}
          <aside
            className={[
              'lg:block flex-shrink-0 w-64',
              filterOpen ? 'block' : 'hidden',
            ].join(' ')}
          >
            <div className="bg-white rounded-2xl border border-border p-6 shadow-card sticky top-44">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-serif font-semibold text-text-primary text-base">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-primary hover:underline cursor-pointer font-medium"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Star Rating */}
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Star Rating</h4>
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
                        className="rounded border-border text-primary focus:ring-primary/20 accent-[#2D3B2D] w-4 h-4 cursor-pointer"
                      />
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: star }).map((_, i) => (
                          <span key={i} className="text-accent text-sm">★</span>
                        ))}
                        {Array.from({ length: 5 - star }).map((_, i) => (
                          <span key={i} className="text-sand-200 text-sm">★</span>
                        ))}
                      </div>
                      <span className="text-xs text-text-secondary group-hover:text-text-primary ml-auto">
                        {star} star{star !== 1 ? 's' : ''}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6 pt-4 border-t border-border/60">
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Price per Night (₹)</h4>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[11px] text-text-secondary mb-1 block">Min (₹)</label>
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
                      className="w-full px-2.5 py-1.5 text-xs border border-border rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[11px] text-text-secondary mb-1 block">Max (₹)</label>
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
                      className="w-full px-2.5 py-1.5 text-xs border border-border rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="pt-4 border-t border-border/60">
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Amenities</h4>
                <div className="space-y-2">
                  {AMENITY_OPTIONS.map((amenity) => (
                    <label key={amenity} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.amenities?.includes(amenity) || false}
                        onChange={() => toggleAmenity(amenity)}
                        className="rounded border-border text-primary focus:ring-primary/20 accent-[#2D3B2D] w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs text-text-secondary group-hover:text-text-primary">
                        {amenity}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ── Results Grid ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {isLoading || isFetching ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <HotelCardSkeleton key={i} />
                ))}
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {results.map((result) => (
                    <HotelCard
                      key={result.hotel.id}
                      hotel={result.hotel}
                      rankReason={result.rankReason}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 0}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, page: Math.max(0, currentPage - 1) }))
                      }
                    >
                      Previous
                    </Button>
                    <span className="text-xs text-text-secondary px-3">
                      Page {currentPage + 1} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages - 1}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, page: currentPage + 1 }))
                      }
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-border shadow-card p-8">
                <div className="w-14 h-14 bg-sand-100 rounded-full flex items-center justify-center mb-4 text-text-secondary">
                  <Building2 size={28} />
                </div>
                <h3 className="text-lg font-serif font-semibold text-text-primary mb-2">No matching properties found</h3>
                <p className="text-text-secondary text-xs max-w-sm leading-relaxed mb-5">
                  We could not find properties matching your current filter criteria. Try expanding your price range or adjusting amenities.
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Reset all filters
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
