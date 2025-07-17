"use client";
import { useState } from "react";
import { LocationSearchRowWithDisplay } from "@shared/types/location";
import { TripFormData, TripTypeOption } from "../types";
import LocationSearch from "./locationSearch";
import { FormErrors } from "../types";

import {
    Calendar,
    Clock,
    MapPin,
    Plane,
    Train,
    Bus,
    Car,
    Ship,
    Save,
    AlertCircle,
    CheckCircle,
} from "lucide-react";

// Trip form component
const TripForm = () => {
    const [formData, setFormData] = useState<TripFormData>({
        name: "",
        trip_type: "flight",
        origin_location: null,
        destination_location: null,
        departure_date: "",
        arrival_date: "",
        departure_time: "",
        arrival_time: "",
        flight_number: "",
        train_number: "",
        airline: "",
        operator: "",
        notes: "",
    });

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitStatus, setSubmitStatus] = useState<
        "success" | "error" | null
    >(null);
    const [errors, setErrors] = useState<FormErrors>({});

    // Define trip types with icons for the buttons
    const tripTypes: TripTypeOption[] = [
        { value: "flight", label: "Flight", icon: Plane },
        { value: "train", label: "Train", icon: Train },
        { value: "bus", label: "Bus", icon: Bus },
        { value: "car", label: "Car", icon: Car },
        { value: "ferry", label: "Ferry", icon: Ship },
        { value: "other", label: "Other", icon: MapPin },
    ];

    // Handle input changes for text fields
    // This function updates the form data state and clears any existing error for that field
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: null,
            }));
        }
    };

    // Handle input changes for the search fields (Search for locations)
    const handleInputChangeSearch = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name } = e.target;

        // Reset the location when user starts typing
        setFormData((prev) => ({
            ...prev,
            [name]: null,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: null,
            }));
        }
    };

    // Handle location selection from the LocationSearch component
    // This function updates the form data state with the selected location and clears any existing error for
    const handleLocationSelect = (
        location: LocationSearchRowWithDisplay,
        type: "origin_location" | "destination_location"
    ) => {
        setFormData((prev) => ({
            ...prev,
            [type]: location,
        }));

        // Clear error when location is selected
        if (errors[type]) {
            setErrors((prev) => ({
                ...prev,
                [type]: null,
            }));
        }

        // TODO: Handle any additional logic when a location is selected
        // TODO: For example, change color of the input or show a confirmation message
    };

    const validateForm = () => {
        const newErrors: FormErrors = {};

        if (!formData.origin_location) {
            newErrors.origin_location = "Origin location is required";
        }

        if (!formData.destination_location) {
            newErrors.destination_location = "Destination location is required";
        }

        if (
            formData.origin_location &&
            formData.destination_location &&
            formData.origin_location.id === formData.destination_location.id
        ) {
            newErrors.destination_location =
                "Origin and destination can't match";
        }

        // TODO: Ensure departure date is before arrival date

        // TODO: Ensure departure time is before arrival time

        // TODO: Validate destination and origin locations (make sure they are not the same + they exist in the database)
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (): Promise<void> => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus(null);

        // TODO: Handle submission logic
        // TODO: For example, send the form data to your API or backend service to add to the database
        try {
            // Prepare the data for submission
            // TODO: Calculate distance between origin and destination
            // TODO: Calculate duration based on departure and arrival times (if provided)
            // TODO: Create tripData type
            // TODO: Create API endpoint to handle trip creation
            const tripData = {
                name: formData.name,
                trip_type: formData.trip_type,
                origin_location_id: formData.origin_location!.id,
                destination_location_id: formData.destination_location!.id,
                departure_date: formData.departure_date || null,
                arrival_date: formData.arrival_date || null,
                departure_time: formData.departure_time || null,
                arrival_time: formData.arrival_time || null,
                flight_number: formData.flight_number || null,
                train_number: formData.train_number || null,
                airline: formData.airline || null,
                operator: formData.operator || null,
                notes: formData.notes || null,
            };

            //TODO: Submit to your API
            const response = await fetch("/api/trips", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(tripData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // const result = await response.json();

            setSubmitStatus("success");

            //TODO: Handle successful submission (redirect, show message, etc.)
            // TODO: Remove this when you implement form submission
            // Reset form after successful submission
            setTimeout(() => {
                setFormData({
                    name: "",
                    trip_type: "flight",
                    origin_location: null,
                    destination_location: null,
                    departure_date: "",
                    arrival_date: "",
                    departure_time: "",
                    arrival_time: "",
                    flight_number: "",
                    train_number: "",
                    airline: "",
                    operator: "",
                    notes: "",
                });
                setSubmitStatus(null);
            }, 2000);
            // ------
        } catch (error) {
            console.error("Error creating trip:", error);
            setSubmitStatus("error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderTransportSpecificFields = () => {
        switch (formData.trip_type) {
            case "flight":
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-black mb-2">
                                Flight Number
                            </label>
                            <input
                                type="text"
                                name="flight_number"
                                value={formData.flight_number}
                                onChange={handleInputChange}
                                placeholder="e.g., AA123"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-black mb-2">
                                Airline
                            </label>
                            <input
                                type="text"
                                name="airline"
                                value={formData.airline}
                                onChange={handleInputChange}
                                placeholder="e.g., American Airlines"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                            />
                        </div>
                    </div>
                );
            case "train":
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-black mb-2">
                                Train Number
                            </label>
                            <input
                                type="text"
                                name="train_number"
                                value={formData.train_number}
                                onChange={handleInputChange}
                                placeholder="e.g., TGV123"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-black mb-2">
                                Operator
                            </label>
                            <input
                                type="text"
                                name="operator"
                                value={formData.operator}
                                onChange={handleInputChange}
                                placeholder="e.g., SNCF"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                            />
                        </div>
                    </div>
                );
            case "bus":
            case "ferry":
                return (
                    <div>
                        <label className="block text-sm font-medium text-black mb-2">
                            Operator
                        </label>
                        <input
                            type="text"
                            name="operator"
                            value={formData.operator}
                            onChange={handleInputChange}
                            placeholder="e.g., Greyhound, Stena Line"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="w-full h-full p-6 bg-white">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-black mb-2">
                    Create New Trip
                </h2>
                <p className="text-black">
                    Add details about your upcoming or past journey
                </p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-black mb-2">
                        Trip Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Summer Vacation to Paris"
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                    />
                </div>

                {/* Trip Type */}
                <div>
                    <label className="block text-sm font-medium text-black mb-3">
                        Transportation Type *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {tripTypes.map(({ value, label, icon: Icon }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        trip_type: value,
                                    }))
                                }
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                    formData.trip_type === value
                                        ? "border-blue-500 bg-blue-50 text-blue-700"
                                        : "border-gray-200 hover:border-gray-300 text-black"
                                }`}
                            >
                                <Icon className="w-6 h-6" />
                                <span className="text-sm font-medium">
                                    {label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Origin and Destination */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative pb-2">
                        <label className="flex items-center text-sm font-medium text-black mb-2">
                            <div className="pr-2">Origin Location * </div>
                            {formData.origin_location && (
                                <CheckCircle className="w-4 h-4" />
                            )}
                        </label>
                        <LocationSearch
                            onLocationSelect={(location) =>
                                handleLocationSelect(
                                    location,
                                    "origin_location"
                                )
                            }
                            placeholder="e.g., JFK"
                            initialValue={formData.origin_location?.name || ""}
                            onInputChange={handleInputChangeSearch}
                            name="origin_location"
                        />
                        {/* Error */}
                        {errors.origin_location && (
                            <p className="absolute left-0 top-full text-sm text-red-600 flex items-start gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {errors.origin_location}
                            </p>
                        )}
                    </div>

                    <div className="relative pb-2">
                        <label className="flex items-center text-sm font-medium text-black mb-2">
                            <div className="pr-2">Destination Location * </div>
                            {formData.destination_location && (
                                <CheckCircle className="w-4 h-4" />
                            )}
                        </label>
                        <LocationSearch
                            onLocationSelect={(location) =>
                                handleLocationSelect(
                                    location,
                                    "destination_location"
                                )
                            }
                            placeholder="e.g., LAX"
                            initialValue={
                                formData.destination_location?.name || ""
                            }
                            onInputChange={handleInputChangeSearch}
                            name="destination_location"
                        />

                        {/* Error */}
                        {errors.destination_location && (
                            <p className="absolute left-0 top-full text-sm text-red-600 flex items-start gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {errors.destination_location}
                            </p>
                        )}
                    </div>
                </div>

                {/* Dates and Times */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-black mb-2">
                                Departure Date
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="date"
                                    name="departure_date"
                                    value={formData.departure_date}
                                    onChange={handleInputChange}
                                    className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-black mb-2">
                                Departure Time
                            </label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="time"
                                    name="departure_time"
                                    value={formData.departure_time}
                                    onChange={handleInputChange}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-black mb-2">
                                Arrival Date
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="date"
                                    name="arrival_date"
                                    value={formData.arrival_date}
                                    onChange={handleInputChange}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                                />
                                {/* TODO: Add error message when arrival_date is before departure */}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-black mb-2">
                                Arrival Time
                            </label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="time"
                                    name="arrival_time"
                                    value={formData.arrival_time}
                                    onChange={handleInputChange}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                                />
                                {/* TODO: Add error message when arrival_time is before departure_time */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transport-specific fields */}
                {renderTransportSpecificFields()}

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-black mb-2">
                        Notes
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Additional information about your trip..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-black"
                    />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2 font-medium"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Creating Trip...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Create Trip
                            </>
                        )}
                    </button>
                </div>

                {/* Success/Error Messages */}
                {submitStatus === "success" && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center gap-2 text-green-800">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">
                                Trip created successfully!
                            </span>
                        </div>
                    </div>
                )}

                {submitStatus === "error" && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-center gap-2 text-red-800">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-medium">
                                Error creating trip. Please try again.
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TripForm;
