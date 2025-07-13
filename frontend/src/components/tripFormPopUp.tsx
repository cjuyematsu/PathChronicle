"use client";

import { X } from "lucide-react";
import TripForm from "../components/tripForm"; // Make sure the path to TripForm is correct

interface AddTripPopUpProps {
  onClose: () => void;
}

export function AddTripPopUp({ onClose }: AddTripPopUpProps) {
  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      
      {/* Modal Container */}
      <div className="relative bg-gray-50 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 p-2 text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 hover:text-gray-800"
        >
          <X className="w-6 h-6" />
        </button>

        {/* The Trip Form */}
        <div className="p-4 sm:p-6">
           <TripForm />
        </div>
      </div>
    </div>
  );
}