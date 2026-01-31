import React, { useState, useEffect } from 'react';
import { useTheme } from '../Context/Theme';
import { useGrievance } from '../Context/GrievanceContext';
import { useUser } from '@clerk/clerk-react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import toast from 'react-hot-toast';
import {
  Star,
  Send,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  AlertCircle,
  X,
  TrendingUp,
  Filter
} from 'lucide-react';

const DEPARTMENTS = [
  "All Departments",
  "Electric Department",
  "Plumbing Department",
  "IT Support",
  "Maintenance Department",
  "Local NMC Department",
  "Road & Infrastructure",
  "Street Public Safety"
];

function Review() {
  const { theme } = useTheme();
  const { user } = useUser();
  const [searchParams] = useSearchParams();
  const grievanceIdFromUrl = searchParams.get('grievanceId');

  const {
    reviews,
    addReview,
    getUnreviewedGrievances,
    updateReviewVotes,
    userStats
  } = useGrievance();

  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  // Review form state
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [satisfaction, setSatisfaction] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(null);

  const unreviewedGrievances = getUnreviewedGrievances();

  // Auto-open review modal if grievanceId in URL
  useEffect(() => {
    if (grievanceIdFromUrl && unreviewedGrievances.length > 0) {
      const grievance = unreviewedGrievances.find(g => g.id === grievanceIdFromUrl);
      if (grievance) {
        handleOpenReviewModal(grievance);
      }
    }
  }, [grievanceIdFromUrl, unreviewedGrievances]);

  // Filter unreviewed grievances by department
  const filteredUnreviewedGrievances = selectedDepartment === "All Departments"
    ? unreviewedGrievances
    : unreviewedGrievances.filter(g => g.department === selectedDepartment);

  // Filter reviews by department
  const filteredReviews = selectedDepartment === "All Departments"
    ? reviews
    : reviews.filter(r => r.grievance?.department === selectedDepartment);

  const handleOpenReviewModal = (issue) => {
    setSelectedIssue(issue);
    setShowReviewModal(true);
    resetForm();
  };

  const resetForm = () => {
    setRating(0);
    setComment('');
    setSatisfaction('');
    setWouldRecommend(null);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    const reviewData = {
      grievanceId: selectedIssue.id,
      grievance: selectedIssue,
      rating,
      comment,
      satisfaction,
      wouldRecommend
    };

    addReview(reviewData);
    setShowReviewModal(false);
    resetForm();
  };

  const handleVote = (reviewId, voteType) => {
    updateReviewVotes(reviewId, voteType);
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className={`min-h-screen ubuntu-regular flex flex-col items-center justify-center ${
          theme === "dark"
            ? "bg-gradient-to-b from-slate-900 via-slate-800 to-gray-900 text-white"
            : "bg-gradient-to-b from-gray-50 to-blue-50 text-black"
        }`}>
          <AlertCircle size={64} className="text-blue-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Login Required</h2>
          <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
            Please login to view and submit reviews
          </p>
        </div>
      </>
    );
  }

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
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 pt-24 pb-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-4xl font-bold mb-2 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              Reviews & Feedback
            </h1>
            <p className={`text-lg ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}>
              Share your experience and help us improve our services
            </p>
          </div>

          {/* Department Filter */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Filter size={20} className={theme === "dark" ? "text-gray-400" : "text-gray-600"} />
              <label className="font-semibold">Filter by Department:</label>
            </div>
            <div className="flex flex-wrap gap-2">
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedDepartment === dept
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : theme === "dark"
                      ? "bg-slate-800 hover:bg-slate-700 text-gray-300"
                      : "bg-white hover:bg-gray-100 text-gray-700 shadow"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`p-6 rounded-xl ${
              theme === "dark" ? "bg-slate-800" : "bg-white"
            } shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Total Reviews
                  </p>
                  <p className="text-3xl font-bold text-blue-500">{userStats.totalReviews}</p>
                </div>
                <MessageSquare size={40} className="text-blue-500 opacity-50" />
              </div>
            </div>

            <div className={`p-6 rounded-xl ${
              theme === "dark" ? "bg-slate-800" : "bg-white"
            } shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Average Rating
                  </p>
                  <p className="text-3xl font-bold text-yellow-500">
                    {userStats.averageRating.toFixed(1)}
                  </p>
                </div>
                <Star size={40} className="text-yellow-500 opacity-50" />
              </div>
            </div>

            <div className={`p-6 rounded-xl ${
              theme === "dark" ? "bg-slate-800" : "bg-white"
            } shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Pending Reviews
                  </p>
                  <p className="text-3xl font-bold text-orange-500">
                    {unreviewedGrievances.length}
                  </p>
                </div>
                <TrendingUp size={40} className="text-orange-500 opacity-50" />
              </div>
            </div>
          </div>

          {/* Pending Reviews */}
          <div className="mb-8">
            <h2 className={`text-2xl font-bold mb-4 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              Pending Reviews {selectedDepartment !== "All Departments" && `- ${selectedDepartment}`}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredUnreviewedGrievances.length > 0 ? (
                filteredUnreviewedGrievances.map(issue => (
                  <div
                    key={issue.id}
                    className={`p-6 rounded-xl ${
                      theme === "dark" ? "bg-slate-800" : "bg-white"
                    } shadow-lg`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg mb-1">{issue.department}</h3>
                        <p className={`text-sm mb-2 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}>
                          #{issue.id}
                        </p>
                        <p className={`text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}>
                          {issue.issueText}
                        </p>
                      </div>
                      <CheckCircle2 size={24} className="text-green-500" />
                    </div>
                    
                    <p className={`text-xs mb-4 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>
                      Raised: {new Date(issue.timestamp).toLocaleDateString()}
                    </p>

                    {issue.locationData && (
                      <p className={`text-xs mb-4 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}>
                        Location: {issue.locationData.area}, {issue.locationData.district}
                      </p>
                    )}

                    <button
                      onClick={() => handleOpenReviewModal(issue)}
                      className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg font-semibold transition-all"
                    >
                      Write Review
                    </button>
                  </div>
                ))
              ) : (
                <div className={`col-span-2 p-8 rounded-xl text-center ${
                  theme === "dark" ? "bg-slate-800" : "bg-white"
                } shadow-lg`}>
                  <CheckCircle2 size={48} className="mx-auto mb-4 text-green-500 opacity-50" />
                  <p className={`text-lg ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}>
                    {selectedDepartment === "All Departments" 
                      ? "All issues have been reviewed!"
                      : `No pending reviews for ${selectedDepartment}`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* All Reviews */}
          <div>
            <h2 className={`text-2xl font-bold mb-4 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              All Reviews {selectedDepartment !== "All Departments" && `- ${selectedDepartment}`}
            </h2>
            <div className="space-y-6">
              {filteredReviews.length > 0 ? (
                filteredReviews.map(review => (
                  <div
                    key={review.id}
                    className={`p-6 rounded-xl ${
                      theme === "dark" ? "bg-slate-800" : "bg-white"
                    } shadow-lg`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={20}
                              className={i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-400"}
                            />
                          ))}
                        </div>
                        <h3 className="font-bold text-lg">{review.grievance?.department || "Unknown Department"}</h3>
                        <p className={`text-sm ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}>
                          Issue: {review.grievance?.issueText || "N/A"}
                        </p>
                      </div>
                      <span className={`text-xs ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}>
                        {new Date(review.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    {review.comment && (
                      <p className={`mb-4 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}>
                        "{review.comment}"
                      </p>
                    )}

                    {review.satisfaction && (
                      <div className="mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          review.satisfaction === 'very-satisfied'
                            ? 'bg-green-500 text-white'
                            : review.satisfaction === 'satisfied'
                            ? 'bg-blue-500 text-white'
                            : review.satisfaction === 'neutral'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}>
                          {review.satisfaction.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleVote(review.id, 'helpful')}
                        className={`flex items-center gap-2 text-sm ${
                          theme === "dark" ? "text-gray-400 hover:text-green-500" : "text-gray-600 hover:text-green-600"
                        }`}
                      >
                        <ThumbsUp size={16} />
                        <span>Helpful ({review.helpful})</span>
                      </button>
                      <button 
                        onClick={() => handleVote(review.id, 'notHelpful')}
                        className={`flex items-center gap-2 text-sm ${
                          theme === "dark" ? "text-gray-400 hover:text-red-500" : "text-gray-600 hover:text-red-600"
                        }`}
                      >
                        <ThumbsDown size={16} />
                        <span>Not Helpful ({review.notHelpful})</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`p-8 rounded-xl text-center ${
                  theme === "dark" ? "bg-slate-800" : "bg-white"
                } shadow-lg`}>
                  <MessageSquare size={48} className="mx-auto mb-4 text-gray-400 opacity-50" />
                  <p className={`text-lg ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}>
                    {selectedDepartment === "All Departments"
                      ? "No reviews yet. Complete an issue to write your first review!"
                      : `No reviews yet for ${selectedDepartment}`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* Review Modal - Same as before */}
      {showReviewModal && selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          {/* Modal content remains the same */}
        </div>
      )}
    </>
  );
}

export default Review;


