import axios from "axios";

const safeParseDate = (dateInfo) => {
  if (!dateInfo) return null;
  
  try {
    // Handle RemoteOK epoch seconds
    if (typeof dateInfo === 'number' && dateInfo < 10000000000) {
      return new Date(dateInfo * 1000);
    }
    
    const parsed = new Date(dateInfo);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch (e) {
    return null;
  }
};

// Common headers to mimic a browser
const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  "Referer": "https://google.com/"
};

export const fetchRemoteOKJobs = async () => {
  try {
    const response = await axios.get("https://remoteok.com/api", {
      headers: BROWSER_HEADERS,
      timeout: 10000 
    });
    
    // RemoteOK returns array directly, sometimes the first item is disclaimer
    const data = Array.isArray(response.data) ? response.data : [];
    const jobs = data.filter(j => j.id && j.id !== 'legal').slice(0, 50);
    
    return jobs.map((job) => ({
      externalId: job.id?.toString() || job.slug,
      source: "remoteok",
      title: job.position || "Untitled Position",
      company: job.company || "Unknown Company",
      location: job.location || "Remote",
      url: job.url || `https://remoteok.com/remote-jobs/${job.slug}`,
      description: job.description || "",
      tags: job.tags || [],
      jobType: "remote",
      salary: job.salary_min && job.salary_max 
        ? `$${job.salary_min}-${job.salary_max}` 
        : null,
      postedAt: safeParseDate(job.date),
    }));
  } catch (error) {
    console.error("Error fetching RemoteOK jobs:", error.message);
    return [];
  }
};

export const fetchJobicyJobs = async () => {
  try {
    const response = await axios.get("https://jobicy.com/api/v2/remote-jobs", {
      params: {
        count: 50,
        geo: "usa,uk,canada",
        industry: "software,tech",
      },
      headers: BROWSER_HEADERS,
      timeout: 10000
    });
    
    const jobs = response.data.jobs || [];
    
    return jobs.map((job) => ({
      externalId: job.id?.toString() || job.slug,
      source: "jobicy",
      title: job.jobTitle || "Untitled Position",
      company: job.companyName || "Unknown Company",
      location: job.jobGeo || "Remote",
      url: job.url || "",
      description: job.jobDescription || "",
      tags: job.jobIndustry ? [job.jobIndustry] : [],
      jobType: job.jobType || "remote",
      salary: null,
      postedAt: safeParseDate(job.pubDate),
    }));
  } catch (error) {
    // Jobicy might return 403 or specific errors
    console.error("Error fetching Jobicy jobs:", error.message);
    return [];
  }
};

export const fetchAdzunaJobs = async () => {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  
  if (!appId || !appKey) {
    console.log("Adzuna API credentials not configured, skipping");
    return [];
  }
  
  try {
    const response = await axios.get(
      `https://api.adzuna.com/v1/api/jobs/us/search/1`,
      {
        params: {
          app_id: appId,
          app_key: appKey,
          results_per_page: 50,
          what: "software developer engineer",
        },
      }
    );
    
    const jobs = response.data.results || [];
    
    return jobs.map((job) => ({
      externalId: job.id?.toString(),
      source: "adzuna",
      title: job.title || "Untitled Position",
      company: job.company?.display_name || "Unknown Company",
      location: job.location?.display_name || "Unknown",
      url: job.redirect_url || "",
      description: job.description || "",
      tags: job.category?.tag ? [job.category.tag] : [],
      jobType: job.contract_type || null,
      salary: job.salary_min && job.salary_max 
        ? `$${Math.round(job.salary_min)}-${Math.round(job.salary_max)}` 
        : null,
      postedAt: safeParseDate(job.created),
    }));
  } catch (error) {
    console.error("Error fetching Adzuna jobs:", error.message);
    return [];
  }
};

// ... existing imports ...

export const fetchRemotiveJobs = async () => {
    try {
        const response = await axios.get("https://remotive.com/api/remote-jobs", {
            headers: BROWSER_HEADERS,
            params: { category: "software-dev", limit: 50 },
            timeout: 10000
        });
        const jobs = response.data.jobs || [];
        return jobs.slice(0, 50).map(job => ({
            externalId: job.id?.toString(),
            source: "remotive",
            title: job.title,
            company: job.company_name,
            location: job.candidate_required_location || "Remote",
            url: job.url,
            description: job.description, // HTML content
            tags: job.tags || [],
            jobType: job.job_type,
            salary: job.salary || null,
            postedAt: safeParseDate(job.publication_date)
        }));
    } catch (error) {
        console.error("Error fetching Remotive jobs:", error.message);
        return [];
    }
};

