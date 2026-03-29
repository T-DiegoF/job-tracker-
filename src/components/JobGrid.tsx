import React, { useEffect, useState, useCallback } from 'react';
import JobCard from './JobCard';
import { Job } from '@/types/job';

const SOURCES = ['Bumeran', 'ZonaJobs', 'Computrabajo'];

const JobGrid: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedModalities, setSelectedModalities] = useState<string[]>(['Remoto']);
  const [error, setError] = useState('');
  const [scrapeMsg, setScrapeMsg] = useState('');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      if (selectedSources.length > 0) params.set('source', selectedSources.join(','));
      if (selectedModalities.length > 0) params.set('modality', selectedModalities.join(','));

      const url = `/api/jobs${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (err: any) {
      setError('No se pudieron cargar las ofertas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedSources, selectedModalities]);

  const handleScrape = async () => {
    setScraping(true);
    setScrapeMsg('');
    setError('');
    try {
      const response = await fetch('/api/scrape', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error en scraping');
      setScrapeMsg(data.message || 'Scraping completado');
      await fetchJobs();
    } catch (err: any) {
      setError(err.message || 'Error durante el scraping');
    } finally {
      setScraping(false);
    }
  };

  const toggleSource = (source: string) => {
    setSelectedSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    );
  };

  const toggleModality = (mode: string) => {
    setSelectedModalities((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => { fetchJobs(); }, 400);
    return () => clearTimeout(timer);
  }, [fetchJobs]);

  const sourceColors: Record<string, { bg: string; active: string; text: string }> = {
    Bumeran:      { bg: '#dbe4ff', active: '#3b5bdb', text: '#fff' },
    ZonaJobs:     { bg: '#ffe0eb', active: '#c2255c', text: '#fff' },
    Computrabajo: { bg: '#d3f9d8', active: '#2f9e44', text: '#fff' },
  };

  const isDefaultFilter = selectedSources.length === 0 && selectedModalities.length === 1 && selectedModalities[0] === 'Remoto';
  const hasFilters = !isDefaultFilter;

  return (
    <div className="container">
      <div className="top-bar">
        <input
          type="text"
          placeholder="Buscar por título, empresa o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button onClick={handleScrape} disabled={scraping} className="scrape-btn">
          {scraping ? '⏳ Scrapeando...' : '🚀 Buscar ofertas'}
        </button>
      </div>

      <div className="filters-bar">
        <span className="filter-label">Fuente:</span>
        {SOURCES.map((source) => {
          const isActive = selectedSources.includes(source);
          const colors = sourceColors[source];
          return (
            <button
              key={source}
              onClick={() => toggleSource(source)}
              className="source-btn"
              style={{
                background: isActive ? colors.active : colors.bg,
                color: isActive ? colors.text : '#333',
                borderColor: isActive ? colors.active : 'transparent',
              }}
            >
              {source}{isActive && ' ✓'}
            </button>
          );
        })}

        <span className="filter-sep" />
        <span className="filter-label">Modalidad:</span>

        {[
          { mode: 'Remoto',  icon: '🏠', active: '#e67700', bg: '#fff3e0' },
          { mode: 'Híbrido', icon: '🔀', active: '#7950f2', bg: '#f3f0ff' },
          { mode: 'Presencial', icon: '🏢', active: '#1098ad', bg: '#e3fafc' },
        ].map(({ mode, icon, active, bg }) => {
          const isActive = selectedModalities.includes(mode);
          return (
            <button
              key={mode}
              onClick={() => toggleModality(mode)}
              className="source-btn"
              style={{
                background: isActive ? active : bg,
                color: isActive ? '#fff' : '#333',
                borderColor: isActive ? active : 'transparent',
              }}
            >
              {icon} {mode}{isActive && ' ✓'}
            </button>
          );
        })}

        <button
          onClick={() => setSelectedModalities([])}
          className="source-btn"
          style={{
            background: selectedModalities.length === 0 ? '#495057' : '#f1f3f5',
            color: selectedModalities.length === 0 ? '#fff' : '#666',
            borderColor: selectedModalities.length === 0 ? '#495057' : 'transparent',
          }}
        >
          🌐 Todas
        </button>

        {hasFilters && (
          <button onClick={() => { setSelectedSources([]); setSelectedModalities(['Remoto']); }} className="clear-btn">
            Restablecer filtros
          </button>
        )}
      </div>

      {scrapeMsg && <div className="msg-success">{scrapeMsg}</div>}
      {error     && <div className="msg-error">{error}</div>}

      {loading ? (
        <p className="loading">Cargando ofertas...</p>
      ) : jobs.length === 0 ? (
        <div className="empty">
          <p>📭 Sin ofertas encontradas</p>
          <p>Haz clic en &quot;Buscar ofertas&quot; para scrapear los portales</p>
        </div>
      ) : (
        <>
          <p className="job-count">
            📊 {jobs.length} oferta{jobs.length !== 1 ? 's' : ''}
            {selectedSources.length > 0 && ` · ${selectedSources.join(', ')}`}
            {selectedModalities.length > 0 && ` · ${selectedModalities.join(', ')}`}
            {searchTerm && ` · "${searchTerm}"`}
          </p>
          <div className="grid">
            {jobs.map((job) => (
              <JobCard key={job.url || job._id} {...job} />
            ))}
          </div>
        </>
      )}

      <style jsx>{`
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          background: #f9fafb;
          min-height: 100vh;
        }
        .top-bar {
          display: flex;
          gap: 12px;
          margin-bottom: 14px;
          flex-wrap: wrap;
          align-items: center;
        }
        .search-input {
          flex: 1;
          min-width: 250px;
          padding: 11px 16px;
          border: 2px solid #e0e4e8;
          border-radius: 8px;
          font-size: 15px;
          transition: border-color 0.2s;
        }
        .search-input:focus {
          outline: none;
          border-color: #3b5bdb;
          box-shadow: 0 0 0 3px rgba(59,91,219,0.12);
        }
        .scrape-btn {
          padding: 11px 22px;
          background: linear-gradient(135deg, #3b5bdb 0%, #1c3db5 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .scrape-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59,91,219,0.35);
        }
        .scrape-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .filters-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .filter-label {
          font-size: 13px;
          font-weight: 600;
          color: #555;
        }
        .filter-sep { width: 1px; height: 24px; background: #ddd; margin: 0 4px; }
        .source-btn {
          padding: 6px 14px;
          border-radius: 20px;
          border: 2px solid transparent;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .source-btn:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .clear-btn {
          padding: 6px 12px;
          border-radius: 20px;
          border: 1px solid #ccc;
          background: #fff;
          color: #888;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .clear-btn:hover { background: #f5f5f5; color: #333; }
        .msg-success {
          padding: 10px 16px;
          background: #ebfbee;
          color: #2f9e44;
          border: 1px solid #b2f2bb;
          border-radius: 8px;
          margin-bottom: 14px;
          font-size: 14px;
          font-weight: 500;
        }
        .msg-error {
          padding: 10px 16px;
          background: #fff5f5;
          color: #c92a2a;
          border: 1px solid #ffc9c9;
          border-radius: 8px;
          margin-bottom: 14px;
          font-size: 14px;
          font-weight: 500;
        }
        .loading { text-align: center; font-size: 16px; color: #666; padding: 40px; }
        .empty { text-align: center; padding: 60px 20px; color: #999; }
        .empty p { margin: 10px 0; }
        .job-count { color: #555; font-weight: 500; margin-bottom: 16px; font-size: 14px; }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }
      `}</style>
    </div>
  );
};

export default JobGrid;
