import express from "express";
import db from "../../lib/db";

const router = express.Router();

// Interface for the frontend Location type
interface Location {
    id: string;
    name: string;
    code?: string;
    city: string;
    country: string;
    type: "airport" | "train_station" | "city" | "bus_station" | "port";
    display: string;
}

// Search locations with autocomplete
router.get("/search", async (req, res) => {
    try {
        const { q, limit = 10, type } = req.query;

        if (!q || typeof q !== "string") {
            return res.json([]);
        }

        if (q.length < 2) {
            return res.json([]);
        }

        // Build the query
        let query = `
            SELECT 
                id,
                name,
                city,
                country,
                airport_code,
                station_code,
                location_type,
                ST_X(coordinates) as longitude,
                ST_Y(coordinates) as latitude,
                timezone
            FROM locations 
            WHERE 
        `;

        const params = [];
        const searchConditions = [];

        // Search across multiple fields
        const searchTerm = `%${q}%`;
        searchConditions.push(`(
            name ILIKE $${params.length + 1} OR 
            city ILIKE $${params.length + 1} OR 
            country ILIKE $${params.length + 1} OR 
            airport_code ILIKE $${params.length + 1} OR
            station_code ILIKE $${params.length + 1}
        )`);
        params.push(searchTerm);

        // Optional: filter by location type
        if (type && type !== "all") {
            searchConditions.push(`location_type = $${params.length + 1}`);
            params.push(type);
        }

        query += searchConditions.join(" AND ");

        // Order by relevance (exact matches first, then partial matches)
        query += `
            ORDER BY 
                CASE 
                    WHEN name ILIKE $${params.length + 1} THEN 1
                    WHEN city ILIKE $${params.length + 1} THEN 2
                    WHEN airport_code ILIKE $${params.length + 1} THEN 3
                    WHEN station_code ILIKE $${params.length + 1} THEN 4
                    ELSE 5 
                END,
                name ASC
            LIMIT $${params.length + 2}
        `;

        const exactSearchTerm = q; // For exact match ordering
        params.push(exactSearchTerm);
        params.push(parseInt(limit.toString()));

        const result = await db.query(query, params);

        // Format the response to match frontend Location interface
        const locations: Location[] = result.rows.map((row) => ({
            id: row.id,
            name: row.name,
            city: row.city,
            country: row.country,
            code: row.airport_code || row.station_code,
            type: row.location_type as Location["type"],
            display: formatDisplayText(row),
        }));

        res.json(locations);
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ error: "Search failed" });
    }
});

// Helper function to format display text
function formatDisplayText(location: any): string {
    const { name, city, country, airport_code, station_code, location_type } =
        location;

    if (location_type === "airport" && airport_code) {
        return `${name} (${airport_code}) - ${city}, ${country}`;
    } else if (location_type === "train_station" && station_code) {
        return `${name} (${station_code}) - ${city}, ${country}`;
    } else if (city && country) {
        return `${name} - ${city}, ${country}`;
    } else {
        return name;
    }
}

export default router;
