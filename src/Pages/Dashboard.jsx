import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import Issues from "../Components/Issues";
import Location from "../Components/Location";
import Monitor from "../Components/Monitor";
import Voice from "../Components/Voice";
import SelectDept, { DEPARTMENTS } from "../Components/SelectDept";
import GrievanceExamplesGuide from "../Components/GrievanceExamplesGuide";
import { useTheme } from "../Context/Theme";
import Footer from "../Components/Footer";
import { useUser, useClerk } from "@clerk/clerk-react";
import { 
  X, Megaphone, Upload, AlertCircle, CheckCircle2, Camera, LogIn 
} from 'lucide-react';

function Dashboard() {
  const { theme } = useTheme();
  const { user, isLoaded } = useUser();
  const { openSignIn } = useClerk();

  // Form States
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [issueText, setIssueText] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [pincode, setPincode] = useState("");
  const [locationData, setLocationData] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // UI States
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Store raised issues (local storage per user)
  const [raisedIssues, setRaisedIssues] = useState(() => {
    if (!user) return [];
    const saved = localStorage.getItem(`raisedIssues_${user.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Save issues to localStorage whenever they change (per user)
  useEffect(() => {
    if (user) {
      localStorage.setItem(`raisedIssues_${user.id}`, JSON.stringify(raisedIssues));
    }
  }, [raisedIssues, user]);

  // Load issues when user logs in
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`raisedIssues_${user.id}`);
      if (saved) {
        setRaisedIssues(JSON.parse(saved));
      }
    } else {
      setRaisedIssues([]);
    }
  }, [user]);

  // Handle issue text change
  const handleIssueChange = (e) => {
    const value = e.target.value;
    setIssueText(value);

    if (errors.issueText) {
      setErrors(prev => ({ ...prev, issueText: "" }));
    }
  };

  // Handle using an example
  const handleUseExample = (exampleText) => {
    setIssueText(exampleText);
    if (errors.issueText) {
      setErrors(prev => ({ ...prev, issueText: "" }));
    }
  };

  // Handle location data from Location component
  const handleLocationDetected = (location) => {
    setLocationData(location);
    if (errors.pincode) {
      setErrors(prev => ({ ...prev, pincode: "" }));
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: "Image size should be less than 5MB" }));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: "Please upload a valid image file" }));
        return;
      }

      setImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      if (errors.image) {
        setErrors(prev => ({ ...prev, image: "" }));
      }
    }
  };

  // Remove image
  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!issueText.trim()) {
      newErrors.issueText = "Please describe your issue";
    } else if (issueText.trim().length < 10) {
      newErrors.issueText = "Issue description should be at least 10 characters";
    }

    if (!departmentId) {
      newErrors.department = "Please select a department or let AI detect it";
    }

    if (!pincode) {
      newErrors.pincode = "Please enter your pincode";
    } else if (!/^\d{6}$/.test(pincode)) {
      newErrors.pincode = "Please enter a valid 6-digit pincode";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission (no backend - store locally)
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const selectedDept = DEPARTMENTS.find(d => d._id === departmentId);

      // Create new issue object
      const newIssue = {
        id: `ISS-${Date.now()}`,
        issueText,
        department: selectedDept?.name || "Unknown",
        departmentId,
        pincode,
        locationData,
        image: imagePreview, // Store base64 image
        imageName: image?.name,
        timestamp: new Date().toISOString(),
        status: 'pending',
        reviewed: false,
        userId: user.id,
        userName: user.fullName || user.firstName || "Anonymous"
      };

      // Add to raised issues (local storage)
      setRaisedIssues(prev => [newIssue, ...prev]);

      setSubmitSuccess(true);

      setTimeout(() => {
        resetForm();
        setIsIssueOpen(false);
        setSubmitSuccess(false);
      }, 2000);

    } catch (error) {
      console.error("Error submitting issue:", error);
      setErrors({ submit: error.message || "Failed to submit issue. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setIssueText("");
    setDepartmentId("");
    setPincode("");
    setLocationData(null);
    setImage(null);
    setImagePreview(null);
    setErrors({});
  };

  // Close modal and reset
  const handleCloseModal = () => {
    setIsIssueOpen(false);
    resetForm();
    setSubmitSuccess(false);
  };

  // Handle issue completion
  const handleCompleteIssue = (issueId) => {
    setRaisedIssues(prev =>
      prev.map(issue =>
        issue.id === issueId
          ? { ...issue, status: 'completed' }
          : issue
      )
    );
  };

  // Handle review submission
  const handleReview = (issue) => {
    console.log('Review issue:', issue);
    // Can implement review modal here
  };

  // Handle raising issue - check authentication
  const handleRaiseIssue = () => {
    if (!user) {
      openSignIn();
      return;
    }
    setIsIssueOpen(true);
  };

  return (
    <>
      <Navbar />

      <div
        className={`min-h-screen ubuntu-regular flex flex-col ${
          theme === "dark"
            ? "bg-gradient-to-b from-slate-900 via-slate-800 to-gray-900 text-white"
            : "bg-gradient-to-b from-gray-50 to-blue-50 text-black"
        }`}
      >
        <main className="flex-grow max-w-6xl mx-auto w-full px-4 pt-24 pb-8">

          {/* Raised Issues Monitor Section - Only show if logged in */}
          {isLoaded && user && raisedIssues.length > 0 && (
            <div className="mb-8">
              <h2 className={`text-3xl font-bold mb-6 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                Your Raised Issues
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {raisedIssues.map((issue) => (
                  <Monitor
                    key={issue.id}
                    issue={issue}
                    onComplete={handleCompleteIssue}
                    onReview={handleReview}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Login prompt if not logged in and trying to view issues */}
          {isLoaded && !user && (
            <div className={`mb-8 p-8 rounded-2xl border-2 border-dashed text-center ${
              theme === "dark"
                ? "bg-slate-800/50 border-gray-600"
                : "bg-white/50 border-gray-300"
            }`}>
              <LogIn size={48} className={`mx-auto mb-4 ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`} />
              <h3 className={`text-2xl font-bold mb-2 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                Login Required
              </h3>
              <p className={`mb-6 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                Please login to view your raised issues and track their status
              </p>
              <button
                onClick={openSignIn}
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30"
                }`}
              >
                Login Now
              </button>
            </div>
          )}

          <Issues />

          {/* Raise Issue Button */}
          <div className="mt-8">
            <button
              onClick={handleRaiseIssue}
              className={`w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg ${
                theme === "dark"
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-blue-500/30"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-blue-500/30"
              }`}
            >
              {!user ? (
                <>
                  <LogIn size={24} />
                  Login to Raise Issue
                </>
              ) : (
                <>
                  <Megaphone size={24} />
                  Raise New Issue
                </>
              )}
            </button>
          </div>

          {/* Modal - Only accessible when logged in */}
          {isIssueOpen && user && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm">
              <div
                className={`w-full max-w-2xl rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto ${
                  theme === "dark"
                    ? "bg-slate-800 text-white"
                    : "bg-white text-black"
                }`}
              >
                {/* Success Overlay */}
                {submitSuccess && (
                  <div className="absolute inset-0 bg-green-500/95 rounded-2xl flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                    <CheckCircle2 size={80} className="text-white mb-4 animate-bounce" />
                    <h3 className="text-2xl font-bold text-white mb-2">Issue Submitted Successfully!</h3>
                    <p className="text-white/90">Your grievance has been registered.</p>
                  </div>
                )}

                {/* Header */}
                <div className={`sticky top-0 z-10 px-6 py-4 border-b rounded-t-2xl ${
                  theme === "dark"
                    ? "bg-slate-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                        <Megaphone className="text-white" size={24} />
                      </div>
                      <h2 className="text-2xl font-bold">Submit Your Grievance</h2>
                    </div>
                    <button
                      onClick={handleCloseModal}
                      className={`p-2 rounded-lg transition-colors ${
                        theme === "dark"
                          ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                          : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={onSubmitHandler} className="p-6 space-y-5">
                  {/* Notice */}
                  <div className={`p-4 rounded-lg border-l-4 border-blue-500 ${
                    theme === "dark" ? "bg-blue-900/20" : "bg-blue-50"
                  }`}>
                    <div className="flex gap-3">
                      <AlertCircle size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">
                        This platform ensures transparency in public service delivery.
                        Please raise genuine issues only. Misuse may lead to strict action.
                      </p>
                    </div>
                  </div>

                  {/* Examples Guide */}
                  <div className="flex justify-center">
                    <GrievanceExamplesGuide onUseExample={handleUseExample} />
                  </div>

                  {/* Voice Input Component */}
                  <Voice
                    value={issueText}
                    onChange={handleIssueChange}
                    placeholder="Describe your issue in detail (minimum 20 characters)... Example: Street light not working on Main Road for 3 days"
                    rows={4}
                  />

                  {errors.issueText && (
                    <p className="text-red-500 text-sm -mt-3 flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.issueText}
                    </p>
                  )}

                  {/* AI Department Selection Component */}
                  <SelectDept
                    issueText={issueText}
                    departmentId={departmentId}
                    setDepartmentId={setDepartmentId}
                    error={errors.department}
                    setError={(error) => setErrors(prev => ({ ...prev, department: error }))}
                  />

                  {/* Location Component */}
                  <Location
                    pincode={pincode}
                    onPincodeChange={setPincode}
                    onLocationDetected={handleLocationDetected}
                    error={errors.pincode}
                    setError={(error) => setErrors(prev => ({ ...prev, pincode: error }))}
                  />

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Upload Image (Optional)
                    </label>

                    {!imagePreview ? (
                      <label
                        className={`w-full border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                          errors.image
                            ? "border-red-500"
                            : theme === "dark"
                            ? "border-gray-600 hover:border-blue-500 bg-slate-700/50"
                            : "border-gray-300 hover:border-blue-500 bg-gray-50"
                        }`}
                      >
                        <Camera size={40} className={theme === "dark" ? "text-gray-400" : "text-gray-500"} />
                        <div className="text-center">
                          <p className="font-medium">Click to upload image</p>
                          <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            PNG, JPG, JPEG up to 5MB
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <X size={18} />
                        </button>
                        <div className={`absolute bottom-2 left-2 px-3 py-1 rounded-full text-xs font-medium ${
                          theme === "dark" ? "bg-black/70 text-white" : "bg-white/90 text-black"
                        }`}>
                          {image?.name}
                        </div>
                      </div>
                    )}

                    {errors.image && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle size={14} /> {errors.image}
                      </p>
                    )}
                  </div>

                  {/* Submit Error */}
                  {errors.submit && (
                    <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg">
                      <p className="text-red-500 text-sm flex items-center gap-2">
                        <AlertCircle size={16} /> {errors.submit}
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                      isSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        Submit Grievance
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}

export default Dashboard;