import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Twitter, Instagram, Facebook, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-primary-dark text-sand-200/70 mt-20 border-t border-primary/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-sand-200/10 rounded-lg flex items-center justify-center border border-sand-200/20">
                <Building2 size={18} className="text-sand-200" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight font-serif">
                Stay<span className="text-accent italic font-normal">wise</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-sand-200/60">
              Curated luxury hotel discovery and booking across India. Authentic stays, explainable ranking, and transparent pricing.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Twitter, Instagram, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-sand-200/80 hover:text-white transition-colors"
                  aria-label="Social Link"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-medium mb-4 text-sm font-serif">Explore</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Search Properties', to: '/search' },
                { label: 'Mumbai Luxury Stays', to: '/search?city=Mumbai' },
                { label: 'Delhi Heritage Retreats', to: '/search?city=Delhi' },
                { label: 'Goa Coastal Resorts', to: '/search?city=Goa' },
                { label: 'Jaipur Palaces', to: '/search?city=Jaipur' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-sm text-sand-200/60 hover:text-sand-100 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4 text-sm font-serif">Platform</h4>
            <ul className="space-y-2.5">
              {['About Staywise', 'Curated Standards', 'Guest Verification', 'Press & Journal'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-sand-200/60 hover:text-sand-100 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4 text-sm font-serif">Support</h4>
            <ul className="space-y-2.5">
              {['Concierge Desk', 'Booking Terms', 'Privacy Commitment', 'Cookie Policy'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-sand-200/60 hover:text-sand-100 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <a
                href="mailto:concierge@staywise.example"
                className="flex items-center gap-2 text-sm text-sand-200/60 hover:text-sand-100 transition-colors"
              >
                <Mail size={14} />
                concierge@staywise.example
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-sand-200/50">
          <p>
            &copy; {new Date().getFullYear()} Staywise. All rights reserved.
          </p>
          <p>
            Quiet luxury meets modern travel.
          </p>
        </div>
      </div>
    </footer>
  );
};
