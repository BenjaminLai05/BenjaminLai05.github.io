import React from 'react';
import { usePatients } from '../context/PatientContext';

export default function PatientsView({ onPatientSelect }) {
  const { patients } = usePatients();
  return (
    <div className="patients-view" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Patient Directory</h2>
        <button className="btn-primary">+ Add New Patient</button>
      </div>
      
      <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase' }}>
              <th style={{ padding: '16px 24px' }}>Name</th>
              <th style={{ padding: '16px 24px' }}>Patient ID</th>
              <th style={{ padding: '16px 24px' }}>Age</th>
              <th style={{ padding: '16px 24px' }}>Last Scan Date</th>
              <th style={{ padding: '16px 24px' }}>Status</th>
              <th style={{ padding: '16px 24px' }}></th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p, i) => (
              <tr 
                key={i} 
                style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s', cursor: 'pointer' }} 
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'} 
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={() => onPatientSelect(p.id)}
              >
                <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500 }}>
                  <div className="avatar" style={{width: '28px', height: '28px', fontSize: '12px'}}>{p.name.charAt(0)}</div>
                  {p.name}
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>{p.id}</td>
                <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>{p.age}</td>
                <td style={{ padding: '16px 24px' }}>{p.lastScan}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ backgroundColor: p.statusColor, color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--text-muted)', textAlign: 'right' }}>...</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Showing 1-{patients.length} of {patients.length} patients</span>
          <div style={{ display: 'flex', gap: '12px' }}>
             <span>&lt;</span> <span>1</span> <span style={{color: 'var(--border-color)'}}>&gt;</span>
          </div>
        </div>
      </div>
    </div>
  );
}
