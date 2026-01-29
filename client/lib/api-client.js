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
// Note: Auth token should be passed via setAuthToken() before making authenticated requests
let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

apiClient.interceptors.request.use(
  async (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
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
      
      // Don't automatically redirect on 401 - let components handle it
      // This prevents infinite redirect loops
      
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
    checkATSScore: (jobDescription) => apiClient.post("/resume/ats-score", { jobDescription }),
    checkATSScoreFile: (formData) => apiClient.post("/resume/ats-score/file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  },
  
  // Cover letter endpoints
  coverLetter: {
    list: () => apiClient.get("/cover-letter"),
    create: (data) => apiClient.post("/cover-letter", data),
    getById: (id) => apiClient.get(`/cover-letter/${id}`),
    update: (id, data) => apiClient.put(`/cover-letter/${id}`, data),
    delete: (id) => apiClient.delete(`/cover-letter/${id}`),
  },
  
  // Interview endpoints
  interview: {
    generateQuiz: () => apiClient.get("/interview/quiz"),
    submitQuiz: (data) => apiClient.post("/interview/quiz", data),
    getAssessments: () => apiClient.get("/interview/assessments"),
  },
  
  // Dashboard endpoints
  dashboard: {
    getStats: () => apiClient.get("/dashboard/stats"),
    getIndustryInsights: () => apiClient.get("/dashboard/industry-insights"),
  },
};

// Server-side fetch helper for Next.js Server Components
export const getServerApi = (token) => {
  const commonHeaders = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const customFetch = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...commonHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || "Server request failed");
    }

    return response.json();
  };

  return {
    user: {
      getMe: () => customFetch("/user/me"),
      update: (data) => customFetch("/user", { 
        method: "PUT", 
        body: JSON.stringify(data) 
      }),
    },
    dashboard: {
      getIndustryInsights: () => customFetch("/dashboard/industry-insights"),
      getStats: () => customFetch("/dashboard/stats"),
    },
  };
};
// AI Job Matcher API Client (Port 4001)
const JOB_MATCHER_API_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:4001/api";

const jobMatcherClient = axios.create({
  baseURL: JOB_MATCHER_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to job matcher requests too
jobMatcherClient.interceptors.request.use(
  async (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Standardize data unwrapping
jobMatcherClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      return Promise.reject({
        message: data?.error || data?.message || "An error occurred",
        status,
        details: data?.details,
      });
    } else if (error.request) {
      return Promise.reject({
        message: "Network error. Please check your connection.",
        status: 0,
      });
    } else {
      return Promise.reject({
        message: error.message || "An unexpected error occurred",
        status: -1,
      });
    }
  }
);

export const jobApi = {
  // Resume endpoints
  resumes: {
    upload: (formData) => jobMatcherClient.post("/resumes/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
    list: () => jobMatcherClient.get("/resumes"),
    getById: (id) => jobMatcherClient.get(`/resumes/${id}`),
    delete: (id) => jobMatcherClient.delete(`/resumes/${id}`),
  },

  // Job endpoints
  jobs: {
    list: (params) => jobMatcherClient.get("/jobs", { params }),
    getById: (id) => jobMatcherClient.get(`/jobs/${id}`),
    sync: () => jobMatcherClient.get("/jobs/sync"),
  },

  // Recommendation endpoints
  recommendations: {
    generate: (resumeId) => jobMatcherClient.post(`/recommendations/${resumeId}`),
    get: (resumeId) => jobMatcherClient.get(`/recommendations/${resumeId}`),
  },
};
