import db from "./db";

interface AirportData {
    name: string;
    city: string;
    country: string;
    airport_code: string;
    location_type: string;
    latitude: number;
    longitude: number;
    timezone: string;
}

async function downloadAirportsData(): Promise<string> {
    try {
        const response = await fetch(
            "https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat"
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text();
        console.log(`Downloaded ${data.length} characters of airport data`);
        return data;
    } catch (error) {
        console.error("Failed to download airports data:", error);
        throw error;
    }
}

function parseAirportData(data: string): AirportData[] {
    const lines = data.trim().split("\n");
    const results: AirportData[] = [];

    console.log(`Processing ${lines.length} lines of airport data`);

    for (const line of lines) {
        try {
            // Split by comma, but handle quoted fields
            const fields = line
                .split(",")
                .map((field) => field.replace(/"/g, "").trim());

            if (fields.length < 14) continue; // Skip incomplete lines

            const [
                id,
                name,
                city,
                country,
                iata,
                icao,
                latitude,
                longitude,
                altitude,
                timezone,
                dst,
                tz_database,
                type,
                source,
            ] = fields;

            // Only include airports with IATA codes and valid coordinates
            if (
                iata &&
                iata !== "\\N" &&
                latitude &&
                longitude &&
                latitude !== "\\N" &&
                longitude !== "\\N"
            ) {
                const lat = parseFloat(latitude);
                const lng = parseFloat(longitude);

                if (!isNaN(lat) && !isNaN(lng)) {
                    results.push({
                        name: name || "",
                        city: city !== "\\N" ? city : "",
                        country: country !== "\\N" ? country : "",
                        airport_code: iata,
                        location_type: "airport",
                        latitude: lat,
                        longitude: lng,
                        timezone: tz_database !== "\\N" ? tz_database : "",
                    });
                }
            }
        } catch (error) {
            console.warn(
                `Error parsing line: ${line.substring(0, 50)}...`,
                error
            );
        }
    }

    console.log(`Parsed ${results.length} valid airports`);
    return results;
}

async function importAirports(): Promise<AirportData[]> {
    console.log("Starting airport import...");

    // Try to download directly instead of using file system
    const airportData = await downloadAirportsData();
    return parseAirportData(airportData);
}

async function insertLocations(locations: AirportData[]): Promise<void> {
    console.log(`Inserting ${locations.length} locations...`);

    let inserted = 0;
    let errors = 0;

    for (const location of locations) {
        try {
            await db.query(
                `
                INSERT INTO locations (name, city, country, airport_code, location_type, coordinates, timezone)
                VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326), $8)
                ON CONFLICT DO NOTHING
                `,
                [
                    location.name,
                    location.city,
                    location.country,
                    location.airport_code,
                    location.location_type,
                    location.longitude,
                    location.latitude,
                    location.timezone,
                ]
            );
            inserted++;

            if (inserted % 100 === 0) {
                console.log(`Inserted ${inserted} locations...`);
            }
        } catch (error) {
            errors++;
            console.error(`Error inserting location ${location.name}:`, error);
        }
    }

    console.log(`Insertion complete. Inserted: ${inserted}, Errors: ${errors}`);
}

export default async function getAirports(): Promise<void> {
    try {
        const airports = await importAirports();
        await insertLocations(airports);
        console.log("Airports imported successfully!");
    } catch (error) {
        console.error("Error importing airports:", error);
        throw error;
    }
}
