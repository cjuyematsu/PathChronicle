"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Trash2, Calendar, MapPin, Plane, Train, Bus, Car, Ship, MoreHorizontal, AlertTriangle } from 'lucide-react';

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

const Card = ({ children, className = "", hover = false }: { 
  children: React.ReactNode; 
  className?: string; 
  hover?: boolean; 
}) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-lg shadow-sm p-6 ${hover ? 'hover:bg-slate-750 transition-colors' : ''} ${className}`}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  onClick,
  className = "",
  icon: Icon
}: {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) => {
  const baseClasses = "rounded-lg font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2";
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-slate-700 text-slate-200 hover:bg-slate-600 focus:ring-slate-500 border border-slate-600",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "text-slate-400 hover:text-slate-200 hover:bg-slate-700 focus:ring-slate-500"
  };
  
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );
};

const Input = ({ 
  placeholder, 
  value, 
  onChange,
  icon: Icon,
  className = ""
}: {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) => (
  <div className={className}>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
      )}
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white placeholder-slate-400`}
      />
    </div>
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
    case 'flight': return <Plane className="w-5 h-5 text-white" />;
    case 'train': return <Train className="w-5 h-5 text-white" />;
    case 'bus': return <Bus className="w-5 h-5 text-white" />;
    case 'car': return <Car className="w-5 h-5 text-white" />;
    case 'ferry': return <Ship className="w-5 h-5 text-white" />;
    default: return <MoreHorizontal className="w-5 h-5 text-white" />;
  }
};

const ManageTripsPage = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTripType, setSelectedTripType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [loading, setLoading] = useState(true);
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setTrips(mockTrips);
      setLoading(false);
    }, 1000);
  }, []);

  const deleteTrip = async (tripId: number) => {
    setTrips(prev => prev.filter(trip => trip.id !== tripId));
    setTripToDelete(null);
  };

  const getTripDisplayName = (trip: Trip) => {
    if (trip.name) return trip.name;
    const origin = trip.origin_location?.name || 'Unknown';
    const destination = trip.destination_location?.name || 'Unknown';
    return `${origin} → ${destination}`;
  };

  const filteredTrips = useMemo(() => {
    const filtered = trips.filter(trip => {
      const matchesSearch = searchTerm === '' || 
        trip.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.origin_location?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.destination_location?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.origin_location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.destination_location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.origin_location?.country_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.destination_location?.country_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.flight_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.train_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.airline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.operator?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedTripType === 'all' || trip.trip_type === selectedTripType;
      
      return matchesSearch && matchesType;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.departure_date || '1970-01-01').getTime() - new Date(a.departure_date || '1970-01-01').getTime();
        case 'name':
          return getTripDisplayName(a).localeCompare(getTripDisplayName(b));
        case 'type':
          return a.trip_type.localeCompare(b.trip_type);
        default:
          return 0;
      }
    });

    return filtered;
  }, [trips, searchTerm, selectedTripType, sortBy]);

  if (loading) {
    return (
      <PageLayout title="Manage Trips" subtitle="Search and remove trips from your collection">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Manage Trips" subtitle="Search and remove trips from your collection">
      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <Input
            placeholder="Search trips, locations, flight numbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
            className="flex-1 max-w-md"
          />
          
          <div className="flex flex-wrap gap-4">
            <Select
              value={selectedTripType}
              onChange={(e) => setSelectedTripType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="flight">Flight</option>
              <option value="train">Train</option>
              <option value="bus">Bus</option>
              <option value="car">Car</option>
              <option value="ferry">Ferry</option>
              <option value="other">Other</option>
            </Select>

            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="type">Sort by Type</option>
            </Select>
          </div>
        </div>
      </Card>

      <div className="mb-4">
        <p className="text-slate-400">
          Showing {filteredTrips.length} of {trips.length} trips
        </p>
      </div>

      <div className="space-y-4">
        {filteredTrips.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-slate-400 text-lg">No trips found matching your criteria</p>
            </div>
          </Card>
        ) : (
          filteredTrips.map((trip) => (
            <Card key={trip.id} hover>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-600/20 rounded-full">
                      {getTripIcon(trip.trip_type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {getTripDisplayName(trip)}
                      </h3>
                      <p className="text-sm text-slate-400 capitalize">{trip.trip_type}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-white">{trip.origin_location?.name}</p>
                        <p className="text-xs text-slate-400">
                          {trip.origin_location?.city && trip.origin_location?.country_code 
                            ? `${trip.origin_location.city}, ${trip.origin_location.country_code}`
                            : trip.origin_location?.city || trip.origin_location?.country_code || 'Unknown location'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-white">{trip.destination_location?.name}</p>
                        <p className="text-xs text-slate-400">
                          {trip.destination_location?.city && trip.destination_location?.country_code 
                            ? `${trip.destination_location.city}, ${trip.destination_location.country_code}`
                            : trip.destination_location?.city || trip.destination_location?.country_code || 'Unknown location'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {trip.departure_date ? new Date(trip.departure_date).toLocaleDateString() : 'N/A'}
                        </p>
                        {trip.departure_time && (
                          <p className="text-xs text-slate-400">{trip.departure_time}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-3">
                    {trip.flight_number && (
                      <span>Flight: {trip.flight_number}</span>
                    )}
                    {trip.train_number && (
                      <span>Train: {trip.train_number}</span>
                    )}
                    {trip.airline && (
                      <span>Airline: {trip.airline}</span>
                    )}
                    {trip.operator && (
                      <span>Operator: {trip.operator}</span>
                    )}
                    {trip.distance_km && (
                      <span>Distance: {trip.distance_km} km</span>
                    )}
                    {trip.duration_minutes && (
                      <span>Duration: {Math.floor(trip.duration_minutes / 60)}h {trip.duration_minutes % 60}m</span>
                    )}
                  </div>

                  {trip.notes && (
                    <div className="mt-3 p-3 bg-slate-700/50 rounded-lg">
                      <p className="text-sm text-slate-300">{trip.notes}</p>
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTripToDelete(trip)}
                  icon={Trash2}
                  className="ml-4 text-red-400 hover:text-red-300 hover:bg-red-600/20"
                />
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Delete confirmation modal */}
      {tripToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-red-600/20 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Delete Trip</h3>
            </div>
            
            <p className="text-slate-300 mb-6">
              Are you sure you want to delete &ldquo;{getTripDisplayName(tripToDelete)}&rdquo;? 
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setTripToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => deleteTrip(tripToDelete.id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </PageLayout>
  );
};

export default ManageTripsPage;
