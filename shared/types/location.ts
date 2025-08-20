// If you want to be more specific about the possible null combinations
export interface LocationSearchRow {
    id: string;
    name: string;
    city: string;
    country: string;
    country_code?: string;
    airport_code?: string | null;
    station_code?: string | null;
    location_type: LocationType;
    latitude?: number;       
    longitude?: number;  
}

// Location type enum for better type safety
export type LocationType =
    | "airport"
    | "train_station"
    | "city"
    | "bus_station"
    | "port"
    | "other";

export type TripType = "flight" | "train" | "bus" | "car" | "ferry" | "other";

// For use in your existing code, you might want to extend with computed properties
export interface LocationSearchRowWithDisplay extends LocationSearchRow {
    display: string;
    code?: string | null;
    latitude?: number;
    longitude?: number;
}
