// If want to change limit, change it manually in the code

"use client";
import Loading from "./loading";
import { useState, useEffect, useRef } from "react";
import {
    LocationSearchRowWithDisplay,
    LocationType,
} from "@shared/types/location";
import {
    Search,
    MapPin,
    Plane,
    Train,
    Building,
    Bus,
    Ship,
} from "lucide-react";

// Define the props interface
interface LocationSearchProps {
    onLocationSelect?: (location: LocationSearchRowWithDisplay) => void;
    placeholder?: string;
    initialValue?: string;
    onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name?: string; // Optional name prop for the input
}

const LocationSearch = ({
    onLocationSelect,
    placeholder = "Search cities, airports, or stations...",
    initialValue = "",
    onInputChange,
    name,
}: LocationSearchProps) => {
    const [query, setQuery] = useState<string>(initialValue);
    const [suggestions, setSuggestions] = useState<
        LocationSearchRowWithDisplay[]
    >([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const [isLocationSelected, setIsLocationSelected] =
        useState<boolean>(false);

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
                searchTerm: searchQuery,
                limit: "5",
            });

            const response = await fetch(
                `http://localhost:5000/api/locations/search?${params}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: LocationSearchRowWithDisplay[] = await response.json();

            setSuggestions(data);
            setShowSuggestions(true);
            setIsLoading(false);
        } catch (error) {
            console.error("Search error:", error);
            setSuggestions([]);
            setShowSuggestions(false);
            setIsLoading(false);
        }
    };

    // Handle input changes with debouncing
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Don't search if a location was just selected
        if (isLocationSelected) {
            return;
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
    }, [query, isLocationSelected]);

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setSelectedIndex(-1);
        setIsLocationSelected(false); // Reset the flag when user types
        onInputChange?.(e); // Notify parent
    };

    // Handle suggestion selection
    const handleSuggestionClick = (location: LocationSearchRowWithDisplay) => {
        setQuery(location.name);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        setIsLocationSelected(true); // Set flag to prevent search
        if (onLocationSelect) {
            onLocationSelect(location);
        }
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

    // Get icon for location type
    const getLocationIcon = (type: LocationType) => {
        switch (type) {
            case "airport":
                return <Plane className="w-4 h-4 text-blue-500" />;
            case "train_station":
                return <Train className="w-4 h-4 text-green-500" />;
            case "city":
                return <Building className="w-4 h-4 text-gray-500" />;
            case "bus_station":
                return <Bus className="w-4 h-4 text-orange-500" />;
            case "port":
                return <Ship className="w-4 h-4 text-purple-500" />;
            default:
                return <MapPin className="w-4 h-4 text-gray-500" />;
        }
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
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
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    ref={inputRef}
                    type="text"
                    name={name}
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() =>
                        query.length >= 2 &&
                        !isLocationSelected &&
                        setShowSuggestions(true)
                    }
                    placeholder={placeholder}
                    className="w-full pl-12 pr-12 py-3 text-base border border-gray-300 rounded-xl bg-white hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 placeholder:text-gray-400"
                />
                {isLoading && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <Loading
                            variant="travel"
                            size="md"
                            text="Finding routes..."
                            layout="horizontal"
                            color="orange"
                        />
                    </div>
                )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-72 overflow-y-auto backdrop-blur-sm"
                >
                    {suggestions.map((location, index) => (
                        <div
                            key={location.id}
                            onClick={() => handleSuggestionClick(location)}
                            className={`px-4 py-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center gap-4 transition-colors duration-150 ${
                                index === selectedIndex
                                    ? "bg-blue-50 border-blue-100"
                                    : ""
                            }`}
                        >
                            <div className="flex-shrink-0">
                                {getLocationIcon(location.location_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 truncate text-base">
                                    {location.name}
                                    {(location.location_type === "airport" ||
                                        location.location_type ===
                                            "train_station") &&
                                        location.code && (
                                            <span className="ml-2 text-sm text-gray-500 font-normal bg-gray-100 px-2 py-0.5 rounded-md">
                                                {location.code}
                                            </span>
                                        )}
                                </div>
                                <div className="text-sm text-gray-600 truncate mt-1">
                                    {location.city}, {location.country}
                                </div>
                            </div>
                            <div className="flex-shrink-0 text-xs text-gray-400 capitalize bg-gray-50 px-2 py-1 rounded-full">
                                {location.location_type.replace("_", " ")}
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
                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl p-6 text-center">
                        <div className="text-gray-400 mb-2">
                            <Search className="w-8 h-8 mx-auto opacity-50" />
                        </div>
                        <div className="text-gray-500 font-medium">
                            No locations found
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                            Try searching for "{query}" with different terms
                        </div>
                    </div>
                )}
        </div>
    );
};

export default LocationSearch;
