// backend/src/routes/Trips.ts
import express from "express";
import db from "../lib/db";

const router = express.Router();

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

async function createGreatCircleRoute(tripId: number, originId: number, destinationId: number): Promise<void> {
    try {
        const result = await db.query(`
            SELECT 
                id,
                ST_Y(coordinates) as lat,
                ST_X(coordinates) as lon
            FROM locations
            WHERE id IN ($1, $2)
        `, [originId, destinationId]);

        if (result.rows.length !== 2) {
            throw new Error('Could not find both locations');
        }

        const origin = result.rows.find((row: any) => row.id === originId);
        const destination = result.rows.find((row: any) => row.id === destinationId);

        if (!origin || !destination) {
            throw new Error('Could not find origin or destination');
        }

        await db.query(`
            INSERT INTO trip_routes (trip_id, route_geometry, route_type)
            VALUES (
                $1,
                ST_MakeLine(
                    ST_SetSRID(ST_MakePoint($2, $3), 4326),
                    ST_SetSRID(ST_MakePoint($4, $5), 4326)
                ),
                'great_circle'
            )
        `, [tripId, origin.lon, origin.lat, destination.lon, destination.lat]);

    } catch (error) {
        console.error('Error creating route:', error);
    }
}

router.post("/", async (req, res) => {
    const client = await db.connect();
    
    try {
        await client.query('BEGIN');
        
        const {
            user_id,
            name,
            trip_type,
            origin_location_id,
            destination_location_id,
            departure_date,
            arrival_date,
            departure_time,
            arrival_time,
            flight_number,
            train_number,
            airline,
            operator,
            notes
        } = req.body;

        const locationsResult = await client.query(`
            SELECT 
                id,
                ST_Y(coordinates) as latitude,
                ST_X(coordinates) as longitude
            FROM locations
            WHERE id IN ($1, $2)
        `, [origin_location_id, destination_location_id]);

        if (locationsResult.rows.length !== 2) {
            throw new Error('Invalid location IDs');
        }

        const origin = locationsResult.rows.find((l: any) => l.id === origin_location_id);
        const destination = locationsResult.rows.find((l: any) => l.id === destination_location_id);

        if (!origin || !destination) {
            throw new Error('Could not find origin or destination location');
        }

        const distance_km = calculateDistance(
            origin.latitude, 
            origin.longitude,
            destination.latitude, 
            destination.longitude
        );

        let duration_minutes: number | null = null;
        if (departure_date && arrival_date && departure_time && arrival_time) {
            const departureDateTime = new Date(`${departure_date}T${departure_time}`);
            const arrivalDateTime = new Date(`${arrival_date}T${arrival_time}`);
            duration_minutes = Math.round((arrivalDateTime.getTime() - departureDateTime.getTime()) / (1000 * 60));
        }

        const tripResult = await client.query(`
            INSERT INTO trips (
                user_id, name, trip_type, origin_location_id, destination_location_id,
                departure_date, arrival_date, departure_time, arrival_time,
                flight_number, train_number, airline, operator, 
                distance_km, duration_minutes, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING id
        `, [
            user_id, name || `${trip_type} trip`, trip_type, origin_location_id, destination_location_id,
            departure_date || null, arrival_date || null, departure_time || null, arrival_time || null,
            flight_number || null, train_number || null, airline || null, operator || null,
            distance_km, duration_minutes, notes || null
        ]);

        const tripId = tripResult.rows[0].id;

        await createGreatCircleRoute(tripId, origin_location_id, destination_location_id);

        await client.query('COMMIT');
        
        res.status(201).json({ 
            id: tripId, 
            message: 'Trip created successfully',
            distance_km: distance_km.toFixed(2)
        });
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating trip:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create trip';
        res.status(500).json({ error: errorMessage });
    } finally {
        client.release();
    }
});

