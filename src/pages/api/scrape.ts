import { NextApiRequest, NextApiResponse } from 'next';
import { scrapeAllJobs, closeBrowser } from '../../lib/scraper-playwright';

let isScrapingInProgress = false;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (isScrapingInProgress) {
    return res.status(429).json({ error: 'Scraping ya en progreso, espera que termine.' });
  }

  isScrapingInProgress = true;

  const { keywords } = req.body || {};
  const parsedKeywords: string[] = Array.isArray(keywords) && keywords.length > 0
    ? keywords.map((k: string) => String(k).trim()).filter(Boolean)
    : ['node', 'node.js', 'node js'];

  console.log(`\n🔥 Iniciando scraping: ${parsedKeywords.join(', ')}`);

  try {
    const jobs = await scrapeAllJobs(parsedKeywords);

    return res.status(200).json({
      success: true,
      message: `Scraping completado. ${jobs.length} ofertas encontradas para: ${parsedKeywords.join(', ')}.`,
      jobsCount: jobs.length,
    });
  } catch (error: any) {
    console.error('Error en /api/scrape:', error);
    return res.status(500).json({ error: error.message || 'Scraping failed' });
  } finally {
    isScrapingInProgress = false;
    await closeBrowser();
  }
}
