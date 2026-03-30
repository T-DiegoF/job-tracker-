import React from 'react';
import JobGrid from '../components/JobGrid';

const Home: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{
        padding: '32px 28px 24px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '6px' }}>
            <h1 style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '32px',
              fontWeight: 800,
              color: 'var(--text)',
              letterSpacing: '-0.5px',
            }}>
              Job Tracker
            </h1>
            <span style={{
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '2px',
              color: 'var(--accent)',
              textTransform: 'uppercase',
              fontFamily: 'DM Sans, sans-serif',
            }}>
              LATAM
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 300 }}>
            Ofertas en tiempo real · Bumeran · ZonaJobs · Computrabajo
          </p>
        </div>
      </header>
      <JobGrid />
    </div>
  );
};

export default Home;
