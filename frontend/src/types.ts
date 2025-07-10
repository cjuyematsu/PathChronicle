import { LocationSearchRowWithDisplay, TripType } from "@shared/types/location";

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
