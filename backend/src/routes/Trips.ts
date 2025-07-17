import express from "express";
import db from "../lib/db";
//import { calculateTripDistance, createTripRoute } from '../db/initialize.js';

const router = express.Router();

// Get all trips for a user with location details
router.get("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await db.query(
            `
            SELECT * FROM trips 
            WHERE user_id = $1 
            ORDER BY departure_date DESC
        `,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching trips:", error);
        res.status(500).json({ error: "Failed to fetch trips" });
    }
});

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
    }
    catch (error) {
        console.error("Error deleting trip:", error);
        return res.status(500).json({ error: "Failed to delete trip" });
    }
});

// Get trip routes for MapLibre (GeoJSON format)
// router.get('/routes/:userId', async (req, res) => {
//     try {
//         const { userId } = req.params;
//         const result = await db.query(`
//             SELECT
//                 t.id,
//                 t.name,
//                 t.trip_type,
//                 t.departure_date,
//                 ST_AsGeoJSON(tr.route_geometry) as route
//             FROM trips t
//             JOIN trip_routes tr ON t.id = tr.trip_id
//             WHERE t.user_id = $1
//             ORDER BY t.departure_date DESC
//         `, [userId]);

//         // Convert to GeoJSON FeatureCollection
//         const features = result.rows.map(row => ({
//             type: 'Feature',
//             properties: {
//                 id: row.id,
//                 name: row.name,
//                 trip_type: row.trip_type,
//                 departure_date: row.departure_date
//             },
//             geometry: JSON.parse(row.route)
//         }));

//         res.json({
//             type: 'FeatureCollection',
//             features
//         });
//     } catch (error) {
//         console.error('Error fetching routes:', error);
//         res.status(500).json({ error: 'Failed to fetch routes' });
//     }
// });

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

        const features = result.rows.map((row) => ({
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

// // Create a new trip
// router.post('/', async (req, res) => {
//     try {
//         const {
//             user_id,
//             name,
//             trip_type,
//             origin_location_id,
//             destination_location_id,
//             departure_date,
//             arrival_date,
//             departure_time,
//             arrival_time,
//             flight_number,
//             operator,
//             notes
//         } = req.body;

//         // Calculate distance
//         const distance = await calculateTripDistance(origin_location_id, destination_location_id);

//         // Insert trip
//         const result = await db.query(`
//             INSERT INTO trips (
//                 user_id, name, trip_type, origin_location_id, destination_location_id,
//                 departure_date, arrival_date, departure_time, arrival_time,
//                 flight_number, operator, distance_km, notes
//             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
//             RETURNING id
//         `, [
//             user_id, name, trip_type, origin_location_id, destination_location_id,
//             departure_date, arrival_date, departure_time, arrival_time,
//             flight_number, operator, distance, notes
//         ]);

//         const tripId = result.rows[0].id;

//         // Create route geometry
//         await createTripRoute(tripId, origin_location_id, destination_location_id);

//         res.status(201).json({ id: tripId, message: 'Trip created successfully' });
//     } catch (error) {
//         console.error('Error creating trip:', error);
//         res.status(500).json({ error: 'Failed to create trip' });
//     }
// });

export default router;
