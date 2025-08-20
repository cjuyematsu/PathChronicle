// src/utils/apiWrapper.ts

import { GuestDataStore } from '@/src/context/AuthContext';
import Cookies from 'js-cookie';
import { CreateTripData, LocationData, GuestTrip } from '@/src/types';

interface ApiWrapperOptions {
  isGuest: boolean;
  userId: number;
}

// Store location data when saved (for guest mode)
const locationCache = new Map<number, LocationData>();
const backendLink = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const apiWrapper = {
  // Helper to get auth token
  getAuthToken() {
    return Cookies.get('auth-token') || '';
  },

  // Fetch trips
  async fetchTrips(options: ApiWrapperOptions) {
    console.log('Fetching trips with options:', options);
    
    if (options.isGuest) {
      const store = GuestDataStore.getInstance();
      const trips = store.getTrips(options.userId);
      console.log('Guest trips fetched:', trips);
      
      // Format trips to match the expected structure
      const formattedTrips = trips.map(trip => ({
        ...trip,
        // Ensure all fields are present
        id: trip.id,
        user_id: trip.user_id || options.userId,
        name: trip.name || '',
        trip_type: trip.trip_type || 'other',
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
        distance_km: trip.distance_km || '0',
        duration_minutes: trip.duration_minutes || 0,
        notes: trip.notes,
        created_at: trip.created_at,
        updated_at: trip.updated_at,
        // Location data for display
        origin_name: trip.origin_name || 'Unknown',
        origin_city: trip.origin_city || '',
        origin_country: trip.origin_country || '',
        origin_lat: trip.origin_lat || 0,
        origin_lon: trip.origin_lon || 0,
        destination_name: trip.destination_name || 'Unknown',
        destination_city: trip.destination_city || '',
        destination_country: trip.destination_country || '',
        destination_lat: trip.destination_lat || 0,
        destination_lon: trip.destination_lon || 0
      }));
      
      return formattedTrips;
    }
    
    const response = await fetch(`${backendLink}/api/trips/user/${options.userId}`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch trips');
    return response.json();
  },

  // Update the createTrip method (around line 80-130)
async createTrip(tripData: CreateTripData, options: ApiWrapperOptions) {
    console.log('Creating trip with data:', tripData, 'Options:', options);
    
    if (options.isGuest) {
      const store = GuestDataStore.getInstance();
      
      // Get the cached location data with proper type
      const originLocation = locationCache.get(tripData.origin_location_id);
      const destLocation = locationCache.get(tripData.destination_location_id);
      
      console.log('Origin location:', originLocation);
      console.log('Destination location:', destLocation);
      
      // Calculate distance if we have coordinates
      let distance = 0;
      if ((originLocation?.latitude || tripData.origin_lat) && 
          (destLocation?.latitude || tripData.destination_lat)) {
        distance = this.calculateDistance(
          originLocation?.latitude || tripData.origin_lat || 0,
          originLocation?.longitude || tripData.origin_lon || 0,
          destLocation?.latitude || tripData.destination_lat || 0,
          destLocation?.longitude || tripData.destination_lon || 0
        );
      }
      
      // Calculate duration if dates/times provided
      let duration_minutes = null;
      if (tripData.departure_date && tripData.arrival_date && 
          tripData.departure_time && tripData.arrival_time) {
        const departure = new Date(`${tripData.departure_date}T${tripData.departure_time}`);
        const arrival = new Date(`${tripData.arrival_date}T${tripData.arrival_time}`);
        duration_minutes = Math.round((arrival.getTime() - departure.getTime()) / (1000 * 60));
      }
      
      // Create trip with proper location data
      const newTrip: GuestTrip = {
        ...tripData,
        id: store.getNextTripId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Use provided data or fall back to cached location data
        origin_name: tripData.origin_name || originLocation?.name || 'Unknown',
        origin_city: tripData.origin_city || originLocation?.city || '',
        origin_country: tripData.origin_country || originLocation?.country_code || originLocation?.country || '',
        origin_country_code: originLocation?.country_code || tripData.origin_country || '',
        origin_lat: tripData.origin_lat || originLocation?.latitude || 0,
        origin_lon: tripData.origin_lon || originLocation?.longitude || 0,
        destination_name: tripData.destination_name || destLocation?.name || 'Unknown',
        destination_city: tripData.destination_city || destLocation?.city || '',
        destination_country: tripData.destination_country || destLocation?.country_code || destLocation?.country || '',
        destination_country_code: destLocation?.country_code || tripData.destination_country || '',
        destination_lat: tripData.destination_lat || destLocation?.latitude || 0,
        destination_lon: tripData.destination_lon || destLocation?.longitude || 0,
        distance_km: distance.toString(),
        duration_minutes: duration_minutes
      };
      
      console.log('Created guest trip:', newTrip);
      const savedTrip = store.addTrip(options.userId, newTrip);
      
      // Debug: print all data
      store.debugPrintAll();
      
      return savedTrip;
    }
    
    const response = await fetch(`${backendLink}/api/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(tripData),
    });
    
    if (!response.ok) throw new Error('Failed to create trip');
    return response.json();
},

  // Delete trip
  async deleteTrip(tripId: number, options: ApiWrapperOptions) {
    console.log('Deleting trip:', tripId, 'Options:', options);
    
    if (options.isGuest) {
      const store = GuestDataStore.getInstance();
      store.deleteTrip(options.userId, tripId);
      return { success: true };
    }
    
    const response = await fetch(`${backendLink}/api/trips/delete/${tripId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({ userId: options.userId }),
    });
    
    if (!response.ok) throw new Error('Failed to delete trip');
    return response.json();
  },

  // Get visited countries
  async getVisitedCountries(options: ApiWrapperOptions) {
    console.log('Getting visited countries with options:', options);
    
    if (options.isGuest) {
      const store = GuestDataStore.getInstance();
      const countries = store.getVisitedCountries(options.userId);
      console.log('Guest visited countries:', countries);
      return countries;
    }
    
    const response = await fetch(`${backendLink}/api/trips/countries/${options.userId}`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch visited countries');
    return response.json();
  },

  // Search locations (always uses real API)
  async searchLocations(searchTerm: string, limit: number = 10) {
    const params = new URLSearchParams({ 
      searchTerm: searchTerm, 
      limit: limit.toString(),
      lang: navigator.language.split('-')[0]
    });
    
    const response = await fetch(`${backendLink}/api/locations/search?${params}`);
    if (!response.ok) throw new Error('Failed to search locations');
    return response.json();
  },

  async saveLocation(locationData: LocationData, options?: ApiWrapperOptions) {
    console.log('Saving location:', locationData, 'Options:', options);
    
    if (options?.isGuest) {
        const store = GuestDataStore.getInstance();
        const locationId = store.saveLocation(locationData);
        
        const fullLocationData = {
            ...locationData,
            id: locationId,
            country_code: locationData.country_code || locationData.country,
            latitude: locationData.latitude,  
            longitude: locationData.longitude  
        };
        
        locationCache.set(locationId, fullLocationData);
        
        console.log('Saved guest location with coordinates:', fullLocationData);
        return { id: locationId, existed: false };
    }
    
    // For real users, save to database
    const response = await fetch(`${backendLink}/api/locations/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(locationData)
    });
    
    if (!response.ok) throw new Error('Failed to save location');
    const result = await response.json();
    
    // Also cache for potential guest mode usage
    locationCache.set(result.id, {
      ...locationData,
      id: result.id
    });
    
    return result;
  },

  // Store location data temporarily (for guest mode)
  cacheLocation(locationId: number, locationData: LocationData) {
    const dataWithCountryCode = {
        ...locationData,
        country_code: locationData.country_code || locationData.country,
        latitude: locationData.latitude,  
        longitude: locationData.longitude  
    };
    locationCache.set(locationId, dataWithCountryCode);
    console.log('Cached location:', { id: locationId, data: dataWithCountryCode });
  },

  // Get cached location
  getCachedLocation(locationId: number) {
    return locationCache.get(locationId);
  },

  // Calculate distance between two points
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  }
};