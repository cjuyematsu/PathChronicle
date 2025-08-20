"use client";

import { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { User, LocationData } from '@/src/types';
import { GuestTrip } from '@/src/types';

// Define the shape of the context data
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, countryCode: string) => Promise<void>;
  logout: () => void;
  updateUserCountry: (countryCode: string) => Promise<void>;
  loginAsGuest: () => void;
  convertGuestToUser: (email: string, password: string, countryCode: string) => Promise<void>;
}

interface StoredLocation extends LocationData {
    id: number;
}

const backendLink = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";


// In-memory data store for guest users
export class GuestDataStore {
  private static instance: GuestDataStore;
  private trips: Map<number, GuestTrip[]> = new Map();
  private locations: Map<number, StoredLocation> = new Map();
  private nextTripId = 1;
  private nextLocationId = -1;

  static getInstance(): GuestDataStore {
    if (!GuestDataStore.instance) {
      GuestDataStore.instance = new GuestDataStore();
    }
    return GuestDataStore.instance;
  }

  getNextTripId(): number {
    return this.nextTripId++;
  }

  addTrip(userId: number, trip: GuestTrip) {
    const trips = this.trips.get(userId) || [];
    const newTrip = { ...trip, id: trip.id || this.getNextTripId() };
    trips.push(newTrip);
    this.trips.set(userId, trips);
    console.log('Guest trip added:', newTrip);
    console.log('All trips for user:', trips);
    return newTrip;
  }

  getTrips(userId: number) {
    const trips = this.trips.get(userId) || [];
    console.log(`Getting trips for guest user ${userId}:`, trips);
    return trips;
  }

  deleteTrip(userId: number, tripId: number) {
    const trips = this.trips.get(userId) || [];
    const filtered = trips.filter(t => t.id !== tripId);
    this.trips.set(userId, filtered);
    console.log(`Deleted trip ${tripId} for user ${userId}`);
  }

  clearUserData(userId: number) {
    this.trips.delete(userId);
    const userLocationKeys = Array.from(this.locations.keys()).filter(key => key < 0);
    userLocationKeys.forEach(key => this.locations.delete(key));
    console.log(`Cleared all data for user ${userId}`);
  }

  getVisitedCountries(userId: number): string[] {
    const trips = this.trips.get(userId) || [];
    const countries = new Set<string>();
    
    trips.forEach(trip => {
      // Check various possible field names for country data
      if (trip.origin_country) {
        countries.add(trip.origin_country.toLowerCase());
      }
      if (trip.destination_country) {
        countries.add(trip.destination_country.toLowerCase());
      }
      // These fields might not exist on all trips, so we check them conditionally
      if ('origin_country_code' in trip && trip.origin_country_code) {
        countries.add(trip.origin_country_code.toLowerCase());
      }
      if ('destination_country_code' in trip && trip.destination_country_code) {
        countries.add(trip.destination_country_code.toLowerCase());
      }
    });
    
    const countryArray = Array.from(countries);
    console.log(`Getting visited countries for user ${userId}:`, countryArray);
    return countryArray;
  }

  // Store location data for guest mode
  saveLocation(location: LocationData) {
    const id = this.nextLocationId--;
    this.locations.set(id, { ...location, id });
    console.log('Guest location saved:', { id, ...location });
    return id;
  }

  getLocation(id: number) {
    return this.locations.get(id);
  }

  getAllLocations() {
    return Array.from(this.locations.values());
  }

  // Debug method to see all stored data
  debugPrintAll() {
    console.log('=== GUEST DATA STORE DEBUG ===');
    console.log('Trips:', Array.from(this.trips.entries()));
    console.log('Locations:', Array.from(this.locations.entries()));
    console.log('==============================');
  }
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    setLoading(true);

    const guestCookie = Cookies.get('guest-session');
    const token = Cookies.get('auth-token');

    if (guestCookie) {
      // Key Fix: Restore the exact guest user object from the cookie
      try {
        const guestUser = JSON.parse(guestCookie);
        setUser(guestUser);
        setIsGuest(true);
      } catch (e) {
        console.error("Failed to parse guest cookie, clearing it.", e);
        Cookies.remove('guest-session');
      }
    } else if (token) {
      // Fetch real user data from your API
      try {
        const response = await fetch(`${backendLink}/api/auth/userdata`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch user data');
        const userData: User = await response.json();
        setUser(userData);
        setIsGuest(false);
      } catch (e) {
        console.error("User session invalid, clearing it.", e);
        Cookies.remove('auth-token');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const loginAsGuest = () => {
    const guestUser: User = {
      id: -Math.floor(Math.random() * 1000000), // Unique ID for the session
      name: 'Guest User',
      email: 'guest@example.com',
      countryCode: 'xx',
      isGuest: true
    };
    
    // Key Fix: Store the entire guest user object in the cookie
    Cookies.set('guest-session', JSON.stringify(guestUser));
    
    setUser(guestUser);
    setIsGuest(true);
    router.push('/');
  };

  const updateUserCountry = async (countryCode: string) => {
    if (isGuest && user) {
      // Key Fix: Update the user state AND the cookie for guests
      const updatedUser = { ...user, countryCode };
      setUser(updatedUser);
      Cookies.set('guest-session', JSON.stringify(updatedUser));
      return;
    }

    const token = Cookies.get('auth-token');
    if (!token) throw new Error('No authentication token found');

    // Your existing logic for updating a real user's country
    await fetch(`${backendLink}/api/auth/update-country`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ countryCode }),
    });

    setUser(prev => prev ? { ...prev, countryCode } : null);
  };