export const fetchReedJobs = async () => {
    if (!process.env.REED_API_KEY) {
        console.log("Reed API key not configured, skipping");
        return [];
    }
    try {
        const response = await axios.get("https://www.reed.co.uk/api/1.0/search", {
            auth: { username: process.env.REED_API_KEY, password: "" },
            params: { keywords: "developer", resultsToTake: 50 },
            headers: BROWSER_HEADERS,
            timeout: 10000
        });
        const jobs = response.data.results || [];
        return jobs.map(job => ({
            externalId: job.jobId?.toString(),
            source: "reed",
            title: job.jobTitle,
            company: job.employerName,
            location: job.locationName,
            url: job.jobUrl,
            description: job.jobDescription,
            salary: job.minimumSalary && job.maximumSalary ? `£${job.minimumSalary}-£${job.maximumSalary}` : null,
            jobType: "full-time", 
            postedAt: safeParseDate(job.date),
            tags: []
        }));
    } catch (error) {
        console.error("Error fetching Reed jobs:", error.message);
        return [];
    }
};

export const fetchUSAJobs = async () => {
    if (!process.env.USAJOBS_API_KEY) {
        console.log("USAJobs API key not configured, skipping");
        return [];
    }
    try {
        const response = await axios.get("https://data.usajobs.gov/api/search", {
            headers: {
                "User-Agent": "career-boast-ai", 
                "Authorization-Key": process.env.USAJOBS_API_KEY,
                "Host": "data.usajobs.gov"
            },
            params: { Keyword: "software", ResultsPerPage: 50 },
            timeout: 10000
        });
        const jobs = response.data.SearchResult?.SearchResultItems || [];
        return jobs.map(item => {
            const job = item.MatchedObjectDescriptor;
            return {
                externalId: job.PositionID,
                source: "usajobs",
                title: job.PositionTitle,
                company: job.OrganizationName,
                location: job.PositionLocation?.[0]?.LocationName || "USA",
                url: job.PositionURI,
                description: job.UserArea?.Details?.JobSummary || job.PositionTitle,
                salary: job.PositionRemuneration?.[0]?.MinimumRange ? `$${job.PositionRemuneration[0].MinimumRange}` : null,
                jobType: job.PositionSchedule?.[0]?.Name || "Full Time",
                postedAt: safeParseDate(job.PublicationStartDate),
                tags: []
            };
        });
    } catch (error) {
        console.error("Error fetching USAJobs:", error.message);
        return [];
    }
};

export const fetchAllJobs = async () => {
  console.log("Fetching jobs from all APIs...");
  
  const [remoteOKJobs, jobicyJobs, adzunaJobs, remotiveJobs, reedJobs, usaJobs] = await Promise.all([
    fetchRemoteOKJobs(),
    fetchJobicyJobs(),
    fetchAdzunaJobs(),
    fetchRemotiveJobs(),
    fetchReedJobs(),
    fetchUSAJobs()
  ]);
  
  let allJobs = [
      ...remoteOKJobs, 
      ...jobicyJobs, 
      ...adzunaJobs,
      ...remotiveJobs,
      ...reedJobs,
      ...usaJobs
  ];

  // Fallback: If no jobs were fetched (likely API blocking), use seed data
  if (allJobs.length === 0) {
      console.log("Warning: APIs returned 0 jobs. Using fallback seed data.");
      const seedJobs = [
          {
              externalId: "mock-1",
              source: "seed",
              title: "Senior Frontend Engineer (React)",
              company: "TechCorp Inc.",
              location: "Remote",
              url: "https://example.com/job1",
              description: "We are looking for an experienced React developer to build modern web applications. Experience with Next.js and Tailwind CSS is required.",
              tags: ["react", "javascript", "typescript", "frontend"],
              jobType: "full-time",
              salary: "$120,000-$160,000",
              postedAt: new Date()
          },
          {
              externalId: "mock-2",
              source: "seed",
              title: "Backend Developer (Node.js)",
              company: "API Solutions",
              location: "New York, NY",
              url: "https://example.com/job2",
              description: "Join our backend team to build scalable microservices using Node.js, Express, and PostgreSQL. Experience with Docker and AWS is a plus.",
              tags: ["node.js", "backend", "postgresql", "aws"],
              jobType: "full-time",
              salary: "$130,000-$170,000",
              postedAt: new Date()
          },
          {
               externalId: "mock-3",
               source: "seed",
               title: "Full Stack Engineer",
               company: "StartupXYZ",
               location: "Remote",
               url: "https://example.com/job3",
               description: "Looking for a generalist who can work on both frontend (React) and backend (Python/Django).",
               tags: ["python", "react", "fullstack", "django"],
               jobType: "contract",
               salary: "$60-$90/hr",
               postedAt: new Date()
          }
      ];
      allJobs = seedJobs;
  }
  
  console.log(`Fetched ${allJobs.length} jobs total (including seeds)`);
  console.log(`  RemoteOK: ${remoteOKJobs.length}`);
  console.log(`  Jobicy: ${jobicyJobs.length}`);
  console.log(`  Adzuna: ${adzunaJobs.length}`);
  
  return allJobs;
};

export default {
  fetchRemoteOKJobs,
  fetchJobicyJobs,
  fetchAdzunaJobs,
  fetchRemotiveJobs,
  fetchReedJobs,
  fetchUSAJobs,
  fetchAllJobs,
};
