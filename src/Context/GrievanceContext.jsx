import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

const GrievanceContext = createContext();

export const useGrievance = () => {
  const context = useContext(GrievanceContext);
  if (!context) {
    throw new Error('useGrievance must be used within GrievanceProvider');
  }
  return context;
};

export const GrievanceProvider = ({ children }) => {
  const { user, isLoaded } = useUser();
  
  const [grievances, setGrievances] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [userStats, setUserStats] = useState({
    totalGrievances: 0,
    completedGrievances: 0,
    pendingGrievances: 0,
    totalReviews: 0,
    averageRating: 0
  });

  // Load data from localStorage when user logs in
  useEffect(() => {
    if (isLoaded && user) {
      loadUserData(user.id);
    }
  }, [user, isLoaded]);

  // Update stats whenever grievances or reviews change
  useEffect(() => {
    if (user) {
      updateUserStats();
      saveUserData(user.id);
    }
  }, [grievances, reviews, user]);

  // Load user data from localStorage
  const loadUserData = (userId) => {
    try {
      const storedGrievances = localStorage.getItem(`grievances_${userId}`);
      const storedReviews = localStorage.getItem(`reviews_${userId}`);
      const storedStats = localStorage.getItem(`stats_${userId}`);

      if (storedGrievances) {
        setGrievances(JSON.parse(storedGrievances));
      }
      if (storedReviews) {
        setReviews(JSON.parse(storedReviews));
      }
      if (storedStats) {
        setUserStats(JSON.parse(storedStats));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Save user data to localStorage
  const saveUserData = (userId) => {
    try {
      localStorage.setItem(`grievances_${userId}`, JSON.stringify(grievances));
      localStorage.setItem(`reviews_${userId}`, JSON.stringify(reviews));
      localStorage.setItem(`stats_${userId}`, JSON.stringify(userStats));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  // Update user statistics
  const updateUserStats = () => {
    const total = grievances.length;
    const completed = grievances.filter(g => g.status === 'completed').length;
    const pending = grievances.filter(g => g.status === 'pending').length;
    const totalReviewsCount = reviews.length;
    const avgRating = totalReviewsCount > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviewsCount
      : 0;

    setUserStats({
      totalGrievances: total,
      completedGrievances: completed,
      pendingGrievances: pending,
      totalReviews: totalReviewsCount,
      averageRating: avgRating
    });
  };

  // Add new grievance
  const addGrievance = (grievanceData) => {
    const newGrievance = {
      id: `GRV-${Date.now()}`,
      userId: user?.id,
      userName: user?.fullName || user?.firstName || 'Anonymous',
      userEmail: user?.primaryEmailAddress?.emailAddress,
      ...grievanceData,
      timestamp: new Date().toISOString(),
      status: 'pending',
      reviewed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setGrievances(prev => [newGrievance, ...prev]);
    return newGrievance;
  };

  // Update grievance status
  const updateGrievanceStatus = (grievanceId, newStatus) => {
    setGrievances(prev =>
      prev.map(grievance =>
        grievance.id === grievanceId
          ? { 
              ...grievance, 
              status: newStatus,
              updatedAt: new Date().toISOString(),
              completedAt: newStatus === 'completed' ? new Date().toISOString() : grievance.completedAt
            }
          : grievance
      )
    );
  };

  // Mark grievance as reviewed
  const markGrievanceAsReviewed = (grievanceId) => {
    setGrievances(prev =>
      prev.map(grievance =>
        grievance.id === grievanceId
          ? { ...grievance, reviewed: true, updatedAt: new Date().toISOString() }
          : grievance
      )
    );
  };

  // Add review
  const addReview = (reviewData) => {
    const newReview = {
      id: `REV-${Date.now()}`,
      userId: user?.id,
      userName: user?.fullName || user?.firstName || 'Anonymous',
      userEmail: user?.primaryEmailAddress?.emailAddress,
      ...reviewData,
      timestamp: new Date().toISOString(),
      helpful: 0,
      notHelpful: 0,
      createdAt: new Date().toISOString()
    };

    setReviews(prev => [newReview, ...prev]);
    markGrievanceAsReviewed(reviewData.grievanceId);
    return newReview;
  };

  // Get grievances by status
  const getGrievancesByStatus = (status) => {
    return grievances.filter(g => g.status === status);
  };

  // Get grievances by department
  const getGrievancesByDepartment = (department) => {
    return grievances.filter(g => g.department === department);
  };

  // Get reviews by grievance ID
  const getReviewsByGrievanceId = (grievanceId) => {
    return reviews.filter(r => r.grievanceId === grievanceId);
  };

  // Get unreviewed completed grievances
  const getUnreviewedGrievances = () => {
    return grievances.filter(g => g.status === 'completed' && !g.reviewed);
  };

  // Delete grievance (optional)
  const deleteGrievance = (grievanceId) => {
    setGrievances(prev => prev.filter(g => g.id !== grievanceId));
    setReviews(prev => prev.filter(r => r.grievanceId !== grievanceId));
  };

  // Update helpful votes on review
  const updateReviewVotes = (reviewId, voteType) => {
    setReviews(prev =>
      prev.map(review =>
        review.id === reviewId
          ? {
              ...review,
              helpful: voteType === 'helpful' ? review.helpful + 1 : review.helpful,
              notHelpful: voteType === 'notHelpful' ? review.notHelpful + 1 : review.notHelpful
            }
          : review
      )
    );
  };

  // Clear all user data (for logout or testing)
  const clearUserData = () => {
    if (user) {
      localStorage.removeItem(`grievances_${user.id}`);
      localStorage.removeItem(`reviews_${user.id}`);
      localStorage.removeItem(`stats_${user.id}`);
    }
    setGrievances([]);
    setReviews([]);
    setUserStats({
      totalGrievances: 0,
      completedGrievances: 0,
      pendingGrievances: 0,
      totalReviews: 0,
      averageRating: 0
    });
  };

  const value = {
    // State
    grievances,
    reviews,
    userStats,
    
    // Grievance methods
    addGrievance,
    updateGrievanceStatus,
    markGrievanceAsReviewed,
    getGrievancesByStatus,
    getGrievancesByDepartment,
    deleteGrievance,
    getUnreviewedGrievances,
    
    // Review methods
    addReview,
    getReviewsByGrievanceId,
    updateReviewVotes,
    
    // Utility methods
    clearUserData
  };

  return (
    <GrievanceContext.Provider value={value}>
      {children}
    </GrievanceContext.Provider>
  );
};