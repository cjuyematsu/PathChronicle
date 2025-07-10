"use client";
import { useState, useEffect, useRef } from "react";
// import {
//     Search,
//     MapPin,
//     Plane,
//     Train,
//     Building,
//     Bus,
//     Ship,
// } from "lucide-react";

// Define the location type
interface Location {
    id: string;
    name: string;
    code?: string;
    city: string;
    country: string;
    type: "airport" | "train_station" | "city" | "bus_station" | "port";
    display: string;
}

// Define the props interface
interface LocationSearchProps {
    onLocationSelect?: (location: Location) => void;
    placeholder?: string;
    initialValue?: string;
    locationTypes?:
        | "all"
        | "airport"
        | "train_station"
        | "city"
        | "bus_station"
        | "port";
}

const LocationSearch = ({
    onLocationSelect,
    placeholder = "Search cities, airports, or stations...",
    initialValue = "",
    locationTypes = "all",
}: LocationSearchProps) => {
    const [query, setQuery] = useState<string>(initialValue);
    const [suggestions, setSuggestions] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(
        null
    );

    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Debounced search function
    const searchLocations = async (searchQuery: string): Promise<void> => {
        if (searchQuery.length < 2) {
            setSuggestions([]);
            setIsLoading(false);
            return;
        }

        try {
            const params = new URLSearchParams({
                q: searchQuery,
                limit: "10",
                ...(locationTypes !== "all" && { type: locationTypes }),
            });

            const response = await fetch(
                `http://localhost:5000/api/locations/search?${params}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: Location[] = await response.json();
            console.log("Search results:", data);

            setSuggestions(data);
            setShowSuggestions(true);
            setIsLoading(false);
        } catch (error) {
            console.error("Search error:", error);
            setSuggestions([]);
            setIsLoading(false);
        }
    };

    // Handle input changes with debouncing
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (query.trim()) {
            setIsLoading(true);
            debounceRef.current = setTimeout(() => {
                searchLocations(query);
            }, 300); // 300ms debounce
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
            setIsLoading(false);
        }

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query, locationTypes]);

    // Handle input change
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ): void => {
        const value = e.target.value;
        setQuery(value);
        setSelectedIndex(-1);
        setSelectedLocation(null);
    };

    // Handle suggestion selection
    const handleSuggestionClick = (location: Location): void => {
        setQuery(location.display);
        setSelectedLocation(location);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        if (onLocationSelect) {
            onLocationSelect(location);
        }
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0) {
                    handleSuggestionClick(suggestions[selectedIndex]);
                }
                break;
            case "Escape":
                setShowSuggestions(false);
                setSelectedIndex(-1);
                break;
        }
    };

    // // Get icon for location type
    // const getLocationIcon = (type: Location["type"]): JSX.Element => {
    //     switch (type) {
    //         case "airport":
    //             return <Plane className="w-4 h-4 text-blue-500" />;
    //         case "train_station":
    //             return <Train className="w-4 h-4 text-green-500" />;
    //         case "city":
    //             return <Building className="w-4 h-4 text-gray-500" />;
    //         case "bus_station":
    //             return <Bus className="w-4 h-4 text-orange-500" />;
    //         case "port":
    //             return <Ship className="w-4 h-4 text-purple-500" />;
    //         default:
    //             return <MapPin className="w-4 h-4 text-gray-500" />;
    //     }
    // };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative w-full">
            {/* Search Input */}
            <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() =>
                        query.length >= 2 && setShowSuggestions(true)
                    }
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                    {suggestions.map((location, index) => (
                        <div
                            key={location.id}
                            onClick={() => handleSuggestionClick(location)}
                            className={`px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center gap-3 ${
                                index === selectedIndex ? "bg-blue-50" : ""
                            }`}
                        >
                            {/* {getLocationIcon(location.type)} */}
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 truncate">
                                    {location.name}
                                    {location.code && (
                                        <span className="ml-2 text-sm text-gray-500 font-normal">
                                            ({location.code})
                                        </span>
                                    )}
                                </div>
                                <div className="text-sm text-gray-500 truncate">
                                    {location.city}, {location.country}
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 capitalize">
                                {location.type.replace("_", " ")}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* No results message */}
            {showSuggestions &&
                suggestions.length === 0 &&
                query.length >= 2 &&
                !isLoading && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
                        No locations found for "{query}"
                    </div>
                )}
        </div>
    );
};

export default LocationSearch;
