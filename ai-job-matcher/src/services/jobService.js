import axios from "axios";
import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser();

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

export const fetchWeWorkRemotelyJobs = async () => {
    try {
        const response = await axios.get("https://weworkremotely.com/remote-jobs.rss", {
            headers: BROWSER_HEADERS,
            timeout: 10000
        });

        const feed = parser.parse(response.data);
        const items = feed.rss?.channel?.item || [];
        
        // Ensure items is an array (might be single object if only one item)
        const jobs = Array.isArray(items) ? items : [items];

        return jobs.map(job => {
            // WWR RSS feed structure:
            // title: "Company Name: Job Title" or just "Job Title"
            // link: url
            // description: html content
            // pubDate: date string
            // guid: unique id url
            
            // Try to extract company from title if possible
            let title = job.title;
            let company = "We Work Remotely";
            
            if (title && title.includes(":")) {
                const parts = title.split(":");
                company = parts[0].trim();
                title = parts.slice(1).join(":").trim();
            }

            return {
                externalId: job.guid || job.link,
                source: "weworkremotely",
                title: title || "Untitled",
                company: company,
                location: "Remote", // WWR RSS doesn't always provide location in a standard field
                url: job.link,
                description: job.description || "",
                tags: [], // Tags not easily available in RSS summary
                jobType: "remote",
                salary: null, // Salary rare in RSS
                postedAt: safeParseDate(job.pubDate)
            };
        }).slice(0, 50);

    } catch (error) {
        console.error("Error fetching We Work Remotely jobs:", error.message);
        return [];
    }
};

export const fetchAllJobs = async () => {
  console.log("Fetching jobs from RemoteOK and We Work Remotely...");
  
  const [remoteOKJobs, wwrJobs] = await Promise.all([
    fetchRemoteOKJobs(),
    fetchWeWorkRemotelyJobs()
  ]);
  
  let allJobs = [...remoteOKJobs, ...wwrJobs];

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
  console.log(`  We Work Remotely: ${wwrJobs.length}`);
  
  return allJobs;
};

export default {
  fetchRemoteOKJobs,
  fetchWeWorkRemotelyJobs,
  fetchAllJobs,
};
