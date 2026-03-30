import React from 'react';
import JobGrid from '../components/JobGrid';

const Home: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{
        padding: '40px 32px 32px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '4px' }}>
              <div style={{
                width: '36px', height: '36px',
                background: 'linear-gradient(135deg, #7c6fff, #06d6c7)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px',
                boxShadow: '0 0 20px rgba(124,111,255,0.5)',
              }}>◈</div>
              <h1 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '26px',
                fontWeight: 800,
                background: 'linear-gradient(90deg, #f0f2ff 0%, #9ba3c9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
              }}>
                Job Tracker
              </h1>
              <span style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '2.5px',
                color: 'var(--neon-b)',
                textTransform: 'uppercase',
                fontFamily: 'JetBrains Mono, monospace',
                opacity: 0.8,
              }}>LATAM</span>
            </div>
            <p style={{
              color: 'var(--text-dim)',
              fontSize: '13px',
              fontWeight: 400,
              paddingLeft: '50px',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              Bumeran · ZonaJobs · Computrabajo
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            background: 'rgba(6,214,199,0.08)',
            border: '1px solid rgba(6,214,199,0.2)',
            borderRadius: '99px',
            fontSize: '12px',
            color: 'var(--neon-b)',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 500,
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--neon-b)', boxShadow: '0 0 8px var(--neon-b)', display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} />
            live
          </div>
        </div>
      </header>
      <JobGrid />

      <style jsx global>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
};

export default Home;
