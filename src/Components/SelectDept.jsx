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
    if (!text.trim() || text.trim().length < 10) {
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

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 800,
          messages: [
            {
              role: "user",
              content: `You are a multilingual department classification AI for Indian public grievances.

IMPORTANT: The user's complaint may be in ANY language including:
- English
- Hindi (हिंदी)
- Hinglish (Hindi-English Mix) - e.g., "light nahi aa rahi", "bijli ka problem hai"
- Marathi (मराठी)
- Tamil (தமிழ்)
- Telugu (తెలుగు)
- Bengali (বাংলা)
- Gujarati (ગુજરાતી)
- Kannada (ಕನ್ನಡ)
- Malayalam (മലയാളം)
- Punjabi (ਪੰਜਾਬੀ)
- Urdu (اردو)
- Odia (ଓଡ଼ିଆ)
- Or any mix of these languages (including Hinglish/Tanglish etc.)

Available Departments:
1. Electrical Maintenance Department - street lights, electrical poles, power supply, electricity issues, transformers
2. Water Supply & Sewerage Department - water supply, pipes, leaks, taps, drains, sewers, plumbing, sewage
3. Information Technology Services Department - wifi, internet, network, computers, connectivity, digital services
4. Infrastructure Maintenance Department - roads, buildings, construction, repairs, damages, potholes, cracks
5. Solid Waste Management Department - garbage, trash, cleanliness, waste collection, dustbins, disposal

User's complaint: "${text}"

ANALYZE THE COMPLAINT IN ANY LANGUAGE and match it to ONE department from the list above.

Common terms to recognize (including Hinglish):
- Light/बत्ती/light nahi aa rahi/बिजली गई/current nahi hai/light chali gayi = Electrical
- Water/पानी/paani nahi aa raha/water supply band hai/नल से पानी नहीं/tap me paani nahi = Water Supply
- Road/रस्ता/road kharab hai/गड्ढा है/pothole hai/सड़क टूटी/sadak tuti hui = Infrastructure
- Garbage/कचरा/kachra pada hai/गंदगी/cleaning nahi ho rahi/garbage nahi uthaya = Waste Management
- Internet/इंटरनेट/wifi nahi chal raha/network problem/internet slow hai/connection issue = IT Services

Hinglish Examples (Hindi-English mix - VERY COMMON):
- "Street light nahi jal rahi hai" = Electrical
- "Paani ka bahut problem hai yaar" = Water Supply
- "Road pe bada sa pothole aa gaya hai" = Infrastructure
- "Kachra collection nahi ho raha properly" = Waste Management
- "WiFi bahut slow chal raha hai" = IT Services
- "Bijli ka pole gir gaya hai" = Electrical
- "Naali overflow ho rahi hai" = Water Supply
- "Footpath toot gaya hai" = Infrastructure
- "Dustbin bahut ganda hai" = Waste Management

Return ONLY this JSON (no other text):
{
  "department": "exact department name from list above",
  "reason": "brief explanation in English",
  "confidence": "high/medium/low"
}`
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
      
      // Find matching department (more flexible matching)
      const matchedDept = DEPARTMENTS.find(d => {
        const deptNameLower = d.name.toLowerCase();
        const analysisDeptLower = analysis.department.toLowerCase();
        
        // Try exact match first
        if (deptNameLower === analysisDeptLower) return true;
        
        // Try partial matches for common variations
        if (analysisDeptLower.includes('electrical') && deptNameLower.includes('electrical')) return true;
        if (analysisDeptLower.includes('water') && deptNameLower.includes('water')) return true;
        if (analysisDeptLower.includes('it ') || analysisDeptLower.includes('information')) {
          if (deptNameLower.includes('information')) return true;
        }
        if (analysisDeptLower.includes('infrastructure') && deptNameLower.includes('infrastructure')) return true;
        if (analysisDeptLower.includes('waste') && deptNameLower.includes('waste')) return true;
        
        return false;
      });

      if (matchedDept) {
        const result = {
          ...analysis,
          departmentId: matchedDept._id,
          department: matchedDept.name // Ensure we use the exact department name
        };
        setAiAnalysisResult(result);
        setDepartmentId(matchedDept._id);
        if (error) setError("");
        return matchedDept._id;
      }
      
      // If no match, try keyword fallback
      return detectDepartmentByKeywords(text);
    } catch (error) {
      console.error("AI department detection failed:", error);
      // Fallback to keyword-based detection
      return detectDepartmentByKeywords(text);
    } finally {
      setIsAnalyzingWithAI(false);
    }
  };

  // Fallback keyword-based detection with multilingual support including Hinglish
  const detectDepartmentByKeywords = (text) => {
    const lowerText = text.toLowerCase();
    let maxScore = 0;
    let bestMatch = null;

    // Extended multilingual keywords including Hinglish
    const multilingualKeywords = {
      electrical: [
        // English
        'light', 'fan', 'power', 'electric', 'current', 'wire', 'bulb', 'switch', 'electricity', 'voltage', 'transformer', 'pole',
        // Hindi
        'बत्ती', 'लाइट', 'बिजली', 'करंट', 'पंखा', 'ट्रांसफार्मर', 'प्रकाश', 'वीज',
        // Hinglish (romanized Hindi + mixed)
        'batti', 'bijli', 'current', 'light nahi', 'bijli nahi', 'current nahi', 'light chali gayi', 
        'bijli gayi', 'light aa rahi', 'power cut', 'transformer', 'pole gir gaya', 'pankha',
        'street light', 'light jal rahi', 'bulb phut gaya',
        // Telugu
        'లైట్', 'విద్యుత్', 'కరెంట్', 'ఫ్యాన్',
        // Kannada
        'ಬೆಳಕು', 'ವಿದ್ಯುತ್', 'ಫ್ಯಾನ್',
        // Malayalam
        'വെളിച്ചം', 'വൈദ്യുതി', 'ഫാൻ'
      ],
      water: [
        // English
        'water', 'pipe', 'leak', 'tap', 'drain', 'sewer', 'plumbing', 'sewage', 'sanitation', 'overflow', 'blockage',
        // Hindi
        'पानी', 'नल', 'पाइप', 'लीक', 'नाली', 'जल', 'पाणी',
        // Hinglish
        'paani', 'pani', 'nal', 'pipe', 'leak', 'naali', 'nali', 'drainage', 'paani nahi', 
        'water nahi', 'nal se paani', 'pipe phut gaya', 'water supply', 'paani aa raha',
        'water leakage', 'naali overflow', 'gutter', 'sewerage', 'drain block',
        'tap se paani nahi', 'supply band hai',
        // Telugu
        'నీరు', 'కుళాయి', 'పైపు', 'డ్రైనేజీ',
        // Kannada
        'ನೀರು', 'ಟ್ಯಾಪ್', 'ಪೈಪ್',
        // Malayalam
        'വെള്ളം', 'കുഴൽ', 'ടാപ്പ്'
      ],
      it: [
        // English
        'wifi', 'internet', 'network', 'computer', 'connection', 'server', 'website', 'online', 'digital', 'portal',
        // Hindi
        'इंटरनेट', 'वाईफाई', 'कंप्यूटर', 'नेटवर्क',
        // Hinglish
        'wifi nahi', 'internet slow', 'network problem', 'connection issue', 'wifi chal raha',
        'internet nahi chal raha', 'broadband', 'wifi ka problem', 'net slow hai',
        'website nahi khul raha', 'online nahi ho raha', 'portal',
        // Telugu
        'ఇంటర్నెట్', 'వైఫై', 'కంప్యూటర్',
        // Kannada
        'ಇಂಟರ್ನೆಟ್', 'ವೈಫೈ',
        // Malayalam
        'ഇന്റർനെറ്റ്', 'വൈഫൈ'
      ],
      infrastructure: [
        // English
        'repair', 'broken', 'damage', 'fix', 'maintenance', 'road', 'building', 'construction', 'crack', 'pothole', 'pavement',
        // Hindi
        'रोड', 'रस्ता', 'गड्ढा', 'सड़क', 'मरम्मत', 'मार्ग', 'इमारत',
        // Hinglish
        'road', 'sadak', 'rasta', 'pothole', 'gadda', 'gaddha', 'road kharab', 'sadak tuti',
        'footpath', 'pavement', 'road repair', 'sadak ki halat', 'road condition',
        'building', 'construction', 'crack aa gaya', 'toot gaya', 'damage hua',
        'maintenance', 'repair', 'broken hai', 'kharab hai',
        // Telugu
        'రోడ్డు', 'గొయ్యి', 'బిల్డింగ్',
        // Kannada
        'ರಸ್ತೆ', 'ಕುಂಡಿ', 'ಕಟ್ಟಡ',
        // Malayalam
        'റോഡ്', 'കുഴി', 'കെട്ടിടം'
      ],
      waste: [
        // English
        'clean', 'garbage', 'trash', 'dirty', 'litter', 'waste', 'dustbin', 'sweeping', 'disposal', 'collection',
        // Hindi
        'कचरा', 'गंदगी', 'सफाई', 'कूड़ा', 'डस्टबिन', 'कूड़ादान', 'स्वच्छता',
        // Hinglish
        'kachra', 'kachraa', 'kuda', 'garbage', 'gandagi', 'safai', 'dustbin', 'cleaning',
        'kachra collection', 'garbage nahi uthaya', 'dustbin bhara hua', 'gandagi hai',
        'safai nahi ho rahi', 'waste collection', 'kuda pada hai', 'sweeper nahi aaya',
        'cleaning nahi hui', 'ganda hai', 'dirty hai', 'litter pada hai',
        // Telugu
        'చెత్త', 'వ్యర్థాలు', 'శుభ్రత',
        // Kannada
        'ಕಸ', 'ಕೊಳಕು', 'ಸ್ವಚ್ಛತೆ',
        // Malayalam
        'മാലിന്യം', 'മാലിന്യനിര്‍മാര്‍ജനം'
      ]
    };

    for (let dept of DEPARTMENTS) {
      let score = 0;
      let categoryKey = '';
      
      // Determine category
      if (dept.name.includes('Electrical')) categoryKey = 'electrical';
      else if (dept.name.includes('Water')) categoryKey = 'water';
      else if (dept.name.includes('Information')) categoryKey = 'it';
      else if (dept.name.includes('Infrastructure')) categoryKey = 'infrastructure';
      else if (dept.name.includes('Waste')) categoryKey = 'waste';
      
      // Check both original keywords and multilingual keywords
      const allKeywords = [...dept.keywords, ...(multilingualKeywords[categoryKey] || [])];
      
      allKeywords.forEach(keyword => {
        if (lowerText.includes(keyword.toLowerCase())) {
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
        reason: `Detected based on ${maxScore} keyword match${maxScore > 1 ? 'es' : ''} in your description`,
        confidence: maxScore >= 3 ? 'high' : maxScore >= 2 ? 'medium' : 'low',
        departmentId: bestMatch._id
      };
      setAiAnalysisResult(result);
      setDepartmentId(bestMatch._id);
      if (error) setError("");
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
    const normalizedText = issueText.trim().toLowerCase();
    if (issueText.trim().length >= 10 && normalizedText !== lastAnalyzedTextRef.current) {
      debounceTimerRef.current = setTimeout(() => {
        detectDepartmentWithAI(issueText);
      }, 1500); // Wait 1.5 seconds after user stops typing
    } else if (issueText.trim().length < 10) {
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