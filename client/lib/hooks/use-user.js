"use client";

import { api } from "@/lib/api-client";
import { useUser as useClerkUser } from "@clerk/nextjs";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * User Context - Manages user data and onboarding status
 * Pattern: Compound Component Pattern (Context + Custom Hook)
 * 
 * Why this pattern?
 * - Encapsulates user state logic
 * - Provides clean API via useUser hook
 * - Avoids prop drilling
 * 
 * Alternative: Could use Zustand for global state, but Context is sufficient for user data
 */

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useClerkUser();
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // Fetch or create user in our database
  const initializeUser = useCallback(async () => {
    if (!clerkUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Check or create user in our DB
      const userData = await api.user.checkOrCreate(clerkUser.id, {
        email: clerkUser.emailAddresses[0]?.emailAddress,
        name: clerkUser.fullName || clerkUser.firstName,
        imageUrl: clerkUser.imageUrl,
      });

      setDbUser(userData.user);

      // Check onboarding status
      const onboardingStatus = await api.user.checkOnboarding();
      setOnboardingComplete(onboardingStatus.completed);
    } catch (error) {
      console.error("Failed to initialize user:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  }, [clerkUser]);

  // Initialize user when Clerk user is loaded
  useEffect(() => {
    if (clerkLoaded) {
      initializeUser();
    }
  }, [clerkLoaded, initializeUser]);

  // Update user data
  const updateUser = useCallback(async (data) => {
    try {
      const updated = await api.user.update(data);
      setDbUser(updated.user);
      
      // If updating onboarding data, mark as complete
      if (data.industry || data.experience) {
        setOnboardingComplete(true);
      }
      
      toast.success("Profile updated successfully");
      return updated.user;
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
      throw error;
    }
  }, []);

  // Refresh user data
  const refetchUser = useCallback(async () => {
    try {
      const userData = await api.user.getMe();
      setDbUser(userData.user);
      return userData.user;
    } catch (error) {
      console.error("Failed to refetch user:", error);
      throw error;
    }
  }, []);

  const value = {
    // User data
    clerkUser,
    dbUser,
    user: dbUser, // Alias for convenience
    
    // Loading states
    loading,
    isAuthenticated: !!clerkUser,
    
    // Onboarding
    onboardingComplete,
    needsOnboarding: !loading && !onboardingComplete && !!clerkUser,
    
    // Actions
    updateUser,
    refetchUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/**
 * Custom hook to access user context
 * Must be used within UserProvider
 */
export function useUser() {
  const context = useContext(UserContext);
  
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  
  return context;
}
