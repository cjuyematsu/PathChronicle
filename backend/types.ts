export interface AirportData {
    name: string;
    city: string;
    country: string;
    airport_code: string;
    location_type: string;
    latitude: number;
    longitude: number;
    timezone: string;
}

export interface LocationSearchResult {
    id: number;
    name: string;
    city: string;
    country: string;
    code: string | null;
    type: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    timezone: string;
    display: string;
}
