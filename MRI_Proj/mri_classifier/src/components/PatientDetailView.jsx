import React, { useState, useEffect } from 'react';
import { usePatients } from '../context/PatientContext';

export default function PatientDetailView({ patientId, onBack, onCompare }) {
  const { patients, updatePatientDetails } = usePatients();
  const patient = patients.find(p => p.id === patientId);

  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (patient) {
      setNotes(patient.clinicalNotes || '');
    }
  }, [patient]);

  if (!patient) return null;

  const handleSaveNotes = () => {
    setIsSaving(true);
    updatePatientDetails(patient.id, { clinicalNotes: notes });
    setTimeout(() => setIsSaving(false), 500); // Simulate network request
  };

  return (
    <div className="patient-detail-view" style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            className="btn-secondary" 
            onClick={onBack}
            style={{ padding: '8px', border: 'none' }}
          >
            ← Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
             <div className="avatar" style={{width: '48px', height: '48px', fontSize: '20px'}}>
               {patient.name.charAt(0)}
             </div>
             <div>
               <h2 style={{ margin: '0 0 4px 0' }}>{patient.name}</h2>
               <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
                 Patient ID: {patient.id} • {patient.age} yrs • {patient.gender}
               </p>
             </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span style={{ 
            backgroundColor: patient.statusColor, 
            color: '#fff', 
            padding: '6px 12px', 
            borderRadius: '16px', 
            fontSize: '13px', 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center'
          }}>
            {patient.status}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flex: 1, minHeight: 0 }}>
        
        {/* Left Column: Notes & Info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
               <h3 className="section-title" style={{ margin: 0 }}>Clinical Notes</h3>
               <button 
                  className={notes !== (patient.clinicalNotes || '') ? "btn-primary" : "btn-secondary"} 
                  onClick={handleSaveNotes}
                  disabled={notes === (patient.clinicalNotes || '') || isSaving}
                  style={{ padding: '4px 12px', fontSize: '13px', minHeight: 'auto' }}
               >
                 {isSaving ? 'Saving...' : 'Save Notes'}
               </button>
            </div>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter patient clinical notes, symptoms, and diagnosis here..."
              style={{
                flex: 1,
                width: '100%',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-hover)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '14px',
                lineHeight: '1.6',
                resize: 'none',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Right Column: Scan History */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h3 className="section-title" style={{ margin: 0 }}>Imaging History</h3>
               <button 
                 className="btn-primary" 
                 onClick={onCompare}
                 disabled={patient.history.length < 2}
               >
                 Compare Longitudinal Scans
               </button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {patient.history.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No imaging history available for this patient.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 24px' }}>Scan</th>
                      <th style={{ padding: '12px 24px' }}>Date</th>
                      <th style={{ padding: '12px 24px' }}>Findings (Tumor Count)</th>
                      <th style={{ padding: '12px 24px' }}>AI Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.history.map((scan, index) => (
                      <tr key={scan.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 24px' }}>
                          <div style={{ 
                            width: '48px', 
                            height: '48px', 
                            borderRadius: '4px', 
                            backgroundColor: '#000',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <img src={scan.url} alt="scan thumbnail" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                          </div>
                        </td>
                        <td style={{ padding: '12px 24px', fontWeight: 500 }}>
                           {scan.date}
                           {index === 0 && <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '2px 6px', borderRadius: '4px' }}>LATEST</span>}
                        </td>
                        <td style={{ padding: '12px 24px' }}>
                           {scan.tumorCount === 0 ? (
                             <span style={{ color: 'var(--text-muted)' }}>No lesions detected</span>
                           ) : (
                             <span style={{ color: 'var(--danger)', fontWeight: 500 }}>{scan.tumorCount} lesion{scan.tumorCount > 1 ? 's' : ''} detected</span>
                           )}
                        </td>
                        <td style={{ padding: '12px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ 
                              width: '40px', 
                              height: '4px', 
                              backgroundColor: 'var(--border-color)', 
                              borderRadius: '2px',
                              overflow: 'hidden'
                            }}>
                               <div style={{ 
                                 width: `${scan.modelConfidence * 100}%`, 
                                 height: '100%', 
                                 backgroundColor: scan.modelConfidence > 0.9 ? 'var(--success)' : 'var(--warning)' 
                               }} />
                            </div>
                            <span style={{ fontSize: '13px' }}>{Math.round(scan.modelConfidence * 100)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
