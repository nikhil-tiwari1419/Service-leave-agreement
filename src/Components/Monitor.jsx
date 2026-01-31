import React, { useState, useEffect } from 'react';
import { useTheme } from '../Context/Theme';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Timer, 
  Calendar,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

// Issue type configurations with resolution times
const ISSUE_TYPES = {
  'Electric Department': {
    name: 'Electrical Issues',
    resolutionTime: 2 * 24 * 60 * 60 * 1000, // 2 days in milliseconds
    color: 'from-yellow-400 to-yellow-600',
    icon: '⚡',
    priority: 'high'
  },
  'Plumbing Department': {
    name: 'Water Issues',
    resolutionTime: 5 * 60 * 60 * 1000, // 5 hours in milliseconds
    color: 'from-blue-400 to-blue-600',
    icon: '💧',
    priority: 'high'
  },
  'Local NMC Department': {
    name: 'Garbage Issues',
    resolutionTime: 2 * 24 * 60 * 60 * 1000, // 2 days in milliseconds
    color: 'from-green-400 to-green-600',
    icon: '🗑️',
    priority: 'medium'
  },
  'Road & Infrastructure': {
    name: 'Road Potholes',
    resolutionTime: 7 * 24 * 60 * 60 * 1000, // 1 week in milliseconds
    color: 'from-orange-400 to-orange-600',
    icon: '🛣️',
    priority: 'low'
  },
  'Street Public Safety': {
    name: 'Public Safety',
    resolutionTime: 2 * 24 * 60 * 60 * 1000, // 2 days in milliseconds
    color: 'from-red-400 to-red-600',
    icon: '🚨',
    priority: 'high'
  },
  'Maintenance Department': {
    name: 'Drainage System',
    resolutionTime: 3 * 24 * 60 * 60 * 1000, // 3 days in milliseconds
    color: 'from-purple-400 to-purple-600',
    icon: '🚰',
    priority: 'medium'
  }
};

const Monitor = ({ issue, onComplete, onReview }) => {
  const { theme } = useTheme();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isOverdue, setIsOverdue] = useState(false);
  const [progress, setProgress] = useState(0);

  const issueConfig = ISSUE_TYPES[issue.department] || {
    name: 'General Issue',
    resolutionTime: 24 * 60 * 60 * 1000,
    color: 'from-gray-400 to-gray-600',
    icon: '📋',
    priority: 'medium'
  };

  const raisedTime = new Date(issue.timestamp);
  const completionTime = new Date(raisedTime.getTime() + issueConfig.resolutionTime);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const remaining = completionTime - now;
      
      if (remaining <= 0) {
        setTimeRemaining(0);
        setIsOverdue(true);
        setProgress(100);
      } else {
        setTimeRemaining(remaining);
        setIsOverdue(false);
        
        // Calculate progress
        const totalTime = issueConfig.resolutionTime;
        const elapsed = now - raisedTime;
        const progressPercent = Math.min((elapsed / totalTime) * 100, 100);
        setProgress(progressPercent);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [issue, completionTime, issueConfig.resolutionTime, raisedTime]);

  // Format time remaining
  const formatTime = (ms) => {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Get status color
  const getStatusColor = () => {
    if (issue.status === 'completed') return 'text-green-500';
    if (isOverdue) return 'text-red-500';
    if (progress > 75) return 'text-orange-500';
    return 'text-blue-500';
  };

  // Get priority badge color
  const getPriorityColor = () => {
    switch (issueConfig.priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div
      className={`rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-[1.02] ${
        theme === "dark"
          ? "bg-slate-800 shadow-lg hover:shadow-blue-500/20"
          : "bg-white shadow-md hover:shadow-xl"
      }`}
    >
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${issueConfig.color} p-4`}>
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{issueConfig.icon}</span>
            <div>
              <h3 className="text-lg font-bold">{issueConfig.name}</h3>
              <p className="text-sm text-white/80">ID: #{issue.id}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor()} text-white uppercase`}>
            {issueConfig.priority}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Issue Description */}
        <div>
          <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
            {issue.issueText}
          </p>
        </div>

        {/* Location */}
        {issue.locationData && (
          <div className={`flex items-center gap-2 text-sm ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}>
            <Calendar size={16} />
            <span>{issue.locationData.area}, {issue.locationData.district}</span>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
              <div className="flex items-center gap-2 mb-1">
                <Clock size={16} />
                <span className="font-medium">Raised:</span>
              </div>
              <p className="ml-6">{raisedTime.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
              <div className="flex items-center gap-2 mb-1">
                <Timer size={16} />
                <span className="font-medium">Expected Completion:</span>
              </div>
              <p className="ml-6">{completionTime.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className={`font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Progress
            </span>
            <span className={`font-bold ${getStatusColor()}`}>
              {progress.toFixed(1)}%
            </span>
          </div>
          <div className={`h-3 rounded-full overflow-hidden ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-200"
          }`}>
            <div
              className={`h-full transition-all duration-500 ${
                issue.status === 'completed'
                  ? 'bg-green-500'
                  : isOverdue
                  ? 'bg-red-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Time Remaining */}
        {issue.status !== 'completed' && (
          <div className={`p-4 rounded-lg ${
            isOverdue
              ? theme === "dark"
                ? "bg-red-900/30 border border-red-500"
                : "bg-red-50 border border-red-300"
              : theme === "dark"
              ? "bg-blue-900/30 border border-blue-500"
              : "bg-blue-50 border border-blue-300"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isOverdue ? (
                  <AlertTriangle size={20} className="text-red-500" />
                ) : (
                  <TrendingUp size={20} className="text-blue-500" />
                )}
                <span className={`font-semibold ${
                  isOverdue ? "text-red-500" : "text-blue-500"
                }`}>
                  {isOverdue ? 'OVERDUE' : 'Time Remaining'}
                </span>
              </div>
              <span className={`text-lg font-bold ${
                isOverdue ? "text-red-500" : "text-blue-500"
              }`}>
                {isOverdue ? formatTime(Math.abs(timeRemaining)) : formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {issue.status === 'completed' ? (
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle2 size={20} />
              <span className="font-semibold">Completed</span>
            </div>
          ) : isOverdue ? (
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle size={20} />
              <span className="font-semibold">Overdue - Pending Action</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-blue-500">
              <Clock size={20} />
              <span className="font-semibold">In Progress</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {issue.status === 'completed' && !issue.reviewed && (
          <button
            onClick={() => onReview(issue)}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
              theme === "dark"
                ? "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                : "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
            }`}
          >
            Write Review
          </button>
        )}

        {issue.reviewed && (
          <div className={`p-3 rounded-lg text-center ${
            theme === "dark" ? "bg-green-900/30 text-green-400" : "bg-green-50 text-green-700"
          }`}>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 size={18} />
              <span className="font-medium">Review Submitted</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Monitor;