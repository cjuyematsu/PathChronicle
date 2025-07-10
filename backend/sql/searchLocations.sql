-- Search locations in the database
-- Takes in 2 parameters:
-- 1. searchTerm: The term to search for in the locations table. ("LA" for example would match "LAX", )
-- 2. limit: The maximum number of results to return.
WITH ranked_results AS (
    SELECT
        id,
        name,
        city,
        country,
        airport_code,
        station_code,
        location_type,
        MIN(
            CASE WHEN LOWER(airport_code) = LOWER($1) THEN
                1
            WHEN LOWER(name) = LOWER($1) THEN
                2
            WHEN LOWER(city) = LOWER($1) THEN
                3
            WHEN LOWER(country) = LOWER($1) THEN
                4
            WHEN LOWER(airport_code)
            LIKE LOWER($1) || '%' THEN
                5
            WHEN LOWER(name)
            LIKE LOWER($1) || '%' THEN
                6
            WHEN LOWER(city)
            LIKE LOWER($1) || '%' THEN
                7
            WHEN LOWER(country)
            LIKE LOWER($1) || '%' THEN
                8
            ELSE
                9
            END) AS relevance_score
    FROM
        locations
    WHERE
        LOWER(airport_code)
        LIKE '%' || LOWER($1) || '%'
        OR LOWER(name)
        LIKE '%' || LOWER($1) || '%'
        OR LOWER(city)
        LIKE '%' || LOWER($1) || '%'
        OR LOWER(country)
        LIKE '%' || LOWER($1) || '%' -- $3 will be the type, if present
        -- caller should dynamically append "AND location_type = $3" if needed
    GROUP BY
        id,
        name,
        city,
        country,
        airport_code,
        station_code,
        location_type
)
SELECT
    id,
    name,
    city,
    country,
    airport_code,
    station_code,
    location_type
FROM
    ranked_results
ORDER BY
    relevance_score ASC,
    CASE WHEN relevance_score <= 4 THEN
        0
    ELSE
        LENGTH(name)
    END ASC,
    name ASC
LIMIT $2;

