import React from 'react';
import { usePatients } from '../context/PatientContext';
import { Icons } from '../App'; // Import shared SVG icons

export default function DashboardHomeView({ onNavigate, loggedInUser }) {
  const { patients } = usePatients();

  const totalPatients = patients.length;
  const totalScans = patients.reduce((acc, p) => acc + (p.history?.length || 0), 0);
  const pendingReviews = patients.filter(p => p.status === 'Pending Review').length;
  const scheduledCount = patients.filter(p => p.status === 'Scheduled').length;

  // Recent activity — latest 5 scans across all patients
  const allScans = patients.flatMap(p =>
    (p.history || []).map(s => ({ ...s, patientName: p.name, patientId: p.id }))
  );
  allScans.sort((a, b) => new Date(b.date) - new Date(a.date));
  const recentScans = allScans.slice(0, 5);

  const stats = [
    { label: 'Total Patients', value: totalPatients, color: 'var(--primary)', icon: <Icons.Patients /> },
    { label: 'Scans Processed', value: totalScans, color: 'var(--success)', icon: <Icons.Scan /> },
    { label: 'Pending Review', value: pendingReviews, color: '#f97316', icon: <Icons.Clock /> },
    { label: 'Scheduled', value: scheduledCount, color: 'var(--primary)', icon: <Icons.Calendar /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      <div>
        <h2 style={{ margin: '0 0 4px 0' }}>Welcome back, {loggedInUser?.name || 'Doctor'}</h2>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Here's your overview for today.</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {stats.map((s, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'default' }}>
            <div style={{ width: '32px', height: '32px', color: s.color }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', flex: 1, minHeight: 0 }}>
        {/* Recent Activity */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icons.Clock style={{ width: '18px', height: '18px', color: 'var(--text-muted)' }}/>
            Recent Scan Activity
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {recentScans.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No scan activity yet.</div>
            ) : (
              recentScans.map((s, i) => (
                <div key={i} style={{
                  padding: '14px 24px',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer'
                }} onClick={() => onNavigate('patientDetail', s.patientId)}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{s.patientName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.date}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      fontWeight: 600,
                      backgroundColor: s.tumorCount > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                      color: s.tumorCount > 0 ? 'var(--danger)' : 'var(--success)'
                    }}>
                      {s.tumorCount > 0 ? `${s.tumorCount} Lesion(s)` : 'Clear'}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {Math.round((s.modelConfidence || 0) * 100)}% conf
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Quick Actions</h3>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => onNavigate('workspace')}>
            <Icons.Scan style={{ width: '16px', height: '16px' }} /> Open Workspace
          </button>
          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => onNavigate('patients')}>
            <Icons.Patients style={{ width: '16px', height: '16px' }} /> View All Patients
          </button>
          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => onNavigate('reports')}>
            <Icons.Reports style={{ width: '16px', height: '16px' }} /> Generate Report
          </button>
          <a href="https://github.com/BenjaminLai05/BenjaminLai05.github.io/releases/download/1.0/exemplar_dataset.zip" download className="btn-secondary" style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download Dataset (Samples)
          </a>

          <div style={{ marginTop: 'auto', padding: '16px', backgroundColor: 'var(--bg-hover)', borderRadius: '8px', fontSize: '13px' }}>
            <div style={{ fontWeight: 600, marginBottom: '8px' }}>System Status</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
              AI Engine Online
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', marginTop: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
              Database Connected
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
