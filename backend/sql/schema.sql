-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable pg_trgm for fuzzy text search 
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Users table
CREATE TABLE IF NOT EXISTS users(
    id serial PRIMARY KEY,
    email varchar(255) UNIQUE NOT NULL,
    icon_code VARCHAR(6),
    CONSTRAINT unique_user_email UNIQUE (email),
    password VARCHAR(255) NOT NULL,
    name varchar(100),
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS locations(
    id serial PRIMARY KEY,
    name varchar(255) NOT NULL,
    city varchar(100),
    country varchar(100),
    country_code varchar(6),
    airport_code varchar(10),
    CONSTRAINT unique_airport_code UNIQUE (airport_code),
    station_code varchar(10),
    location_type varchar(50) NOT NULL CHECK (location_type IN ('airport', 'train_station', 'city', 'landmark', 'other')),
    coordinates GEOMETRY(point, 4326) NOT NULL,
    timezone varchar(50),
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_locations_coordinates ON locations USING GIST(coordinates);

-- Text search indexes for locations
CREATE INDEX IF NOT EXISTS idx_locations_name_lower ON locations(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_locations_city_lower ON locations(LOWER(city));
CREATE INDEX IF NOT EXISTS idx_locations_country_lower ON locations(LOWER(country));
CREATE INDEX IF NOT EXISTS idx_locations_airport_code_lower ON locations(LOWER(airport_code));
CREATE INDEX IF NOT EXISTS idx_locations_station_code_lower ON locations(LOWER(station_code));

-- Composite indexes for common search patterns
CREATE INDEX IF NOT EXISTS idx_locations_name_city ON locations(LOWER(name), LOWER(city));
CREATE INDEX IF NOT EXISTS idx_locations_type_name ON locations(location_type, LOWER(name));

-- Partial indexes for code searches 
CREATE INDEX IF NOT EXISTS idx_locations_airport_code_not_null 
    ON locations(LOWER(airport_code)) 
    WHERE airport_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_locations_station_code_not_null 
    ON locations(LOWER(station_code)) 
    WHERE station_code IS NOT NULL;

-- Trigram indexes for fuzzy search 
CREATE INDEX IF NOT EXISTS idx_locations_name_trgm ON locations USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_locations_city_trgm ON locations USING gin(city gin_trgm_ops);

-- Trips table
CREATE TABLE IF NOT EXISTS trips(
    id serial PRIMARY KEY,
    user_id integer REFERENCES users(id) ON DELETE CASCADE,
    name varchar(255),
    trip_type varchar(50) NOT NULL CHECK (trip_type IN ('flight', 'train', 'bus', 'car', 'ferry', 'other')),
    origin_location_id integer NOT NULL REFERENCES locations(id),
    destination_location_id integer NOT NULL REFERENCES locations(id),
    departure_date date,
    arrival_date date,
    departure_time time,
    arrival_time time,
    flight_number varchar(20),
    train_number varchar(20),
    airline varchar(100),
    operator VARCHAR(100),
    distance_km DECIMAL(10, 2),
    duration_minutes integer,
    notes text,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Trip routes table
CREATE TABLE IF NOT EXISTS trip_routes(
    id serial PRIMARY KEY,
    trip_id integer REFERENCES trips(id) ON DELETE CASCADE,
    route_geometry GEOMETRY(LINESTRING, 4326),
    route_type varchar(50) DEFAULT 'great_circle' CHECK (route_type IN ('great_circle', 'actual', 'approximate')),
    created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for trips and trip routes
CREATE INDEX IF NOT EXISTS idx_trip_routes_geometry ON trip_routes USING GIST(route_geometry);
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_departure_date ON trips(departure_date);
CREATE INDEX IF NOT EXISTS idx_trips_trip_type ON trips(trip_type);
CREATE INDEX IF NOT EXISTS idx_trips_origin_dest ON trips(origin_location_id, destination_location_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE
    ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE
    ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE
    ON trips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Materialized view for popular locations 
CREATE MATERIALIZED VIEW IF NOT EXISTS popular_locations AS
SELECT 
    l.id,
    l.name,
    l.city,
    l.country,
    l.country_code,
    l.airport_code,
    l.station_code,
    l.location_type,
    l.coordinates,
    COUNT(DISTINCT t.id) as trip_count
FROM locations l
LEFT JOIN trips t ON (l.id = t.origin_location_id OR l.id = t.destination_location_id)
GROUP BY l.id, l.name, l.city, l.country, l.country_code, 
         l.airport_code, l.station_code, l.location_type, l.coordinates
HAVING COUNT(DISTINCT t.id) > 0
ORDER BY trip_count DESC;

-- Indexes on the materialized view
CREATE INDEX IF NOT EXISTS idx_popular_locations_name ON popular_locations(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_popular_locations_trip_count ON popular_locations(trip_count DESC);

-- Update table statistics for better query planning
ALTER TABLE locations ALTER COLUMN name SET STATISTICS 1000;
ALTER TABLE locations ALTER COLUMN city SET STATISTICS 1000;
ALTER TABLE locations ALTER COLUMN country SET STATISTICS 1000;

-- Analyze tables to update statistics
ANALYZE locations;
ANALYZE trips;
ANALYZE users;
