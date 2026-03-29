import React from 'react';
import { Job } from '@/types/job';

interface JobCardProps extends Job {}

const SOURCE_COLORS: Record<string, { bg: string; color: string }> = {
  Bumeran:      { bg: '#dbe4ff', color: '#3b5bdb' },
  ZonaJobs:     { bg: '#ffe0eb', color: '#c2255c' },
  Computrabajo: { bg: '#d3f9d8', color: '#2f9e44' },
};

const MODALITY_COLORS: Record<string, { bg: string; color: string }> = {
  Remoto:   { bg: '#fff3e0', color: '#e67700' },
  Híbrido:  { bg: '#f3f0ff', color: '#7950f2' },
  Presencial: { bg: '#f8f9fa', color: '#495057' },
};

const JobCard: React.FC<JobCardProps> = ({
  title, company, location, source, url, salary, jobType, modality, description,
}) => {
  const handleClick = () => window.open(url, '_blank');
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') handleClick();
  };

  const srcColor = SOURCE_COLORS[source] ?? { bg: '#f0f0f0', color: '#555' };

  return (
    <button onClick={handleClick} onKeyDown={handleKeyDown} className="card" aria-label={`Apply to ${title} at ${company}`}>
      <div className="title">{title}</div>
      <div className="company">{company}</div>

      <div className="meta">
        {location && <span className="badge location">📍 {location}</span>}
        {modality  && (() => {
          const mc = MODALITY_COLORS[modality] ?? { bg: '#f0f0f0', color: '#555' };
          const icon = modality === 'Remoto' ? '🏠' : modality === 'Híbrido' ? '🔀' : '🏢';
          return <span className="badge" style={{ background: mc.bg, color: mc.color, fontWeight: 600 }}>{icon} {modality}</span>;
        })()}
        {jobType   && <span className="badge jobtype">{jobType}</span>}
        {salary    && <span className="badge salary">💰 {salary}</span>}
        <span
          className="badge source"
          style={{ background: srcColor.bg, color: srcColor.color }}
        >
          {source}
        </span>
      </div>

      {description && <p className="description">{description.substring(0, 120)}...</p>}

      <style jsx>{`
        .card {
          background: linear-gradient(135deg, #f5f7fa 0%, #fff 100%);
          padding: 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid #e0e4e8;
          text-align: left;
          width: 100%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.12);
          border-color: #3b5bdb;
        }
        .title {
          font-weight: 600;
          font-size: 16px;
          color: #1a1a1a;
          margin-bottom: 6px;
          line-height: 1.3;
        }
        .company {
          color: #3b5bdb;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 10px;
        }
        .meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 10px;
        }
        .badge {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 6px;
          background: #f0f0f0;
          color: #333;
          white-space: nowrap;
        }
        .location { background: #e8f4f8; color: #0066cc; }
        .jobtype  { background: #f0e8f8; color: #6600cc; }
        .salary   { background: #f0f8e8; color: #00aa00; }
        .source   { margin-left: auto; font-weight: 600; }
        .description {
          font-size: 13px;
          color: #666;
          margin: 10px 0 0;
          line-height: 1.4;
        }
      `}</style>
    </button>
  );
};

export default JobCard;
