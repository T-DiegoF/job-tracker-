import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Job } from '@/types/job';

const SOURCE_STYLES: Record<string, { color: string; domain: string }> = {
  Bumeran:      { color: '#7c6fff', domain: 'bumeran.com.ar' },
  ZonaJobs:     { color: '#ff6b9d', domain: 'zonajobs.com.ar' },
  Computrabajo: { color: '#06d6c7', domain: 'computrabajo.com.ar' },
};

const MODALITY_STYLES: Record<string, { color: string; icon: string }> = {
  Remoto:     { color: '#06d6c7', icon: '⌂' },
  Híbrido:    { color: '#7c6fff', icon: '⇄' },
  Presencial: { color: '#ffd166', icon: '⊞' },
};

export default function JobDetail() {
  const router = useRouter();
  const { id, data } = router.query;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Use inline data from navigation if available (avoids API call)
    if (data) {
      try {
        setJob(JSON.parse(data as string));
        setLoading(false);
        return;
      } catch { /* fall through to fetch */ }
    }

    // Fallback: fetch from API (e.g. on page reload)
    setLoading(true);
    fetch(`/api/jobs/${encodeURIComponent(id as string)}`)
      .then(r => r.json())
      .then(d => { setJob(d.job ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id, data]);

  if (loading) return (
    <div className="page-center">
      <div className="loader">
        <div className="ring" />
        <div className="ring" style={{ animationDelay: '-0.3s', width: '48px', height: '48px' }} />
        <div className="ring" style={{ animationDelay: '-0.6s', width: '32px', height: '32px' }} />
      </div>
      <style jsx>{`
        .page-center { display:flex; align-items:center; justify-content:center; min-height:100vh; }
        .loader { position:relative; width:64px; height:64px; display:flex; align-items:center; justify-content:center; }
        .ring { position:absolute; width:64px; height:64px; border:2px solid transparent; border-top-color:#7c6fff; border-radius:50%; animation:spin 1s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );

  if (!job) return (
    <div className="page-center">
      <div style={{ fontSize: '40px', marginBottom: '8px' }}>◈</div>
      <p style={{ color: 'var(--text-mid)', fontSize: '15px', fontWeight: 500 }}>No se pudo cargar la oferta</p>
      <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Podés ver la oferta original directamente en el portal.</p>
      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
        <button onClick={() => router.push('/')} className="back-btn">← Volver al listado</button>
      </div>
      <style jsx>{`
        .page-center { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; gap:10px; text-align:center; padding:20px; }
        .back-btn { padding:10px 20px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--text-mid); cursor:pointer; font-size:13px; transition:all 0.2s; }
        .back-btn:hover { background:rgba(255,255,255,0.08); color:var(--text); }
      `}</style>
    </div>
  );

  const src = SOURCE_STYLES[job.source] ?? { color: '#9ba3c9', domain: '' };
  const mod = job.modality ? MODALITY_STYLES[job.modality] ?? { color: '#9ba3c9', icon: '○' } : null;
  const logoUrl = src.domain ? `https://www.google.com/s2/favicons?domain=${src.domain}&sz=64` : '';

  const linkedinCompanyUrl = `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(job.company)}`;

  // LinkedIn People Search URLs — filtered by company + role + Argentina (geoUrn 103323778)
  const liPeople = (role: string) => {
    const kw = encodeURIComponent('"' + role + '" "' + job.company + '"');
    return 'https://www.linkedin.com/search/results/people/?keywords=' + kw + '&geoUrn=%5B%22103323778%22%5D&origin=FACETED_SEARCH';
  };

  const recruiterLinks = [
    { icon: '🔍', title: 'Recruiter',           sub: 'Personas con rol Recruiter',           url: liPeople('Recruiter') },
    { icon: '🎯', title: 'Talent Acquisition',  sub: 'Personas con rol Talent Acquisition',  url: liPeople('Talent Acquisition') },
    { icon: '🧲', title: 'Technical Recruiter', sub: 'Personas con rol Technical Recruiter', url: liPeople('Technical Recruiter') },
    { icon: '👥', title: 'HRBP / HR Manager',   sub: 'Personas con rol HRBP o HR Manager',   url: liPeople('HRBP') },
    { icon: '🏢', title: 'Página de empresa',   sub: 'Ver ' + job.company + ' en LinkedIn',  url: linkedinCompanyUrl },
  ];

  return (
    <div className="page">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <button onClick={() => router.push('/')} className="back-btn">
            ← Volver
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="logo-wrap" style={{ borderColor: `${src.color}40` }}>
              {logoError || !logoUrl ? (
                <span style={{ color: src.color, fontSize: '12px', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                  {job.source.slice(0, 2).toUpperCase()}
                </span>
              ) : (
                <img src={logoUrl} alt={job.source} className="logo-img" onError={() => setLogoError(true)} />
              )}
            </div>
            <span className="source-label" style={{ color: src.color }}>{job.source}</span>
          </div>
        </div>
      </header>

      <main className="main">
        {/* Job hero */}
        <div className="hero-card" style={{ borderColor: `${src.color}25` }}>
          <div className="accent-top" style={{ background: `linear-gradient(90deg, ${src.color}, transparent)` }} />
          <div className="hero-body">
            <h1 className="job-title">{job.title}</h1>
            <div className="company-row">
              <span className="company-name">{job.company}</span>
              {job.location && <span className="location">· {job.location}</span>}
            </div>

            <div className="badges">
              {mod && (
                <span className="badge" style={{ color: mod.color, borderColor: `${mod.color}40`, background: `${mod.color}12` }}>
                  {mod.icon} {job.modality}
                </span>
              )}
              {job.jobType && <span className="badge">{job.jobType}</span>}
              {job.salary  && <span className="badge salary">{job.salary}</span>}
            </div>

            <div className="actions">
              <a href={job.url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ background: `linear-gradient(135deg, ${src.color}, ${src.color}bb)` }}>
                Ver oferta original →
              </a>
              <a href={recruiterLinks[0].url} target="_blank" rel="noopener noreferrer" className="btn-linkedin">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                Buscar reclutadores
              </a>
            </div>
          </div>
        </div>

        <div className="two-col">
          {/* Description */}
          <div className="glass-card description-card">
            <h2 className="section-title">Descripción del puesto</h2>
            {job.description ? (
              <p className="description-text">{job.description}</p>
            ) : (
              <p className="no-data">No hay descripción disponible para esta oferta.</p>
            )}
          </div>

          {/* Recruiters panel */}
          <div className="glass-card recruiters-card">
            <h2 className="section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#0077b5" style={{ flexShrink: 0 }}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              Reclutadores en {job.company}
            </h2>

            <p className="recruiters-desc">
              Encontrá personas de Talent Acquisition, HR y Recruiting en <strong>{job.company}</strong> directamente en LinkedIn.
            </p>

            <div className="recruiter-links">
              {recruiterLinks.map(link => (
                <a key={link.title} href={link.url} target="_blank" rel="noopener noreferrer" className="recruiter-link">
                  <span className="recruiter-link-icon">{link.icon}</span>
                  <div>
                    <div className="recruiter-link-title">{link.title}</div>
                    <div className="recruiter-link-sub">{link.sub}</div>
                  </div>
                </a>
              ))}
            </div>

            <div className="tip">
              💡 Tip: Conectá con el reclutador antes de aplicar para aumentar tus chances.
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .page { min-height: 100vh; }

        .header {
          position: sticky; top: 0; z-index: 100;
          background: rgba(8,11,26,0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 16px 32px;
        }
        .header-inner {
          max-width: 1100px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
        }
        .back-btn {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          color: var(--text-mid);
          font-size: 13px;
          font-weight: 500;
          padding: 8px 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .back-btn:hover { color: var(--text); border-color: rgba(255,255,255,0.2); }
        .logo-wrap {
          width: 32px; height: 32px;
          border-radius: 7px; border: 1px solid;
          background: rgba(255,255,255,0.05);
          display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .logo-img { width: 24px; height: 24px; object-fit: contain; }
        .source-label { font-size: 13px; font-weight: 600; }

        .main { max-width: 1100px; margin: 0 auto; padding: 32px 32px 60px; }

        /* Hero */
        .hero-card {
          position: relative;
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 24px;
        }
        .accent-top { height: 2px; width: 100%; }
        .hero-body { padding: 28px 32px 32px; }
        .job-title {
          font-family: 'Outfit', sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.5px;
          line-height: 1.2;
          margin-bottom: 10px;
        }
        .company-row { display: flex; align-items: center; gap: 8px; margin-bottom: 18px; }
        .company-name { font-size: 16px; font-weight: 600; color: var(--neon-a); }
        .location { font-size: 14px; color: var(--text-mid); }
        .badges { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
        .badge {
          font-size: 12px; font-weight: 500;
          padding: 5px 12px; border-radius: 99px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: var(--text-mid);
        }
        .salary { color: #ffd166; border-color: rgba(255,209,102,0.3); background: rgba(255,209,102,0.08); }

        .actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .btn-primary {
          display: inline-flex; align-items: center;
          padding: 12px 24px;
          border-radius: 10px; border: none;
          color: #0d0f14; font-weight: 700; font-size: 14px;
          text-decoration: none; cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(124,111,255,0.3);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(124,111,255,0.45); filter: brightness(1.1); }
        .btn-linkedin {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 20px;
          border-radius: 10px;
          border: 1px solid rgba(0,119,181,0.4);
          background: rgba(0,119,181,0.1);
          color: #4da6d4;
          font-weight: 600; font-size: 14px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .btn-linkedin:hover { background: rgba(0,119,181,0.2); border-color: rgba(0,119,181,0.6); transform: translateY(-2px); }

        /* Two column layout */
        .two-col {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 860px) {
          .two-col { grid-template-columns: 1fr; }
        }

        .glass-card {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 24px 28px;
        }
        .section-title {
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 16px;
          letter-spacing: 0.2px;
          display: flex; align-items: center; gap: 8px;
        }
        .description-text {
          font-size: 14px;
          color: var(--text-mid);
          line-height: 1.8;
          white-space: pre-wrap;
          font-weight: 300;
        }
        .no-data { font-size: 14px; color: var(--text-dim); font-style: italic; }

        /* Recruiters */
        .recruiters-desc {
          font-size: 13px; color: var(--text-mid);
          margin-bottom: 16px; line-height: 1.6;
        }
        .recruiters-desc strong { color: var(--text); font-weight: 600; }
        .recruiter-links { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
        .recruiter-link {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
        }
        .recruiter-link:hover {
          background: rgba(0,119,181,0.08);
          border-color: rgba(0,119,181,0.3);
          transform: translateX(4px);
        }
        .company-link:hover {
          background: rgba(124,111,255,0.08);
          border-color: rgba(124,111,255,0.3);
        }
        .recruiter-link-icon { font-size: 20px; flex-shrink: 0; }
        .recruiter-link-title { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 2px; }
        .recruiter-link-sub   { font-size: 11px; color: var(--text-dim); }
        .tip {
          font-size: 12px; color: var(--text-dim);
          padding: 10px 14px;
          background: rgba(255,209,102,0.06);
          border: 1px solid rgba(255,209,102,0.15);
          border-radius: 8px;
          line-height: 1.5;
        }

        @media (max-width: 640px) {
          .main { padding: 20px 16px 40px; }
          .hero-body { padding: 20px; }
          .job-title { font-size: 22px; }
          .header { padding: 14px 16px; }
        }
      `}</style>
    </div>
  );
}
