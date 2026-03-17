import React, { useState } from 'react';
import { usePatients } from '../context/PatientContext';

export default function PatientsView({ onPatientSelect }) {
  const { patients, addNewPatient } = usePatients();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', age: '', gender: 'Select Gender', clinicalNotes: '' });
  
  // Feature 7: Patient Filtering & Sorting
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');

  const handleCreatePatient = () => {
    if (!newPatient.name) { alert("Patient Name is required."); return; }
    const id = addNewPatient(newPatient);
    setIsAddModalOpen(false);
    setNewPatient({ name: '', age: '', gender: 'Select Gender', clinicalNotes: '' });
    onPatientSelect(id);
  };

  const statusOptions = ['All', 'Completed', 'In Progress', 'Pending Review', 'Scheduled', 'Routine Check'];

  let filteredPatients = statusFilter === 'All'
    ? patients
    : patients.filter(p => p.status === statusFilter);

  filteredPatients = [...filteredPatients].sort((a, b) => {
    switch (sortBy) {
      case 'name': return (a.name || '').localeCompare(b.name || '');
      case 'status': return (a.status || '').localeCompare(b.status || '');
      case 'age': return parseInt(a.age || 0) - parseInt(b.age || 0);
      default: return 0;
    }
  });

  return (
    <div className="patients-view" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Patient Directory</h2>
        <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>+ Add New Patient</button>
      </div>

      {/* Filter & Sort Bar */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        {statusOptions.map(s => (
          <button
            key={s}
            className={statusFilter === s ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '5px 14px', fontSize: '12px' }}
            onClick={() => setStatusFilter(s)}
          >{s}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sort:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)', fontSize: '12px' }}
          >
            <option value="name">Name</option>
            <option value="status">Status</option>
            <option value="age">Age</option>
          </select>
        </div>
      </div>
      
      <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase' }}>
              <th style={{ padding: '16px 24px' }}>Name</th>
              <th style={{ padding: '16px 24px' }}>Patient ID</th>
              <th style={{ padding: '16px 24px' }}>Age</th>
              <th style={{ padding: '16px 24px' }}>Last Scan</th>
              <th style={{ padding: '16px 24px' }}>Status</th>
            </tr>
          </thead>
        </table>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No patients match this filter.</td></tr>
              ) : (
                filteredPatients.map(p => (
                  <tr key={p.id} onClick={() => onPatientSelect(p.id)} style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '16px 24px', fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>{p.id}</td>
                    <td style={{ padding: '16px 24px' }}>{p.age}</td>
                    <td style={{ padding: '16px 24px' }}>{p.lastScan}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, backgroundColor: `${p.statusColor}20`, color: p.statusColor }}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Showing {filteredPatients.length} of {patients.length} patients</span>
        </div>
      </div>

      {isAddModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '500px', display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <h2 style={{ margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>Add New Patient</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Patient Name</label>
                <input type="text" value={newPatient.name} onChange={(e) => setNewPatient({...newPatient, name: e.target.value})} placeholder="e.g. John Doe"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Age</label>
                  <input type="number" value={newPatient.age} onChange={(e) => setNewPatient({...newPatient, age: e.target.value})} placeholder="Years"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)', outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Gender</label>
                  <select value={newPatient.gender} onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)', outline: 'none', appearance: 'none' }}>
                    <option disabled>Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Initial Clinical Notes</label>
                <textarea value={newPatient.clinicalNotes} onChange={(e) => setNewPatient({...newPatient, clinicalNotes: e.target.value})}
                  placeholder="Record symptoms, previous diagnoses, or reasons for scan..."
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical', minHeight: '100px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <button className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreatePatient}>Add Patient</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
