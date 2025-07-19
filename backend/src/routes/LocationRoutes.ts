import express from "express";
import db from "../lib/db";
import axios from "axios";
import NodeCache from "node-cache";

const router = express.Router();

const searchCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 }); // 1 hour TTL
const osmCache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 }); // 24 hour TTL for OSM data

let lastOsmCall = 0;
const OSM_RATE_LIMIT = 1000; // 1 second between calls

router.get("/search", async (req, res) => {
    try {
        const { searchTerm, limit = "10", lang } = req.query;
        
        if (!searchTerm || (searchTerm as string).length < 2) {
            return res.json([]);
        }

        const normalizedSearchTerm = (searchTerm as string).toLowerCase().trim();
        const langCode = (lang as string) || 'en';
        const cacheKey = `search:${normalizedSearchTerm}:${langCode}:${limit}`;

        // Check cache first
        const cachedResults = searchCache.get<any[]>(cacheKey);
        if (cachedResults) {
            return res.json(cachedResults);
        }

        // Search database 
        const dbResults = await searchDatabaseOptimized(normalizedSearchTerm, parseInt(limit as string));
        
        // If we have enough results from database, return them
        if (dbResults.length >= parseInt(limit as string) * 0.7) {
            searchCache.set(cacheKey, dbResults);
            return res.json(dbResults);
        }

        // Search OpenStreetMap
        let osmResults: any[] = [];
        const osmCacheKey = `osm:${normalizedSearchTerm}:${langCode}`;
        const cachedOsmResults = osmCache.get<any[]>(osmCacheKey);
        
        if (cachedOsmResults) {
            osmResults = cachedOsmResults;
        } else {
            const now = Date.now();
            if (now - lastOsmCall >= OSM_RATE_LIMIT) {
                lastOsmCall = now;
                osmResults = await searchOpenStreetMapOptimized(normalizedSearchTerm, langCode);
                osmCache.set(osmCacheKey, osmResults);
            }
        }
        
        const combinedResults = combineResults(dbResults, osmResults, parseInt(limit as string));
        
        searchCache.set(cacheKey, combinedResults);
        
        res.json(combinedResults);
    } catch (error) {
        console.error("Error searching locations:", error);
        res.status(500).json({ error: "Failed to search locations" });
    }
});

async function searchDatabaseOptimized(searchTerm: string, limit: number) {
    const searchQuery = `
        WITH search_terms AS (
            SELECT $1::text as term
        ),
        ranked_results AS (
            SELECT 
                l.id,
                l.name,
                l.city,
                l.country,
                l.country_code,
                l.airport_code,
                l.station_code,
                l.location_type,
                ST_Y(l.coordinates) as latitude,
                ST_X(l.coordinates) as longitude,
                -- Improved relevance scoring
                CASE 
                    WHEN LOWER(l.name) = st.term THEN 100
                    WHEN LOWER(l.airport_code) = st.term THEN 95
                    WHEN LOWER(l.station_code) = st.term THEN 95
                    WHEN LOWER(l.name) LIKE st.term || '%' THEN 80
                    WHEN LOWER(l.city) = st.term THEN 70
                    WHEN LOWER(l.city) LIKE st.term || '%' THEN 60
                    WHEN LOWER(l.name) LIKE '%' || st.term || '%' THEN 40
                    WHEN LOWER(l.city) LIKE '%' || st.term || '%' THEN 30
                    WHEN LOWER(l.country) LIKE '%' || st.term || '%' THEN 20
                    ELSE 10
                END as relevance_score,
                -- Additional scoring for location type
                CASE l.location_type
                    WHEN 'airport' THEN 5
                    WHEN 'train_station' THEN 4
                    WHEN 'city' THEN 3
                    WHEN 'landmark' THEN 2
                    ELSE 1
                END as type_score
            FROM locations l, search_terms st
            WHERE (
                LOWER(l.name) LIKE '%' || st.term || '%' OR
                LOWER(l.city) LIKE '%' || st.term || '%' OR
                LOWER(l.country) LIKE '%' || st.term || '%' OR
                LOWER(l.airport_code) = st.term OR
                LOWER(l.station_code) = st.term
            )
        )
        SELECT 
            id,
            name,
            city,
            country,
            country_code,
            airport_code,
            station_code,
            location_type,
            latitude,
            longitude,
            relevance_score
        FROM ranked_results
        ORDER BY relevance_score DESC, type_score DESC, name
        LIMIT $2
    `;

    const result = await db.query(searchQuery, [searchTerm, limit]);

    return result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        city: row.city || "",
        country: row.country || "",
        country_code: row.country_code || "",
        code: row.airport_code || row.station_code || "",
        location_type: row.location_type,
        latitude: row.latitude,
        longitude: row.longitude,
        from_db: true,
        relevance: row.relevance_score
    }));
}

