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

    // Filtro por modalidad: "Remoto", "Híbrido", o ambos
    if (modality) {
      const modes = (modality as string).split(',').map((m) => m.trim());
      // Para datos nuevos usamos el campo modality (exacto de la API).
      // Para datos viejos sin campo modality, solo usamos la URL como fallback
      // (más confiable que la descripción, que puede mencionar "remoto" en cualquier contexto).
      const orConditions: any[] = [];
      for (const mode of modes) {
        // Match exacto del campo modality guardado
        orConditions.push({ modality: { $regex: `^${mode}$`, $options: 'i' } });
        // Fallback para registros viejos sin campo modality: solo URL para Remoto
        if (/remot/i.test(mode)) {
          orConditions.push({
            modality: { $exists: false },
            url: { $regex: 'remot', $options: 'i' },
          });
          orConditions.push({
            modality: '',
            url: { $regex: 'remot', $options: 'i' },
          });
        }
      }
      extraFilter.$or = orConditions;
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
