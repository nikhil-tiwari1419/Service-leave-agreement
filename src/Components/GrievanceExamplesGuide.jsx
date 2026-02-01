import React, { useState } from 'react';
import { HelpCircle, Lightbulb, Copy, CheckCircle2, X } from 'lucide-react';
import { useTheme } from '../Context/Theme';

function GrievanceExamplesGuide({ onUseExample }) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const examples = [
    {
      category: "Electrical Issues",
      icon: "💡",
      color: "yellow",
      examples: [
        "The street light near ABC Road junction has not been working for the past 5 days, causing safety concerns at night.",
        "Electrical pole on XYZ Street is leaning dangerously and could fall anytime. Immediate attention required.",
        "Street light ke wire khule pade hain Main Road pe, bahut dangerous hai. Please fix karo urgently.",
        "Transformer near City Park is making loud buzzing noise and sparking occasionally. Safety hazard.",
      ]
    },
    {
      category: "Water & Drainage",
      icon: "💧",
      color: "blue",
      examples: [
        "No water supply in our area for the last 3 days. The municipal pipeline seems to be damaged.",
        "Water leakage from main pipeline on Station Road is causing waterlogging and road damage.",
        "Humare area mein paani nahi aa raha hai 2 din se. Pipeline ka problem lag raha hai.",
        "Sewage overflow near Market Square is creating unhygienic conditions and foul smell.",
      ]
    },
    {
      category: "Roads & Infrastructure",
      icon: "🚧",
      color: "green",
      examples: [
        "Large pothole on Highway Road near kilometer 5 is causing accidents. Needs urgent repair.",
        "Footpath near School Road is completely broken, making it dangerous for pedestrians.",
        "Road pe bada gadda ban gaya hai Hospital ke samne. Accident ho sakta hai.",
        "Bridge railing on River Road is damaged and poses safety risk to vehicles and pedestrians.",
      ]
    },
    {
      category: "Waste Management",
      icon: "🗑️",
      color: "pink",
      examples: [
        "Garbage has not been collected from our locality for the past 5 days. Dustbins are overflowing.",
        "Public dustbin near Bus Stand is broken and garbage is scattered everywhere.",
        "Kachra collection nahi ho raha properly. 1 week se dustbin bhara pada hai.",
        "Street cleaning not done in Market Area for many days, creating unhygienic conditions.",
      ]
    },
    {
      category: "IT & Digital Services",
      icon: "📡",
      color: "purple",
      examples: [
        "Public WiFi at Community Center has not been working for the last 2 weeks.",
        "Government portal for birth certificate is showing error and not accepting applications.",
        "Digital kiosk at Municipal Office is not functioning. Screen is blank.",
        "Public wifi nahi chal raha Library me. Internet connection problem hai.",
      ]
    }
  ];

  const handleCopyExample = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    
    if (onUseExample) {
      onUseExample(text);
      setIsOpen(false);
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      yellow: "border-yellow-500 bg-yellow-500/10 text-yellow-600",
      blue: "border-blue-500 bg-blue-500/10 text-blue-600",
      green: "border-green-500 bg-green-500/10 text-green-600",
      pink: "border-pink-500 bg-pink-500/10 text-pink-600",
      purple: "border-purple-500 bg-purple-500/10 text-purple-600",
    };
    return colors[color] || colors.blue;
  };

  return (
    <>
      {/* Help Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          theme === "dark"
            ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/50"
            : "bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
        }`}
      >
        <Lightbulb size={16} />
        See Example Descriptions
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className={`w-full max-w-4xl rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col ${
              theme === "dark"
                ? "bg-slate-800 text-white"
                : "bg-white text-gray-900"
            }`}
          >
            {/* Header */}
            <div className={`px-6 py-4 border-b ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <HelpCircle className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">How to Write a Valid Grievance</h2>
                    <p className={`text-sm mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Click on any example to use it as a template
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
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

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Guidelines */}
              <div className={`mb-6 p-4 rounded-lg border-l-4 border-blue-500 ${
                theme === "dark" ? "bg-blue-900/20" : "bg-blue-50"
              }`}>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb size={18} className="text-blue-500" />
                  What Makes a Good Grievance Description?
                </h3>
                <ul className="text-sm space-y-1 ml-6 list-disc">
                  <li><strong>Be Specific:</strong> Mention exact location (road name, area, landmark)</li>
                  <li><strong>Describe the Problem:</strong> What exactly is wrong?</li>
                  <li><strong>Add Duration:</strong> How long has this been an issue?</li>
                  <li><strong>Impact:</strong> How is it affecting the public?</li>
                  <li><strong>Language:</strong> You can write in English, Hindi, Hinglish, or any Indian language</li>
                </ul>
              </div>

              {/* Examples by Category */}
              <div className="space-y-6">
                {examples.map((category, catIndex) => (
                  <div key={catIndex}>
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                      <span className="text-2xl">{category.icon}</span>
                      {category.category}
                    </h3>
                    <div className="grid gap-3">
                      {category.examples.map((example, exIndex) => {
                        const globalIndex = `${catIndex}-${exIndex}`;
                        return (
                          <div
                            key={exIndex}
                            className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md ${
                              getColorClasses(category.color)
                            } ${theme === "dark" ? "hover:bg-opacity-20" : "hover:bg-opacity-30"}`}
                            onClick={() => handleCopyExample(example, globalIndex)}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className={`text-sm flex-1 ${
                                theme === "dark" ? "text-gray-200" : "text-gray-800"
                              }`}>
                                "{example}"
                              </p>
                              <button
                                className={`flex-shrink-0 p-2 rounded-md transition-colors ${
                                  copiedIndex === globalIndex
                                    ? "bg-green-500 text-white"
                                    : theme === "dark"
                                    ? "bg-slate-700 hover:bg-slate-600 text-gray-300"
                                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                }`}
                              >
                                {copiedIndex === globalIndex ? (
                                  <CheckCircle2 size={16} />
                                ) : (
                                  <Copy size={16} />
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div className={`mt-6 p-4 rounded-lg ${
                theme === "dark" ? "bg-slate-700/50" : "bg-gray-100"
              }`}>
                <h3 className="font-semibold mb-2">💡 Pro Tips:</h3>
                <ul className="text-sm space-y-1 ml-6 list-disc">
                  <li>Minimum 20 characters required for AI to analyze</li>
                  <li>Add specific location details for faster resolution</li>
                  <li>You can write in Hinglish (e.g., "light nahi jal rahi")</li>
                  <li>Be honest and accurate in your description</li>
                  <li>Avoid personal conversations or random text</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default GrievanceExamplesGuide;