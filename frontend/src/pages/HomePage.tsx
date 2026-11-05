import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, ArrowRight, Building2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useHotelSearch } from '../hooks/useHotels';
import { HotelCard } from '../components/hotel/HotelCard';
import { HotelCardSkeleton } from '../components/hotel/HotelCardSkeleton';

const POPULAR_DESTINATIONS = [
  { city: 'Mumbai', tagline: 'City of Dreams', gradient: 'from-blue-600 to-indigo-800', emoji: '🌊' },
  { city: 'Delhi', tagline: 'Heart of India', gradient: 'from-orange-500 to-red-700', emoji: '🏛️' },
  { city: 'Bangalore', tagline: 'Silicon Valley of India', gradient: 'from-emerald-500 to-teal-700', emoji: '💻' },
  { city: 'Goa', tagline: 'Beach Paradise', gradient: 'from-cyan-400 to-blue-600', emoji: '🏖️' },
  { city: 'Jaipur', tagline: 'Pink City', gradient: 'from-pink-500 to-rose-700', emoji: '🏰' },
  { city: 'Kolkata', tagline: 'City of Joy', gradient: 'from-yellow-500 to-amber-700', emoji: '🎭' },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: featuredData, isLoading: featuredLoading } = useHotelSearch(
    { query: '', page: 0, size: 4, sortBy: 'rating_desc' },
    true
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleDestinationClick = (city: string) => {
    navigate(`/search?city=${encodeURIComponent(city)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-light to-blue-600">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <Star size={13} className="text-accent fill-current" />
            <span className="text-white/90 text-sm font-medium">Over 10,000 hotels worldwide</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight tracking-tight">
            Find your perfect
            <br />
            <span className="text-accent">place to stay</span>
          </h1>
          <p className="text-white/75 text-lg sm:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            Search thousands of hotels, compare prices, and book with confidence.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2">
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search hotels, cities, or areas..."
                  className="w-full pl-10 pr-4 py-3 bg-white/10 text-white placeholder:text-white/50
                    rounded-xl border border-transparent focus:outline-none focus:border-white/40
                    focus:bg-white/15 transition-all text-sm"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="bg-accent hover:bg-amber-500 text-white px-6 py-3 rounded-xl font-semibold flex-shrink-0"
              >
                <Search size={16} />
                Search
              </Button>
            </div>
          </form>

          {/* Quick stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            {[
              { label: 'Hotels', value: '10K+' },
              { label: 'Cities', value: '500+' },
              { label: 'Happy guests', value: '2M+' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-white/60 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Destinations ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">Popular Destinations</h2>
            <p className="text-text-secondary mt-1">Explore trending cities loved by travelers</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight size={15} />}
            onClick={() => navigate('/search')}
          >
            View all
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {POPULAR_DESTINATIONS.map((dest) => (
            <button
              key={dest.city}
              onClick={() => handleDestinationClick(dest.city)}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${dest.gradient}
                p-5 text-left hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-pointer`}
            >
              <div className="text-3xl mb-2">{dest.emoji}</div>
              <p className="font-bold text-white text-sm">{dest.city}</p>
              <p className="text-white/70 text-xs mt-0.5 leading-tight">{dest.tagline}</p>
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight size={14} className="text-white/80" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Featured Hotels ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">Top Rated Hotels</h2>
            <p className="text-text-secondary mt-1">Handpicked properties loved by our guests</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight size={15} />}
            onClick={() => navigate('/search?sortBy=rating_desc')}
          >
            See all
          </Button>
        </div>

        {featuredLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <HotelCardSkeleton key={i} />
            ))}
          </div>
        ) : featuredData?.content && featuredData.content.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredData.content.map((result) => (
              <HotelCard
                key={result.hotel.id}
                hotel={result.hotel}
                rankReason={result.rankReason}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-border">
            <Building2 size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-text-secondary">No hotels available yet. Check back soon!</p>
          </div>
        )}
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-primary to-primary-light rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-10 w-32 h-32 rounded-full bg-white" />
            <div className="absolute bottom-4 right-10 w-24 h-24 rounded-full bg-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3 relative">
            Ready to explore the world?
          </h2>
          <p className="text-white/80 mb-6 relative">
            Sign up and get access to exclusive member deals.
          </p>
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-slate-50 font-semibold relative"
            onClick={() => navigate('/register')}
          >
            Create Free Account
          </Button>
        </div>
      </section>
    </div>
  );
};
