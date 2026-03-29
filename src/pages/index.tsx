import React from 'react';
import JobGrid from '../components/JobGrid';

const Home: React.FC = () => {
  return (
    <div>
      <div style={{ padding: '24px 20px 8px', borderBottom: '1px solid #e8ecf0' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
          Node.js Job Finder
        </h1>
        <p style={{ color: '#666', marginTop: '6px', fontSize: '14px' }}>
          Ofertas de Node.js en Bumeran, ZonaJobs y Computrabajo
        </p>
      </div>
      <JobGrid />
    </div>
  );
};

export default Home;
