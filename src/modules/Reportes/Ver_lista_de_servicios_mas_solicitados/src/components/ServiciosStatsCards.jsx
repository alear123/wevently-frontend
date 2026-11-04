import React, { useMemo } from 'react';

export default function ServiciosStatsCards({ data }) {
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Sort by quantity to find min and max
    const sorted = [...data].sort((a, b) => b.cantidad - a.cantidad);
    const mostRequested = sorted[0];
    const leastRequested = sorted[sorted.length - 1];

    return { mostRequested, leastRequested };
  }, [data]);

  if (!stats) return null;


  return (
    <div className="stats-cards-container" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      <div className="stat-card most-requested" style={{ 
        flex: '1', 
        minWidth: '250px', 
        backgroundColor: '#fff', 
        borderRadius: '12px', 
        padding: '24px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        borderLeft: '5px solid #10B981'
      }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Más Solicitado</h4>
        <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: '700', color: '#10B981', lineHeight: '1.2' }}>{stats.mostRequested.cantidad}</div>
        <div className="stat-label" style={{ fontSize: '1.1rem', color: '#374151', marginTop: '4px', fontWeight: '500' }}>{stats.mostRequested.servicio}</div>
      </div>
      <div className="stat-card least-requested" style={{ 
        flex: '1', 
        minWidth: '250px', 
        backgroundColor: '#fff', 
        borderRadius: '12px', 
        padding: '24px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        borderLeft: '5px solid #EF4444'
      }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Menos Solicitado</h4>
        <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: '700', color: '#EF4444', lineHeight: '1.2' }}>{stats.leastRequested.cantidad}</div>
        <div className="stat-label" style={{ fontSize: '1.1rem', color: '#374151', marginTop: '4px', fontWeight: '500' }}>{stats.leastRequested.servicio}</div>
      </div>
    </div>
  );
}
