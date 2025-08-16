"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Plane, Train, Bus, Car, Ship, MoreHorizontal, Clock, Globe, TrendingUp, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ManageTripType, TripApiResponse } from '@/src/types';
import { useAuth } from '../../context/AuthContext';

const Card = ({ children, className = "" }: { 
  children: React.ReactNode; 
  className?: string; 
}) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-xl p-6 ${className}`}>
    {children}
  </div>
);

const Select = ({ 
  children, 
  value, 
  onChange,
  className = ""
}: {
  children: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}) => (
  <select
    value={value}
    onChange={onChange}
    className={`px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white ${className}`}
  >
    {children}
  </select>
);

const Button = ({ 
  children, 
  onClick,
  variant = 'primary'
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}) => {
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-600"
  };
  
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 rounded-xl font-medium transition-all ${variantClasses[variant]}`}
    >
      {children}
    </button>
  );
};

const getTripIcon = (tripType: string) => {
  switch (tripType) {
    case 'flight': return <Plane className="w-5 h-5" />;
    case 'train': return <Train className="w-5 h-5" />;
    case 'bus': return <Bus className="w-5 h-5" />;
    case 'car': return <Car className="w-5 h-5" />;
    case 'ferry': return <Ship className="w-5 h-5" />;
    default: return <MoreHorizontal className="w-5 h-5" />;
  }
};

const SummaryPage = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<ManageTripType[]>([]);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [selectedYear, setSelectedYear] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visitedCountries, setVisitedCountries] = useState<string[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch trips
      const tripsResponse = await fetch(`/api/trips/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('auth-token=')[1]?.split(';')[0] || ''}`
        }
      });

      if (!tripsResponse.ok) {
        throw new Error('Failed to fetch trips');
      }

      const tripsData = await tripsResponse.json();
      
      // Transform backend response to match frontend type
      const formattedTrips: ManageTripType[] = tripsData.map((trip: TripApiResponse) => ({
        id: trip.id,
        user_id: trip.user_id,
        name: trip.name,
        trip_type: trip.trip_type,
        origin_location_id: trip.origin_location_id,
        destination_location_id: trip.destination_location_id,
        departure_date: trip.departure_date,
        arrival_date: trip.arrival_date,
        departure_time: trip.departure_time,
        arrival_time: trip.arrival_time,
        flight_number: trip.flight_number,
        train_number: trip.train_number,
        airline: trip.airline,
        operator: trip.operator,
        distance_km: parseFloat(trip.distance_km),
        duration_minutes: trip.duration_minutes,
        notes: trip.notes,
        created_at: trip.created_at,
        updated_at: trip.updated_at,
        origin_location: {
          id: trip.origin_location_id,
          name: trip.origin_name,
          city: trip.origin_city,
          country_code: trip.origin_country,
        },
        destination_location: {
          id: trip.destination_location_id,
          name: trip.destination_name,
          city: trip.destination_city,
          country_code: trip.destination_country,
        },
      }));
      
      // Fetch visited countries
      const countriesResponse = await fetch(`/api/trips/countries/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('auth-token=')[1]?.split(';')[0] || ''}`
        }
      });

      if (!countriesResponse.ok) {
        throw new Error('Failed to fetch visited countries');
      }

      const countries = await countriesResponse.json();
      
      setTrips(formattedTrips);
      setVisitedCountries(countries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="w-full h-full p-6 bg-slate-900 text-white">
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">Please log in to view your travel summary</p>
        </div>
      </div>
    );
  }

  if ((trips.length) === 0 && !loading && !error) {
    return (
      <div className="w-full h-full p-6 bg-slate-900 text-white">
        <div className="flex items-center justify-center py-12">
          <div className="text-bold text-3xl">Please Add Trips</div>
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
      <div className="w-full h-full p-6 bg-slate-900 text-white">
        <Card className="max-w-2xl mx-auto">
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <Button variant="secondary" onClick={fetchData}>
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const availableYears = [...new Set(trips
    .filter(trip => trip.departure_date)
    .map(trip => new Date(trip.departure_date!).getFullYear().toString())
  )].sort().reverse();

  const filteredTrips = trips.filter(trip => {
    const tripYear = trip.departure_date ? new Date(trip.departure_date).getFullYear().toString() : '';
    return selectedYear === 'all' || tripYear === selectedYear;
  });

  const totalDistance = filteredTrips.reduce((sum, trip) => sum + (trip.distance_km || 0), 0);
  const totalTrips = filteredTrips.length;
  const totalDuration = filteredTrips.reduce((sum, trip) => sum + (trip.duration_minutes || 0), 0);
  const uniqueCountries = visitedCountries.length;

  const roundedDistance = Math.round(totalDistance); // Round to 2 decimal places

  const formatDistance = (km: number): string => {
    if (unitSystem === 'metric') {
      return `${km.toLocaleString()} km`;
    } else {
      return `${Math.round(km * 0.621371).toLocaleString()} mi`;
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const tripTypeData = Object.entries(
    filteredTrips.reduce((acc: Record<string, number>, trip) => {
      acc[trip.trip_type] = (acc[trip.trip_type] || 0) + 1;
      return acc;
    }, {})
  ).map(([type, count]) => ({ type, count }));

  const typeColors = {
    flight: '#3B82F6',
    train: '#10B981',
    car: '#F59E0B',
    bus: '#8B5CF6',
    ferry: '#06B6D4',
    other: '#6B7280'
  };

  return (
    <div className="w-full h-full p-6 bg-slate-900 text-white">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 py-6">Trip Summary</h2>
        <p className="text-gray-300">Overview of your travel statistics</p>
      </div>

      <Card className="mb-8">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-slate-400 mb-2">Filter by Year</label>
            <Select
              className="appearance-none w-1/2 text-center"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="all">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </Select>
          </div>
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-slate-400 mb-2">Units</label>
            <Select
              className="appearance-none w-1/2 text-center"
              value={unitSystem}
              onChange={(e) => setUnitSystem(e.target.value as 'metric' | 'imperial')}
            >
              <option value="metric">Kilometers</option>
              <option value="imperial">Miles</option>
            </Select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Total Distance</p>
              <p className="text-2xl font-bold text-white">{formatDistance(roundedDistance)}</p>
            </div>
            <Globe className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Total Trips</p>
              <p className="text-2xl font-bold text-white">{totalTrips}</p>
            </div>
            <MapPin className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Travel Time</p>
              <p className="text-2xl font-bold text-white">{formatDuration(totalDuration)}</p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Countries Visited</p>
              <p className="text-2xl font-bold text-white">{uniqueCountries}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {tripTypeData.length > 0 && (
        <Card className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Trip Type Distribution</h3>
          <div className="bg-slate-700/30 rounded-lg p-4">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tripTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percent }) => `${type} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {tripTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={typeColors[entry.type as keyof typeof typeColors] || typeColors.other} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '0.75rem',
                    color: '#ffffff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Recent Trips</h3>
        {filteredTrips.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No trips found for the selected period</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTrips.slice(0, 5).map((trip) => (
              <div key={trip.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-blue-600/20 text-white">
                    {getTripIcon(trip.trip_type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">
                      {trip.name || `${trip.origin_location?.name} → ${trip.destination_location?.name}`}
                    </h4>
                    <p className="text-sm text-slate-400">
                      {trip.departure_date ? new Date(trip.departure_date).toLocaleDateString() : 'No date'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">{formatDistance(trip.distance_km || 0)}</p>
                  <p className="text-sm text-slate-400">{formatDuration(trip.duration_minutes || 0)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default SummaryPage;