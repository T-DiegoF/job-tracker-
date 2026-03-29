import { Job } from '../types/job';

// Este archivo es un fallback simple
// El scraping real está en scraper-playwright.ts

export async function scrapeJobs(keywords: string[]): Promise<Job[]> {
  // Fallback: retorna array vacío
  // El scraping real se dispara desde /api/scrape
  console.log('ℹ️ Para scraping, usa POST /api/scrape');
  return [];
}

function filterJobs(allJobs: Job[], keywords: string[]): Job[] {
  return allJobs.filter((job) => {
    const jobTitle = job.title.toLowerCase();
    const jobCompany = job.company.toLowerCase();

    const nodeNestKeywords = ['node', 'nest', 'nodejs', 'nestjs'];
    const hasNodeOrNest = nodeNestKeywords.some(
      (keyword) => jobTitle.includes(keyword) || jobCompany.includes(keyword)
    );

    return hasNodeOrNest;
  });
}
