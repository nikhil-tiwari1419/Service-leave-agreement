import React, { useState } from "react";
import Navbar from "../Components/Navbar";
import Issues from "../Components/Issues";
import Location from "../Components/Location";
import Monitor from "../Components/Monitor"; // Import Monitor
import { useTheme } from "../Context/Theme";
import Footer from "../Components/Footer";
import { X, Megaphone, Upload, AlertCircle, CheckCircle2, Camera } from 'lucide-react';

const ISSUE_DEPARTMENTS = [
  {
    department: "Electric Department",
    keywords: ["light", "fan", "power", "electric", "current", "wire", "tower", "failure", "electricity"],
    color: "from-yellow-400 to-yellow-600"
  },
  {
    department: "Plumbing Department",
    keywords: ["water", "pipe", "leak", "tap", "drain", "plumbing", "sewer"],
    color: "from-blue-400 to-blue-600"
  },
  {
    department: "IT Support",
    keywords: ["wifi", "internet", "network", "computer", "connection"],
    color: "from-purple-400 to-purple-600"
  },
  {
    department: "Maintenance Department",
    keywords: ["repair", "broken", "damage", "fix", "maintenance"],
    color: "from-green-400 to-green-600"
  },
  {
    department: "Local NMC Department",
    keywords: ["clean", "garbage", "trash", "dirty", "litter", "waste", "sanitation"],
    color: "from-pink-400 to-pink-600"
  },
];

function Dashboard() {
  const { theme } = useTheme();

  // Form States
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [issueText, setIssueText] = useState("");
  const [department, setDepartment] = useState("");
  const [pincode, setPincode] = useState("");
  const [locationData, setLocationData] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // UI States
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Store raised issues
  const [raisedIssues, setRaisedIssues] = useState([]);

  // Auto detect department based on keywords
  const detectDepartment = (text) => {
    const lowerText = text.toLowerCase();

    for (let dept of ISSUE_DEPARTMENTS) {
      if (dept.keywords.some(keyword => lowerText.includes(keyword))) {
        return dept.department;
      }
    }
    return "";
  };

  // Handle issue text change and auto-detect department
  const handleIssueChange = (e) => {
    const value = e.target.value;
    setIssueText(value);

    if (value.trim()) {
      const detectedDept = detectDepartment(value);
      if (detectedDept) {
        setDepartment(detectedDept);
      }
    }

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

    if (!department) {
      newErrors.department = "Please select a department";
    }

    if (!pincode) {
      newErrors.pincode = "Please enter your pincode";
    } else if (!/^\d{6}$/.test(pincode)) {
      newErrors.pincode = "Please enter a valid 6-digit pincode";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('issue', issueText);
      formData.append('department', department);
      formData.append('pincode', pincode);
      
      if (locationData) {
        formData.append('location', JSON.stringify(locationData));
      }
      
      if (image) {
        formData.append('image', image);
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create new issue object
      const newIssue = {
        id: `ISS-${String(raisedIssues.length + 1).padStart(3, '0')}`,
        issueText,
        department,
        pincode,
        locationData,
        image: image?.name,
        timestamp: new Date().toISOString(),
        status: 'pending',
        reviewed: false
      };

      console.log('Submitted Issue:', newIssue);

      // Add to raised issues
      setRaisedIssues(prev => [newIssue, ...prev]);

      setSubmitSuccess(true);

      setTimeout(() => {
        resetForm();
        setIsIssueOpen(false);
        setSubmitSuccess(false);
      }, 2000);

    } catch (error) {
      console.error("Error submitting issue:", error);
      setErrors({ submit: "Failed to submit issue. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setIssueText("");
    setDepartment("");
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

  // Handle issue completion (for testing)
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
    // Navigate to review page or open review modal
    console.log('Review issue:', issue);
    // You can implement navigation to Review page here
    // window.location.href = '/review';
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
          
          {/* Raised Issues Monitor Section */}
          {raisedIssues.length > 0 && (
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

          <Issues />

          {/* Raise Issue Button */}
          <div className="mt-8">
            <button
              onClick={() => setIsIssueOpen(true)}
              className={`w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg ${
                theme === "dark"
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-blue-500/30"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-blue-500/30"
              }`}
            >
              <Megaphone size={24} />
              Raise New Issue
            </button>
          </div>

          {/* Modal */}
          {isIssueOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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

                  {/* Issue Description */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Issue Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={issueText}
                      onChange={handleIssueChange}
                      placeholder="Describe your issue in detail (minimum 10 characters)..."
                      rows="4"
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all outline-none resize-none ${
                        errors.issueText
                          ? "border-red-500 focus:border-red-600"
                          : theme === "dark"
                          ? "bg-slate-700 border-gray-600 focus:border-blue-500 text-white"
                          : "bg-white border-gray-300 focus:border-blue-500 text-black"
                      }`}
                    />
                    {errors.issueText && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle size={14} /> {errors.issueText}
                      </p>
                    )}
                    <p className={`text-xs mt-1 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}>
                      {issueText.length} characters
                    </p>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={department}
                      onChange={(e) => {
                        setDepartment(e.target.value);
                        if (errors.department) {
                          setErrors(prev => ({ ...prev, department: "" }));
                        }
                      }}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all outline-none ${
                        errors.department
                          ? "border-red-500 focus:border-red-600"
                          : theme === "dark"
                          ? "bg-slate-700 border-gray-600 focus:border-blue-500 text-white"
                          : "bg-white border-gray-300 focus:border-blue-500 text-black"
                      }`}
                    >
                      <option value="">-- Auto-detected or Select Manually --</option>
                      {ISSUE_DEPARTMENTS.map((dept) => (
                        <option key={dept.department} value={dept.department}>
                          {dept.department}
                        </option>
                      ))}
                    </select>
                    {errors.department && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle size={14} /> {errors.department}
                      </p>
                    )}
                    {department && !errors.department && (
                      <p className={`text-sm mt-1 flex items-center gap-1 ${
                        theme === "dark" ? "text-green-400" : "text-green-600"
                      }`}>
                        <CheckCircle2 size={14} /> Department selected: {department}
                      </p>
                    )}
                  </div>

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

