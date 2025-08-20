import { LocationSearchRowWithDisplay, TripType, LocationType } from "@shared/types/location";

// Trip form data interface
export interface TripFormData {
    name: string;
    trip_type: string;
    origin_location: LocationSearchRowWithDisplay | null;
    destination_location: LocationSearchRowWithDisplay | null;
    departure_date: string;
    arrival_date: string;
    departure_time: string;
    arrival_time: string;
    flight_number: string;
    train_number: string;
    airline: string;
    operator: string;
    notes: string;
}

// Form errors interface
export interface FormErrors {
    [key: string]: string | null;
}

// Trip type option interface
export interface TripTypeOption {
    value: TripType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

// Basic Location interface (renamed to avoid confusion)
export interface BasicLocation {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country_code?: string;
    city?: string;
}

// Globe-specific Location interface with coordinates
export interface GlobeLocation {
    name: string;
    coordinates: [number, number]; // [longitude, latitude] for globe rendering
    city?: string;
}
  
export interface Trip {
    id: number;
    user_id: number;
    name: string | null;
    trip_type: TripType;
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
}

export interface ExtendedLocationSearchRow extends LocationSearchRowWithDisplay {
    from_db?: boolean;
    latitude?: number;
    longitude?: number;
    osm_id?: string;
    code?: string;
}

export interface LocationSearchResult {
    id?: number;
    name: string;
    city: string;
    country: string;
    country_code?: string;
    code?: string;
    location_type: LocationType; 
    latitude: number;
    longitude: number;
    from_db: boolean;
    osm_id?: string;
}

export interface ApiLocationResult {
    id?: number;
    name: string;
    city: string;
    country: string;
    country_code?: string;
    code?: string;
    location_type: LocationType;
    latitude?: number;
    longitude?: number;
    from_db?: boolean;
    osm_id?: string;
}

export interface Star {
    x: number;
    y: number;
    size: number;
    brightness: number;
    twinkleSpeed: number;
    twinklePhase: number;
}

// Updated GlobeLine to use GlobeLocation
export interface GlobeLine {
    id: number;
    name: string;
    trip_type: TripType;
    origin: GlobeLocation;
    destination: GlobeLocation;
    departure_date: string;
    airline?: string;
    operator?: string;
}
  
export interface RawTripData {
    id: number;
    name: string;
    trip_type: TripType;
    origin_name: string;
    origin_lon: number;
    origin_lat: number;
    origin_city: string;
    destination_name: string;
    destination_lon: number;
    destination_lat: number;
    destination_city: string;
    departure_date: string;
    airline?: string | null;
    operator?: string | null;
}

export interface ManageTripType {
    id: number;
    user_id: number;
    name: string | null;
    trip_type: TripType;
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

export interface User {
    id: number; 
    name: string;
    email: string;
    countryCode: string;
    isGuest?: boolean;
}

export interface TripApiResponse {
    id: number;
    user_id: number;
    name: string | null;
    trip_type: string;
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
    distance_km: string;
    duration_minutes: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    origin_name: string;
    origin_city: string;
    origin_country: string;
    destination_name: string;
    destination_city: string;
    destination_country: string;
}

// For creating trips
export interface CreateTripData {
    user_id: number;
    name: string;
    trip_type: string;
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
    notes: string | null;
    // For guest mode
    origin_name?: string;
    origin_city?: string;
    origin_country?: string;
    origin_lat?: number;
    origin_lon?: number;
    destination_name?: string;
    destination_city?: string;
    destination_country?: string;
    destination_lat?: number;
    destination_lon?: number;
}

// For guest trip storage
// For guest trip storage
export interface GuestTrip extends CreateTripData {
    id: number;
    created_at: string;
    updated_at: string;
    distance_km: string;
    duration_minutes: number | null;
    origin_country_code?: string;
    destination_country_code?: string;
}

// For location data
export interface LocationData {
    id?: number;
    name: string;
    city?: string;
    country?: string;
    country_code?: string;
    airport_code?: string;
    station_code?: string;
    location_type?: string;
    latitude?: number;
    longitude?: number;
}

// For API responses
export interface ApiResponse<T> {
    ok: boolean;
    data?: T;
    error?: string;
}