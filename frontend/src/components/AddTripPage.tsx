"use client";

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Plane, Train, Bus, Car, Ship, Save, CheckCircle, AlertTriangle } from 'lucide-react';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
    </div>
  </div>
);

const PageLayout = ({ children, title, subtitle }: { 
  children: React.ReactNode; 
  title: string; 
  subtitle?: string; 
}) => (
  <div className="min-h-screen bg-slate-900 flex flex-col">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        {subtitle && <p className="text-slate-400">{subtitle}</p>}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  </div>
);

const Card = ({ children, className = "" }: { 
  children: React.ReactNode; 
  className?: string; 
}) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-lg shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  onClick,
  className = "",
  icon: Icon
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) => {
  const baseClasses = "rounded-lg font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2";
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-slate-700 text-slate-200 hover:bg-slate-600 focus:ring-slate-500 border border-slate-600",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "text-slate-400 hover:text-slate-200 hover:bg-slate-700 focus:ring-slate-500"
  };
  
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );
};

const Input = ({ 
  label, 
  placeholder, 
  value, 
  onChange,
  type = "text",
  icon: Icon,
  error,
  className = "",
  name
}: {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  icon?: React.ComponentType<{ className?: string }>;
  error?: string;
  className?: string;
  name?: string;
}) => (
  <div className={className}>
    {label && (
      <label className="block text-sm font-medium text-slate-200 mb-2">
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white placeholder-slate-400`}
      />
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
        <AlertTriangle className="w-4 h-4" />
        {error}
      </p>
    )}
  </div>
);

const AddTripPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    trip_type: "flight",
    departure_date: "",
    arrival_date: "",
    departure_time: "",
    arrival_time: "",
    flight_number: "",
    notes: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const tripTypes = [
    { value: "flight", label: "Flight", icon: Plane },
    { value: "train", label: "Train", icon: Train },
    { value: "bus", label: "Bus", icon: Bus },
    { value: "car", label: "Car", icon: Car },
    { value: "ferry", label: "Ferry", icon: Ship },
    { value: "other", label: "Other", icon: MapPin },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setSubmitStatus('success');
      setIsSubmitting(false);
      setTimeout(() => {
        setFormData({
          name: "",
          trip_type: "flight",
          departure_date: "",
          arrival_date: "",
          departure_time: "",
          arrival_time: "",
          flight_number: "",
          notes: ""
        });
        setSubmitStatus(null);
      }, 2000);
    }, 1000);
  };

  if (loading) {
    return (
      <PageLayout title="Create New Trip" subtitle="Add details about your upcoming or past journey">
        <LoadingSpinner />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Create New Trip" subtitle="Add details about your upcoming or past journey">
      <Card>
        <div className="space-y-6">
          <Input
            label="Trip Name"
            name="name"
            placeholder="e.g., Summer Vacation to Paris"
            value={formData.name}
            onChange={handleInputChange}
          />

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-3">
              Transportation Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {tripTypes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, trip_type: value }))}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    formData.trip_type === value
                      ? "border-blue-500 bg-blue-600/20 text-blue-400"
                      : "border-slate-600 hover:border-slate-500 text-slate-300 hover:text-slate-200 hover:bg-slate-700"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Departure Date"
              name="departure_date"
              type="date"
              value={formData.departure_date}
              onChange={handleInputChange}
              icon={Calendar}
            />
            <Input
              label="Arrival Date"
              name="arrival_date"
              type="date"
              value={formData.arrival_date}
              onChange={handleInputChange}
              icon={Calendar}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Departure Time"
              name="departure_time"
              type="time"
              value={formData.departure_time}
              onChange={handleInputChange}
              icon={Clock}
            />
            <Input
              label="Arrival Time"
              name="arrival_time"
              type="time"
              value={formData.arrival_time}
              onChange={handleInputChange}
              icon={Clock}
            />
          </div>

          {formData.trip_type === 'flight' && (
            <Input
              label="Flight Number"
              name="flight_number"
              placeholder="e.g., AA123"
              value={formData.flight_number}
              onChange={handleInputChange}
              icon={Plane}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              placeholder="Additional information about your trip..."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-white placeholder-slate-400"
            />
          </div>

          <div className="flex justify-end pt-6">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              icon={isSubmitting ? undefined : Save}
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Trip...
                </>
              ) : (
                'Create Trip'
              )}
            </Button>
          </div>

          {submitStatus === 'success' && (
            <div className="p-4 bg-green-600/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Trip created successfully!</span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </PageLayout>
  );
};

export default AddTripPage;
