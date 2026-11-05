import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Twitter, Instagram, Facebook, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                <Building2 size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Stay<span className="text-blue-400">Finder</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-500">
              Find and book the perfect hotel for every trip. Curated properties, transparent pricing.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[Twitter, Instagram, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Explore</h4>
            <ul className="space-y-2.5">
              {['Search Hotels', 'Popular Destinations', 'Top Rated', 'Deals & Offers'].map((item) => (
                <li key={item}>
                  <Link
                    to="/search"
                    className="text-sm text-slate-500 hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2.5">
              {['About Us', 'Careers', 'Press', 'Blog'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Support</h4>
            <ul className="space-y-2.5">
              {['Help Center', 'Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <a
                href="mailto:support@stayfinder.com"
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors"
              >
                <Mail size={14} />
                support@stayfinder.com
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            &copy; {new Date().getFullYear()} StayFinder. All rights reserved.
          </p>
          <p className="text-sm text-slate-600">
            Made with ❤️ for travelers worldwide
          </p>
        </div>
      </div>
    </footer>
  );
};
