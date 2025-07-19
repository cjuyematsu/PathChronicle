import { LocationSearchRowWithDisplay, TripType, LocationType } from "@shared/types/location";

// Trip form data interface
export interface TripFormData {
    name: string;
    trip_type: TripType;
    origin_location: LocationSearchRowWithDisplay | null;
    destination_location: LocationSearchRowWithDisplay | null;
    departure_date: string; // 2027-07-31
    arrival_date: string;
    departure_time: string; // 23:25
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
    value: "flight" | "train" | "bus" | "car" | "ferry" | "other";
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

export interface Location {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country_code?: string;
    city?: string;
}
  
export interface Trip {
    id: number;
    user_id: number;
    name: string | null;
    trip_type: 'flight' | 'train' | 'bus' | 'car' | 'ferry' | 'other';
    origin_location_id: number;
    destination_location_id: number;
    departure_date: string | null; // or Date if you parse it
    arrival_date: string | null; // or Date if you parse it
    departure_time: string | null;
    arrival_time: string | null;
    flight_number: string | null;
    train_number: string | null;
    airline: string | null;
    operator: string | null;
    distance_km: number | null;
    duration_minutes: number | null;
    notes: string | null;
    created_at: string; // or Date
    updated_at: string; // or Date
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