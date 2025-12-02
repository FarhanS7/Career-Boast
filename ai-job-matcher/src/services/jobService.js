import axios from "axios";

export const fetchRemoteOKJobs = async () => {
  try {
    const response = await axios.get("https://remoteok.com/api", {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CareerBoost/1.0)",
      },
    });
    
    const jobs = response.data.slice(1, 51);
    
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
      postedAt: job.date ? new Date(job.date * 1000) : null,
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
      postedAt: job.pubDate ? new Date(job.pubDate) : null,
    }));
  } catch (error) {
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
      postedAt: job.created ? new Date(job.created) : null,
    }));
  } catch (error) {
    console.error("Error fetching Adzuna jobs:", error.message);
    return [];
  }
};

export const fetchAllJobs = async () => {
  console.log("Fetching jobs from all APIs...");
  
  const [remoteOKJobs, jobicyJobs, adzunaJobs] = await Promise.all([
    fetchRemoteOKJobs(),
    fetchJobicyJobs(),
    fetchAdzunaJobs(),
  ]);
  
  const allJobs = [...remoteOKJobs, ...jobicyJobs, ...adzunaJobs];
  
  console.log(`Fetched ${allJobs.length} jobs total`);
  console.log(`  RemoteOK: ${remoteOKJobs.length}`);
  console.log(`  Jobicy: ${jobicyJobs.length}`);
  console.log(`  Adzuna: ${adzunaJobs.length}`);
  
  return allJobs;
};

export default {
  fetchRemoteOKJobs,
  fetchJobicyJobs,
  fetchAdzunaJobs,
  fetchAllJobs,
};
