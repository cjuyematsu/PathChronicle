-- This file has all the SQL schema and tables

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE
    IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        CONSTRAINT unique_user_email UNIQUE (email), -- Ensure unique email
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Locations table
CREATE TABLE
    IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(100),
        country VARCHAR(100),
        airport_code VARCHAR(10),
        CONSTRAINT unique_airport_code UNIQUE (airport_code), -- Ensure unique airport code (add other constraints as needed)
        -- For airports (IATA/ICAO codes)
        station_code VARCHAR(10),
        -- For train stations
        location_type VARCHAR(50) NOT NULL CHECK (
            location_type IN (
                'airport',
                'train_station',
                'city',
                'landmark',
                'other'
            )
        ),
        coordinates GEOMETRY (POINT, 4326) NOT NULL,
        -- PostGIS geometry column
        timezone VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Index for searching locations by name, city, country, and airport/station code
CREATE INDEX IF NOT EXISTS idx_locations_coordinates ON locations USING GIST (coordinates);

-- Trips table
CREATE TABLE
    IF NOT EXISTS trips (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
        name VARCHAR(255),
        -- Trip name/description
        trip_type VARCHAR(50) NOT NULL CHECK (
            trip_type IN ('flight', 'train', 'bus', 'car', 'ferry', 'other')
        ),
        origin_location_id INTEGER REFERENCES locations (id),
        destination_location_id INTEGER REFERENCES locations (id),
        departure_date DATE,
        -- (optional)
        arrival_date DATE,
        -- (optional)
        departure_time TIME,
        -- (optional)
        arrival_time TIME,
        -- (optional)
        flight_number VARCHAR(20),
        -- For flights (optional)
        train_number VARCHAR(20),
        -- For trains (optional)
        airline VARCHAR(100),
        -- For flights (optional)
        operator VARCHAR(100),
        -- For trains, buses, etc. (optional)
        distance_km DECIMAL(10, 2),
        -- Calculated distance (optional)
        duration_minutes INTEGER,
        -- Trip duration (optional)
        notes TEXT,
        -- (optional)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Trip routes table
CREATE TABLE
    IF NOT EXISTS trip_routes (
        id SERIAL PRIMARY KEY,
        trip_id INTEGER REFERENCES trips (id) ON DELETE CASCADE,
        route_geometry GEOMETRY (LINESTRING, 4326),
        -- Great circle or actual route
        route_type VARCHAR(50) DEFAULT 'great_circle' CHECK (
            route_type IN ('great_circle', 'actual', 'approximate')
        ),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Index for trip routes geometry
CREATE INDEX IF NOT EXISTS idx_trip_routes_geometry ON trip_routes USING GIST (route_geometry);

-- Other indexes
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips (user_id);

CREATE INDEX IF NOT EXISTS idx_trips_departure_date ON trips (departure_date);

CREATE INDEX IF NOT EXISTS idx_trips_trip_type ON trips (trip_type);

-- CREATE INDEX IF NOT EXISTS idx_trip_segments_trip_id ON trip_segments(trip_id);
-- CREATE INDEX IF NOT EXISTS idx_trip_photos_trip_id ON trip_photos(trip_id);