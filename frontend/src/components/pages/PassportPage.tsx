"use client";

import { useState, useEffect } from "react";
import { countries, Country } from "@/src/data/countries"; 
import 'flag-icons/css/flag-icons.min.css';

const PassportPage = () => {
    const [visitedCountries, setVisitedCountries] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const userId = 1; // Placeholder for user ID

    useEffect(() => {
        if (!userId) {
            setIsLoading(false);
            return;
        }

        const fetchVisitedCountries = async () => {
            setIsLoading(true);
            try {
                // --- MOCK DATA ---
                // We'll simulate a network delay of 500ms
                await new Promise(resolve => setTimeout(resolve, 500));

                // This array simulates the data you'd get from your API
                const mockData = ['us', 'ca', 'mx', 'fr', 'jp', 'gb', 'de', 'it', 'es', 'au', 'br', 'in'];
                setVisitedCountries(new Set(mockData));
                
                /*
                // --- REAL FETCH LOGIC (Commented Out) ---
                const response = await fetch(`/api/trips/countries/${userId}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch visited countries');
                }
                const data: string[] = await response.json();
                setVisitedCountries(new Set(data));
                */
               
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVisitedCountries();
    }, [userId]);

    return (
        <div className="w-full h-full p-6 md:p-8 bg-gray-900 text-white">
            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">
                    Passport ({visitedCountries.size})
                </h2>
                <p className="text-gray-400">
                    A collection of stamps from every country you&apos;ve visited.
                </p>
            </div>

            {isLoading ? (
                <div className="text-center text-gray-400">Loading your passport...</div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
                    {countries.map((country: Country) => {
                        const hasVisited = visitedCountries.has(country.code);

                        return (
                            <div key={country.code} className="flex flex-col items-center">
                                {/* Stamp visual */}
                                <div
                                    className={`w-36 h-28 p-1 rounded-lg flex items-center justify-center transition-all duration-300
                                    ${
                                        hasVisited
                                            ? "bg-amber-50"
                                            : "bg-gray-800"
                                    }`}
                                    style={{
                                        border: '1px dashed #a1a1aa',
                                    }}
                                >
                                    {hasVisited ? (
                                        // The flag icon
                                        <span
                                            className={`fi fi-${country.code} text-7xl rounded-md`}
                                            style={{
                                                width: '100px',
                                                height: '75px',
                                                backgroundSize: 'cover',
                                            }}
                                        ></span>
                                    ) : (
                                        // Empty state
                                        <div className="w-full h-full bg-gray-700 rounded-md"></div>
                                    )}
                                </div>

                                {/* Country Name */}
                                <p className="mt-3 text-center text-sm font-medium truncate w-36">
                                    {country.name}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PassportPage;