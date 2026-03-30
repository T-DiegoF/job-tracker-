import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Job } from '@/types/job';

interface JobCardProps extends Job {}

const SOURCE_STYLES: Record<string, { glow: string; label: string; color: string; domain: string }> = {
  Bumeran:      { glow: '#7c6fff', color: '#7c6fff', label: 'BU', domain: 'bumeran.com.ar' },
  ZonaJobs:     { glow: '#ff6b9d', color: '#ff6b9d', label: 'ZJ', domain: 'zonajobs.com.ar' },
  Computrabajo: { glow: '#06d6c7', color: '#06d6c7', label: 'CT', domain: 'computrabajo.com.ar' },
};

const MODALITY_STYLES: Record<string, { color: string; icon: string }> = {
  Remoto:     { color: '#06d6c7', icon: '⌂' },
  Híbrido:    { color: '#7c6fff', icon: '⇄' },
  Presencial: { color: '#ffd166', icon: '⊞' },
};


const JobCard: React.FC<JobCardProps> = ({
  _id, title, company, location, source, url, salary, jobType, modality, description,
}) => {
  const [logoError, setLogoError] = useState(false);
  const router = useRouter();

  const handleClick = () => router.push(`/job/${encodeURIComponent(_id || url)}`);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') handleClick();
  };

  const src = SOURCE_STYLES[source] ?? { glow: '#9ba3c9', color: '#9ba3c9', label: source?.slice(0, 2).toUpperCase(), domain: '' };
  const mod = modality ? MODALITY_STYLES[modality] ?? { color: '#9ba3c9', icon: '○' } : null;

  const logoUrl = src.domain
    ? `https://www.google.com/s2/favicons?domain=${src.domain}&sz=64`
    : '';
  const initials = source.slice(0, 2).toUpperCase();

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="card"
      aria-label={`Ver oferta: ${title} en ${company}`}
    >
      {/* Top accent line */}
      <div className="accent-line" style={{ background: `linear-gradient(90deg, ${src.color}, transparent)` }} />

      <div className="card-body">
        {/* Header row */}
        <div className="card-header">
          {/* Company logo */}
          <div className="logo-wrap" style={{ borderColor: `${src.color}30` }}>
            {logoError ? (
              <span className="logo-initials" style={{ color: src.color }}>{initials}</span>
            ) : (
              <img
                src={logoUrl}
                alt={company}
                className="logo-img"
                onError={() => setLogoError(true)}
              />
            )}
          </div>

          <div className="source-badge" style={{
            background: `${src.color}18`,
            border: `1px solid ${src.color}40`,
            color: src.color,
            boxShadow: `0 0 12px ${src.color}20`,
          }}>
            {src.label}
          </div>
          {mod && (
            <div className="modality-badge" style={{ color: mod.color, borderColor: `${mod.color}35`, background: `${mod.color}10` }}>
              {mod.icon} {modality}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="title">{title}</div>
        <div className="company">{company}</div>

        {/* Tags */}
        <div className="tags">
          {location && <span className="tag">{location}</span>}
          {jobType  && <span className="tag">{jobType}</span>}
          {salary   && <span className="tag salary">{salary}</span>}
        </div>

        {description && (
          <p className="description">{description.substring(0, 110)}…</p>
        )}

        {/* Footer */}
        <div className="card-footer">
          <span className="view-link">Ver oferta →</span>
        </div>
      </div>

      <style jsx>{`
        .card {
          position: relative;
          background: var(--glass);
          backdrop-filter: var(--blur);
          -webkit-backdrop-filter: var(--blur);
          border: 1px solid var(--border);
          border-radius: 16px;
          cursor: pointer;
          text-align: left;
          width: 100%;
          padding: 0;
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
          overflow: hidden;
        }
        .card:hover {
          transform: translateY(-4px) scale(1.01);
          border-color: var(--border-h);
          box-shadow:
            0 20px 60px rgba(0,0,0,0.5),
            0 0 0 1px rgba(255,255,255,0.1),
            inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .accent-line {
          height: 2px;
          width: 100%;
        }
        .card-body {
          padding: 18px 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 2px;
        }
        .logo-wrap {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid;
          background: rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .logo-img {
          width: 28px;
          height: 28px;
          object-fit: contain;
          border-radius: 4px;
        }
        .logo-initials {
          font-size: 12px;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.5px;
        }
        .source-badge {
          font-size: 10px;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          padding: 3px 8px;
          border-radius: 6px;
          letter-spacing: 1px;
        }
        .modality-badge {
          font-size: 11px;
          font-weight: 500;
          padding: 3px 9px;
          border-radius: 20px;
          border: 1px solid;
          margin-left: auto;
        }
        .title {
          font-weight: 600;
          font-size: 15px;
          color: var(--text);
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .company {
          font-size: 13px;
          font-weight: 500;
          color: var(--neon-a);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        .tag {
          font-size: 11px;
          font-weight: 400;
          padding: 3px 9px;
          border-radius: 20px;
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.03);
          color: var(--text-mid);
          white-space: nowrap;
        }
        .salary {
          color: var(--neon-d);
          border-color: rgba(255,209,102,0.25);
          background: rgba(255,209,102,0.06);
        }
        .description {
          font-size: 12px;
          color: var(--text-dim);
          line-height: 1.5;
          font-weight: 300;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .card-footer {
          margin-top: 4px;
          padding-top: 10px;
          border-top: 1px solid var(--border);
        }
        .view-link {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-dim);
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.3px;
          transition: color 0.2s;
        }
        .card:hover .view-link {
          color: var(--neon-b);
        }
      `}</style>
    </button>
  );
};

export default JobCard;
