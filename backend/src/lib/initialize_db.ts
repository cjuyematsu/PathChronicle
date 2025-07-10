// Do not use this file (deprecated, use sql/schema.sql instead)

import db from "./db";

export async function initializeDatabase() {
    try {
        // Enable PostGIS extension
        await db.query("CREATE EXTENSION IF NOT EXISTS postgis;");

        // Create users table
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create locations table for storing places
        await db.query(`
            CREATE TABLE IF NOT EXISTS locations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                city VARCHAR(100),
                country VARCHAR(100),
                airport_code VARCHAR(10), -- For airports (IATA/ICAO codes)
                station_code VARCHAR(10), -- For train stations
                location_type VARCHAR(50) NOT NULL CHECK (location_type IN ('airport', 'train_station', 'city', 'landmark', 'other')),
                coordinates GEOMETRY(POINT, 4326) NOT NULL, -- PostGIS geometry column
                timezone VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create spatial index for locations
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_locations_coordinates 
            ON locations USING GIST (coordinates);
        `);

        // Create trips table
        await db.query(`
            CREATE TABLE IF NOT EXISTS trips (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(255), -- Trip name/description
                trip_type VARCHAR(50) NOT NULL CHECK (trip_type IN ('flight', 'train', 'bus', 'car', 'ferry', 'other')),
                origin_location_id INTEGER REFERENCES locations(id),
                destination_location_id INTEGER REFERENCES locations(id),
                departure_date DATE, -- (optional)
                arrival_date DATE, -- (optional)
                departure_time TIME, -- (optional)
                arrival_time TIME, -- (optional)
                flight_number VARCHAR(20), -- For flights (optional)
                train_number VARCHAR(20), -- For trains (optional)
                airline VARCHAR(100), -- For flights (optional)
                operator VARCHAR(100), -- For trains, buses, etc. (optional)
                distance_km DECIMAL(10,2), -- Calculated distance (optional)
                duration_minutes INTEGER, -- Trip duration (optional)
                notes TEXT, -- (optional)
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // // Create trip_segments table for complex trips with multiple legs
        // await db.query(`
        //     CREATE TABLE IF NOT EXISTS trip_segments (
        //         id SERIAL PRIMARY KEY,
        //         trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
        //         segment_order INTEGER NOT NULL,
        //         origin_location_id INTEGER REFERENCES locations(id),
        //         destination_location_id INTEGER REFERENCES locations(id),
        //         departure_datetime TIMESTAMP,
        //         arrival_datetime TIMESTAMP,
        //         transport_type VARCHAR(50) NOT NULL,
        //         flight_number VARCHAR(20),
        //         operator VARCHAR(100),
        //         seat_number VARCHAR(10),
        //         notes TEXT,
        //         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        //     );
        // `);

        // Create trip_routes table for storing the actual path geometry
        await db.query(`
            CREATE TABLE IF NOT EXISTS trip_routes (
                id SERIAL PRIMARY KEY,
                trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
                route_geometry GEOMETRY(LINESTRING, 4326), -- Great circle or actual route
                route_type VARCHAR(50) DEFAULT 'great_circle' CHECK (route_type IN ('great_circle', 'actual', 'approximate')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create spatial index for trip routes
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_trip_routes_geometry 
            ON trip_routes USING GIST (route_geometry);
        `);

        // // Create trip_photos table for storing photos related to trips
        // await db.query(`
        //     CREATE TABLE IF NOT EXISTS trip_photos (
        //         id SERIAL PRIMARY KEY,
        //         trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
        //         photo_url VARCHAR(500) NOT NULL,
        //         caption TEXT,
        //         taken_at TIMESTAMP,
        //         location_coordinates GEOMETRY(POINT, 4326),
        //         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        //     );
        // `);

        // Create indexes for better performance
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
            CREATE INDEX IF NOT EXISTS idx_trips_departure_date ON trips(departure_date);
            CREATE INDEX IF NOT EXISTS idx_trips_trip_type ON trips(trip_type);
            -- CREATE INDEX IF NOT EXISTS idx_trip_segments_trip_id ON trip_segments(trip_id);
            -- CREATE INDEX IF NOT EXISTS idx_trip_photos_trip_id ON trip_photos(trip_id);
        `);

        // Create a view for easy trip querying with location details
        // await db.query(`
        //     CREATE OR REPLACE VIEW trip_details AS
        //     SELECT
        //         t.id,
        //         t.user_id,
        //         t.name,
        //         t.trip_type,
        //         t.departure_date,
        //         t.arrival_date,
        //         t.departure_time,
        //         t.arrival_time,
        //         t.flight_number,
        //         t.operator,
        //         t.distance_km,
        //         t.duration_minutes,
        //         t.notes,

        //         -- Origin location details
        //         ol.name as origin_name,
        //         ol.city as origin_city,
        //         ol.country as origin_country,
        //         ol.airport_code as origin_airport_code,
        //         ST_X(ol.coordinates) as origin_longitude,
        //         ST_Y(ol.coordinates) as origin_latitude,

        //         -- Destination location details
        //         dl.name as destination_name,
        //         dl.city as destination_city,
        //         dl.country as destination_country,
        //         dl.airport_code as destination_airport_code,
        //         ST_X(dl.coordinates) as destination_longitude,
        //         ST_Y(dl.coordinates) as destination_latitude,

        //         t.created_at,
        //         t.updated_at
        //     FROM trips t
        //     LEFT JOIN locations ol ON t.origin_location_id = ol.id
        //     LEFT JOIN locations dl ON t.destination_location_id = dl.id;
        // `);

        console.log("Database initialized successfully!");
        console.log(
            "Tables created: users, locations, trips, trip_segments, trip_routes, trip_photos"
        );
        console.log("PostGIS extension enabled for spatial data");
        console.log("Sample locations inserted");
    } catch (error) {
        console.error("Error initializing database:", error);
        throw error;
    }
}

// // Helper function to calculate great circle distance between two points
// export async function calculateTripDistance(originLocationId, destinationLocationId) {
//     try {
//         const result = await db.query(`
//             SELECT
//                 ST_Distance(
//                     ST_Transform(ol.coordinates, 3857),
//                     ST_Transform(dl.coordinates, 3857)
//                 ) / 1000 as distance_km
//             FROM locations ol, locations dl
//             WHERE ol.id = $1 AND dl.id = $2
//         `, [originLocationId, destinationLocationId]);

//         return result.rows[0]?.distance_km || 0;
//     } catch (error) {
//         console.error("Error calculating distance:", error);
//         return 0;
//     }
// }

// // Helper function to create a great circle route between two locations
// export async function createTripRoute(tripId, originLocationId, destinationLocationId) {
//     try {
//         await db.query(`
//             INSERT INTO trip_routes (trip_id, route_geometry, route_type)
//             SELECT
//                 $1,
//                 ST_MakeLine(ol.coordinates, dl.coordinates),
//                 'great_circle'
//             FROM locations ol, locations dl
//             WHERE ol.id = $2 AND dl.id = $3
//         `, [tripId, originLocationId, destinationLocationId]);
//     } catch (error) {
//         console.error("Error creating trip route:", error);
//         throw error;
//     }
// }
