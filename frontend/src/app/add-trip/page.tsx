"use client";
import AddTripComponent from "@/src/components/AddTripPage";

export default function AddTripPage() {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="relative w-full">
                <AddTripComponent />
            </div>
        </div>
    );
}