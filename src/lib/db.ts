import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: String,
    description: String,
    source: { type: String, default: 'Bumeran' },
    url: { type: String, unique: true, required: true },
    salary: String,
    jobType: String,
    modality: String,
    postedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export interface IJob extends mongoose.Document {
  title: string;
  company: string;
  location?: string;
  description?: string;
  source: string;
  url: string;
  salary?: string;
  jobType?: string;
  modality?: string;
  postedDate: Date;
}

export const JobModel = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);

// In-memory fallback database
let inMemoryJobs: Map<string, any> = new Map();
let mongoConnected = false;

export async function connectDB() {
  try {
    if (mongoose.connection.readyState === 1) {
      mongoConnected = true;
      return;
    }

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobs-scraper';

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    mongoConnected = true;
    console.log('✓ MongoDB conectado');
  } catch (error) {
    console.warn('⚠️ MongoDB no disponible, usando base de datos en memoria');
    mongoConnected = false;
  }
}

export async function saveJob(jobData: Partial<IJob>) {
  try {
    if (!mongoConnected) {
      if (jobData.url) {
        inMemoryJobs.set(jobData.url, {
          ...jobData,
          _id: jobData.url,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      return;
    }

    const job = new JobModel(jobData);
    await job.save();
  } catch (error: any) {
    if (error.code === 11000) {
      // Duplicate key - ignorar
      return;
    }
    // Fallback a memoria si MongoDB falla
    if (jobData.url) {
      inMemoryJobs.set(jobData.url, {
        ...jobData,
        _id: jobData.url,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }
}

export async function getJobs(filter: any = {}) {
  try {
    if (!mongoConnected) {
      const jobs = Array.from(inMemoryJobs.values());
      return applyInMemoryFilter(jobs, filter);
    }
    return await JobModel.find(filter).sort({ postedDate: -1 }).limit(200).lean();
  } catch (error) {
    const jobs = Array.from(inMemoryJobs.values());
    return applyInMemoryFilter(jobs, filter);
  }
}

export async function searchJobs(searchTerm: string, extraFilter: any = {}) {
  try {
    const searchRegex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    if (!mongoConnected) {
      const jobs = Array.from(inMemoryJobs.values());
      return jobs.filter(
        (job) =>
          searchRegex.test(job.title) ||
          searchRegex.test(job.description || '') ||
          searchRegex.test(job.company || '')
      );
    }

    const searchOr = [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { company: { $regex: searchTerm, $options: 'i' } },
    ];

    const { $or: extraOr, ...restFilter } = extraFilter;
    const mongoFilter: any = { ...restFilter };

    if (extraOr) {
      mongoFilter.$and = [{ $or: extraOr }, { $or: searchOr }];
    } else {
      mongoFilter.$or = searchOr;
    }

    return await JobModel.find(mongoFilter).sort({ postedDate: -1 }).limit(200).lean();
  } catch (error) {
    console.error('Error buscando jobs:', error);
    return [];
  }
}

function applyInMemoryFilter(jobs: any[], filter: any): any[] {
  if (!filter || Object.keys(filter).length === 0) return jobs;

  return jobs.filter((job) => {
    for (const [key, value] of Object.entries(filter)) {
      if (key === '$or') {
        // Soporte básico para $or
        const orConditions = value as any[];
        const matches = orConditions.some((condition) => {
          return Object.entries(condition).every(([field, fieldFilter]: [string, any]) => {
            const jobVal = job[field] || '';
            if (fieldFilter.$regex) {
              return new RegExp(fieldFilter.$regex, fieldFilter.$options || '').test(jobVal);
            }
            return jobVal === fieldFilter;
          });
        });
        if (!matches) return false;
      } else if (typeof value === 'object' && value !== null && '$in' in (value as any)) {
        if (!(value as any).$in.includes(job[key])) return false;
      } else {
        if (job[key] !== value) return false;
      }
    }
    return true;
  });
}
