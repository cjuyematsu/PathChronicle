"use client";

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, MapPin, Clock, Plane, Train, Car, Ship, Bus, TrendingUp, Globe, Award } from 'lucide-react';
import { Trip } from '@/src/types';

interface User {
  id: number;
  name: string;
  email: string;
}

interface TripTypeData {
  type: string;
  count: number;
}

interface MonthlyData {
  month: string;
  distance: number;
}

type TripType = 'flight' | 'train' | 'bus' | 'car' | 'ferry' | 'other';

const useAuth = () => ({
  user: { id: 1, name: 'John Doe', email: 'john@example.com' } as User,
  isAuthenticated: true
});

const TripSummaryPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedTripType, setSelectedTripType] = useState('all');
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');

  useEffect(() => {
    const mockTrips: Trip[] = [
      { 
        id: 1, 
        user_id: 1,
        name: 'Business Trip to NYC', 
        trip_type: 'flight', 
        origin_location_id: 1,
        destination_location_id: 2,
        departure_date: '2024-01-15',
        arrival_date: '2024-01-15',
        departure_time: '08:00',
        arrival_time: '16:00',
        flight_number: 'AA123',
        train_number: null,
        airline: 'American Airlines',
        operator: null,
        distance_km: 3500, 
        duration_minutes: 480,
        notes: null,
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-01-10T10:00:00Z'
      },
      { 
        id: 2, 
        user_id: 1,
        name: 'Weekend in Paris', 
        trip_type: 'flight', 
        origin_location_id: 1,
        destination_location_id: 3,
        departure_date: '2024-02-20',
        arrival_date: '2024-02-20',
        departure_time: '10:30',
        arrival_time: '13:30',
        flight_number: 'AF456',
        train_number: null,
        airline: 'Air France',
        operator: null,
        distance_km: 1200, 
        duration_minutes: 180,
        notes: null,
        created_at: '2024-02-15T10:00:00Z',
        updated_at: '2024-02-15T10:00:00Z'
      },
      { 
        id: 3, 
        user_id: 1,
        name: 'Train to Berlin', 
        trip_type: 'train', 
        origin_location_id: 3,
        destination_location_id: 4,
        departure_date: '2024-03-10',
        arrival_date: '2024-03-10',
        departure_time: '09:00',
        arrival_time: '16:00',
        flight_number: null,
        train_number: 'ICE789',
        airline: null,
        operator: 'Deutsche Bahn',
        distance_km: 850, 
        duration_minutes: 420,
        notes: null,
        created_at: '2024-03-05T10:00:00Z',
        updated_at: '2024-03-05T10:00:00Z'
      },
      { 
        id: 4, 
        user_id: 1,
        name: 'Road Trip to Mountains', 
        trip_type: 'car', 
        origin_location_id: 1,
        destination_location_id: 5,
        departure_date: '2024-04-05',
        arrival_date: '2024-04-05',
        departure_time: '08:00',
        arrival_time: '14:00',
        flight_number: null,
        train_number: null,
        airline: null,
        operator: null,
        distance_km: 650, 
        duration_minutes: 360,
        notes: 'Scenic route through countryside',
        created_at: '2024-04-01T10:00:00Z',
        updated_at: '2024-04-01T10:00:00Z'
      },
      { 
        id: 5, 
        user_id: 1,
        name: 'Ferry to Ireland', 
        trip_type: 'ferry', 
        origin_location_id: 6,
        destination_location_id: 7,
        departure_date: '2024-05-12',
        arrival_date: '2024-05-12',
        departure_time: '22:00',
        arrival_time: '06:00',
        flight_number: null,
        train_number: null,
        airline: null,
        operator: 'Irish Ferries',
        distance_km: 220, 
        duration_minutes: 240,
        notes: null,
        created_at: '2024-05-08T10:00:00Z',
        updated_at: '2024-05-08T10:00:00Z'
      },
      { 
        id: 6, 
        user_id: 1,
        name: 'Summer Vacation', 
        trip_type: 'flight', 
        origin_location_id: 1,
        destination_location_id: 8,
        departure_date: '2024-06-18',
        arrival_date: '2024-06-18',
        departure_time: '07:00',
        arrival_time: '17:00',
        flight_number: 'BA901',
        train_number: null,
        airline: 'British Airways',
        operator: null,
        distance_km: 4200, 
        duration_minutes: 600,
        notes: null,
        created_at: '2024-06-10T10:00:00Z',
        updated_at: '2024-06-10T10:00:00Z'
      },
      { 
        id: 7, 
        user_id: 1,
        name: 'City Break', 
        trip_type: 'train', 
        origin_location_id: 1,
        destination_location_id: 9,
        departure_date: '2024-07-22',
        arrival_date: '2024-07-22',
        departure_time: '11:00',
        arrival_time: '14:00',
        flight_number: null,
        train_number: 'TH234',
        airline: null,
        operator: 'Thalys',
        distance_km: 420, 
        duration_minutes: 180,
        notes: null,
        created_at: '2024-07-18T10:00:00Z',
        updated_at: '2024-07-18T10:00:00Z'
      },
      { 
        id: 8, 
        user_id: 1,
        name: 'Bus Tour', 
        trip_type: 'bus', 
        origin_location_id: 1,
        destination_location_id: 10,
        departure_date: '2024-08-14',
        arrival_date: '2024-08-14',
        departure_time: '09:00',
        arrival_time: '14:00',
        flight_number: null,
        train_number: null,
        airline: null,
        operator: 'Eurolines',
        distance_km: 380, 
        duration_minutes: 300,
        notes: null,
        created_at: '2024-08-10T10:00:00Z',
        updated_at: '2024-08-10T10:00:00Z'
      },
      { 
        id: 9, 
        user_id: 1,
        name: 'Fall Conference', 
        trip_type: 'flight', 
        origin_location_id: 1,
        destination_location_id: 11,
        departure_date: '2023-10-10',
        arrival_date: '2023-10-10',
        departure_time: '12:00',
        arrival_time: '19:00',
        flight_number: 'LH567',
        train_number: null,
        airline: 'Lufthansa',
        operator: null,
        distance_km: 2800, 
        duration_minutes: 420,
        notes: null,
        created_at: '2023-10-05T10:00:00Z',
        updated_at: '2023-10-05T10:00:00Z'
      },
      { 
        id: 10, 
        user_id: 1,
        name: 'Holiday Trip', 
        trip_type: 'flight', 
        origin_location_id: 1,
        destination_location_id: 12,
        departure_date: '2023-12-20',
        arrival_date: '2023-12-20',
        departure_time: '06:00',
        arrival_time: '18:00',
        flight_number: 'EK890',
        train_number: null,
        airline: 'Emirates',
        operator: null,
        distance_km: 5200, 
        duration_minutes: 720,
        notes: null,
        created_at: '2023-12-15T10:00:00Z',
        updated_at: '2023-12-15T10:00:00Z'
      }
    ];
    
    setTimeout(() => {
      setTrips(mockTrips);
      setLoading(false);
    }, 1000);
  }, []);

  const kmToMiles = (km: number): number => km * 0.621371;
  
  const formatDistance = (km: number): string => {
    if (unitSystem === 'metric') {
      return `${km.toLocaleString()} km`;
    } else {
      return `${Math.round(kmToMiles(km)).toLocaleString()} mi`;
    }
  };

  const getDistanceValue = (km: number): number => {
    return unitSystem === 'metric' ? km : kmToMiles(km);
  };

  const filteredTrips = trips.filter(trip => {
    const tripYear = trip.departure_date ? new Date(trip.departure_date).getFullYear().toString() : '';
    const yearMatch = selectedYear === 'all' || tripYear === selectedYear;
    const typeMatch = selectedTripType === 'all' || trip.trip_type === selectedTripType;
    return yearMatch && typeMatch;
  });

  const totalDistance = filteredTrips.reduce((sum, trip) => sum + (trip.distance_km || 0), 0);
  const totalTrips = filteredTrips.length;
  const totalDuration = filteredTrips.reduce((sum, trip) => sum + (trip.duration_minutes || 0), 0);
  const averageDistance = totalTrips > 0 ? totalDistance / totalTrips : 0;

  const availableYears = [...new Set(trips
    .filter(trip => trip.departure_date)
    .map(trip => new Date(trip.departure_date!).getFullYear().toString())
  )].sort().reverse();

  const tripTypeData: TripTypeData[] = Object.entries(
    filteredTrips.reduce((acc: Record<string, number>, trip) => {
      acc[trip.trip_type] = (acc[trip.trip_type] || 0) + 1;
      return acc;
    }, {})
  ).map(([type, count]) => ({ type, count }));

  const monthlyData = filteredTrips.reduce((acc: Record<string, number>, trip) => {
    if (trip.departure_date) {
      const month = new Date(trip.departure_date).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + getDistanceValue(trip.distance_km || 0);
    }
    return acc;
  }, {});

  const monthlyChartData: MonthlyData[] = Object.entries(monthlyData).map(([month, distance]) => ({
    month,
    distance: Math.round(distance)
  }));

  const typeColors: Record<TripType, string> = {
    flight: '#3B82F6',
    train: '#10B981',
    car: '#F59E0B',
    bus: '#8B5CF6',
    ferry: '#06B6D4',
    other: '#6B7280'
  };

  const getTypeIcon = (type: TripType) => {
    switch (type) {
      case 'flight': return <Plane className="w-4 h-4" />;
      case 'train': return <Train className="w-4 h-4" />;
      case 'car': return <Car className="w-4 h-4" />;
      case 'bus': return <Bus className="w-4 h-4" />;
      case 'ferry': return <Ship className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getCarbonFootprint = (distance: number, type: TripType): number => {
    const emissions: Record<TripType, number> = {
      flight: 0.255, 
      train: 0.041,
      car: 0.171,
      bus: 0.089,
      ferry: 0.113,
      other: 0.1
    };
    return Math.round(distance * emissions[type]);
  };

  const totalCarbonFootprint = filteredTrips.reduce((sum, trip) => 
    sum + getCarbonFootprint(trip.distance_km || 0, trip.trip_type), 0
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your trip summary</h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trip Summary Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}! Here&apos;s your travel overview.</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                <option value="all">All Years</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Trip Type</label>
              <select
                value={selectedTripType}
                onChange={(e) => setSelectedTripType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                <option value="all">All Types</option>
                <option value="flight">Flight</option>
                <option value="train">Train</option>
                <option value="car">Car</option>
                <option value="bus">Bus</option>
                <option value="ferry">Ferry</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Units</label>
              <select
                value={unitSystem}
                onChange={(e) => setUnitSystem(e.target.value as 'metric' | 'imperial')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                <option value="metric">Kilometers</option>
                <option value="imperial">Miles</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Distance</p>
                <p className="text-2xl font-bold text-gray-900">{formatDistance(totalDistance)}</p>
              </div>
              <Globe className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Trips</p>
                <p className="text-2xl font-bold text-gray-900">{totalTrips}</p>
              </div>
              <MapPin className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Travel Time</p>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(totalDuration)}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Carbon Footprint</p>
                <p className="text-2xl font-bold text-gray-900">{totalCarbonFootprint} kg CO₂</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Monthly Distance Traveled ({unitSystem === 'metric' ? 'km' : 'miles'})
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`${value} ${unitSystem === 'metric' ? 'km' : 'mi'}`, 'Distance']} />
                <Bar dataKey="distance" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Type Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                    data={tripTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                >
                    {tripTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={typeColors[entry.type as TripType]} />
                    ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Trips</h3>
          <div className="space-y-4">
            {filteredTrips.slice(0, 5).map((trip) => (
              <div key={trip.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full" style={{ backgroundColor: `${typeColors[trip.trip_type]}20` }}>
                    {getTypeIcon(trip.trip_type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{trip.name || 'Unnamed Trip'}</h4>
                    <p className="text-sm text-gray-500">
                      {trip.departure_date ? new Date(trip.departure_date).toLocaleDateString() : 'No date'}
                    </p>
                    {trip.flight_number && (
                      <p className="text-xs text-gray-400">Flight: {trip.flight_number}</p>
                    )}
                    {trip.train_number && (
                      <p className="text-xs text-gray-400">Train: {trip.train_number}</p>
                    )}
                    {trip.operator && (
                      <p className="text-xs text-gray-400">Operator: {trip.operator}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatDistance(trip.distance_km || 0)}</p>
                  <p className="text-sm text-gray-500">{formatDuration(trip.duration_minutes || 0)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Travel Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
              <Award className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="font-medium text-gray-900">Distance Milestone</p>
                <p className="text-sm text-gray-600">
                  {totalDistance > 50000 ? 'World Traveler' : 
                   totalDistance > 25000 ? 'Explorer' : 
                   totalDistance > 10000 ? 'Adventurer' : 'Getting Started'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900">Trip Frequency</p>
                <p className="text-sm text-gray-600">
                  {totalTrips > 20 ? 'Frequent Traveler' : 
                   totalTrips > 10 ? 'Regular Traveler' : 
                   totalTrips > 5 ? 'Occasional Traveler' : 'New Traveler'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <p className="font-medium text-gray-900">Average Trip</p>
                <p className="text-sm text-gray-600">{Math.round(getDistanceValue(averageDistance))} {unitSystem === 'metric' ? 'km' : 'mi'} per trip</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripSummaryPage;