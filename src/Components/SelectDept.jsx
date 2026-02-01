import React, { useState, useRef, useEffect } from 'react';
import { Brain, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../Context/Theme';

// Department definitions
export const DEPARTMENTS = [
  {
    _id: "dept_electrical",
    name: "Electrical Maintenance Department",
    keywords: ["light", "fan", "power", "electric", "current", "wire", "bulb", "switch", "electricity", "voltage", "transformer", "pole"],
    color: "from-yellow-400 to-yellow-600",
    description: "Handles street lights, electrical poles, power supply issues"
  },
  {
    _id: "dept_water",
    name: "Water Supply & Sewerage Department",
    keywords: ["water", "pipe", "leak", "tap", "drain", "sewer", "plumbing", "sewage", "sanitation", "overflow", "blockage"],
    color: "from-blue-400 to-blue-600",
    description: "Handles water supply, drainage, sewerage issues"
  },
  {
    _id: "dept_it",
    name: "Information Technology Services Department",
    keywords: ["wifi", "internet", "network", "computer", "connection", "server", "website", "online", "digital", "portal"],
    color: "from-purple-400 to-purple-600",
    description: "Handles IT infrastructure, digital services, connectivity"
  },
  {
    _id: "dept_infrastructure",
    name: "Infrastructure Maintenance Department",
    keywords: ["repair", "broken", "damage", "fix", "maintenance", "road", "building", "construction", "crack", "pothole", "pavement"],
    color: "from-green-400 to-green-600",
    description: "Handles roads, buildings, public infrastructure"
  },
  {
    _id: "dept_waste",
    name: "Solid Waste Management Department",
    keywords: ["clean", "garbage", "trash", "dirty", "litter", "waste", "dustbin", "sweeping", "disposal", "collection"],
    color: "from-pink-400 to-pink-600",
    description: "Handles waste collection, cleanliness, sanitation"
  }
];

function SelectDept({ issueText, departmentId, setDepartmentId, error, setError }) {
  const { theme } = useTheme();
  const [isAnalyzingWithAI, setIsAnalyzingWithAI] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);
  const debounceTimerRef = useRef(null);
  const lastAnalyzedTextRef = useRef('');

  // AI-powered department detection using Claude API
  const detectDepartmentWithAI = async (text) => {
    if (!text.trim() || text.trim().length < 15) {
      setAiAnalysisResult(null);
      return null;
    }

    // Prevent re-analyzing the same text
    if (text.trim() === lastAnalyzedTextRef.current) {
      return;
    }

    lastAnalyzedTextRef.current = text.trim();
    setIsAnalyzingWithAI(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          messages: [
            {
              role: "user",
              content: `You are an intelligent department classification assistant for a public grievance system in India.

Available departments and their responsibilities:
${DEPARTMENTS.map(d => `- ${d.name}: ${d.description}`).join('\n')}

User's issue description (may be in any Indian language or English): "${text}"

Your task:
1. Analyze the issue carefully
2. Identify the most appropriate department
3. Provide a brief reason (1 sentence)

Respond in this EXACT JSON format:
{
  "department": "exact department name from the list",
  "reason": "brief explanation",
  "confidence": "high/medium/low"
}

Only output valid JSON, nothing else.`
            }
          ],
        })
      });

      if (!response.ok) {
        throw new Error('AI service unavailable');
      }

      const data = await response.json();
      let aiResponse = data.content[0].text.trim();
      
      // Remove markdown code blocks if present
      aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const analysis = JSON.parse(aiResponse);
      
      // Find matching department
      const matchedDept = DEPARTMENTS.find(d => 
        d.name.toLowerCase() === analysis.department.toLowerCase()
      );

      if (matchedDept) {
        const result = {
          ...analysis,
          departmentId: matchedDept._id
        };
        setAiAnalysisResult(result);
        setDepartmentId(matchedDept._id);
        return matchedDept._id;
      }
      
      return null;
    } catch (error) {
      console.error("AI department detection failed:", error);
      // Fallback to keyword-based detection
      return detectDepartmentByKeywords(text);
    } finally {
      setIsAnalyzingWithAI(false);
    }
  };

  // Fallback keyword-based detection
  const detectDepartmentByKeywords = (text) => {
    const lowerText = text.toLowerCase();
    let maxScore = 0;
    let bestMatch = null;

    for (let dept of DEPARTMENTS) {
      let score = 0;
      dept.keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          score++;
        }
      });
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = dept;
      }
    }

    if (bestMatch && maxScore > 0) {
      const result = {
        department: bestMatch.name,
        reason: `Detected based on keywords: ${bestMatch.keywords.filter(k => lowerText.includes(k)).join(', ')}`,
        confidence: maxScore >= 3 ? 'high' : maxScore >= 2 ? 'medium' : 'low',
        departmentId: bestMatch._id
      };
      setAiAnalysisResult(result);
      setDepartmentId(bestMatch._id);
      return bestMatch._id;
    }

    return null;
  };

  // Auto-detect department when issue text changes
  useEffect(() => {
    // Clear any existing timeout
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Only analyze if text is long enough and hasn't been analyzed yet
    if (issueText.trim().length >= 15 && issueText.trim() !== lastAnalyzedTextRef.current) {
      debounceTimerRef.current = setTimeout(() => {
        detectDepartmentWithAI(issueText);
      }, 2000); // Wait 2 seconds after user stops typing
    } else if (issueText.trim().length < 15) {
      setAiAnalysisResult(null);
      lastAnalyzedTextRef.current = '';
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [issueText]);

  // Manual department selection
  const handleDepartmentChange = (e) => {
    const newDeptId = e.target.value;
    setDepartmentId(newDeptId);
    
    if (newDeptId) {
      const dept = DEPARTMENTS.find(d => d._id === newDeptId);
      setAiAnalysisResult({
        department: dept.name,
        reason: "Manually selected by user",
        confidence: "manual",
        departmentId: newDeptId
      });
    } else {
      setAiAnalysisResult(null);
    }
    
    if (error) {
      setError("");
    }
  };

  return (
    <div>
      {/* AI Analysis Result */}
      {aiAnalysisResult && (
        <div className={`mb-4 p-4 rounded-lg border ${
          aiAnalysisResult.confidence === 'high' 
            ? 'border-green-500 bg-green-500/10'
            : aiAnalysisResult.confidence === 'medium'
            ? 'border-yellow-500 bg-yellow-500/10'
            : aiAnalysisResult.confidence === 'manual'
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-orange-500 bg-orange-500/10'
        }`}>
          <div className="flex items-start gap-3">
            <Brain size={20} className={
              aiAnalysisResult.confidence === 'high' 
                ? 'text-green-500'
                : aiAnalysisResult.confidence === 'medium'
                ? 'text-yellow-500'
                : aiAnalysisResult.confidence === 'manual'
                ? 'text-blue-500'
                : 'text-orange-500'
            } />
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1">
                {aiAnalysisResult.confidence === 'manual' ? '✓ Manual Selection' : '🤖 AI Analysis'}
              </p>
              <p className="text-sm">{aiAnalysisResult.reason}</p>
              {aiAnalysisResult.confidence !== 'manual' && (
                <p className="text-xs mt-1 opacity-75">
                  Confidence: {aiAnalysisResult.confidence.toUpperCase()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Department Selector */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Department <span className="text-red-500">*</span>
          {isAnalyzingWithAI && (
            <span className="ml-2 text-xs text-blue-500 inline-flex items-center gap-1">
              <Sparkles size={12} className="animate-spin" />
              AI analyzing...
            </span>
          )}
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
          <option value="">-- AI will detect or Select Manually --</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} /> {error}
          </p>
        )}
        {departmentId && !error && (
          <p className={`text-sm mt-1 flex items-center gap-1 ${
            theme === "dark" ? "text-green-400" : "text-green-600"
          }`}>
            <CheckCircle2 size={14} /> Department selected: {
              DEPARTMENTS.find(d => d._id === departmentId)?.name
            }
          </p>
        )}
      </div>
    </div>
  );
}

export default SelectDept;