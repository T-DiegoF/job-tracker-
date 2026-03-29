import { NextApiRequest, NextApiResponse } from 'next';
import { getJobs, searchJobs, connectDB } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { search, source, modality } = req.query;

    // Filtro por fuente (Bumeran, Computrabajo o combinaciones)
    const extraFilter: any = {};
    if (source && source !== 'all') {
      const sources = (source as string).split(',').map((s) => s.trim());
      extraFilter.source = { $in: sources };
    }

    // Filtro por modalidad: "Remoto", "Híbrido", "Presencial"
    if (modality) {
      const modes = (modality as string).split(',').map((m) => m.trim());
      const onlyRemoto = modes.includes('Remoto') && !modes.includes('Híbrido');
      const orConditions: any[] = [];

      for (const mode of modes) {
        if (/remot/i.test(mode)) {
          orConditions.push({ modality: { $regex: 'remot|home.?office', $options: 'i' } });
        } else if (/h[ií]brid/i.test(mode)) {
          orConditions.push({ modality: { $regex: 'h[ií]brid', $options: 'i' } });
        } else if (/presencial/i.test(mode)) {
          orConditions.push({ modality: { $regex: 'presencial|on.?site|oficina', $options: 'i' } });
        }
      }

      if (orConditions.length > 0) {
        // Si solo Remoto: combinar con exclusión explícita de híbridos via $and
        if (onlyRemoto) {
          extraFilter.$and = [
            { $or: orConditions },
            { modality: { $not: { $regex: 'h[ií]brid', $options: 'i' } } },
          ];
        } else {
          extraFilter.$or = orConditions;
        }
      }
    }

    let jobs;
    if (search && (search as string).trim()) {
      jobs = await searchJobs(search as string, extraFilter);
    } else {
      jobs = await getJobs(extraFilter);
    }

    return res.status(200).json({ jobs, total: jobs.length });
  } catch (error: any) {
    console.error('Error en /api/jobs:', error);
    return res.status(500).json({ error: error.message || 'Error fetching jobs' });
  }
}
