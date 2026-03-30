import React from 'react';
import { Job } from '@/types/job';

interface JobCardProps extends Job {}

const SOURCE_STYLES: Record<string, { color: string; label: string }> = {
  Bumeran:      { color: '#6c8dfa', label: 'BU' },
  ZonaJobs:     { color: '#f472b6', label: 'ZJ' },
  Computrabajo: { color: '#34d399', label: 'CT' },
};

const MODALITY_STYLES: Record<string, { color: string; icon: string }> = {
  Remoto:     { color: '#34d399', icon: '⌂' },
  Híbrido:    { color: '#a78bfa', icon: '⇄' },
  Presencial: { color: '#fb923c', icon: '⊞' },
};

const JobCard: React.FC<JobCardProps> = ({
  title, company, location, source, url, salary, jobType, modality, description,
}) => {
  const handleClick = () => window.open(url, '_blank');
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') handleClick();
  };

  const src = SOURCE_STYLES[source] ?? { color: '#7a809a', label: source?.slice(0, 2).toUpperCase() };
  const mod = modality ? MODALITY_STYLES[modality] ?? { color: '#7a809a', icon: '○' } : null;

  return (
    <button onClick={handleClick} onKeyDown={handleKeyDown} className="card" aria-label={`Ver oferta: ${title} en ${company}`}>
      <div className="card-inner">
        {/* Source dot */}
        <div className="source-dot" style={{ background: src.color }} title={source}>
          {src.label}
        </div>

        <div className="content">
          <div className="title">{title}</div>
          <div className="company">{company}</div>

          <div className="meta">
            {modality && mod && (
              <span className="tag" style={{ color: mod.color, borderColor: `${mod.color}33`, background: `${mod.color}11` }}>
                {mod.icon} {modality}
              </span>
            )}
            {location && (
              <span className="tag location">{location}</span>
            )}
            {jobType && (
              <span className="tag">{jobType}</span>
            )}
            {salary && (
              <span className="tag salary">{salary}</span>
            )}
          </div>

          {description && (
            <p className="description">{description.substring(0, 110)}…</p>
          )}
        </div>
      </div>

      <style jsx>{`
        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          cursor: pointer;
          text-align: left;
          width: 100%;
          padding: 0;
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
          position: relative;
          overflow: hidden;
        }
        .card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 60%, rgba(108,141,250,0.04) 100%);
          pointer-events: none;
        }
        .card:hover {
          border-color: var(--accent);
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px var(--accent);
        }
        .card-inner {
          display: flex;
          gap: 14px;
          padding: 18px;
        }
        .source-dot {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 800;
          color: #0d0f14;
          flex-shrink: 0;
          letter-spacing: 0.5px;
          font-family: 'Syne', sans-serif;
        }
        .content { flex: 1; min-width: 0; }
        .title {
          font-weight: 600;
          font-size: 15px;
          color: var(--text);
          margin-bottom: 3px;
          line-height: 1.35;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .company {
          color: var(--accent);
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 10px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 10px;
        }
        .tag {
          font-size: 11px;
          font-weight: 500;
          padding: 3px 9px;
          border-radius: 20px;
          border: 1px solid var(--border);
          background: var(--surface2);
          color: var(--text-muted);
          white-space: nowrap;
          letter-spacing: 0.2px;
        }
        .location { color: var(--text-muted); }
        .salary   { color: var(--green); border-color: #34d39933; background: #34d39911; }
        .description {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.5;
          font-weight: 300;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </button>
  );
};

export default JobCard;
