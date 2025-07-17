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

// Mock data
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
    name: null,
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
      name: 'Paris Gare du Nord',
      city: 'Paris',
      country_code: 'FR'
    },
    destination_location: {
      id: 4,
      name: 'Lyon Part-Dieu',
      city: 'Lyon',
      country_code: 'FR'
    }
  },
  {
    id: 3,
    user_id: 1,
    name: "Road Trip to Grand Canyon",
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
    distance_km: 680,
    duration_minutes: 450,
    notes: 'Pack camping gear and plenty of water',
    created_at: '2024-04-15T09:00:00Z',
    updated_at: '2024-04-15T09:00:00Z',
    origin_location: {
      id: 5,
      name: 'Phoenix Sky Harbor',
      city: 'Phoenix',
      country_code: 'US'
    },
    destination_location: {
      id: 6,
      name: 'Grand Canyon Village',
      city: 'Grand Canyon',
      country_code: 'US'
    }
  },
  {
    id: 4,
    user_id: 1,
    name: "Weekend in Barcelona",
    trip_type: 'flight',
    origin_location_id: 7,
    destination_location_id: 8,
    departure_date: '2024-06-05',
    arrival_date: '2024-06-05',
    departure_time: '11:20',
    arrival_time: '13:35',
    flight_number: 'IB6254',
    train_number: null,
    airline: 'Iberia',
    operator: null,
    distance_km: 620,
    duration_minutes: 135,
    notes: 'Check hotel reservation confirmation',
    created_at: '2024-05-20T16:45:00Z',
    updated_at: '2024-05-20T16:45:00Z',
    origin_location: {
      id: 7,
      name: 'Madrid-Barajas Airport',
      city: 'Madrid',
      country_code: 'ES'
    },
    destination_location: {
      id: 8,
      name: 'Barcelona-El Prat Airport',
      city: 'Barcelona',
      country_code: 'ES'
    }
  },
  {
    id: 5,
    user_id: 1,
    name: null,
    trip_type: 'bus',
    origin_location_id: 9,
    destination_location_id: 10,
    departure_date: '2024-07-12',
    arrival_date: '2024-07-12',
    departure_time: '09:30',
    arrival_time: '14:15',
    flight_number: null,
    train_number: null,
    airline: null,
    operator: 'Megabus',
    distance_km: 350,
    duration_minutes: 285,
    notes: 'Bring entertainment for long journey',
    created_at: '2024-06-25T11:20:00Z',
    updated_at: '2024-06-25T11:20:00Z',
    origin_location: {
      id: 9,
      name: 'London Victoria Coach Station',
      city: 'London',
      country_code: 'GB'
    },
    destination_location: {
      id: 10,
      name: 'Edinburgh Bus Station',
      city: 'Edinburgh',
      country_code: 'GB'
    }
  },
  {
    id: 6,
    user_id: 1,
    name: "Island Ferry Adventure",
    trip_type: 'ferry',
    origin_location_id: 11,
    destination_location_id: 12,
    departure_date: '2024-08-03',
    arrival_date: '2024-08-03',
    departure_time: '16:00',
    arrival_time: '18:30',
    flight_number: null,
    train_number: null,
    airline: null,
    operator: 'BC Ferries',
    distance_km: 85,
    duration_minutes: 150,
    notes: 'Beautiful sunset views expected',
    created_at: '2024-07-18T13:10:00Z',
    updated_at: '2024-07-18T13:10:00Z',
    origin_location: {
      id: 11,
      name: 'Tsawwassen Terminal',
      city: 'Vancouver',
      country_code: 'CA'
    },
    destination_location: {
      id: 12,
      name: 'Swartz Bay Terminal',
      city: 'Victoria',
      country_code: 'CA'
    }
  }
];

const RemoveTripPage = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTripType, setSelectedTripType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    // Simulate API call with mock data
    const fetchTrips = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTrips(mockTrips);
      setLoading(false);
    };

    fetchTrips();
  }, []);

  const deleteTrip = async (tripId: number) => {
    try {
      setDeleteLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTrips(prev => prev.filter(trip => trip.id !== tripId));
      setTripToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setDeleteLoading(false);
    }
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTripDisplayName = (trip: Trip) => {
    if (trip.name) return trip.name;
    const origin = trip.origin_location?.name || 'Unknown';
    const destination = trip.destination_location?.name || 'Unknown';
    return `${origin} → ${destination}`;
  };

  const getLocationDisplay = (location: Trip['origin_location'] | Trip['destination_location']) => {
    if (!location) return { name: 'Unknown', city: '', country: '' };
    return {
      name: location.name,
      city: location.city || '',
      country: location.country_code || ''
    };
  };

  // Filter and sort trips
  const filteredAndSortedTrips = useMemo(() => {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Trips</h1>
          <p className="text-gray-600">Search and remove trips from your collection</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 text-black">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search trips, locations, flight numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <select
                value={selectedTripType}
                onChange={(e) => setSelectedTripType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="flight">Flight</option>
                <option value="train">Train</option>
                <option value="bus">Bus</option>
                <option value="car">Car</option>
                <option value="ferry">Ferry</option>
                <option value="other">Other</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="type">Sort by Type</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredAndSortedTrips.length} of {trips.length} trips
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {filteredAndSortedTrips.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500 text-lg">No trips found matching your criteria</p>
            </div>
          ) : (
            filteredAndSortedTrips.map((trip) => {
              const originDisplay = getLocationDisplay(trip.origin_location);
              const destinationDisplay = getLocationDisplay(trip.destination_location);
              
              return (
                <div key={trip.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                          {getTripIcon(trip.trip_type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {getTripDisplayName(trip)}
                          </h3>
                          <p className="text-sm text-gray-500 capitalize">{trip.trip_type}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{originDisplay.name}</p>
                            <p className="text-xs text-gray-500">
                              {originDisplay.city && originDisplay.country 
                                ? `${originDisplay.city}, ${originDisplay.country}`
                                : originDisplay.city || originDisplay.country || 'Unknown location'
                              }
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{destinationDisplay.name}</p>
                            <p className="text-xs text-gray-500">
                              {destinationDisplay.city && destinationDisplay.country 
                                ? `${destinationDisplay.city}, ${destinationDisplay.country}`
                                : destinationDisplay.city || destinationDisplay.country || 'Unknown location'
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{formatDate(trip.departure_date)}</p>
                            {trip.departure_time && (
                              <p className="text-xs text-gray-500">{formatTime(trip.departure_time)}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Additional Details */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
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
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{trip.notes}</p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setTripToDelete(trip)}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete trip"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {tripToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Trip</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete &ldquo;{getTripDisplayName(tripToDelete)}&rdquo;? 
                This action cannot be undone.
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setTripToDelete(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteTrip(tripToDelete.id)}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemoveTripPage;