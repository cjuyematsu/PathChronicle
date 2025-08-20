"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Plane, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { countries, getCountryName } from '../../data/countries';
import 'flag-icons/css/flag-icons.min.css';
import { apiWrapper } from '@/src/utils/apiWrapper';


interface CountryVisit {
  code: string;
  name: string;
  firstVisit?: string;
  visitCount?: number;
}

const PassportStamp = ({ country, isVisited }: { country: CountryVisit; isVisited: boolean }) => {
  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${isVisited ? '' : 'opacity-40'}`}>
        <svg width="140" height="140" viewBox="0 0 140 140" className="relative">
          <rect 
            x="10" 
            y="10" 
            width="120" 
            height="120" 
            fill={isVisited ? "#FEF3C7" : "#4A5568"} 
            stroke={isVisited ? "#D97706" : "#2D3748"}
            strokeWidth="2"
          />
          
          <defs>
            <circle id={`perf-${country.code}`} r="3.1" fill="#1e293b" />
          </defs>
          
          {Array.from({ length: 8 }).map((_, i) => (
            <use 
              key={`top-${i}`} 
              href={`#perf-${country.code}`} 
              x={20 + i * 15} 
              y={10} 
            />
          ))}
          
          {Array.from({ length: 8 }).map((_, i) => (
            <use 
              key={`bottom-${i}`} 
              href={`#perf-${country.code}`} 
              x={20 + i * 15} 
              y={130} 
            />
          ))}
          
          {Array.from({ length: 8 }).map((_, i) => (
            <use 
              key={`left-${i}`} 
              href={`#perf-${country.code}`} 
              x={10} 
              y={20 + i * 15} 
            />
          ))}
          
          {Array.from({ length: 8 }).map((_, i) => (
            <use 
              key={`right-${i}`} 
              href={`#perf-${country.code}`} 
              x={130} 
              y={20 + i * 15} 
            />
          ))}
        </svg>

        <div className="absolute inset-0 flex items-center justify-center" style={{ padding: '25px' }}>
          <div className={`w-full h-full flex items-center justify-center ${!isVisited ? 'grayscale' : ''}`}>
            <span className={`fi fi-${country.code} fis`} style={{ fontSize: '5.5rem' }}></span>
          </div>
        </div>

        
      </div>

      <p className={`mt-2 text-sm font-medium text-center ${isVisited ? 'text-white' : 'text-slate-500'}`}>
        {country.name}
      </p>
    </div>
  );
};

const PassportPage = () => {
  const { user, isGuest } = useAuth();
  const [visitedCountries, setVisitedCountries] = useState<string[]>([]);
  const [countryVisits, setCountryVisits] = useState<CountryVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'visited' | 'not-visited'>('visited');

  const fetchVisitedCountries = useCallback(async () => {
    if (!user?.id) return;

    console.log('Passport - Fetching countries for user:', user.id, 'isGuest:', isGuest);

    try {
        setLoading(true);
        setError(null);

        // Use apiWrapper to get visited countries
        const countryCodes = await apiWrapper.getVisitedCountries({
            isGuest: isGuest,
            userId: user.id
        });
        
        console.log('Passport - Received country codes:', countryCodes);

        // Normalize the country codes
        const normalizedCodes = countryCodes.map((code: string) => code.toLowerCase());
        setVisitedCountries(normalizedCodes);

        // Create country visit objects
        const visits = normalizedCodes.map((code: string) => ({
            code: code,
            name: getCountryName(code)
        }));

        setCountryVisits(visits);
        console.log('Passport - Country visits:', visits);
    } catch (err) {
        console.error('Passport - Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
        setLoading(false);
    }
}, [user?.id, isGuest]);
  useEffect(() => {
    if (user?.id) {
      fetchVisitedCountries();
    }
  }, [user, fetchVisitedCountries]);

  const getFilteredCountries = () => {
    if (selectedFilter === 'visited') {
      return countryVisits;
    } else if (selectedFilter === 'not-visited') {
      return countries
        .filter(country => !visitedCountries.includes(country.code))
        .map(country => ({
          code: country.code,
          name: country.name
        }));
    } else {
      const visited = countryVisits;
      const notVisited = countries
        .filter(country => !visitedCountries.includes(country.code))
        .map(country => ({
          code: country.code,
          name: country.name
        }));
      return [...visited, ...notVisited];
    }
  };

  const displayedCountries = getFilteredCountries();
  const visibleCountries = isExpanded ? displayedCountries : displayedCountries.slice(0, 12);

  if (!user) {
    return (
      <div className="w-full min-h-screen p-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Globe className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Please log in to view your passport</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-full p-6 bg-slate-900 text-white">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen p-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button 
              onClick={fetchVisitedCountries}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalCountries = countries.length;
  const visitedCount = visitedCountries.length;
  const percentageVisited = totalCountries > 0 ? Math.round((visitedCount / totalCountries) * 100) : 0;

  if (visitedCount === 0) {
    return (
        <div className="w-full h-full p-6 bg-slate-900 text-white">
            <div className="flex items-center justify-center py-12">
                <div className="text-bold text-3xl">No Countries Visited</div>
            </div>
        </div>
    )

  }

  return (
    <div className="w-full min-h-screen p-6 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 py-6">Passport ({visitedCount})</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Countries Visited</p>
                  <p className="text-2xl font-bold text-white">{visitedCount}</p>
                </div>
                <MapPin className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">World Coverage</p>
                  <p className="text-2xl font-bold text-white">{percentageVisited}%</p>
                </div>
                <Globe className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Remaining</p>
                  <p className="text-2xl font-bold text-white">{totalCountries - visitedCount}</p>
                </div>
                <Plane className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setSelectedFilter('visited')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedFilter === 'visited'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Visited ({visitedCount})
            </button>
            <button
              onClick={() => setSelectedFilter('not-visited')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedFilter === 'not-visited'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Not Visited ({totalCountries - visitedCount})
            </button>
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              All ({totalCountries})
            </button>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-8">
          {visibleCountries.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">
                {selectedFilter === 'visited' 
                  ? "No countries visited yet. Start your journey!"
                  : "No countries match this filter."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
                {visibleCountries.map((country) => {
                  const isVisited = visitedCountries.includes(country.code);
                  
                  return (
                    <PassportStamp
                      key={country.code}
                      country={country}
                      isVisited={isVisited}
                    />
                  );
                })}
              </div>

              {displayedCountries.length > 12 && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition-all"
                  >
                    {isExpanded ? (
                      <>
                        Show Less
                        <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Show All ({displayedCountries.length})
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PassportPage;