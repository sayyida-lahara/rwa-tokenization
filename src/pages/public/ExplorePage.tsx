import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { MockAssetService } from '../../services/mockAssetService';
import type { FilterState, Asset } from '../../types';
import { AssetCard } from '../../components/marketplace/AssetCard';
import { AssetCardList } from '../../components/marketplace/AssetCardList';
import { FilterSidebar } from '../../components/marketplace/FilterSidebar';
import { SortDropdown } from '../../components/marketplace/SortDropdown';
import { SearchBar } from '../../components/marketplace/SearchBar';
import { CategoryPills } from '../../components/marketplace/CategoryPills';
import { LayoutGrid, List, SlidersHorizontal, RotateCcw } from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: searchParams.get('q') || '',
    category: initialCategory,
    minInvestment: 0,
    maxInvestment: 1000,
    minValuation: 0,
    maxValuation: 60000000,
    location: 'all',
    investmentStatus: 'all',
    verificationStatus: 'all',
    sortBy: 'recently_listed',
    viewMode: 'grid',
  });

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Load live assets from service
  const allAssets = MockAssetService.getAssets();

  // Distinct locations for dropdown
  const availableLocations = useMemo(() => {
    const locSet = new Set<string>();
    allAssets.forEach((a) => {
      locSet.add(`${a.location.city}, ${a.location.country}`);
    });
    return Array.from(locSet);
  }, [allAssets]);

  // Counts for category tabs
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allAssets.length };
    allAssets.forEach((a) => {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });
    return counts;
  }, [allAssets]);

  // Filtered and Sorted Assets
  const filteredAssets = useMemo(() => {
    return allAssets
      .filter((asset) => {
        // Search Query
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchesName = asset.name.toLowerCase().includes(q);
          const matchesCity = asset.location.city.toLowerCase().includes(q);
          const matchesCountry = asset.location.country.toLowerCase().includes(q);
          const matchesCategory = asset.category.toLowerCase().includes(q);
          const matchesTag = asset.tagLine.toLowerCase().includes(q);
          if (!matchesName && !matchesCity && !matchesCountry && !matchesCategory && !matchesTag) {
            return false;
          }
        }

        // Category
        if (filters.category && filters.category !== 'all') {
          if (asset.category.toLowerCase() !== filters.category.toLowerCase()) {
            return false;
          }
        }

        // Minimum Investment
        if (filters.minInvestment > 0 && asset.minimumInvestment < filters.minInvestment) {
          return false;
        }

        // Maximum Valuation
        if (asset.totalValuation > filters.maxValuation) {
          return false;
        }

        // Location
        if (filters.location && filters.location !== 'all') {
          const locString = `${asset.location.city}, ${asset.location.country}`;
          if (locString !== filters.location) {
            return false;
          }
        }

        // Investment Status
        if (filters.investmentStatus && filters.investmentStatus !== 'all') {
          if (asset.investmentStatus !== filters.investmentStatus) {
            return false;
          }
        }

        // Verification Status
        if (filters.verificationStatus && filters.verificationStatus !== 'all') {
          if (asset.verificationStatus !== filters.verificationStatus) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'lowest_price':
            return a.tokenPrice - b.tokenPrice;
          case 'highest_price':
            return b.tokenPrice - a.tokenPrice;
          case 'highest_valuation':
            return b.totalValuation - a.totalValuation;
          case 'highest_yield':
            return b.expectedYield - a.expectedYield;
          case 'most_popular':
            return b.fundingProgress - a.fundingProgress;
          case 'recently_listed':
          default:
            return new Date(b.listingDate).getTime() - new Date(a.listingDate).getTime();
        }
      });
  }, [allAssets, filters]);

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'all',
      minInvestment: 0,
      maxInvestment: 1000,
      minValuation: 0,
      maxValuation: 60000000,
      location: 'all',
      investmentStatus: 'all',
      verificationStatus: 'all',
      sortBy: 'recently_listed',
      viewMode: filters.viewMode,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* PAGE HEADER */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-display text-white tracking-tight">
          Explore Real World Assets
        </h1>
        <p className="text-sm text-gray-400">
          Discover verified tokenized investment opportunities.
        </p>
      </div>

      {/* SEARCH AND CATEGORY BAR */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar
            value={filters.searchQuery}
            onChange={(q) => setFilters({ ...filters, searchQuery: q })}
            placeholder="Search by asset name, Bangalore, Mumbai, Gold, Solar..."
            className="flex-1"
          />

          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#151D30] border border-[#1E293B] text-xs font-semibold text-gray-200"
            >
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <SortDropdown
              value={filters.sortBy}
              onChange={(sort) => setFilters({ ...filters, sortBy: sort })}
            />

            {/* Grid / List View Toggle */}
            <div className="flex items-center bg-[#151D30] border border-[#1E293B] p-1 rounded-xl">
              <button
                onClick={() => setFilters({ ...filters, viewMode: 'grid' })}
                className={`p-1.5 rounded-lg transition-colors ${
                  filters.viewMode === 'grid'
                    ? 'bg-blue-600/30 text-cyan-300'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFilters({ ...filters, viewMode: 'list' })}
                className={`p-1.5 rounded-lg transition-colors ${
                  filters.viewMode === 'list'
                    ? 'bg-blue-600/30 text-cyan-300'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Category Ribbon */}
        <CategoryPills
          selectedCategory={filters.category}
          onSelectCategory={(cat) => setFilters({ ...filters, category: cat })}
          counts={categoryCounts}
        />
      </div>

      {/* MAIN CONTENT AREA: SIDEBAR + ASSET GRID */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block shrink-0">
          <FilterSidebar
            filters={filters}
            onChange={(newFilters) => setFilters(newFilters)}
            onReset={handleResetFilters}
            availableLocations={availableLocations}
          />
        </div>

        {/* Mobile Filter Drawer */}
        {isMobileFilterOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <div className="relative w-80 bg-[#151D30] h-full shadow-2xl p-4 overflow-y-auto z-10 flex flex-col justify-between">
              <FilterSidebar
                filters={filters}
                onChange={(newFilters) => {
                  setFilters(newFilters);
                }}
                onReset={handleResetFilters}
                availableLocations={availableLocations}
              />
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="mt-4 w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs"
              >
                Show {filteredAssets.length} Results
              </button>
            </div>
          </div>
        )}

        {/* Assets Feed */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          {/* Results count & active query badges */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>
              Showing <strong className="text-white font-display">{filteredAssets.length}</strong>{' '}
              verified assets
            </span>
            {(filters.searchQuery || filters.category !== 'all' || filters.minInvestment > 0) && (
              <button
                onClick={handleResetFilters}
                className="text-cyan-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear active filters</span>
              </button>
            )}
          </div>

          {filteredAssets.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#151D30] border border-[#1E293B] space-y-3">
              <p className="text-base font-semibold text-white">No matching assets found</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Try adjusting your search criteria, clearing valuation or minimum investment filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          ) : filters.viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAssets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAssets.map((asset) => (
                <AssetCardList key={asset.id} asset={asset} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
