import React, { useState, useEffect } from 'react';
import { MapPin, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../Context/Theme';

const Location = ({ 
  pincode, 
  onPincodeChange, 
  onLocationDetected, 
  error, 
  setError 
}) => {
  const { theme } = useTheme();
  
  const [isLoading, setIsLoading] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [manualLocation, setManualLocation] = useState('');

  // Fetch location data when pincode changes
  useEffect(() => {
    if (pincode && pincode.length === 6) {
      fetchLocationByPincode(pincode);
    } else {
      setLocationData(null);
      if (onLocationDetected) {
        onLocationDetected(null);
      }
    }
  }, [pincode]);

  // Fetch location data from API
  const fetchLocationByPincode = async (pin) => {
    setIsLoading(true);
    setError && setError('');

    try {
      // Using India Post API for pincode lookup
      const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await response.json();

      if (data && data[0]?.Status === 'Success') {
        const postOffice = data[0].PostOffice[0];
        const detectedLocation = {
          area: postOffice.Name,
          district: postOffice.District,
          state: postOffice.State,
          country: postOffice.Country,
          pincode: pin,
          fullAddress: `${postOffice.Name}, ${postOffice.District}, ${postOffice.State} - ${pin}`
        };

        setLocationData(detectedLocation);
        
        // Pass location data to parent component
        if (onLocationDetected) {
          onLocationDetected(detectedLocation);
        }
      } else {
        setLocationData(null);
        setError && setError('Invalid pincode or location not found');
      }
    } catch (err) {
      console.error('Error fetching location:', err);
      setError && setError('Failed to fetch location. Please try again.');
      setLocationData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle manual location input
  const handleManualLocationChange = (e) => {
    const value = e.target.value;
    setManualLocation(value);
    
    // Update parent with manual location if no auto-detected location
    if (!locationData && onLocationDetected) {
      onLocationDetected({
        area: value,
        manual: true
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Pincode Input */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Pincode <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MapPin 
            size={18} 
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`} 
          />
          <input
            type="text"
            value={pincode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              onPincodeChange(value);
              if (error) {
                setError && setError('');
              }
            }}
            placeholder="Enter 6-digit pincode"
            maxLength="6"
            className={`w-full pl-10 pr-10 py-3 rounded-lg border-2 transition-all outline-none ${
              error
                ? "border-red-500 focus:border-red-600"
                : theme === "dark"
                ? "bg-slate-700 border-gray-600 focus:border-blue-500 text-white"
                : "bg-white border-gray-300 focus:border-blue-500 text-black"
            }`}
          />
          
          {/* Loading Spinner */}
          {isLoading && (
            <Loader2 
              size={18} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" 
            />
          )}
          
          {/* Success Icon */}
          {locationData && !isLoading && (
            <CheckCircle2 
              size={18} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" 
            />
          )}
        </div>
        
        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} /> {error}
          </p>
        )}
        
        {/* Character Count */}
        <p className={`text-xs mt-1 ${
          theme === "dark" ? "text-gray-400" : "text-gray-500"
        }`}>
          {pincode.length}/6 digits
        </p>
      </div>

      {/* Auto-Detected Location Display */}
      {locationData && !isLoading && (
        <div className={`p-4 rounded-lg border-l-4 border-green-500 animate-fadeIn ${
          theme === "dark" ? "bg-green-900/20" : "bg-green-50"
        }`}>
          <div className="flex items-start gap-3">
            <MapPin size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className={`font-semibold mb-1 ${
                theme === "dark" ? "text-green-400" : "text-green-700"
              }`}>
                Location Detected
              </p>
              <div className={`text-sm space-y-1 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>
                <p><span className="font-medium">Area:</span> {locationData.area}</p>
                <p><span className="font-medium">District:</span> {locationData.district}</p>
                <p><span className="font-medium">State:</span> {locationData.state}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Location Input (Optional) */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Additional Location Details (Optional)
        </label>
        <div className="relative">
          <MapPin 
            size={18} 
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`} 
          />
          <input
            type="text"
            value={manualLocation}
            onChange={handleManualLocationChange}
            placeholder="Street, Building, Landmark..."
            className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 transition-all outline-none ${
              theme === "dark"
                ? "bg-slate-700 border-gray-600 focus:border-blue-500 text-white"
                : "bg-white border-gray-300 focus:border-blue-500 text-black"
            }`}
          />
        </div>
        <p className={`text-xs mt-1 ${
          theme === "dark" ? "text-gray-400" : "text-gray-500"
        }`}>
          Add specific details like street name, building number, or nearby landmark
        </p>
      </div>

      {/* Info Box */}
      {pincode.length === 6 && !locationData && !isLoading && !error && (
        <div className={`p-3 rounded-lg text-sm ${
          theme === "dark" ? "bg-blue-900/20 text-blue-300" : "bg-blue-50 text-blue-700"
        }`}>
          <p className="flex items-center gap-2">
            <AlertCircle size={16} />
            Searching for location...
          </p>
        </div>
      )}
    </div>
  );
};

export default Location;