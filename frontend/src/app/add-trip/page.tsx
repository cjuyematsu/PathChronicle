"use client";

import AddTripPage from "@/src/components/pages/AddTripPage";
import { useAuth } from "@/src/context/AuthContext"; 
import React from "react";

const AddTripContainerPage = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div></div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="relative w-full">
                <AddTripPage userId={user.id} />
            </div>
    </div>
  );
};

export default AddTripContainerPage;