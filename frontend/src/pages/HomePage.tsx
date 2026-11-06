import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Building2, ShieldCheck, Sparkles, Award } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useHotelSearch } from '../hooks/useHotels';
import { useAuthStore } from '../store/authStore';
import { HotelCard } from '../components/hotel/HotelCard';
import { HotelCardSkeleton } from '../components/hotel/HotelCardSkeleton';

interface DestinationItem {
  city: string;
  tagline: string;
  image: string;
  fallback?: string;
}

const CURATED_DESTINATIONS: DestinationItem[] = [
  {
    city: 'Mumbai',
    tagline: 'Coastal glamour & heritage avenues',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=750&fit=crop&q=80',
    fallback: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&h=750&fit=crop&q=80',
  },
  {
    city: 'Delhi',
    tagline: 'Mughal palaces & diplomatic enclave',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&h=750&fit=crop&q=80',
    fallback: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=750&fit=crop&q=80',
  },
  {
    city: 'Goa',
    tagline: 'Serene shores & private villas',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&h=750&fit=crop&q=80',
    fallback: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&h=750&fit=crop&q=80',
  },
  {
    city: 'Jaipur',
    tagline: 'Royal residences & desert courtyards',
    image: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=600&h=750&fit=crop&q=80',
    fallback: 'https://images.unsplash.com/photo-1587213811864-c8d8c79d60f7?w=600&h=750&fit=crop&q=80',
  },
  {
    city: 'Bangalore',
    tagline: 'Garden city luxury & rooftop suites',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&h=750&fit=crop&q=80',
    fallback: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=750&fit=crop&q=80',
  },
  {
    city: 'Kolkata',
    tagline: 'Colonial grand dames & cultural soul',
    image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=600&h=750&fit=crop&q=80',
    fallback: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=750&fit=crop&q=80',
  },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
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
      {/* ── Editorial Hero ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-hidden">
        {/* Ambient background photo */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&h=1080&fit=crop&q=85"
            alt="Luxury hotel courtyard"
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/85 via-primary-dark/75 to-primary-dark/90" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-sand-200/15 border border-sand-200/25 rounded-full px-3.5 py-1 mb-6">
            <Sparkles size={13} className="text-accent" />
            <span className="text-sand-100 text-xs font-medium tracking-wide">
              Curated hospitality across India
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal text-white mb-5 leading-[1.15] tracking-tight">
            Quiet luxury,
            <br />
            <span className="italic font-normal text-accent">crafted for the modern traveler</span>
          </h1>
          <p className="text-sand-100/80 text-base sm:text-lg mb-10 max-w-xl mx-auto font-light leading-relaxed">
            Discover iconic palaces, serene coastal resorts, and urban retreats with explainable recommendations and transparent pricing.
          </p>

          {/* Search box */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-2 bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-modal border border-sand-200/40">
              <div className="flex-1 relative flex items-center">
                <Search
                  size={18}
                  className="absolute left-3.5 text-text-secondary pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by hotel name, city, or area..."
                  className="w-full pl-10 pr-4 py-3 bg-transparent text-text-primary placeholder:text-text-secondary/60 text-sm outline-none"
                />
              </div>
              <Button
                type="submit"
                size="md"
                className="bg-primary hover:bg-primary-light text-white px-7 py-3 rounded-xl flex-shrink-0"
              >
                Search Stays
              </Button>
            </div>
          </form>

          {/* Quick city pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <span className="text-xs text-sand-200/60 mr-1">Trending:</span>
            {['Mumbai', 'Delhi', 'Goa', 'Jaipur', 'Bangalore'].map((city) => (
              <button
                key={city}
                onClick={() => handleDestinationClick(city)}
                className="text-xs text-sand-100/85 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1 rounded-full border border-white/10 transition-[background-color,color] duration-150 cursor-pointer"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hospitality Principles ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-border shadow-card flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-sand-100 flex items-center justify-center text-primary flex-shrink-0">
              <Award size={20} />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-text-primary text-base mb-1">
                Curated Standards
              </h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                Hand-inspected properties adhering to quiet luxury design, pristine service, and verified comfort.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-border shadow-card flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-sand-100 flex items-center justify-center text-primary flex-shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-text-primary text-base mb-1">
                Explainable Ranking
              </h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                Clear transparency into why every property is recommended, factoring ratings, guest volume, and relevance.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-border shadow-card flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-sand-100 flex items-center justify-center text-primary flex-shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-text-primary text-base mb-1">
                Verified Guest Reviews
              </h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                Only travelers with completed reservations can review, guaranteeing trustworthy and authentic feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Curated Destinations ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-text-primary tracking-tight">
              Featured Destinations
            </h2>
            <p className="text-text-secondary text-sm mt-1">
              Historic palaces, vibrant metropolises, and tranquil coastal retreats
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight size={14} />}
            onClick={() => navigate('/search')}
          >
            Explore all
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CURATED_DESTINATIONS.map((dest) => (
            <div
              key={dest.city}
              onClick={() => handleDestinationClick(dest.city)}
              className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer shadow-card border border-border"
            >
              <img
                src={dest.image}
                alt={dest.city}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                onError={(e) => {
                  if (dest.fallback && (e.target as HTMLImageElement).src !== dest.fallback) {
                    (e.target as HTMLImageElement).src = dest.fallback;
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="text-xl font-serif font-semibold">{dest.city}</p>
                <p className="text-xs text-white/80 mt-1 leading-snug">{dest.tagline}</p>
                <span className="inline-flex items-center gap-1 text-xs text-accent mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Discover properties <ArrowRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Top Rated Stays ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-text-primary tracking-tight">
              Distinguished Stays
            </h2>
            <p className="text-text-secondary text-sm mt-1">
              Top-rated properties favored by guests for service, architecture, and dining
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight size={14} />}
            onClick={() => navigate('/search?sortBy=rating_desc')}
          >
            View collection
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
            <Building2 size={40} className="text-sand-300 mx-auto mb-3" />
            <p className="text-text-secondary">No properties available. Please check back shortly.</p>
          </div>
        )}
      </section>

      {/* ── Editorial Invitation (hidden if logged in) ────────────────────── */}
      {!isAuthenticated && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="bg-surface-warm rounded-3xl p-10 sm:p-14 border border-border shadow-card flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-left">
              <span className="text-xs uppercase tracking-wider text-accent font-medium">
                Join Staywise
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-text-primary mt-2 mb-3">
                Experience seamless luxury travel across India
              </h2>
              <p className="text-text-secondary text-sm leading-relaxed">
                Create a complimentary guest account to reserve suites, manage itineraries, and share verified reviews.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary-light text-white font-medium"
                onClick={() => navigate('/register')}
              >
                Create Account
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/search')}
              >
                Explore Stays
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
