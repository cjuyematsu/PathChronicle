"use client";
import SummaryComponent from "@/src/components/TripSummaryPage";

export default function AddTripPage() {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="relative w-full">
                <SummaryComponent />
            </div>
        </div>
    );
}