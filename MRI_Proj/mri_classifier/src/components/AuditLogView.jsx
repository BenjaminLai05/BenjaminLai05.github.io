import React, { useState } from 'react';

export default function AuditLogView({ auditLog = [] }) {
  const [filterType, setFilterType] = useState('all');

  const filtered = filterType === 'all'
    ? auditLog
    : auditLog.filter(e => e.type === filterType);

  const typeColors = {
    login: '#0ea5e9',
    logout: '#6b7280',
    patient_view: '#8b5cf6',
    scan_upload: '#10b981',
    report_generated: '#f59e0b',
    patient_created: '#06b6d4',
    notes_updated: '#ec4899',
  };

  const typeLabels = {
    login: 'Login',
    logout: 'Logout',
    patient_view: 'Patient Viewed',
    scan_upload: 'Scan Upload',
    report_generated: 'Report',
    patient_created: 'Patient Created',
    notes_updated: 'Notes Updated',
  };

  const uniqueTypes = [...new Set(auditLog.map(e => e.type))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Audit Trail</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className={filterType === 'all' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '12px' }}
            onClick={() => setFilterType('all')}
          >All ({auditLog.length})</button>
          {uniqueTypes.map(t => (
            <button
              key={t}
              className={filterType === t ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 14px', fontSize: '12px' }}
              onClick={() => setFilterType(t)}
            >{typeLabels[t] || t}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '180px 120px 1fr 200px', 
          padding: '12px 24px', 
          borderBottom: '1px solid var(--border-color)', 
          backgroundColor: 'var(--bg-hover)', 
          fontWeight: 600, 
          fontSize: '13px', 
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          <span>Timestamp</span>
          <span>Type</span>
          <span>Description</span>
          <span>User</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No audit events recorded yet.</div>
          ) : (
            filtered.map((event, i) => (
              <div key={i} style={{ 
                display: 'grid', 
                gridTemplateColumns: '180px 120px 1fr 200px', 
                padding: '12px 24px', 
                borderBottom: '1px solid var(--border-color)',
                fontSize: '14px',
                alignItems: 'center'
              }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{event.timestamp}</span>
                <span>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: `${typeColors[event.type] || '#6b7280'}20`,
                    color: typeColors[event.type] || '#6b7280',
                  }}>{typeLabels[event.type] || event.type}</span>
                </span>
                <span>{event.description}</span>
                <span style={{ fontWeight: 500 }}>{event.userName}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
