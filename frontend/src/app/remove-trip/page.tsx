"use client";
import RemoveTripComponent from "@/src/components/ManageTripsPage";

export default function AddTripPage() {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="relative w-full">
                <RemoveTripComponent />
            </div>
        </div>
    );
}