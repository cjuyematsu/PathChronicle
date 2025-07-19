"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { LocationType, LocationSearchRowWithDisplay } from "@shared/types/location";
import { Search, MapPin, Plane, Train, Building, Bus, Ship } from "lucide-react";
import Loading from "./loading";

interface ApiLocationResult {
    id?: number;
    name: string;
    city: string;
    country: string;
    country_code?: string;
    code?: string;
    location_type: LocationType;
    latitude?: number;
    longitude?: number;
    from_db?: boolean;
    osm_id?: string;
}

interface LocationSearchProps {
    onLocationSelect: (location: LocationSearchRowWithDisplay) => void;
    placeholder?: string;
    initialValue?: string;
    onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name?: string;
}

// Cache for search results
const searchCache = new Map<string, ApiLocationResult[]>();

const LocationSearch = ({
    onLocationSelect,
    placeholder = "Search cities, airports, or stations...",
    initialValue = "",
    onInputChange,
    name,
}: LocationSearchProps) => {
    const [query, setQuery] = useState<string>(initialValue);
    const [suggestions, setSuggestions] = useState<ApiLocationResult[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const [isLocationSelected, setIsLocationSelected] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLUListElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const saveQueueRef = useRef<Map<string, Promise<ApiLocationResult>>>(new Map());

    // Memoize user language
    const userLang = useMemo(() => navigator.language.split('-')[0], []);

    const searchLocations = useCallback(async (searchQuery: string): Promise<void> => {
        if (searchQuery.length < 2) {
            setSuggestions([]);
            return;
        }

        // Check cache first
        const cacheKey = `${searchQuery.toLowerCase()}_${userLang}`;
        if (searchCache.has(cacheKey)) {
            setSuggestions(searchCache.get(cacheKey)!);
            setShowSuggestions(true);
            return;
        }

        setIsLoading(true);
        try {
            const params = new URLSearchParams({ 
                searchTerm: searchQuery, 
                limit: "10",
                lang: userLang 
            });

            const response = await fetch(`/api/locations/search?${params}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data: ApiLocationResult[] = await response.json();
            
            // Cache the results
            searchCache.set(cacheKey, data);
            
            // Only update state if this is still the current query
            if (searchQuery === query) {
                setSuggestions(data);
                setShowSuggestions(true);
            }
        } catch (error) {
            console.error("Search error:", error);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    }, [query, userLang]);

    const saveLocationToDatabase = useCallback(async (location: ApiLocationResult): Promise<ApiLocationResult> => {
        if (location.from_db) return location;
        
        const queueKey = location.osm_id || `${location.name}_${location.city}_${location.country}`;
        
        if (saveQueueRef.current.has(queueKey)) {
            return saveQueueRef.current.get(queueKey)!;
        }

        const savePromise = fetch("/api/locations/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: location.name,
                city: location.city,
                country: location.country,
                location_type: location.location_type,
                latitude: location.latitude,
                longitude: location.longitude,
                osm_id: location.osm_id,
            }),
        })
        .then(response => {
            if (!response.ok) throw new Error("Failed to save location");
            return response.json();
        })
        .then(result => ({ ...location, id: result.id, from_db: true }))
        .catch(error => {
            console.error("Error saving location:", error);
            return location;
        })
        .finally(() => {
            saveQueueRef.current.delete(queueKey);
        });

        saveQueueRef.current.set(queueKey, savePromise);
        return savePromise;
    }, []);

    useEffect(() => {
        if (isLocationSelected || !query.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);
        
        debounceRef.current = setTimeout(() => {
            searchLocations(query);
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, isLocationSelected, searchLocations]);

    const handleInputChangeEvent = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setQuery(newValue);
        setIsLocationSelected(false);
        if (onInputChange) onInputChange(e);
    }, [onInputChange]);

    const handleSuggestionClick = useCallback(async (location: ApiLocationResult) => {
        setShowSuggestions(false);
        
        const display = `${location.name}${location.city ? `, ${location.city}` : ""}${location.country ? `, ${location.country}` : ""}`;
        setQuery(display);
        setIsLocationSelected(true);

        const tempLocation: LocationSearchRowWithDisplay = {
            id: location.id ? String(location.id) : `temp_${location.osm_id || Date.now()}`,
            display: display,
            name: location.name,
            city: location.city,
            country: location.country,
            location_type: location.location_type,
        };
        
        onLocationSelect(tempLocation);

        // Save to database asynchronously without blocking
        if (!location.from_db) {
            saveLocationToDatabase(location).then(savedLocation => {
                if (savedLocation.id) {
                    const finalLocation: LocationSearchRowWithDisplay = {
                        ...tempLocation,
                        id: String(savedLocation.id),
                    };
                    onLocationSelect(finalLocation);
                }
            });
        }
    }, [onLocationSelect, saveLocationToDatabase]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || suggestions.length === 0) return;
        
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
                break;
            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0) {
                    handleSuggestionClick(suggestions[selectedIndex]);
                }
                break;
            case "Escape":
                setShowSuggestions(false);
                break;
        }
    }, [showSuggestions, suggestions, selectedIndex, handleSuggestionClick]);

    const getLocationIcon = useCallback((type: LocationType) => {
        const iconProps = "w-4 h-4";
        switch (type) {
            case "airport": return <Plane className={`${iconProps} text-blue-500`} />;
            case "train_station": return <Train className={`${iconProps} text-green-500`} />;
            case "city": return <Building className={`${iconProps} text-gray-500`} />;
            case "bus_station": return <Bus className={`${iconProps} text-orange-500`} />;
            case "port": return <Ship className={`${iconProps} text-purple-500`} />;
            default: return <MapPin className={`${iconProps} text-gray-500`} />;
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
                inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (initialValue && initialValue !== query) {
            setQuery(initialValue);
        }
    }, [initialValue]);

    return (
        <div className="relative w-full">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                    ref={inputRef}
                    type="text"
                    name={name}
                    value={query}
                    onChange={handleInputChangeEvent}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.length >= 2 && !isLocationSelected && setShowSuggestions(true)}
                    placeholder={placeholder}
                    autoComplete="off"
                    className="w-full pl-12 pr-12 py-3 text-base rounded-xl transition-all duration-200 outline-none
                               border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                               dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-blue-500"
                />
                {isLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loading variant="travel" size="md" text="" layout="horizontal" color="orange" />
                    </div>
                )}
            </div>
            {showSuggestions && suggestions.length > 0 && (
                <ul ref={suggestionsRef} className="absolute z-50 w-full mt-2 rounded-xl shadow-xl max-h-72 overflow-y-auto 
                                                   bg-white border border-gray-200 
                                                   dark:bg-gray-800 dark:border-gray-700">
                    {suggestions.map((location, index) => (
                        <li
                            key={location.id || location.osm_id || `${location.name}-${index}`}
                            onClick={() => handleSuggestionClick(location)}
                            className={`px-4 py-3 cursor-pointer border-b last:border-b-0 flex items-center gap-4 transition-colors duration-150 
                                       border-gray-100 hover:bg-gray-50
                                       dark:border-gray-700 dark:hover:bg-gray-700
                                       ${index === selectedIndex ? "bg-blue-50 dark:bg-blue-900/50" : ""}`}
                        >
                            <div className="flex-shrink-0">{getLocationIcon(location.location_type)}</div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold truncate text-base text-gray-900 dark:text-gray-100">
                                    {location.name}
                                    {location.code && (
                                        <span className="ml-2 text-sm font-normal px-2 py-0.5 rounded-md 
                                                       bg-gray-100 text-gray-600 
                                                       dark:bg-gray-700 dark:text-gray-300">
                                            {location.code}
                                        </span>
                                    )}
                                </div>
                                <div className="text-sm truncate mt-1 text-gray-600 dark:text-gray-400">
                                    {location.city}{location.city && location.country && ", "}{location.country}
                                </div>
                            </div>
                            <div className="flex-shrink-0 text-xs capitalize px-2 py-1 rounded-full 
                                           bg-gray-50 text-gray-500
                                           dark:bg-gray-700 dark:text-gray-400">
                                {location.location_type.replace(/_/g, " ")}
                            </div>
                            {!location.from_db && (
                                <div className="flex-shrink-0 text-xs px-2 py-1 rounded-full
                                              bg-yellow-100 text-yellow-800
                                              dark:bg-yellow-900/50 dark:text-yellow-400">
                                    OSM
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default LocationSearch;
