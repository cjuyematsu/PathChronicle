"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { LocationSearchRowWithDisplay } from "@shared/types/location";
import LocationSearch from "../locationSearch";
import { TripFormData, CreateTripData } from "@/src/types";
import { apiWrapper } from '@/src/utils/apiWrapper';
import { useAuth } from '@/src/context/AuthContext';

import { Calendar, Clock, MapPin, Plane, Train, Bus, Car, Ship, Save, 
    AlertCircle, CheckCircle } from "lucide-react";

interface FormErrors {
    [key: string]: string | null;
}

interface TripTypeOption {
    value: string;
    label: string;
    icon: React.FC<{ className?: string }>;
}

interface TripFormProps {
    userId: number;
}

const AddTripPage = ({ userId }: TripFormProps) => {
    const router = useRouter();
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
    const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState<boolean>(true);

    const { isGuest } = useAuth();

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 500);
    }, []);

    const tripTypes: TripTypeOption[] = [
        { value: "flight", label: "Flight", icon: Plane },
        { value: "train", label: "Train", icon: Train },
        { value: "bus", label: "Bus", icon: Bus },
        { value: "car", label: "Car", icon: Car },
        { value: "ferry", label: "Ferry", icon: Ship },
        { value: "other", label: "Other", icon: MapPin },
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const handleInputChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name } = e.target;
        setFormData((prev) => ({ ...prev, [name as keyof TripFormData]: null }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const handleLocationSelect = (
        location: LocationSearchRowWithDisplay,
        type: "origin_location" | "destination_location"
    ) => {
        setFormData((prev) => ({ ...prev, [type]: location }));
        if (errors[type]) setErrors((prev) => ({ ...prev, [type]: null }));
    };

    const validateForm = () => {
        const newErrors: FormErrors = {};
        if (!formData.origin_location) {
            newErrors.origin_location = "Origin location is required";
        }
        if (!formData.destination_location) {
            newErrors.destination_location = "Destination location is required";
        }
        if (formData.origin_location?.id === formData.destination_location?.id) {
            newErrors.destination_location = "Origin and destination can't be the same";
        }
        if (formData.departure_date && formData.arrival_date) {
            if (new Date(formData.departure_date) > new Date(formData.arrival_date)) {
                newErrors.arrival_date = "Arrival can't be before departure";
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (): Promise<void> => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const tripData: CreateTripData = {
                user_id: userId,
                name: formData.name || `Trip to ${formData.destination_location?.name}`,
                trip_type: formData.trip_type,
                origin_location_id: parseInt(formData.origin_location!.id, 10),
                destination_location_id: parseInt(formData.destination_location!.id, 10),
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

            // For guest mode, include location details
            if (isGuest && formData.origin_location) {
                tripData.origin_name = formData.origin_location.name;
                tripData.origin_city = formData.origin_location.city || '';
                tripData.origin_country = formData.origin_location.country_code || formData.origin_location.country || '';
                tripData.origin_lat = formData.origin_location.latitude || 0;
                tripData.origin_lon = formData.origin_location.longitude || 0;
                
                console.log('Origin coordinates:', tripData.origin_lat, tripData.origin_lon);
            }
            
            if (isGuest && formData.destination_location) {
                tripData.destination_name = formData.destination_location.name;
                tripData.destination_city = formData.destination_location.city || '';
                tripData.destination_country = formData.destination_location.country_code || formData.destination_location.country || '';
                tripData.destination_lat = formData.destination_location.latitude || 0;
                tripData.destination_lon = formData.destination_location.longitude || 0;
                
                console.log('Destination coordinates:', tripData.destination_lat, tripData.destination_lon);
            }

            await apiWrapper.createTrip(tripData, {
                isGuest: isGuest,
                userId: userId
            });
            
            setSubmitStatus("success");
            setShowSuccessPopup(true);
            
            // Clear the form immediately
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
            
            // Hide the popup after 5 seconds
            setTimeout(() => {
                setShowSuccessPopup(false);
                setSubmitStatus(null);
            }, 5000);
        } catch (error) {
            console.error("Error creating trip:", error);
            setSubmitStatus("error");
            // Hide error after 5 seconds
            setTimeout(() => {
                setSubmitStatus(null);
            }, 5000);
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
                            <label className="block text-sm font-medium text-white mb-2">Flight Number</label>
                            <input type="text" name="flight_number" value={formData.flight_number} onChange={handleInputChange} placeholder="e.g., AA123" className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-400" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Airline</label>
                            <input type="text" name="airline" value={formData.airline} onChange={handleInputChange} placeholder="e.g., American Airlines" className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-400" />
                        </div>
                    </div>
                );
            case "train":
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Train Number</label>
                            <input type="text" name="train_number" value={formData.train_number} onChange={handleInputChange} placeholder="e.g., TGV123" className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-400" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Operator</label>
                            <input type="text" name="operator" value={formData.operator} onChange={handleInputChange} placeholder="e.g., SNCF" className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-400" />
                        </div>
                    </div>
                );
            case "bus":
            case "ferry":
                return (
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Operator</label>
                        <input type="text" name="operator" value={formData.operator} onChange={handleInputChange} placeholder={formData.trip_type === "bus" ? "e.g., Greyhound" : "e.g., Stena Line"} className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-400" />
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="w-full h-full p-6 bg-slate-900 text-white">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full p-6 bg-slate-900 text-white">
            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2 py-6">Create New Trip</h2>
                <p className="text-gray-300">Add details about your upcoming or past journey.</p>
            </div>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Trip Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Summer Vacation to Paris" className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-3">Transportation Type *</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {tripTypes.map(({ value, label, icon: Icon }) => (
                            <button key={value} type="button" onClick={() => setFormData((prev) => ({ ...prev, trip_type: value }))} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${formData.trip_type === value ? "border-blue-500 bg-blue-500/20 text-blue-400" : "border-gray-600 hover:border-gray-500" }`}>
                                <Icon className="w-6 h-6" />
                                <span className="text-sm font-medium">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative pb-6">
                        <label className="flex items-center text-sm font-medium mb-2">
                            <span className="pr-2">Origin Location *</span>
                            {formData.origin_location && <CheckCircle className="w-4 h-4 text-green-500" />}
                        </label>
                        <LocationSearch onLocationSelect={(location) => handleLocationSelect(location, "origin_location")} placeholder="Search for origin..." initialValue={formData.origin_location?.display || ""} onInputChange={handleInputChangeSearch} name="origin_location" />
                        {errors.origin_location && <p className="absolute left-0 bottom-0 text-sm text-red-500 flex items-start gap-1"><AlertCircle className="w-4 h-4 flex-shrink-0" />{errors.origin_location}</p>}
                    </div>
                    <div className="relative pb-6">
                        <label className="flex items-center text-sm font-medium mb-2">
                            <span className="pr-2">Destination Location *</span>
                            {formData.destination_location && <CheckCircle className="w-4 h-4 text-green-500" />}
                        </label>
                        <LocationSearch onLocationSelect={(location) => handleLocationSelect(location, "destination_location")} placeholder="Search for destination..." initialValue={formData.destination_location?.display || ""} onInputChange={handleInputChangeSearch} name="destination_location" />
                        {errors.destination_location && <p className="absolute left-0 bottom-0 text-sm text-red-500 flex items-start gap-1"><AlertCircle className="w-4 h-4 flex-shrink-0" />{errors.destination_location}</p>}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Departure Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input type="date" name="departure_date" value={formData.departure_date} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Departure Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input type="time" name="departure_time" value={formData.departure_time} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Arrival Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input type="date" name="arrival_date" value={formData.arrival_date} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                {errors.arrival_date && <p className="text-sm text-red-500 flex items-start gap-1 mt-1"><AlertCircle className="w-4 h-4 flex-shrink-0" />{errors.arrival_date}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Arrival Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input type="time" name="arrival_time" value={formData.arrival_time} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>
                    </div>
                </div>
                {renderTransportSpecificFields()}
                <div>
                    <label className="block text-sm font-medium mb-2">Notes</label>
                    <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={4} placeholder="Additional information about your trip..." className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none placeholder-gray-400" />
                </div>
                <div className="flex justify-end pt-6">
                    <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2 font-medium">
                        {isSubmitting ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Creating Trip...</>) : (<><Save className="w-5 h-5" />Create Trip</>)}
                    </button>
                </div>
            </div>

            {/* Success Popup */}
            {showSuccessPopup && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all animate-slideUp">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4 animate-scaleIn">
                                <CheckCircle className="w-12 h-12 text-green-500" />
                            </div>
                            
                            <h3 className="text-2xl font-bold text-white mb-2">
                                Trip Added Successfully!
                            </h3>
                            <p className="text-gray-400 mb-6">
                                Your trip has been saved to your collection.
                            </p>
                            
                            <div className="bg-slate-900/50 rounded-xl p-4 w-full mb-6">
                                <p className="text-sm text-gray-300">
                                    <span className="text-blue-400">Tip:</span> You can delete your trips anytime from the 
                                    <span className="font-semibold text-white"> Remove Trips</span> page.
                                </p>
                            </div>
                            
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => {
                                        setShowSuccessPopup(false);
                                        setSubmitStatus(null);
                                    }}
                                    className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors font-medium"
                                >
                                    Add Another Trip
                                </button>
                                <button
                                    onClick={() => {
                                        router.push('/');
                                    }}
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                                >
                                    View Globe
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Notification */}
            {submitStatus === "error" && !showSuccessPopup && (
                <div className="fixed bottom-8 right-8 max-w-md animate-slideInRight z-50">
                    <div className="bg-red-900/90 backdrop-blur border border-red-600 rounded-xl p-4 shadow-xl">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-red-400">Failed to create trip</p>
                                <p className="text-sm text-red-300/80 mt-1">
                                    Please check your connection and try again.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slideInRight {
                    from { 
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to { 
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes scaleIn {
                    from { 
                        transform: scale(0);
                    }
                    to { 
                        transform: scale(1);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
                
                .animate-slideInRight {
                    animation: slideInRight 0.3s ease-out;
                }
                
                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
                
                .trip-form-location-search :global(.border-gray-300) { border-color: rgb(75 85 99); }
                .trip-form-location-search :global(.bg-white) { background-color: rgb(31 41 55); }
                .trip-form-location-search :global(.text-gray-900) { color: rgb(243 244 246); }
                .trip-form-location-search :global(.text-gray-600) { color: rgb(156 163 175); }
                .trip-form-location-search :global(.text-gray-500) { color: rgb(156 163 175); }
                .trip-form-location-search :global(.text-gray-400) { color: rgb(156 163 175); }
                .trip-form-location-search :global(.bg-gray-50) { background-color: rgb(55 65 81); }
                .trip-form-location-search :global(.bg-gray-100) { background-color: rgb(75 85 99); }
                .trip-form-location-search :global(.hover\\:bg-gray-50:hover) { background-color: rgb(55 65 81); }
                .trip-form-location-search :global(.bg-blue-50) { background-color: rgb(30 64 175) !important; opacity: 0.2; }
                .trip-form-location-search :global(.border-gray-200) { border-color: rgb(75 85 99); }
                .trip-form-location-search :global(.border-gray-100) { border-color: rgb(75 85 99); }
                .trip-form-location-search :global(.shadow-xl) { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4); }
                .trip-form-location-search :global(.border-blue-100) { border-color: rgb(30 64 175); }
                .trip-form-location-search :global(.bg-yellow-50) { background-color: rgb(133 77 14); }
                .trip-form-location-search :global(.text-yellow-600) { color: rgb(251 191 36); }
            `}</style>
        </div>
    );
};

export default AddTripPage;