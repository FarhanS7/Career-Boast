import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Get Clerk session token if available
    if (typeof window !== "undefined") {
      try {
        // Dynamically import Clerk to avoid SSR issues
        const { useAuth } = await import("@clerk/nextjs");
        const { getToken } = useAuth();
        const token = await getToken();
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn("Failed to get auth token:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - redirect to sign in
        if (typeof window !== "undefined") {
          window.location.href = "/sign-in";
        }
      }
      
      // Return formatted error
      return Promise.reject({
        message: data?.error || data?.message || "An error occurred",
        status,
        details: data?.details,
      });
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        message: "Network error. Please check your connection.",
        status: 0,
      });
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || "An unexpected error occurred",
        status: -1,
      });
    }
  }
);

export default apiClient;

// API endpoint helpers
export const api = {
  // User endpoints
  user: {
    getMe: () => apiClient.get("/user/me"),
    checkOrCreate: (clerkUserId, clerkData) => 
      apiClient.post("/user/check", { clerkUserId, clerkData }),
    update: (data) => apiClient.put("/user", data),
    checkOnboarding: () => apiClient.get("/user/onboarding-status"),
  },
  
  // Resume endpoints
  resume: {
    get: () => apiClient.get("/resume"),
    save: (data) => apiClient.post("/resume", data),
    improve: (data) => apiClient.post("/resume/improve", data),
  },
  
  // Cover letter endpoints
  coverLetter: {
    list: () => apiClient.get("/cover-letter"),
    create: (data) => apiClient.post("/cover-letter", data),
    getById: (id) => apiClient.get(`/cover-letter/${id}`),
    delete: (id) => apiClient.delete(`/cover-letter/${id}`),
  },
  
  // Interview endpoints
  interview: {
    generateQuiz: (data) => apiClient.post("/interview/quiz", data),
    submitQuiz: (data) => apiClient.post("/interview/quiz/submit", data),
    getAssessments: () => apiClient.get("/interview/assessments"),
  },
  
  // Dashboard endpoints
  dashboard: {
    getStats: () => apiClient.get("/dashboard/stats"),
  },
};
