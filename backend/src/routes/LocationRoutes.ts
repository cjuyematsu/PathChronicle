import express from "express";
import db from "../lib/db";
import loadSQL from "../lib/loadSQL";
import {
    LocationSearchRow,
    LocationType,
    LocationSearchRowWithDisplay,
} from "@shared/types/location";

const router = express.Router();

// Search locations with autocomplete
router.get("/search", async (req, res) => {
    try {
        const searchTerm = req.query.searchTerm as string;
        const limit = req.query.searchLimit
            ? parseInt(req.query.searchLimit as string)
            : 5;
        const type = req.query.type as LocationType | undefined;

        // Validate query parameter (search only if longer than 2 characters)
        if (!searchTerm) {
            return res.json([]);
        }
        if (searchTerm.length < 2) {
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
        const params = [searchTerm, limit];
        if (type) {
            params.push(type);
        }

        // Execute the query
        const result = await db.query(query, params);

        // TODO: Format the response to match frontend Location interface
        // TODO: Find a better way to format the display text
        const locations: LocationSearchRowWithDisplay[] = result.rows.map(
            (row: LocationSearchRow) => ({
                id: row.id,
                name: row.name,
                city: row.city,
                country: row.country,
                code: row.airport_code || row.station_code,
                location_type: row.location_type,
                display: formatDisplayText(row),
            })
        );

        res.json(locations);
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ error: "Search failed" });
    }
});

//TODO:  Helper function to format display text
//TODO: Find a better way to format the display text
function formatDisplayText(location: LocationSearchRow) {
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