  const logout = () => {
    if (isGuest && user) {
      GuestDataStore.getInstance().clearUserData(user.id);
      Cookies.remove('guest-session');
    } else {
      Cookies.remove('auth-token');
    }
    setUser(null);
    setIsGuest(false);
    router.push('/login');
  };

  const login = async (email: string, password: string) => {
    Cookies.remove('guest-session'); 
    const response = await fetch(`${backendLink}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    Cookies.set('auth-token', data.token, { expires: 1, secure: true, sameSite: 'strict' });
    await fetchUser();
    router.push('/');
  };

  const signup = async (email: string, password: string, countryCode: string) => {
    Cookies.remove('guest-session'); 
    const response = await fetch(`${backendLink}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, countryCode }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Signup failed');
    Cookies.set('auth-token', data.token, { expires: 1, secure: true, sameSite: 'strict' });
    await fetchUser();
    router.push('/');
  };

  const convertGuestToUser = async (email: string, password: string, countryCode: string) => {
  if (!isGuest || !user) {
    throw new Error('Not a guest user');
  }

  try {
    // Get guest's trips from the data store
    const guestStore = GuestDataStore.getInstance();
    const guestTrips = guestStore.getTrips(user.id);
    
    console.log('Migrating guest trips:', guestTrips);

    // Sign up the user
    const response = await fetch(`${backendLink}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, countryCode }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    Cookies.set('auth-token', data.token, { expires: 1, secure: true, sameSite: 'strict' });
    
    // Migrate guest trips to the new user account
    console.log(`Migrating ${guestTrips.length} trips to new user account...`);
    
    for (const trip of guestTrips) {
      try {
        let originLocationId = trip.origin_location_id;
        if (trip.origin_location_id < 0) { 
          const originResponse = await fetch(`${backendLink}/api/locations/save`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.token}`
            },
            body: JSON.stringify({
              name: trip.origin_name,
              city: trip.origin_city,
              country: trip.origin_country,
              country_code: trip.origin_country,
              location_type: 'other',
              latitude: trip.origin_lat,
              longitude: trip.origin_lon
            })
          });
          
          if (originResponse.ok) {
            const originData = await originResponse.json();
            originLocationId = originData.id;
          }
        }

        let destinationLocationId = trip.destination_location_id;
        if (trip.destination_location_id < 0) { 
          const destResponse = await fetch(`${backendLink}/api/locations/save`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.token}`
            },
            body: JSON.stringify({
              name: trip.destination_name,
              city: trip.destination_city,
              country: trip.destination_country,
              country_code: trip.destination_country,
              location_type: 'other',
              latitude: trip.destination_lat,
              longitude: trip.destination_lon
            })
          });
          
          if (destResponse.ok) {
            const destData = await destResponse.json();
            destinationLocationId = destData.id;
          }
        }

        // Now create the trip with the proper location IDs
        const tripResponse = await fetch(`${backendLink}/api/trips`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.token}`
          },
          body: JSON.stringify({
            user_id: data.user.id,
            name: trip.name,
            trip_type: trip.trip_type,
            origin_location_id: originLocationId,
            destination_location_id: destinationLocationId,
            departure_date: trip.departure_date,
            arrival_date: trip.arrival_date,
            departure_time: trip.departure_time,
            arrival_time: trip.arrival_time,
            flight_number: trip.flight_number,
            train_number: trip.train_number,
            airline: trip.airline,
            operator: trip.operator,
            notes: trip.notes
          }),
        });

        if (tripResponse.ok) {
          console.log(`Successfully migrated trip: ${trip.name || 'Unnamed trip'}`);
        } else {
          console.error(`Failed to migrate trip: ${trip.name || 'Unnamed trip'}`, await tripResponse.text());
        }
      } catch (error) {
        console.error('Failed to migrate trip:', trip, error);
      }
    }

    sessionStorage.removeItem('guestUser');
    guestStore.clearUserData(user.id);
    setIsGuest(false);
    
    await fetchUser();
    
    console.log('Guest to user conversion complete!');
    
    if (guestTrips.length > 0) {
      alert(`Successfully created your account and saved ${guestTrips.length} trip(s)!`);
    }
    
    router.push('/');
  } catch (error) {
    console.error('Error converting guest to user:', error);
    throw error;
  }
};

  const value = { 
    user, 
    isAuthenticated: !!user, 
    isGuest,
    login, 
    signup, 
    logout, 
    updateUserCountry,
    loginAsGuest,
    convertGuestToUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Create the custom hook for easy access
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}