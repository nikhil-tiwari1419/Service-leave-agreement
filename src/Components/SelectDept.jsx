import React, { useState, useRef, useEffect } from 'react';
import { Brain, Sparkles, AlertCircle, CheckCircle2, Lock, Edit3, XCircle, Shield } from 'lucide-react';
import { useTheme } from '../Context/Theme';

// Department definitions
export const DEPARTMENTS = [
  {
    _id: "dept_electrical",
    name: "Electrical Maintenance Department",
    color: "from-yellow-400 to-yellow-600",
    description: "Handles street lights, electrical poles, power supply issues"
  },
  {
    _id: "dept_water",
    name: "Water Supply & Sewerage Department",
    color: "from-blue-400 to-blue-600",
    description: "Handles water supply, drainage, sewerage issues"
  },
  {
    _id: "dept_it",
    name: "Information Technology Services Department",
    color: "from-purple-400 to-purple-600",
    description: "Handles IT infrastructure, digital services, connectivity"
  },
  {
    _id: "dept_infrastructure",
    name: "Infrastructure Maintenance Department",
    color: "from-green-400 to-green-600",
    description: "Handles roads, buildings, public infrastructure"
  },
  {
    _id: "dept_waste",
    name: "Solid Waste Management Department",
    color: "from-pink-400 to-pink-600",
    description: "Handles waste collection, cleanliness, sanitation"
  }
];

