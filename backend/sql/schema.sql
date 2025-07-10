-- This file has all the SQL schema and tables
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE IF NOT EXISTS users(
    id serial PRIMARY KEY,
    email varchar(255) UNIQUE NOT NULL,
    CONSTRAINT unique_user_email UNIQUE (email), -- Ensure unique email
    password VARCHAR(255) NOT NULL,
    name varchar(100),
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations(
    id serial PRIMARY KEY,
    name varchar(255) NOT NULL,
    city varchar(100),
    country varchar(100),
    airport_code varchar(10),
    CONSTRAINT unique_airport_code UNIQUE (airport_code), -- Ensure unique airport code (add other constraints as needed)
    -- For airports (IATA/ICAO codes)
    station_code varchar(10),
    -- For train stations
    location_type varchar(50) NOT NULL CHECK (location_type IN ('airport', 'train_station', 'city', 'landmark', 'other')),
    coordinates GEOMETRY(point, 4326) NOT NULL,
    -- PostGIS geometry column
    timezone varchar(50),
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Index for searching locations by name, city, country, and airport/station code
CREATE INDEX IF NOT EXISTS idx_locations_coordinates ON locations USING GIST(coordinates);

-- Trips table
CREATE TABLE IF NOT EXISTS trips(
    id serial PRIMARY KEY,
    user_id integer REFERENCES users(id) ON DELETE CASCADE,
    name varchar(255), -- (optional)
    -- Trip name/description
    trip_type varchar(50) NOT NULL CHECK (trip_type IN ('flight', 'train', 'bus', 'car', 'ferry', 'other')),
    origin_location_id integer NOT NULL REFERENCES locations(id),
    destination_location_id integer NOT NULL REFERENCES locations(id),
    departure_date date,
    -- (optional)
    arrival_date date,
    -- (optional)
    departure_time time,
    -- (optional)
    arrival_time time,
    -- (optional)
    flight_number varchar(20),
    -- For flights (optional)
    train_number varchar(20),
    -- For trains (optional)
    airline varchar(100),
    -- For flights (optional)
    operator VARCHAR(100),
    -- For trains, buses, etc. (optional)
    distance_km DECIMAL(10, 2),
    -- Calculated distance (optional)
    duration_minutes integer,
    -- Trip duration (optional)
    notes text,
    -- (optional)
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Trip routes table
CREATE TABLE IF NOT EXISTS trip_routes(
    id serial PRIMARY KEY,
    trip_id integer REFERENCES trips(id) ON DELETE CASCADE,
    route_geometry GEOMETRY(LINESTRING, 4326),
    -- Great circle or actual route
    route_type varchar(50) DEFAULT 'great_circle' CHECK (route_type IN ('great_circle', 'actual', 'approximate')),
    created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Index for trip routes geometry
CREATE INDEX IF NOT EXISTS idx_trip_routes_geometry ON trip_routes USING GIST(route_geometry);

-- Other indexes
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);

CREATE INDEX IF NOT EXISTS idx_trips_departure_date ON trips(departure_date);

CREATE INDEX IF NOT EXISTS idx_trips_trip_type ON trips(trip_type);

-- CREATE INDEX IF NOT EXISTS idx_trip_segments_trip_id ON trip_segments(trip_id);
-- CREATE INDEX IF NOT EXISTS idx_trip_photos_trip_id ON trip_photos(trip_id);
