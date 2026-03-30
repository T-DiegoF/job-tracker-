import React, { useEffect, useState, useCallback } from 'react';
import JobCard from './JobCard';
import { Job } from '@/types/job';

const SOURCES = ['Bumeran', 'ZonaJobs', 'Computrabajo'];

const SOURCE_COLORS: Record<string, string> = {
  Bumeran:      '#6c8dfa',
  ZonaJobs:     '#f472b6',
  Computrabajo: '#34d399',
};

const MODALITIES = [
  { mode: 'Remoto',     icon: '⌂', color: '#34d399' },
  { mode: 'Híbrido',    icon: '⇄', color: '#a78bfa' },
  { mode: 'Presencial', icon: '⊞', color: '#fb923c' },
];

const JobGrid: React.FC = () => {
  const [jobs, setJobs]                         = useState<Job[]>([]);
  const [loading, setLoading]                   = useState(false);
  const [scraping, setScraping]                 = useState(false);
  const [searchTerm, setSearchTerm]             = useState('');
  const [selectedSources, setSelectedSources]   = useState<string[]>([]);
  const [selectedModalities, setSelectedModalities] = useState<string[]>(['Remoto']);
  const [error, setError]                       = useState('');
  const [scrapeMsg, setScrapeMsg]               = useState('');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim())        params.set('search',   searchTerm.trim());
      if (selectedSources.length)   params.set('source',   selectedSources.join(','));
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

      {/* Search bar */}
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
        </div>
        <button onClick={handleScrape} disabled={scraping} className="scrape-btn">
          {scraping
            ? <><span className="spinner" /> Buscando…</>
            : <><span>↻</span> Buscar ofertas</>
          }
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <span className="filter-label">Fuente</span>
          {SOURCES.map(source => {
            const active = selectedSources.includes(source);
            const color  = SOURCE_COLORS[source];
            return (
              <button
                key={source}
                onClick={() => toggleSource(source)}
                className="filter-btn"
                style={{
                  borderColor: active ? color : 'var(--border)',
                  color:       active ? color : 'var(--text-muted)',
                  background:  active ? `${color}15` : 'transparent',
                }}
              >
                <span className="dot" style={{ background: color }} />
                {source}
              </button>
            );
          })}
        </div>

        <div className="filter-sep" />

        <div className="filter-group">
          <span className="filter-label">Modalidad</span>
          {MODALITIES.map(({ mode, icon, color }) => {
            const active = selectedModalities.includes(mode);
            return (
              <button
                key={mode}
                onClick={() => toggleModality(mode)}
                className="filter-btn"
                style={{
                  borderColor: active ? color : 'var(--border)',
                  color:       active ? color : 'var(--text-muted)',
                  background:  active ? `${color}15` : 'transparent',
                }}
              >
                {icon} {mode}
              </button>
            );
          })}
          <button
            onClick={() => setSelectedModalities([])}
            className="filter-btn"
            style={{
              borderColor: selectedModalities.length === 0 ? 'var(--text-muted)' : 'var(--border)',
              color:       selectedModalities.length === 0 ? 'var(--text)' : 'var(--text-muted)',
              background:  selectedModalities.length === 0 ? 'var(--surface2)' : 'transparent',
            }}
          >
            ◎ Todas
          </button>
        </div>

        {hasFilters && (
          <button
            onClick={() => { setSelectedSources([]); setSelectedModalities(['Remoto']); }}
            className="clear-btn"
          >
            × Restablecer
          </button>
        )}
      </div>

      {/* Messages */}
      {scrapeMsg && <div className="msg success">{scrapeMsg}</div>}
      {error     && <div className="msg error">{error}</div>}

      {/* Content */}
      {loading ? (
        <div className="state-view">
          <div className="pulse-ring" />
          <p>Cargando ofertas…</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="state-view empty">
          <div className="empty-icon">◈</div>
          <p>Sin ofertas encontradas</p>
          <p className="empty-sub">Haz clic en «Buscar ofertas» para obtener resultados</p>
        </div>
      ) : (
        <>
          <div className="job-count">
            <span className="count-num">{jobs.length}</span>
            <span> oferta{jobs.length === 1 ? '' : 's'}</span>
            {selectedSources.length > 0 && <span className="count-tag">{selectedSources.join(' · ')}</span>}
            {selectedModalities.length > 0 && <span className="count-tag">{selectedModalities.join(' · ')}</span>}
            {searchTerm && <span className="count-tag">"{searchTerm}"</span>}
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
          padding: 24px 28px 48px;
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
          left: 14px;
          font-size: 18px;
          color: var(--text-muted);
          pointer-events: none;
          line-height: 1;
        }
        .search-input {
          width: 100%;
          padding: 12px 16px 12px 42px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--text);
          font-size: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .search-input::placeholder { color: var(--text-muted); }
        .search-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(108,141,250,0.12);
        }
        .scrape-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: var(--accent);
          color: #0d0f14;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          font-family: 'Syne', sans-serif;
          letter-spacing: 0.3px;
        }
        .scrape-btn:hover:not(:disabled) {
          background: #8aa4ff;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(108,141,250,0.35);
        }
        .scrape-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(0,0,0,0.3);
          border-top-color: #0d0f14;
          border-radius: 50%;
          display: inline-block;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Filters */
        .filters-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 20px;
          padding: 14px 16px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
        }
        .filter-group {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .filter-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-right: 4px;
          font-family: 'Syne', sans-serif;
        }
        .filter-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 6px;
          border: 1px solid var(--border);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          background: transparent;
          color: var(--text-muted);
        }
        .filter-btn:hover { border-color: var(--text-muted); color: var(--text); }
        .dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .filter-sep {
          width: 1px; height: 28px;
          background: var(--border);
          margin: 0 4px;
        }
        .clear-btn {
          padding: 5px 12px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-muted);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s;
          margin-left: auto;
        }
        .clear-btn:hover { color: var(--text); border-color: var(--text-muted); }

        /* Messages */
        .msg {
          padding: 10px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 13px;
          font-weight: 500;
        }
        .success { background: #34d39915; color: var(--green); border: 1px solid #34d39940; }
        .error   { background: #f4727215; color: #f47272;      border: 1px solid #f4727240; }

        /* States */
        .state-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          color: var(--text-muted);
          gap: 12px;
        }
        .pulse-ring {
          width: 40px; height: 40px;
          border: 2px solid var(--accent);
          border-radius: 50%;
          animation: pulse 1.2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(0.9); opacity: 0.5; }
          50%       { transform: scale(1.1); opacity: 1; }
        }
        .empty-icon {
          font-size: 40px;
          color: var(--border);
        }
        .empty p { font-size: 15px; font-weight: 500; }
        .empty-sub { font-size: 13px; color: var(--text-muted); margin-top: -4px; }

        /* Count */
        .job-count {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          font-size: 13px;
          color: var(--text-muted);
          flex-wrap: wrap;
        }
        .count-num {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: var(--text);
        }
        .count-tag {
          padding: 2px 8px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 4px;
          font-size: 12px;
        }

        /* Grid */
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 12px;
        }
      `}</style>
    </div>
  );
};

export default JobGrid;