async function searchOpenStreetMapOptimized(searchTerm: string, langCode: string) {
    try {
        const queries = determineSearchQueries(searchTerm);
        
        const searchPromises = queries.map(query => 
            searchOsmWithTimeout(query, langCode, 2000) 
        );
        
        const results = await Promise.allSettled(searchPromises);
        const allResults: any[] = [];
        
        results.forEach((result) => {
            if (result.status === 'fulfilled' && result.value) {
                allResults.push(...result.value);
            }
        });

        return processOsmResults(allResults, searchTerm);
    } catch (error) {
        console.error("Error searching OpenStreetMap:", error);
        return [];
    }
}

function determineSearchQueries(searchTerm: string): string[] {
    const queries: string[] = [];
    const lowerTerm = searchTerm.toLowerCase();
    
    const hasAirport = /airport|aerodrome/i.test(searchTerm);
    const hasStation = /station|gare|bahnhof/i.test(searchTerm);
    const hasBus = /bus/i.test(searchTerm);
    const hasFerry = /ferry|port/i.test(searchTerm);
    
    if (hasAirport) {
        queries.push(searchTerm);
    } else if (hasStation) {
        queries.push(searchTerm);
    } else if (hasBus || hasFerry) {
        queries.push(searchTerm);
    } else {
        if (searchTerm.length <= 3) {
            queries.push(`${searchTerm} airport`);
            queries.push(searchTerm);
        } else {
            queries.push(searchTerm); 
            queries.push(`${searchTerm} airport`);
            queries.push(`${searchTerm} railway station`);
        }
    }
    
    return queries.slice(0, 3);
}

