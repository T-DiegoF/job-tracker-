export interface Job {
  _id?: string;
  title: string;
  company: string;
  location?: string;
  description?: string;
  source: string;
  url: string;
  salary?: string;
  jobType?: string;
  modality?: string;
  postedDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}