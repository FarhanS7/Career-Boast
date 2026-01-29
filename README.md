# Career Coach AI (Career-Boast)

An AI-powered career growth assistant that helps you build resumes, generate cover letters, track industry trends, and prepare for interviews.

## 🚀 Repository Structure

This is a monorepo containing:

-   **/client**: Next.js frontend application.
-   **/server**: Express.js backend (Main API).
-   **/ai-job-matcher**: Secondary microservice for AI-powered job matching and vector search.

## 🛠️ Getting Started

### Prerequisites

-   Node.js (v18+)
-   PostgreSQL (for Prisma)
-   MongoDB (used by some components)
-   Qdrant (for vector search in `ai-job-matcher`)
-   Clerk (for authentication)
-   Google Gemini API Key

### Installation

1.  **Clone the repo:**
    ```bash
    git clone <repo-url>
    cd Career-Boast
    ```

2.  **Setup Server:**
    ```bash
    cd server
    npm install
    # Copy .env mapping from root or create new one
    npm run prisma:push
    npm run dev
    ```

3.  **Setup AI Job Matcher:**
    ```bash
    cd ai-job-matcher
    npm install
    npm run dev
    ```

4.  **Setup Client:**
    ```bash
    cd client
    npm install
    npm run dev
    ```

## 🔐 Environment Variables

Ensure you have `.env` files in `server`, `ai-job-matcher`, and `client` with the following variables:

-   `DATABASE_URL` (PostgreSQL)
-   `CLERK_SECRET_KEY` & `CLERK_PUBLISHABLE_KEY`
-   `GEMINI_API_KEY`
-   `NEXT_PUBLIC_API_URL` (pointing to server)
-   `NEXT_PUBLIC_AI_SERVICE_URL` (pointing to ai-job-matcher)

## ✅ Recent Improvements

-   **Standardized Error Handling**: Unified error response format and handled database-specific errors.
-   **Security Headers**: Integrated `helmet` across all backend services.
-   **HTTP Logging**: Integrated `morgan` for better developer visibility.
-   **Frontend UX**: Added navigation progress bars and improved API client consistency.
