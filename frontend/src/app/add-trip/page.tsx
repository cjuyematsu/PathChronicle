"use client";

import AddTripPage from "@/src/components/pages/AddTripPage";
import { useAuth } from "@/src/context/AuthContext"; 
import React from "react";

const AddTripContainerPage = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        Loading...
      </div>
    );
  }

  return <AddTripPage userId={user.id} />;
};

export default AddTripContainerPage;