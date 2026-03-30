import React, { useEffect, useState, useCallback } from 'react';
import JobCard from './JobCard';
import { Job } from '@/types/job';

const SOURCES = ['Bumeran', 'ZonaJobs', 'Computrabajo'];

const SOURCE_COLORS: Record<string, string> = {
  Bumeran:      '#7c6fff',
  ZonaJobs:     '#ff6b9d',
  Computrabajo: '#06d6c7',
};

const MODALITIES = [
  { mode: 'Remoto',     icon: '⌂', color: '#06d6c7' },
  { mode: 'Híbrido',    icon: '⇄', color: '#7c6fff' },
  { mode: 'Presencial', icon: '⊞', color: '#ffd166' },
];

const JobGrid: React.FC = () => {
  const [jobs, setJobs]                             = useState<Job[]>([]);
  const [loading, setLoading]                       = useState(false);
  const [scraping, setScraping]                     = useState(false);
  const [searchTerm, setSearchTerm]                 = useState('');
  const [selectedSources, setSelectedSources]       = useState<string[]>([]);
  const [selectedModalities, setSelectedModalities] = useState<string[]>(['Remoto']);
  const [error, setError]                           = useState('');
  const [scrapeMsg, setScrapeMsg]                   = useState('');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim())         params.set('search',   searchTerm.trim());
      if (selectedSources.length)    params.set('source',   selectedSources.join(','));
      if (selectedModalities.length) params.set('modality', selectedModalities.join(','));
      const res = await fetch(`/api/jobs${params.toString() ? '?' + params : ''}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch {
      setError('No se pudieron cargar las ofertas.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedSources, selectedModalities]);

  const handleScrape = async () => {
    setScraping(true);
    setScrapeMsg('');
    setError('');
    try {
      const keyword = searchTerm.trim() || 'node';
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: [keyword] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en scraping');
      setScrapeMsg(data.message || 'Scraping completado');
      await fetchJobs();
    } catch (err: any) {
      setError(err.message || 'Error durante el scraping');
    } finally {
      setScraping(false);
    }
  };

  const toggleSource   = (s: string) => setSelectedSources(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const toggleModality = (m: string) => setSelectedModalities(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m]);

  useEffect(() => {
    const t = setTimeout(fetchJobs, 400);
    return () => clearTimeout(t);
  }, [fetchJobs]);

  const isDefault  = selectedSources.length === 0 && selectedModalities.length === 1 && selectedModalities[0] === 'Remoto';
  const hasFilters = !isDefault;

  return (
    <div className="container">

      {/* Search + action */}
      <div className="top-bar">
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Buscar por título, empresa o descripción…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-x" onClick={() => setSearchTerm('')}>×</button>
          )}
        </div>
        <button onClick={handleScrape} disabled={scraping} className="scrape-btn">
          {scraping
            ? <><span className="spinner" /> Buscando…</>
            : <>↻ Buscar ofertas</>
          }
        </button>
      </div>

      {/* Filters panel */}
      <div className="filters-panel">
        <div className="filter-group">
          <span className="filter-label">Fuente</span>
          <div className="filter-pills">
            {SOURCES.map(source => {
              const active = selectedSources.includes(source);
              const color  = SOURCE_COLORS[source];
              return (
                <button
                  key={source}
                  onClick={() => toggleSource(source)}
                  className="pill"
                  style={{
                    borderColor: active ? color : 'rgba(255,255,255,0.08)',
                    color:       active ? color : 'var(--text-mid)',
                    background:  active ? `${color}12` : 'rgba(255,255,255,0.02)',
                    boxShadow:   active ? `0 0 14px ${color}25` : 'none',
                  }}
                >
                  <span className="pill-dot" style={{ background: color, boxShadow: active ? `0 0 6px ${color}` : 'none' }} />
                  {source}
                </button>
              );
            })}
          </div>
        </div>

        <div className="filter-divider" />

        <div className="filter-group">
          <span className="filter-label">Modalidad</span>
          <div className="filter-pills">
            {MODALITIES.map(({ mode, icon, color }) => {
              const active = selectedModalities.includes(mode);
              return (
                <button
                  key={mode}
                  onClick={() => toggleModality(mode)}
                  className="pill"
                  style={{
                    borderColor: active ? color : 'rgba(255,255,255,0.08)',
                    color:       active ? color : 'var(--text-mid)',
                    background:  active ? `${color}12` : 'rgba(255,255,255,0.02)',
                    boxShadow:   active ? `0 0 14px ${color}25` : 'none',
                  }}
                >
                  {icon} {mode}
                </button>
              );
            })}
            <button
              onClick={() => setSelectedModalities([])}
              className="pill"
              style={{
                borderColor: selectedModalities.length === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)',
                color:       selectedModalities.length === 0 ? 'var(--text)'           : 'var(--text-mid)',
                background:  selectedModalities.length === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
              }}
            >
              ◎ Todas
            </button>
          </div>
        </div>

        {hasFilters && (
          <button
            className="reset-btn"
            onClick={() => { setSelectedSources([]); setSelectedModalities(['Remoto']); }}
          >
            × Restablecer
          </button>
        )}
      </div>

      {/* Messages */}
      {scrapeMsg && <div className="msg success">{scrapeMsg}</div>}
      {error     && <div className="msg error">{error}</div>}

      {/* Content */}
      {loading && (
        <div className="state-center">
          <div className="loader">
            <div className="loader-ring" />
            <div className="loader-ring" style={{ animationDelay: '-0.3s', width: '48px', height: '48px' }} />
            <div className="loader-ring" style={{ animationDelay: '-0.6s', width: '32px', height: '32px' }} />
          </div>
          <p className="state-text">Cargando ofertas…</p>
        </div>
      )}
      {!loading && jobs.length === 0 && (
        <div className="state-center">
          <div className="empty-glyph">◈</div>
          <p className="state-text">Sin resultados</p>
          <p className="state-sub">Haz clic en «Buscar ofertas» para obtener resultados</p>
        </div>
      )}
      {!loading && jobs.length > 0 && (
        <>
          <div className="results-bar">
            <span className="results-num">{jobs.length}</span>
            <span className="results-label"> oferta{jobs.length === 1 ? '' : 's'}</span>
            {selectedSources.length > 0    && <span className="results-tag">{selectedSources.join(' · ')}</span>}
            {selectedModalities.length > 0 && <span className="results-tag">{selectedModalities.join(' · ')}</span>}
            {searchTerm                    && <span className="results-tag">"{searchTerm}"</span>}
          </div>
          <div className="grid">
            {jobs.map(job => (
              <JobCard key={job.url || job._id} {...job} />
            ))}
          </div>
        </>
      )}

      <style jsx>{`
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 28px 32px 60px;
        }

        /* Search */
        .top-bar {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
          align-items: center;
        }
        .search-wrap {
          flex: 1;
          min-width: 260px;
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 16px;
          font-size: 20px;
          color: var(--text-dim);
          pointer-events: none;
          line-height: 1;
          z-index: 1;
        }
        .search-input {
          width: 100%;
          padding: 13px 44px 13px 46px;
          background: var(--glass);
          backdrop-filter: var(--blur);
          -webkit-backdrop-filter: var(--blur);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--text);
          font-size: 14px;
          font-weight: 400;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .search-input::placeholder { color: var(--text-dim); }
        .search-input:focus {
          outline: none;
          border-color: rgba(124,111,255,0.5);
          box-shadow: 0 0 0 3px rgba(124,111,255,0.1), 0 0 30px rgba(124,111,255,0.08);
        }
        .clear-x {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          color: var(--text-dim);
          font-size: 18px;
          cursor: pointer;
          line-height: 1;
          padding: 2px 4px;
          transition: color 0.15s;
        }
        .clear-x:hover { color: var(--text); }

        .scrape-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 13px 26px;
          background: linear-gradient(135deg, #7c6fff 0%, #5b4fd4 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          box-shadow: 0 4px 24px rgba(124,111,255,0.35);
          letter-spacing: 0.2px;
        }
        .scrape-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(124,111,255,0.5);
          background: linear-gradient(135deg, #9080ff 0%, #7060e8 100%);
        }
        .scrape-btn:active:not(:disabled) { transform: translateY(0); }
        .scrape-btn:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }

        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: #fff;
          border-radius: 50%;
          display: inline-block;
          animation: spin 0.65s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Filters */
        .filters-panel {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 24px;
          padding: 16px 20px;
          background: var(--glass);
          backdrop-filter: var(--blur);
          -webkit-backdrop-filter: var(--blur);
          border: 1px solid var(--border);
          border-radius: 14px;
        }
        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .filter-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--text-dim);
          font-family: 'JetBrains Mono', monospace;
          margin-right: 2px;
        }
        .filter-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 13px;
          border-radius: 99px;
          border: 1px solid;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.1px;
        }
        .pill:hover { filter: brightness(1.2); }
        .pill-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .filter-divider {
          width: 1px; height: 32px;
          background: var(--border);
          flex-shrink: 0;
        }
        .reset-btn {
          margin-left: auto;
          padding: 5px 13px;
          border-radius: 99px;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent;
          color: var(--text-dim);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .reset-btn:hover { color: var(--text); border-color: rgba(255,255,255,0.2); }

        /* Messages */
        .msg {
          padding: 11px 18px;
          border-radius: 10px;
          margin-bottom: 18px;
          font-size: 13px;
          font-weight: 500;
          backdrop-filter: var(--blur);
        }
        .success { background: rgba(6,214,199,0.08);  color: #06d6c7; border: 1px solid rgba(6,214,199,0.2); }
        .error   { background: rgba(255,107,157,0.08); color: #ff6b9d; border: 1px solid rgba(255,107,157,0.2); }

        /* States */
        .state-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 100px 20px;
          gap: 14px;
        }
        .loader {
          position: relative;
          width: 64px; height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }
        .loader-ring {
          position: absolute;
          width: 64px; height: 64px;
          border: 2px solid transparent;
          border-top-color: var(--neon-a);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        .state-text { font-size: 15px; font-weight: 500; color: var(--text-mid); }
        .state-sub  { font-size: 13px; color: var(--text-dim); margin-top: -6px; }
        .empty-glyph {
          font-size: 48px;
          color: var(--text-dim);
          line-height: 1;
          filter: drop-shadow(0 0 16px rgba(124,111,255,0.3));
        }

        /* Results bar */
        .results-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .results-num {
          font-size: 20px;
          font-weight: 800;
          background: linear-gradient(90deg, var(--neon-a), var(--neon-b));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .results-label { font-size: 14px; color: var(--text-mid); font-weight: 400; }
        .results-tag {
          padding: 2px 10px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: var(--glass);
          font-size: 11px;
          color: var(--text-mid);
          font-family: 'JetBrains Mono', monospace;
        }

        /* Grid */
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 14px;
        }

        @media (max-width: 640px) {
          .container { padding: 16px 16px 40px; }
          .filters-panel { padding: 12px 14px; }
        }
      `}</style>
    </div>
  );
};

export default JobGrid;
