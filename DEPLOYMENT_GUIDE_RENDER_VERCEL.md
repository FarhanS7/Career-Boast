# Deployment Guide: Render & Vercel

This guide provides step-by-step instructions to deploy your **Backend** (`server` & `ai-job-matcher`) to **Render** and your **Frontend** (`client`) to **Vercel**.

## Prerequisites

1.  **GitHub Repository**: Push all your latest code to GitHub.
2.  **Accounts**:
    *   [Render.com](https://render.com) (for Backend & Database)
    *   [Vercel.com](https://vercel.com) (for Frontend)
    *   [Clerk.com](https://clerk.com) (Authentication)
    *   [Qdrant Cloud](https://qdrant.tech/cloud/) (Recommended for Vector Database) or use local/docker.

---

## Part 1: Database Setup (Render)

1.  **Log in to Render** and click **New +** -> **PostgreSQL**.
2.  **Name**: `career-coach-db` (or similar).
3.  **Region**: Choose a region close to you (e.g., Ohio, Frankfurt).
4.  **Plan**: Select **Free** (good for testing, expires in 90 days) or a paid plan for production.
5.  **Create Database**.
6.  **Wait for provision**. Once ready, copy the **Internal Database URL** (for backend services on Render) and **External Database URL** (for running migrations from your machine).

---

## Part 2: Vector Database (Qdrant)

Your `ai-job-matcher` needs Qdrant.
*   **Option A (Easiest)**: Sign up for **Qdrant Cloud** (Free Tier). Create a cluster and get the **URL** and **API Key**.
*   **Option B (Docker on Render)**: Create a new **Web Service** on Render -> "Deploy an Image" -> Image URL: `qdrant/qdrant:latest`. This requires a paid plan with sufficient disk space.

> **Recommendation**: Use **Qdrant Cloud** for easiest setup.

---

## Part 3: Backend Deployment (Render)

### Service 1: Main Server (`server`)

1.  Click **New +** -> **Web Service**.
2.  **Connect GitHub** and select your repository.
3.  **Configuration**:
    *   **Name**: `career-coach-server`
    *   **Root Directory**: `server`
    *   **Environment**: `Node`
    *   **Build Command**: `npm install && npx prisma generate`
    *   **Start Command**: `npm start`
    *   **Plan**: Free (Note: Spins down after inactivity) or Starter.
4.  **Environment Variables** (Add these in "Environment" tab):
    *   `DATABASE_URL`: Paste the **Internal Database URL** from Part 1.
    *   `CLERK_SECRET_KEY`: Your Clerk Secret Key.
    *   `CLERK_PUBLISHABLE_KEY`: Your Clerk Publishable Key.
    *   `GEMINI_API_KEY`: Your Google Gemini API Key.
    *   `NODE_ENV`: `production`
5.  **Deploy**.

### Service 2: AI Job Matcher (`ai-job-matcher`)

1.  Click **New +** -> **Web Service**.
2.  Select the same repository.
3.  **Configuration**:
    *   **Name**: `career-coach-ai-matcher`
    *   **Root Directory**: `ai-job-matcher`
    *   **Environment**: `Node`
    *   **Build Command**: `npm install && npx prisma generate`
    *   **Start Command**: `npm start`
4.  **Environment Variables**:
    *   `DATABASE_URL`: Paste the **Internal Database URL** from Part 1.
    *   `QDRANT_URL`: Your Qdrant Cloud URL (e.g., `https://xyz.us-east-1-0.aws.cloud.qdrant.io:6333`).
    *   `QDRANT_API_KEY`: Your Qdrant Cloud API Key. (If using cloud).
    *   `GEMINI_API_KEY`: Your Google Gemini API Key.
    *   `PORT`: `4001` (Render acts as proxy, but good to set).
5.  **Deploy**.

---

## Part 4: Run Database Migrations

You need to apply your schema to the new Render database.

1.  On your **Local Machine**:
    *   Update your local `.env` or run the command with the env var inline.
    *   Use the **External Database URL** from Render.
    *   Open terminal in `server` folder:
    ```bash
    # Linux/Mac
    DATABASE_URL="postgres://user:pass@host/db_name" npx prisma migrate deploy

    # Windows Powershell
    $env:DATABASE_URL="postgres://user:pass@host/db_name"; npx prisma migrate deploy
    ```
2.  Verify tables are created.

---

## Part 5: Frontend Deployment (Vercel)

1.  **Log in to Vercel** and click **Add New...** -> **Project**.
2.  **Import** your Git repository.
3.  **Configuration**:
    *   **Framework Preset**: Next.js
    *   **Root Directory**: Click "Edit" and select `client`.
4.  **Environment Variables**:
    *   `NEXT_PUBLIC_API_URL`: The URL of your **Main Server** on Render (e.g., `https://career-coach-server.onrender.com/api`).
    *   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk Publishable Key.
5.  **Deploy**.

---

## Part 6: Final Verification

1.  Open your **Vercel Deployment URL**.
2.  **Test Log In**: Ensure Clerk loads safely.
3.  **Test Dashboard**: Ensure data fetches from the backend (check Network tab if issues arise).
4.  **Test AI Features**: Ensure AI Job Matcher is responding (might take a moment if on Free tier cold start).
