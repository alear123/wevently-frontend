import React, { useEffect, useState } from 'react';
import { getTopProvinciasGlobal } from '../../../src/api/reportesApi';

export default function TopProvinciasGlobal() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopProvinciasGlobal()
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Cargando top provincias...</div>;

  return (
    <div className="card-reporte-global" style={{ 
      backgroundColor: '#fff', 
      borderRadius: '12px', 
      padding: '20px', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      flex: '0 0 auto',
      width: '350px',
      maxWidth: '100%'
    }}>
      <h3 style={{ 
        fontSize: '1.1rem', 
        fontWeight: '600', 
        color: '#1a1a1a', 
        marginBottom: '16px',
        borderBottom: '1px solid #eee',
        paddingBottom: '12px'
      }}>
        Top 3 Provincias (Global)
      </h3>
      <ul className="lista-top-global" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {data.map((item, index) => (
          <li key={index} className="item-top-global" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '12px',
            padding: '8px 0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="rank" style={{ 
                backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                color: '#fff',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                {index + 1}
              </span>
              <span className="nombre" style={{ fontWeight: '500', color: '#333' }}>{item.provincia}</span>
            </div>
            <span className="cantidad" style={{ 
              backgroundColor: '#f3f4f6', 
              padding: '4px 12px', 
              borderRadius: '20px', 
              fontSize: '0.9rem', 
              color: '#4b5563',
              fontWeight: '600'
            }}>
              {item.cantidad}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
