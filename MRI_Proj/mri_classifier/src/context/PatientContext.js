import React, { createContext, useState, useContext, useEffect } from 'react';
import API_BASE_URL from '../config';

const PatientContext = createContext();

export const usePatients = () => useContext(PatientContext);

export const PatientProvider = ({ children }) => {
  // Global Settings State
  const [defaultConfidence, setDefaultConfidence] = useState(0.85);

  const [patients, setPatients] = useState([]);

  // Fetch initial data from the SQLite Database backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/patients`)
      .then(res => res.json())
      .then(data => {
         // Sort history by date internally if needed, or rely on backend
         setPatients(data);
      })
      .catch(err => console.error("Failed to load patients from database:", err));
  }, []);

  const addScanToPatient = (patientId, scanData) => {
    const newScan = {
      id: `scan_${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      tumorCount: scanData.tumorCount,
      modelConfidence: scanData.modelConfidence,
      url: scanData.imageUrl // Base64 or Blob URL
    };

    // 1. Optimistic UI update
    setPatients(prevPatients => prevPatients.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          lastScan: newScan.date,
          status: 'Pending Review',
          statusColor: '#f97316',
          history: [newScan, ...p.history]
        };
      }
      return p;
    }));

    // 2. Sync to Database
    fetch(`${API_BASE_URL}/api/patients/${patientId}/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newScan)
    }).catch(err => console.error("DB Sync Error (Scan):", err));

    fetch(`${API_BASE_URL}/api/patients/${patientId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
         lastScan: newScan.date,
         status: 'Pending Review',
         statusColor: '#f97316'
      })
    }).catch(err => console.error("DB Sync Error (Patient Update):", err));
  };

  const updatePatientDetails = (patientId, updates) => {
    // Optimistic Update
    setPatients(prevPatients => prevPatients.map(p => {
        if (p.id === patientId) {
            return { ...p, ...updates };
        }
        return p;
    }));

    // DB Sync
    fetch(`${API_BASE_URL}/api/patients/${patientId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(err => console.error("DB Sync Error (Details):", err));
  };

  const addNewPatient = (patientData) => {
    const newPatient = {
      id: `P${Math.floor(Math.random() * 100000)}`,
      name: patientData.name,
      age: patientData.age.toString(),
      gender: patientData.gender,
      lastScan: 'N/A',
      status: 'Scheduled',
      statusColor: 'var(--primary)',
      clinicalNotes: patientData.clinicalNotes || 'No notes provided.',
      history: []
    };
    
    // Optimistic Update
    setPatients(prev => [newPatient, ...prev]);
    
    // DB Sync
    fetch(`${API_BASE_URL}/api/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPatient)
    }).catch(err => console.error("DB Sync Error (New Patient):", err));
    
    return newPatient.id;
  };

  return (
    <PatientContext.Provider value={{ 
        patients, 
        addScanToPatient, 
        updatePatientDetails,
        addNewPatient,
        defaultConfidence,
        setDefaultConfidence 
    }}>
      {children}
    </PatientContext.Provider>
  );
};
