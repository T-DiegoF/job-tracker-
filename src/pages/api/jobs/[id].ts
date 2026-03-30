import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { JobModel, connectDB } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' });

  try {
    await connectDB();

    let job = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      job = await JobModel.findById(id).lean();
    }
    if (!job) {
      job = await JobModel.findOne({ url: decodeURIComponent(id) }).lean();
    }
    if (!job) return res.status(404).json({ error: 'Job not found' });

    return res.status(200).json({ job });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
