"use client";
import TripForm from "@/src/components/tripForm";

export default function AddTripPage() {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="relative w-full">
                <TripForm />
            </div>
        </div>
    );
}