import React, { useRef, useState, useEffect } from 'react';
import API_BASE_URL from './config';
import { usePatients } from './context/PatientContext';
import PatientsView from './components/PatientsView';
import StudiesView from './components/StudiesView';
import ReportsView from './components/ReportsView';
import './App.css';
import './index.css';

/* ─────────────────────────────────────────────────────────
   SVG ICONS
───────────────────────────────────────────────────────── */
const Icons = {
  Dashboard: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"></rect><rect x="14" y="3" width="7" height="5" rx="1"></rect><rect x="14" y="12" width="7" height="9" rx="1"></rect><rect x="3" y="16" width="7" height="5" rx="1"></rect></svg>,
  Patients: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  Studies: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>,
  Reports: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  Settings: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  Sun: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>,
  Moon: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>,
  Upload: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
  Scan: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3a2 2 0 0 0-2 2v2"></path><path d="M19 3a2 2 0 0 1 2 2v2"></path><path d="M21 19a2 2 0 0 1-2 2h-2"></path><path d="M5 21a2 2 0 0 1-2-2v-2"></path><circle cx="12" cy="12" r="3"></circle></svg>,
  Search: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
};

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────── */
export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false); // Light view is default for medical
  const [currentTab, setCurrentTab] = useState('dashboard');
  
  // Dashboard Workspace State
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [showAnnotated, setShowAnnotated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confidence, setConfidence] = useState(0.85); // Default high threshold
  const [lastScanResult, setLastScanResult] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const fileInputRef = useRef(null);
  // Consume global patient context
  const { patients, addScanToPatient } = usePatients();
  
  // Set default selected patient if patients exist
  const [selectedPatientId, setSelectedPatientId] = useState('');
  useEffect(() => {
    if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);

  // Sync theme with document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // ─── Actions ───────────────────────────────────────────
  const openFilePicker = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const picked = e.target.files[0];
    if (!picked || !picked.type.startsWith('image/')) return;
    setFile(picked);
    setResultUrl(null);
    setShowAnnotated(false);
    setLastScanResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => setPreviewUrl(evt.target.result);
    reader.readAsDataURL(picked);
  };

  const handleScan = async () => {
    if (!file) return;
    const fd = new FormData();
    fd.append('img', file);
    fd.append('confidence', confidence.toString());

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/scan-with-mask`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Server error');
      
      const data = await res.json();
      const annotatedUrl = `data:image/png;base64,${data.annotated_image}`;
      setResultUrl(annotatedUrl);
      setShowAnnotated(true);

      const maxConfidence = data.confidences?.length > 0 ? Math.max(...data.confidences) : 0;
      setLastScanResult({
        tumorCount: data.num_detections,
        modelConfidence: maxConfidence,
        fileName: file.name
      });
      showToast('Scan completed successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast('Scan failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToastMessage({ text: message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ─── Render Sub-Views ──────────────────────────────────
  const renderDashboard = () => (
    <div className="dashboard-grid">
      {/* Central Workspace Panel */}
      <div className="card workspace-card">
        <div className="workspace-header">
          <h2>MRI Workspace</h2>
          <div className="workspace-actions">
            <button className="btn-secondary" onClick={openFilePicker}>
              <Icons.Upload /> Upload Scan
            </button>
            <button 
              className="btn-primary" 
              onClick={handleScan} 
              disabled={!file || loading}
            >
              <Icons.Scan /> {loading ? 'Scanning...' : 'Run Detection'}
            </button>
          </div>
        </div>

        <div className="image-viewer-area">
          {loading && <div className="loading-overlay">Processing MRI Data...</div>}
          
          {!file && !previewUrl && (
             <div className="upload-placeholder" onClick={openFilePicker} style={{cursor: 'pointer'}}>
               <Icons.Upload />
               <p>Select or drag & drop an MRI scan here</p>
             </div>
          )}

          {(previewUrl || resultUrl) && (
            <img
              src={showAnnotated && resultUrl ? resultUrl : previewUrl}
              alt={showAnnotated ? 'Annotated MRI' : 'Original MRI Preview'}
              className="scan-image"
            />
          )}
        </div>

        <div className="confidence-controls">
          <label>
            <span>Detection Confidence Threshold</span>
            <span>{Math.round(confidence * 100)}%</span>
          </label>
          <input
            type="range"
            className="slider"
            min="0" max="100"
            value={confidence * 100}
            onChange={(e) => setConfidence(parseFloat(e.target.value) / 100)}
          />
        </div>
      </div>

      {/* Right Details Panel */}
      <div className="details-panel">
        <div className="card">
          <h3 className="section-title">Record Assignment</h3>
          <select 
            className="patient-select"
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
          >
            {patients.map(p => (
               <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
            ))}
          </select>
          <button 
            className="btn-secondary" 
            style={{width: '100%', justifyContent:'center'}}
            disabled={!resultUrl || !lastScanResult}
            onClick={() => {
              addScanToPatient(selectedPatientId, {
                imageUrl: previewUrl,
                annotatedUrl: resultUrl,
                tumorCount: lastScanResult.tumorCount,
                modelConfidence: lastScanResult.modelConfidence
              });
              showToast('Saved to Patient Record', 'success');
              // Optionally clear workspace after saving:
              // setFile(null); setPreviewUrl(null); setResultUrl(null);
            }}
          >
            Save Scan to Record
          </button>
        </div>

        <div className="card">
          <h3 className="section-title">Analysis Summary</h3>
          {lastScanResult ? (
            <>
              <div className="metric-card">
                <div className="label">Tumor Count</div>
                <div className="value">{lastScanResult.tumorCount}</div>
              </div>
              <div className="metric-card">
                <div className="label">Highest Confidence</div>
                <div className="value">{Math.round(lastScanResult.modelConfidence * 100)}%</div>
              </div>
              <div style={{marginTop: '16px'}}>
                <button 
                   className="btn-secondary" 
                   style={{width: '100%', justifyContent:'center'}}
                   onClick={() => setShowAnnotated(!showAnnotated)}
                >
                  {showAnnotated ? 'Hide AI overlay' : 'Show AI overlay'}
                </button>
              </div>
            </>
          ) : (
            <p style={{color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center'}}>
              Awaiting scan execution...
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStub = (title, icon) => (
    <div className="stub-view">
      {icon}
      <h2>{title}</h2>
      <p>This module is currently under construction in Iteration 1.</p>
    </div>
  );

  return (
    <div className="app-layout">
      {/* Hidden File Input */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Icons.Dashboard />
          <div className="sidebar-title">NeuroScan AI</div>
        </div>
        
        <nav className="nav-menu">
          <div className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentTab('dashboard')}>
            <Icons.Dashboard /> Workspace
          </div>
          <div className={`nav-item ${currentTab === 'patients' ? 'active' : ''}`} onClick={() => setCurrentTab('patients')}>
            <Icons.Patients /> Patient Records
          </div>
          <div className={`nav-item ${currentTab === 'studies' ? 'active' : ''}`} onClick={() => setCurrentTab('studies')}>
            <Icons.Studies /> Imaging Studies
          </div>
          <div className={`nav-item ${currentTab === 'reports' ? 'active' : ''}`} onClick={() => setCurrentTab('reports')}>
            <Icons.Reports /> AI Reports
          </div>
        </nav>

        <div className="sidebar-footer">
           <div className="nav-item" style={{padding: '8px'}}>
             <Icons.Settings /> Settings
           </div>
           <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
             {isDarkMode ? <Icons.Sun /> : <Icons.Moon />}
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            {currentTab.charAt(0).toUpperCase() + currentTab.slice(1)} Overview
          </div>
          <div className="topbar-actions">
            <div className="search-box">
              <Icons.Search />
              <input type="text" placeholder="Search ID or Name..." />
            </div>
            <div className="user-profile">
              <div className="avatar">DR</div>
              <span>Dr. E. Reed</span>
            </div>
          </div>
        </header>

        <div className="view-container">
          {currentTab === 'dashboard' && renderDashboard()}
          {currentTab === 'patients' && (
            <PatientsView 
              onPatientSelect={(id) => {
                setSelectedPatientId(id);
                setCurrentTab('studies');
              }} 
            />
          )}
          {currentTab === 'studies' && <StudiesView patientId={selectedPatientId} />}
          {currentTab === 'reports' && <ReportsView patientId={selectedPatientId} />}
        </div>
      </main>

      {/* Global Toast */}
      {toastMessage && (
        <div className={`toast toast--${toastMessage.type}`}>
          {toastMessage.text}
        </div>
      )}
    </div>
  );
}