// Backend API URL - can be configured via environment variable
// Vite uses import.meta.env instead of process.env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function SelectDept({ issueText, departmentId, setDepartmentId, error, setError }) {
  const { theme } = useTheme();
  const [isAnalyzingWithAI, setIsAnalyzingWithAI] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [showManualSelection, setShowManualSelection] = useState(false);
  const [canAnalyze, setCanAnalyze] = useState(false);
  const [isValidGrievance, setIsValidGrievance] = useState(false);
  const debounceTimerRef = useRef(null);
  const lastAnalyzedTextRef = useRef('');

  // Check if description is sufficient for AI analysis
  useEffect(() => {
    const trimmedText = issueText.trim();
    if (trimmedText.length >= 20) {
      setCanAnalyze(true);
    } else {
      setCanAnalyze(false);
      setIsValidGrievance(false);
      setValidationResult(null);
      if (trimmedText.length > 0 && trimmedText.length < 20) {
        setError("Please provide a detailed description (at least 20 characters) for AI analysis");
      }
    }
  }, [issueText, setError]);

  // Validate and classify the grievance via backend API
  const validateAndClassifyGrievance = async (text) => {
    if (!text.trim() || text.trim().length < 20) {
      setValidationResult(null);
      setAiAnalysisResult(null);
      return null;
    }

    // Prevent re-analyzing the same text
    const normalizedText = text.trim().toLowerCase();
    if (normalizedText === lastAnalyzedTextRef.current) {
      return;
    }

    lastAnalyzedTextRef.current = normalizedText;
    setIsAnalyzingWithAI(true);
    setValidationResult(null);
    setAiAnalysisResult(null);
    setIsValidGrievance(false);

    try {
      // 🔒 SECURE: Call backend API instead of OpenAI directly
      // API key is safely stored on the server
      const response = await fetch(`${API_URL}/api/validate-grievance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Validation request failed');
      }

      const analysis = await response.json();
      
      // Set validation result
      setValidationResult(analysis);

      if (!analysis.is_valid) {
        // Invalid grievance
        setIsValidGrievance(false);
        setShowManualSelection(false);
        setDepartmentId('');
        setAiAnalysisResult(null);
        setError(analysis.validation_message || "This does not appear to be a valid public grievance.");
        return null;
      }

      // Valid grievance - proceed with classification
      setIsValidGrievance(true);
      
      // Find matching department
      const matchedDept = DEPARTMENTS.find(d => {
        const deptNameLower = d.name.toLowerCase();
        const analysisDeptLower = (analysis.department || '').toLowerCase();
        
        if (deptNameLower === analysisDeptLower) return true;
        
        const deptKeywords = deptNameLower.split(' ');
        const analysisKeywords = analysisDeptLower.split(' ');
        
        if (deptKeywords.some(kw => kw === 'electrical') && analysisKeywords.some(kw => kw === 'electrical')) return true;
        if (deptKeywords.some(kw => kw === 'water') && analysisKeywords.some(kw => kw === 'water')) return true;
        if (deptKeywords.some(kw => kw === 'information' || kw === 'technology') && 
            analysisKeywords.some(kw => kw === 'information' || kw === 'technology')) return true;
        if (deptKeywords.some(kw => kw === 'infrastructure') && analysisKeywords.some(kw => kw === 'infrastructure')) return true;
        if (deptKeywords.some(kw => kw === 'waste') && analysisKeywords.some(kw => kw === 'waste')) return true;
        
        return false;
      });

      if (matchedDept) {
        const result = {
          ...analysis,
          departmentId: matchedDept._id,
          department: matchedDept.name
        };
        setAiAnalysisResult(result);
        setDepartmentId(matchedDept._id);
        
        // Hide manual selection if AI confidence is medium or high
        if (analysis.confidence === 'high' || analysis.confidence === 'medium') {
          setShowManualSelection(false);
        } else {
          setShowManualSelection(true);
        }
        
        if (error) setError("");
        return matchedDept._id;
      } else {
        // Classified as valid but couldn't match department
        setShowManualSelection(true);
        setError("Valid grievance detected, but please select the appropriate department manually.");
        return null;
      }
      
    } catch (error) {
      console.error("Backend validation failed:", error);
      
      // Check for specific errors
      if (error.message?.includes('Failed to fetch')) {
        setError("Unable to connect to validation server. Please check if the backend is running.");
      } else {
        setError(error.message || "AI validation failed. Please try again.");
      }
      
      setIsValidGrievance(false);
      setShowManualSelection(false);
      return null;
    } finally {
      setIsAnalyzingWithAI(false);
    }
  };

  // Auto-validate and classify when issue text changes
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const normalizedText = issueText.trim().toLowerCase();
    if (issueText.trim().length >= 20 && normalizedText !== lastAnalyzedTextRef.current) {
      debounceTimerRef.current = setTimeout(() => {
        validateAndClassifyGrievance(issueText);
      }, 2000);
    } else if (issueText.trim().length < 20) {
      setValidationResult(null);
      setAiAnalysisResult(null);
      setShowManualSelection(false);
      setIsValidGrievance(false);
      lastAnalyzedTextRef.current = '';
      if (departmentId) {
        setDepartmentId('');
      }
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [issueText]);

  // Manual department selection - only allowed if validated
  const handleDepartmentChange = (e) => {
    if (!isValidGrievance) {
      return;
    }

    const newDeptId = e.target.value;
    setDepartmentId(newDeptId);
    
    if (newDeptId) {
      const dept = DEPARTMENTS.find(d => d._id === newDeptId);
      setAiAnalysisResult({
        department: dept.name,
        reason: "Manually selected by user",
        confidence: "manual",
        departmentId: newDeptId,
        is_valid: true
      });
    } else {
      setAiAnalysisResult(null);
    }
    
    if (error) {
      setError("");
    }
  };

  // Allow user to change AI selection
  const handleChangeSelection = () => {
    setShowManualSelection(true);
  };

  // Retry validation
  const handleRetryValidation = () => {
    lastAnalyzedTextRef.current = '';
    setValidationResult(null);
    setAiAnalysisResult(null);
    setError("");
    if (issueText.trim().length >= 20) {
      validateAndClassifyGrievance(issueText);
    }
  };

  return (
    <div>
      {/* Validation Message - Description Required */}
      {!canAnalyze && issueText.trim().length > 0 && issueText.trim().length < 20 && (
        <div className={`mb-4 p-4 rounded-lg border-2 border-orange-500 bg-orange-500/10`}>
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1">Description Too Short</p>
              <p className="text-sm">
                Please provide a detailed description (at least 20 characters) so our AI can validate and classify your complaint.
              </p>
              <p className="text-xs mt-2 opacity-75">
                Current length: {issueText.trim().length} / 20 characters
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis in Progress */}
      {isAnalyzingWithAI && (
        <div className={`mb-4 p-4 rounded-lg border-2 border-blue-500 bg-blue-500/10`}>
          <div className="flex items-start gap-3">
            <Sparkles size={20} className="text-blue-500 animate-spin flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1">🤖 AI Validating Your Complaint...</p>
              <p className="text-sm">
                Checking if this is a valid public grievance and determining the appropriate department.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* INVALID Grievance Result */}
      {validationResult && !validationResult.is_valid && !isAnalyzingWithAI && (
        <div className={`mb-4 p-4 rounded-lg border-2 border-red-500 bg-red-500/10`}>
          <div className="flex items-start gap-3">
            <XCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold mb-2 text-red-500">❌ Invalid Public Grievance</p>
              <p className="text-sm mb-3">
                {validationResult.validation_message}
              </p>
              <div className={`p-3 rounded-lg mb-3 ${
                theme === "dark" ? "bg-slate-800" : "bg-white"
              }`}>
                <p className="text-xs font-semibold mb-1">Why was this rejected?</p>
                <p className="text-xs">{validationResult.reason}</p>
              </div>
              <div className={`p-3 rounded-lg border ${
                theme === "dark" ? "border-gray-600 bg-slate-800/50" : "border-gray-300 bg-gray-50"
              }`}>
                <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                  <Shield size={12} />
                  Valid Public Grievances Include:
                </p>
                <ul className="text-xs space-y-1 ml-4 list-disc">
                  <li>Street light or electrical infrastructure issues</li>
                  <li>Water supply or drainage problems</li>
                  <li>Road damage or potholes</li>
                  <li>Garbage collection issues</li>
                  <li>Public wifi or digital service problems</li>
                  <li>Any civic amenity or public infrastructure issue</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={handleRetryValidation}
                className={`mt-3 w-full text-sm py-2 px-4 rounded-lg transition-colors ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                Retry Validation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VALID Grievance - AI Analysis Result */}
      {aiAnalysisResult && validationResult?.is_valid && !isAnalyzingWithAI && (
        <div className={`mb-4 p-4 rounded-lg border-2 ${
          aiAnalysisResult.confidence === 'high' 
            ? 'border-green-500 bg-green-500/10'
            : aiAnalysisResult.confidence === 'medium'
            ? 'border-yellow-500 bg-yellow-500/10'
            : aiAnalysisResult.confidence === 'manual'
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-orange-500 bg-orange-500/10'
        }`}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {aiAnalysisResult.confidence === 'manual' ? (
                <Edit3 size={20} className="text-blue-500" />
              ) : (
                <Brain size={20} className={
                  aiAnalysisResult.confidence === 'high' 
                    ? 'text-green-500'
                    : aiAnalysisResult.confidence === 'medium'
                    ? 'text-yellow-500'
                    : 'text-orange-500'
                } />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1 flex items-center gap-2">
                {aiAnalysisResult.confidence === 'manual' 
                  ? '✓ Manual Selection' 
                  : '✅ Valid Grievance - Department Classified'}
              </p>
              {validationResult?.validation_message && aiAnalysisResult.confidence !== 'manual' && (
                <p className="text-xs mb-2 opacity-75">
                  {validationResult.validation_message}
                </p>
              )}
              <p className="text-sm mb-2">
                <strong>Department:</strong> {aiAnalysisResult.department}
              </p>
              <p className="text-sm mb-2">
                <strong>Analysis:</strong> {aiAnalysisResult.reason}
              </p>
              {aiAnalysisResult.confidence !== 'manual' && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-current/20">
                  <p className="text-xs opacity-75">
                    Confidence: <span className="font-semibold uppercase">{aiAnalysisResult.confidence}</span>
                    <span className="ml-2 text-xs opacity-60">🔒 Secure Backend</span>
                  </p>
                  {!showManualSelection && (
                    <button
                      type="button"
                      onClick={handleChangeSelection}
                      className={`text-xs px-3 py-1 rounded-md transition-colors ${
                        theme === "dark"
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                    >
                      Change Department
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Department Selector - Only shown for valid grievances */}
      {showManualSelection && isValidGrievance ? (
        <div>
          <label className="block text-sm font-semibold mb-2">
            Select Department <span className="text-red-500">*</span>
          </label>
          <select
            value={departmentId}
            onChange={handleDepartmentChange}
            className={`w-full px-4 py-3 rounded-lg border-2 transition-all outline-none ${
              error
                ? "border-red-500 focus:border-red-600"
                : theme === "dark"
                ? "bg-slate-700 border-gray-600 focus:border-blue-500 text-white"
                : "bg-white border-gray-300 focus:border-blue-500 text-black"
            }`}
          >
            <option value="">-- Select Department --</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      ) : !showManualSelection && isValidGrievance && departmentId ? (
        <div className={`p-4 rounded-lg border-2 ${
          theme === "dark"
            ? "bg-slate-700/50 border-gray-600"
            : "bg-gray-50 border-gray-200"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold mb-1">Selected Department</p>
              <p className={`text-lg font-bold ${
                theme === "dark" ? "text-green-400" : "text-green-600"
              }`}>
                {DEPARTMENTS.find(d => d._id === departmentId)?.name}
              </p>
            </div>
            <CheckCircle2 size={32} className={
              theme === "dark" ? "text-green-400" : "text-green-600"
            } />
          </div>
          <button
            type="button"
            onClick={handleChangeSelection}
            className={`mt-3 w-full text-sm py-2 px-4 rounded-lg transition-colors ${
              theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            Change Department
          </button>
        </div>
      ) : (
        <div className={`p-4 rounded-lg border-2 border-dashed ${
          theme === "dark"
            ? "bg-slate-800/50 border-gray-600 text-gray-400"
            : "bg-gray-50 border-gray-300 text-gray-500"
        }`}>
          <div className="flex items-center gap-3">
            <Lock size={20} className="flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Department Selection Locked</p>
              <p className="text-xs">
                {!canAnalyze 
                  ? "Complete the description (min 20 characters) to unlock"
                  : "AI validation in progress..."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {departmentId && !error && isValidGrievance && (
        <p className={`text-sm mt-2 flex items-center gap-1 ${
          theme === "dark" ? "text-green-400" : "text-green-600"
        }`}>
          <CheckCircle2 size={14} /> Valid grievance - Department assigned
        </p>
      )}
    </div>
  );
}

export default SelectDept;