async function searchOsmWithTimeout(query: string, langCode: string, timeout: number): Promise<any[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
        
        const response = await axios.get(nominatimUrl, {
            headers: {
                'User-Agent': 'PathChronicle/1.0',
                'Accept-Language': langCode
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response.data;
    } catch (error) {
        clearTimeout(timeoutId);
        if (axios.isCancel(error)) {
            console.log(`OSM search timeout for query: ${query}`);
        }
        return [];
    }
}

function processOsmResults(results: any[], searchTerm: string): any[] {
    const processedResults = results.map((item: any) => {
        let locationType = "other";
        if (item.type === "aerodrome" || item.class === "aeroway") {
            locationType = "airport";
        } else if (item.type === "station" || item.class === "railway") {
            locationType = "train_station";
        } else if (item.type === "city" || item.type === "town" || item.type === "village") {
            locationType = "city";
        } else if (item.type === "tourist_attraction" || item.class === "tourism") {
            locationType = "landmark";
        }

        const displayParts = item.display_name.split(',');
        let name = displayParts[0].trim();
        
        if (locationType === "airport" || locationType === "train_station") {
            name = name.replace(/ Airport$/i, '')
                      .replace(/ Railway Station$/i, '')
                      .replace(/ Train Station$/i, '')
                      .replace(/ Station$/i, '');
        }

        return {
            osm_id: item.osm_id,
            name: name,
            city: item.address?.city || item.address?.town || item.address?.village || "",
            country: item.address?.country || "",
            location_type: locationType,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            from_db: false,
            relevance: calculateOsmRelevance(name, searchTerm, locationType)
        };
    });

    processedResults.sort((a, b) => b.relevance - a.relevance);
    
    const uniqueResults = new Map();
    for (const result of processedResults) {
        const key = `${result.name}-${result.city}-${result.country}`.toLowerCase();
        if (!uniqueResults.has(key) || result.relevance > uniqueResults.get(key).relevance) {
            uniqueResults.set(key, result);
        }
    }

    return Array.from(uniqueResults.values()).slice(0, 10);
}

function calculateOsmRelevance(name: string, searchTerm: string, locationType: string): number {
    let score = 0;
    const lowerName = name.toLowerCase();
    const lowerSearch = searchTerm.toLowerCase();
    
    // Exact match
    if (lowerName === lowerSearch) score += 100;
    // Starts with search term
    else if (lowerName.startsWith(lowerSearch)) score += 80;
    // Contains search term
    else if (lowerName.includes(lowerSearch)) score += 50;
    
    if (locationType === "airport") score += 20;
    else if (locationType === "train_station") score += 15;
    else if (locationType === "city") score += 10;
    else if (locationType === "landmark") score += 5;
    
    return score;
}

function combineResults(dbResults: any[], osmResults: any[], limit: number): any[] {
    const combined = [...dbResults];
    const existingKeys = new Set(
        dbResults.map(r => `${r.name}-${r.city}-${r.country}`.toLowerCase())
    );
    
    for (const osmResult of osmResults) {
        if (combined.length >= limit) break;
        
        const key = `${osmResult.name}-${osmResult.city}-${osmResult.country}`.toLowerCase();
        if (!existingKeys.has(key)) {
            combined.push(osmResult);
            existingKeys.add(key);
        }
    }
    
    // Sort by relevance
    combined.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
    
    return combined.slice(0, limit);
}

router.post("/save", async (req, res) => {
    try {
        const {
            name,
            city,
            country,
            location_type,
            latitude,
            longitude,
            osm_id
        } = req.body;

        const client = await db.connect();
        
        try {
            await client.query('BEGIN');
            
            const existing = await client.query(`
                SELECT id FROM locations 
                WHERE (
                    (ST_DWithin(coordinates, ST_SetSRID(ST_MakePoint($1, $2), 4326), 0.001) AND name = $3)
                    OR (name = $3 AND city IS NOT DISTINCT FROM $4 AND country IS NOT DISTINCT FROM $5)
                )
                LIMIT 1
            `, [longitude, latitude, name, city || null, country || null]);

            if (existing.rows.length > 0) {
                await client.query('COMMIT');
                return res.json({ id: existing.rows[0].id, existed: true });
            }

            // Insert new location
            const result = await client.query(`
                INSERT INTO locations (
                    name, 
                    city, 
                    country, 
                    location_type, 
                    coordinates,
                    created_at,
                    updated_at
                ) VALUES (
                    $1, $2, $3, $4, 
                    ST_SetSRID(ST_MakePoint($5, $6), 4326),
                    NOW(),
                    NOW()
                ) RETURNING id
            `, [
                name, 
                city || null, 
                country || null, 
                location_type, 
                longitude, 
                latitude
            ]);

            await client.query('COMMIT');
            
            // Clear relevant caches
            clearSearchCache(name, city, country);
            
            res.json({ id: result.rows[0].id, existed: false });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error saving location:", error);
        res.status(500).json({ error: "Failed to save location" });
    }
});

// Clear cache entries that might be affected by new location
function clearSearchCache(name: string, city: string | null, country: string | null) {
    const keys = searchCache.keys();
    const termsToCheck = [
        name.toLowerCase(),
        city?.toLowerCase(),
        country?.toLowerCase()
    ].filter(Boolean);
    
    for (const key of keys) {
        for (const term of termsToCheck) {
            if (term && key.includes(term)) {
                searchCache.del(key);
            }
        }
    }
}

export default router;
