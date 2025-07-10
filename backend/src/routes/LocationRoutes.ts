import express from "express";
import db from "../lib/db";
import loadSQL from "../lib/loadSQL";

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
        const { q, limit = 5, type } = req.query;

        // Validate query parameter (search only if longer than 2 characters)
        if (typeof q !== "string") {
            return res.status(400).json({ error: "Invalid query parameter" });
        }
        if (!q) {
            return res.json([]);
        }
        if (q.length < 2) {
            return res.json([]);
        }

        // Create a parameterized SQL query
        let query = loadSQL("searchLocations.sql");
        if (type) {
            query = query.replace(
                "-- $3 will be the type, if present",
                "AND location_type = $3"
            );
        }

        // Create parameters for the query
        const params = [q, parseInt(limit.toString())];
        if (type) {
            params.push(type as string);
        }

        // Execute the query
        const result = await db.query(query, params);

        // TODO: Format the response to match frontend Location interface
        // TODO: Find a better way to format the display text
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

//TODO:  Helper function to format display text
//TODO: Find a better way to format the display text
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
