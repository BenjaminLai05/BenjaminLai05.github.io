import React, { createContext, useState, useContext } from 'react';

const PatientContext = createContext();

export const usePatients = () => useContext(PatientContext);

export const PatientProvider = ({ children }) => {
  // Initial Mock Data (to be replaced by DB later if needed)
  const [patients, setPatients] = useState([
    { 
      id: '104523', 
      name: 'Sarah Jenkins', 
      age: 34, 
      lastScan: '15 Oct 2023', 
      status: 'Completed', 
      statusColor: 'var(--success)',
      history: [
        { id: 's1', date: '15 Oct 2023', type: 'Axial T1+C', tumorCount: 0, modelConfidence: 0.98, url: '/dataset/no/1 no.jpeg' }
      ]
    },
    { 
      id: 'EV93021', 
      name: 'Eleanor Vance', 
      age: 48, 
      lastScan: '14 Oct 2023', 
      status: 'In Progress', 
      statusColor: 'var(--warning)',
      history: [
        { id: 's2', date: '30 Sep 2026', type: 'Axial T1+C', tumorCount: 2, modelConfidence: 0.95, url: 'http://127.0.0.1:8000/dataset/yes/Y1.jpg' },
        { id: 's3', date: '14 Oct 2026', type: 'Axial T1+C', tumorCount: 2, modelConfidence: 0.94, url: 'http://127.0.0.1:8000/dataset/yes/Y2.jpg' }
      ]
    },
    { 
      id: '104525', 
      name: 'Emily Rodriguez', 
      age: 27, 
      lastScan: '12 Oct 2023', 
      status: 'Scheduled', 
      statusColor: 'var(--primary)',
      history: []
    }
  ]);

  const addScanToPatient = (patientId, scanData) => {
    setPatients(prevPatients => prevPatients.map(p => {
      if (p.id === patientId) {
        // Create a new history array with the new scan at the beginning
        const newHistory = [
          {
            id: `scan_${Date.now()}`,
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            type: 'Axial T1+C (AI Upload)', // Defaulting type for uploads
            tumorCount: scanData.tumorCount,
            modelConfidence: scanData.modelConfidence,
            url: scanData.imageUrl, // Base64 or Blob URL
            annotatedUrl: scanData.annotatedUrl
          },
          ...p.history
        ];
        
        return {
          ...p,
          lastScan: newHistory[0].date,
          status: 'Pending Review',
          statusColor: '#f97316',
          history: newHistory
        };
      }
      return p;
    }));
  };

  return (
    <PatientContext.Provider value={{ patients, addScanToPatient }}>
      {children}
    </PatientContext.Provider>
  );
};
