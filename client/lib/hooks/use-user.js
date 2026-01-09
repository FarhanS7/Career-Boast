"use client";

import { api, setAuthToken } from "@/lib/api-client";
import { useAuth, useUser as useClerkUser } from "@clerk/nextjs";
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
  const { getToken } = useAuth();
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
      // Try to load from cache first for immediate UI
      const cachedStatus = localStorage.getItem("onboarding_complete");
      if (cachedStatus === "true") {
        setOnboardingComplete(true);
      }

      setLoading(true);

      // Get auth token and set it for API calls
      const token = await getToken();
      if (token) {
        setAuthToken(token);
      }

      // Check or create user in our DB
      const userData = await api.user.checkOrCreate(clerkUser.id, {
        email: clerkUser.emailAddresses[0]?.emailAddress,
        name: clerkUser.fullName || clerkUser.firstName,
        imageUrl: clerkUser.imageUrl,
      });

      setDbUser(userData.user);

      // Check onboarding status based on user data
      const isComplete = !!userData.user?.industry;
      setOnboardingComplete(isComplete);
      
      // Update cache
      localStorage.setItem("onboarding_complete", isComplete.toString());
    } catch (error) {
      console.error("Failed to initialize user:", error);
      
      if (error.status !== 0 && error.status !== 401) {
        toast.error("Failed to load user data");
      }
      
      setDbUser(null);
      setOnboardingComplete(false);
    } finally {
      setLoading(false);
    }
  }, [clerkUser, getToken]);

  // Initialize user when Clerk user is loaded
  useEffect(() => {
    if (clerkLoaded) {
      initializeUser();
    }
  }, [clerkLoaded, initializeUser]);

  // Update user data
  const updateUser = useCallback(async (data) => {
    try {
      const token = await getToken();
      if (token) {
        setAuthToken(token);
      }

      const updated = await api.user.update(data);
      setDbUser(updated.user);
      
      if (data.industry || data.experience) {
        setOnboardingComplete(true);
        localStorage.setItem("onboarding_complete", "true");
      }
      
      toast.success("Profile updated successfully");
      return updated.user;
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
      throw error;
    }
  }, [getToken]);

  // Refresh user data
  const refetchUser = useCallback(async () => {
    try {
      const token = await getToken();
      if (token) {
        setAuthToken(token);
      }

      const userData = await api.user.getMe();
      setDbUser(userData.user);
      
      const isComplete = !!userData.user?.industry;
      setOnboardingComplete(isComplete);
      localStorage.setItem("onboarding_complete", isComplete.toString());
      
      return userData.user;
    } catch (error) {
      console.error("Failed to refetch user:", error);
      throw error;
    }
  }, [getToken]);

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
