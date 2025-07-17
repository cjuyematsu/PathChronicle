"use client";

import React, { useState } from 'react';
import { Calendar, MapPin, Plane, Train, Bus, Car, Ship, MoreHorizontal, Clock, Globe, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Trip {
  id: number;
  user_id: number;
  name: string | null;
  trip_type: 'flight' | 'train' | 'bus' | 'car' | 'ferry' | 'other';
  origin_location_id: number;
  destination_location_id: number;
  departure_date: string | null;
  arrival_date: string | null;
  departure_time: string | null;
  arrival_time: string | null;
  flight_number: string | null;
  train_number: string | null;
  airline: string | null;
  operator: string | null;
  distance_km: number | null;
  duration_minutes: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  origin_location?: {
    id: number;
    name: string;
    city?: string;
    country_code?: string;
  };
  destination_location?: {
    id: number;
    name: string;
    city?: string;
    country_code?: string;
  };
}

const mockTrips: Trip[] = [
  {
    id: 1,
    user_id: 1,
    name: "Business Trip to Tokyo",
    trip_type: 'flight',
    origin_location_id: 1,
    destination_location_id: 2,
    departure_date: '2024-03-15',
    arrival_date: '2024-03-16',
    departure_time: '14:30',
    arrival_time: '09:45',
    flight_number: 'AA123',
    train_number: null,
    airline: 'American Airlines',
    operator: null,
    distance_km: 10800,
    duration_minutes: 795,
    notes: 'Remember to bring presentation materials',
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
    origin_location: {
      id: 1,
      name: 'John F. Kennedy International Airport',
      city: 'New York',
      country_code: 'US'
    },
    destination_location: {
      id: 2,
      name: 'Tokyo Haneda Airport',
      city: 'Tokyo',
      country_code: 'JP'
    }
  },
  {
    id: 2,
    user_id: 1,
    name: "Train to Paris",
    trip_type: 'train',
    origin_location_id: 3,
    destination_location_id: 4,
    departure_date: '2024-04-20',
    arrival_date: '2024-04-20',
    departure_time: '08:15',
    arrival_time: '10:45',
    flight_number: null,
    train_number: 'TGV2307',
    airline: null,
    operator: 'SNCF',
    distance_km: 450,
    duration_minutes: 150,
    notes: null,
    created_at: '2024-03-01T14:30:00Z',
    updated_at: '2024-03-01T14:30:00Z',
    origin_location: {
      id: 3,
      name: 'London St Pancras',
      city: 'London',
      country_code: 'GB'
    },
    destination_location: {
      id: 4,
      name: 'Paris Gare du Nord',
      city: 'Paris',
      country_code: 'FR'
    }
  },
  {
    id: 3,
    user_id: 1,
    name: "Road Trip to Mountains",
    trip_type: 'car',
    origin_location_id: 5,
    destination_location_id: 6,
    departure_date: '2024-05-10',
    arrival_date: '2024-05-10',
    departure_time: '06:00',
    arrival_time: '13:30',
    flight_number: null,
    train_number: null,
    airline: null,
    operator: null,
    distance_km: 650,
    duration_minutes: 450,
    notes: 'Scenic route through countryside',
    created_at: '2024-04-15T09:00:00Z',
    updated_at: '2024-04-15T09:00:00Z',
    origin_location: {
      id: 5,
      name: 'Denver International Airport',
      city: 'Denver',
      country_code: 'US'
    },
    destination_location: {
      id: 6,
      name: 'Aspen',
      city: 'Aspen',
      country_code: 'US'
    }
  }
];

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
    </div>
  </div>
);

const PageLayout = ({ children, title, subtitle }: { 
  children: React.ReactNode; 
  title: string; 
  subtitle?: string; 
}) => (
  <div className="min-h-screen bg-slate-900 flex flex-col">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        {subtitle && <p className="text-slate-400">{subtitle}</p>}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  </div>
);

const Card = ({ children, className = "" }: { 
  children: React.ReactNode; 
  className?: string; 
}) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-lg shadow-sm p-6 ${className}`}>
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
    className={`px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white ${className}`}
  >
    {children}
  </select>
);

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
  const [trips, setTrips] = useState<Trip[]>([]);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [selectedYear, setSelectedYear] = useState('all');
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    setTimeout(() => {
      setTrips(mockTrips);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <PageLayout title="Trip Summary Dashboard" subtitle="Overview of your travel statistics">
        <LoadingSpinner />
      </PageLayout>
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
    <PageLayout title="Trip Summary Dashboard" subtitle="Overview of your travel statistics">
      <Card className="mb-8">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-slate-400 mb-2">Filter by Year</label>
            <Select
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
              <p className="text-2xl font-bold text-white">{formatDistance(totalDistance)}</p>
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
              <p className="text-sm font-medium text-slate-400">Average Trip</p>
              <p className="text-2xl font-bold text-white">{formatDistance(totalTrips > 0 ? totalDistance / totalTrips : 0)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </Card>
      </div>

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
                  <Cell key={`cell-${index}`} fill={typeColors[entry.type as keyof typeof typeColors]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '0.5rem',
                  color: '#ffffff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Recent Trips</h3>
        <div className="space-y-4">
          {filteredTrips.slice(0, 5).map((trip) => (
            <div key={trip.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-blue-600/20">
                  {getTripIcon(trip.trip_type)}
                </div>
                <div>
                  <h4 className="font-medium text-white">{trip.name || 'Unnamed Trip'}</h4>
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
      </Card>
    </PageLayout>
  );
};

export default SummaryPage;
