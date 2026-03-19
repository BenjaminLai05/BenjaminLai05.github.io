import React, { createContext, useState, useContext, useEffect } from 'react';
import API_BASE_URL from '../config';

const PatientContext = createContext();

export const usePatients = () => useContext(PatientContext);

const fallbackMockData = [
  {
    id: "P93284", name: "Sarah Jenkins", age: "42", gender: "Female", status: "Pending Review", statusColor: "#f97316", clinicalNotes: "Patient presented with mild headaches. First baseline scan complete.", lastScan: "15 Oct 2023",
    history: [
      { id: "s1", date: "15 Oct 2023", tumorCount: 1, modelConfidence: 0.89, url: "/dataset/yes/Y1.jpg" }
    ]
  },
  {
    id: "P11029", name: "Michael Chang", age: "58", gender: "Male", status: "Completed", statusColor: "var(--success)", clinicalNotes: "Routine annual scan. No previous history of neurological issues. Review complete.", lastScan: "12 Nov 2023",
    history: [
      { id: "s2", date: "12 Nov 2023", tumorCount: 0, modelConfidence: 0.99, url: "/dataset/no/N1.jpeg" }
    ]
  },
  {
    id: "P55812", name: "Emily Thorne", age: "31", gender: "Female", status: "Scheduled", statusColor: "var(--primary)", clinicalNotes: "Follow-up requested after recent concussive incident. Monitoring for micro-hemorrhaging.", lastScan: "N/A", history: []
  },
  {
    id: "P40991", name: "Robert Fischer", age: "66", gender: "Male", status: "In progress", statusColor: "#3b82f6", clinicalNotes: "History of meningioma. Scan requested to check for recurrence. Currently undergoing analysis.", lastScan: "02 Jan 2024",
    history: [
      { id: "s3", date: "02 Jan 2024", tumorCount: 1, modelConfidence: 0.92, url: "/dataset/yes/Y2.jpg" },
      { id: "s4", date: "05 Jun 2023", tumorCount: 0, modelConfidence: 0.95, url: "/dataset/no/N2.jpeg" }
    ]
  },
  {
    id: "P77302", name: "Aisha Reynolds", age: "25", gender: "Female", status: "Routine Check", statusColor: "#8b5cf6", clinicalNotes: "Presented with migraines. Scheduled for standard routine check. MRI shows no abnormalities initially.", lastScan: "28 Feb 2024",
    history: [
      { id: "s5", date: "28 Feb 2024", tumorCount: 0, modelConfidence: 0.98, url: "/dataset/no/N3.jpg" }
    ]
  },
  {
    id: "P60492", name: "David O'Connor", age: "45", gender: "Male", status: "Pending Review", statusColor: "#f97316", clinicalNotes: "Patient arrived with persistent dizziness. Monitoring required.", lastScan: "15 Mar 2024",
    history: [
      { id: "s6", date: "15 Mar 2024", tumorCount: 2, modelConfidence: 0.94, url: "/dataset/yes/Y100.JPG" },
      { id: "s11", date: "01 Mar 2024", tumorCount: 1, modelConfidence: 0.91, url: "/dataset/yes/Y51.jpg" }
    ]
  },
  {
    id: "P81923", name: "Chloe Bennett", age: "29", gender: "Female", status: "Completed", statusColor: "var(--success)", clinicalNotes: "Routine clearance scan for a prior sports injury.", lastScan: "01 Dec 2023",
    history: [
      { id: "s7", date: "01 Dec 2023", tumorCount: 0, modelConfidence: 0.97, url: "/dataset/no/N20.jpg" },
      { id: "s13", date: "01 Nov 2023", tumorCount: 0, modelConfidence: 0.99, url: "/dataset/no/N18.jpg" }
    ]
  },
  {
    id: "P30214", name: "Marcus Vance", age: "52", gender: "Male", status: "In progress", statusColor: "#3b82f6", clinicalNotes: "Investigating suspected structural anomalies. Scanning currently underway.", lastScan: "10 Feb 2024",
    history: [
      { id: "s8", date: "10 Feb 2024", tumorCount: 1, modelConfidence: 0.88, url: "/dataset/yes/Y8.jpg" },
      { id: "s10", date: "01 Jan 2024", tumorCount: 0, modelConfidence: 0.99, url: "/dataset/no/N10.jpg" }
    ]
  },
  {
    id: "P90333", name: "Olivia Shaw", age: "38", gender: "Female", status: "Scheduled", statusColor: "var(--primary)", clinicalNotes: "Scheduled for recurring migraine check-up.", lastScan: "N/A", history: []
  },
  {
    id: "P41122", name: "James Harper", age: "61", gender: "Male", status: "Routine Check", statusColor: "#8b5cf6", clinicalNotes: "Regular bi-annual check for past micro-hemorrhaging history.", lastScan: "20 Nov 2023",
    history: [
      { id: "s9", date: "20 Nov 2023", tumorCount: 0, modelConfidence: 0.99, url: "/dataset/no/N40.jpg" },
      { id: "s12", date: "01 Oct 2023", tumorCount: 0, modelConfidence: 0.98, url: "/dataset/no/N15.jpg" }
    ]
  },
  {
    id: "P19283", name: "William Davies", age: "47", gender: "Male", status: "Completed", statusColor: "var(--success)", clinicalNotes: "Post-operative follow-up scanning complete. Showing stable conditions.", lastScan: "18 Jan 2024",
    history: [
      { id: "s14", date: "18 Jan 2024", tumorCount: 0, modelConfidence: 0.98, url: "/dataset/no/N11.jpg" },
      { id: "s15", date: "20 Dec 2023", tumorCount: 0, modelConfidence: 0.99, url: "/dataset/no/N12.jpg" }
    ]
  },
  {
    id: "P83921", name: "Sophia Martinez", age: "34", gender: "Female", status: "In progress", statusColor: "#3b82f6", clinicalNotes: "Patient undergoing contrast-enhanced MRI to evaluate right temporal lobe anomaly seen in previous scan.", lastScan: "04 Mar 2024",
    history: [
      { id: "s16", date: "04 Mar 2024", tumorCount: 1, modelConfidence: 0.91, url: "/dataset/yes/Y12.jpg" },
      { id: "s17", date: "10 Feb 2024", tumorCount: 1, modelConfidence: 0.87, url: "/dataset/yes/Y14.jpg" }
    ]
  },
  {
    id: "P72194", name: "Liam Zhang", age: "62", gender: "Male", status: "Pending Review", statusColor: "#f97316", clinicalNotes: "Recent scan shows potential new lesion. Awaiting conclusive review from senior radiologist.", lastScan: "22 Mar 2024",
    history: [
      { id: "s18", date: "22 Mar 2024", tumorCount: 2, modelConfidence: 0.93, url: "/dataset/yes/Y16.JPG" },
      { id: "s19", date: "10 Oct 2023", tumorCount: 1, modelConfidence: 0.86, url: "/dataset/yes/Y15.jpg" },
      { id: "s20", date: "15 Jan 2023", tumorCount: 0, modelConfidence: 0.97, url: "/dataset/no/N13.jpg" }
    ]
  },
  {
    id: "P63728", name: "Emma Wilson", age: "28", gender: "Female", status: "Scheduled", statusColor: "var(--primary)", clinicalNotes: "Scheduled for baseline routine neuroimaging due to family history of cerebral conditions.", lastScan: "N/A", history: []
  },
  {
    id: "P29481", name: "Noah Sullivan", age: "55", gender: "Male", status: "Routine Check", statusColor: "#8b5cf6", clinicalNotes: "Standard annual review for patient with previous benign cyst removal.", lastScan: "05 Jan 2024",
    history: [
      { id: "s21", date: "05 Jan 2024", tumorCount: 0, modelConfidence: 0.99, url: "/dataset/no/N15.jpg" },
      { id: "s22", date: "05 Jan 2023", tumorCount: 0, modelConfidence: 0.99, url: "/dataset/no/N14.jpg" }
    ]
  }
];

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
         if (data && data.length > 0) {
           setPatients(data);
         } else {
           setPatients(fallbackMockData);
         }
      })
      .catch(err => {
         console.error("Failed to load patients from database:", err);
         setPatients(fallbackMockData);
      });
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
