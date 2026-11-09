import React from 'react';
import { Link } from 'react-router';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
      <div className="text-6xl font-extrabold font-display text-cyan-400">404</div>
      <h1 className="text-2xl font-bold font-display text-white">Page Not Found</h1>
      <p className="text-xs text-gray-400">
        The tokenized real-world page you are looking for does not exist or has been moved.
      </p>
      <div className="pt-2 flex justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#151D30] border border-[#22304E] text-white text-xs font-semibold"
        >
          <span>Explore Assets</span>
        </Link>
      </div>
    </div>
  );
};