// Get all trips for a user with location details
router.get("/user/:userId", async (req, res) => {

    try {
        const userId = parseInt(req.params.userId, 10);

        if (isNaN(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }
        const result = await db.query(`
            SELECT 
                t.*,
                ol.name as origin_name,
                ol.city as origin_city,
                ol.country as origin_country,
                ST_X(ol.coordinates) as origin_lon,
                ST_Y(ol.coordinates) as origin_lat,
                dl.name as destination_name,
                dl.city as destination_city,
                dl.country as destination_country,
                ST_X(dl.coordinates) as destination_lon,
                ST_Y(dl.coordinates) as destination_lat
            FROM trips t
            JOIN locations ol ON t.origin_location_id = ol.id
            JOIN locations dl ON t.destination_location_id = dl.id
            WHERE t.user_id = $1 
            ORDER BY t.departure_date DESC NULLS LAST, t.created_at DESC
        `, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching trips:", error);
        res.status(500).json({ error: "Failed to fetch trips" });
    }
});

// Delete a trip
router.delete("/delete/:tripId", async (req, res) => {
    try {
        const { tripId } = req.params;
        const { userId } = req.body;

        const verifyResult = await db.query(
            'SELECT id FROM trips WHERE id = $1 AND user_id = $2',
            [tripId, userId]
        );
        
        if (verifyResult.rows.length === 0) {
            return res.status(404).json({ error: "Trip not found or unauthorized" });
        }
        
        await db.query('DELETE FROM trips WHERE id = $1', [tripId]);
        res.json({ message: "Trip deleted successfully" });
    } catch (error) {
        console.error("Error deleting trip:", error);
        return res.status(500).json({ error: "Failed to delete trip" });
    }
});

// Get trip routes for MapLibre (GeoJSON format)
router.get('/routes/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await db.query(`
            SELECT
                t.id,
                t.name,
                t.trip_type,
                t.departure_date,
                ST_AsGeoJSON(tr.route_geometry) as route,
                ol.name as origin_name,
                dl.name as destination_name
            FROM trips t
            JOIN trip_routes tr ON t.id = tr.trip_id
            JOIN locations ol ON t.origin_location_id = ol.id
            JOIN locations dl ON t.destination_location_id = dl.id
            WHERE t.user_id = $1
            ORDER BY t.departure_date DESC
        `, [userId]);

        // Convert to GeoJSON FeatureCollection
        const features = result.rows.map((row: any) => ({
            type: 'Feature',
            properties: {
                id: row.id,
                name: row.name,
                trip_type: row.trip_type,
                departure_date: row.departure_date,
                origin: row.origin_name,
                destination: row.destination_name
            },
            geometry: JSON.parse(row.route)
        }));

        res.json({
            type: 'FeatureCollection',
            features
        });
    } catch (error) {
        console.error('Error fetching routes:', error);
        res.status(500).json({ error: 'Failed to fetch routes' });
    }
});

// Get all locations as GeoJSON points
router.get("/locations", async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                id,
                name,
                city,
                country,
                location_type,
                ST_AsGeoJSON(coordinates) as coordinates
            FROM locations
            ORDER BY name
        `);

        const features = result.rows.map((row: any) => ({
            type: "Feature",
            properties: {
                id: row.id,
                name: row.name,
                city: row.city,
                country: row.country,
                location_type: row.location_type,
            },
            geometry: JSON.parse(row.coordinates),
        }));

        res.json({
            type: "FeatureCollection",
            features,
        });
    } catch (error) {
        console.error("Error fetching locations:", error);
        res.status(500).json({ error: "Failed to fetch locations" });
    }
});

// Get visited countries for a user
router.get("/countries/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await db.query(`
            SELECT DISTINCT l.country_code
            FROM trips t
            JOIN locations l ON l.id IN (t.origin_location_id, t.destination_location_id)
            WHERE t.user_id = $1 AND l.country_code IS NOT NULL
        `, [userId]);

        const countries = result.rows.map((row: any) => row.country_code);
        res.json(countries);
    } catch (error) {
        console.error("Error fetching countries:", error);
        res.status(500).json({ error: "Failed to fetch countries" });
    }
});

export default router;
