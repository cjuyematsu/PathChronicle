"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Trash2, Calendar, MapPin, Plane, Train, Bus, Car, Ship, MoreHorizontal, AlertTriangle } from 'lucide-react';
import { ManageTripType, TripApiResponse } from '@/src/types';
import { useAuth } from '../../context/AuthContext';

const Card = ({ children, className = "", hover = false }: { 
  children: React.ReactNode; 
  className?: string; 
  hover?: boolean; 
}) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-xl p-6 ${hover ? 'hover:bg-slate-750 transition-colors' : ''} ${className}`}>
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
  const baseClasses = "rounded-xl font-medium transition-all focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2";
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-slate-700 text-slate-200 hover:bg-slate-600 focus:ring-slate-500 border border-slate-600",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "text-slate-400 hover:text-slate-200 hover:bg-slate-700 focus:ring-slate-500"
  };
  
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3",
    lg: "px-6 py-4 text-lg"
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
  <div className="relative">
    {Icon && (
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
    )}
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3 bg-slate-800 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white placeholder-slate-400 ${className}`}
    />
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

const ManageTripsPage = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<ManageTripType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTripType, setSelectedTripType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tripToDelete, setTripToDelete] = useState<ManageTripType | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchTrips();
    }
  }, [user]);

  const fetchTrips = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/trips/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('auth-token=')[1]?.split(';')[0] || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }

      const trips = await response.json();
      
      // Transform backend response to match frontend type
      const formattedTrips: ManageTripType[] = trips.map((trip: TripApiResponse) => ({
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
      
      setTrips(formattedTrips);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trips');
      console.error('Error fetching trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (tripId: number) => {
    if (!user?.id) return;
    
    try {
      setDeleting(true);
      
      const response = await fetch(`/api/trips/delete/${tripId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('auth-token=')[1]?.split(';')[0] || ''}`
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete trip');
      }
      
      setTrips(prev => prev.filter(trip => trip.id !== tripId));
      setTripToDelete(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete trip');
    } finally {
      setDeleting(false);
    }
  };

  const getTripDisplayName = (trip: ManageTripType) => {
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

  if (!user) {
    return (
      <div className="w-full h-full p-6 bg-slate-900 text-white">
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">Please log in to view your trips</p>
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
            <Button variant="secondary" onClick={fetchTrips}>
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="w-full h-full p-6 bg-slate-900 text-white">
        <div className="flex items-center justify-center py-12">
          <div className="text-bold text-3xl">Please Add Trips</div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full h-full p-6 bg-slate-900 text-white">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 py-6">Manage Trips</h2>
        <p className="text-gray-300">Search and remove trips from your collection</p>
      </div>

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
              <p className="text-slate-400 text-lg">
                {trips.length === 0 
                  ? "You haven't added any trips yet" 
                  : "No trips found matching your criteria"}
              </p>
            </div>
          </Card>
        ) : (
          filteredTrips.map((trip) => (
            <Card key={trip.id} hover>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-600/20 rounded-full text-white">
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
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => deleteTrip(tripToDelete.id)}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ManageTripsPage;