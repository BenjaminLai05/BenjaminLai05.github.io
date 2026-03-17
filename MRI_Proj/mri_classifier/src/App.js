import React, { useRef, useState, useEffect, useCallback } from 'react';
import API_BASE_URL from './config';
import { usePatients } from './context/PatientContext';
import PatientsView from './components/PatientsView';
import PatientDetailView from './components/PatientDetailView';
import StudiesView from './components/StudiesView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import LoginView from './components/LoginView';
import DashboardHomeView from './components/DashboardHomeView';
import AuditLogView from './components/AuditLogView';
import './App.css';
import './index.css';

/* ─────────────────────────────────────────────────────────
   SVG ICONS
───────────────────────────────────────────────────────── */
export const Icons = {
  Dashboard: (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"></rect><rect x="14" y="3" width="7" height="5" rx="1"></rect><rect x="14" y="12" width="7" height="9" rx="1"></rect><rect x="3" y="16" width="7" height="5" rx="1"></rect></svg>,
  Home: (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
  Patients: (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  Studies: (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>,
  Reports: (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  Settings: (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  Sun: (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>,
  Moon: (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>,
  Upload: (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
  Scan: (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3a2 2 0 0 0-2 2v2"></path><path d="M19 3a2 2 0 0 1 2 2v2"></path><path d="M21 19a2 2 0 0 1-2 2h-2"></path><path d="M5 21a2 2 0 0 1-2-2v-2"></path><circle cx="12" cy="12" r="3"></circle></svg>,
  Search: (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  Bell: (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
  Shield: (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
  Download: (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
  Clock: (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  Calendar: (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
  FileText: (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
};

const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────── */
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTab, setCurrentTab] = useState('home');
  
  // Workspace State
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [showAnnotated, setShowAnnotated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastScanResult, setLastScanResult] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Feature: Search
  const [searchQuery, setSearchQuery] = useState('');

  // Feature: Notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  // Feature: Audit Trail
  const [auditLog, setAuditLog] = useState([]);

  // Feature: Session Timeout
  const sessionTimerRef = useRef(null);

  // Patient Context
  const { patients, addScanToPatient, defaultConfidence } = usePatients();
  const [selectedPatientId, setSelectedPatientId] = useState('');

  useEffect(() => {
    if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // ─── Audit Logger ─────────────────────────────────────
  const logAudit = useCallback((type, description) => {
    if (!loggedInUser) return;
    const entry = {
      timestamp: new Date().toLocaleString(),
      type,
      description,
      userName: loggedInUser.name,
      userId: loggedInUser.id,
    };
    setAuditLog(prev => [entry, ...prev]);
  }, [loggedInUser]);

  // ─── Session Timeout ──────────────────────────────────
  const resetSessionTimer = useCallback(() => {
    if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    if (!isAuthenticated) return;
    sessionTimerRef.current = setTimeout(() => {
      setIsAuthenticated(false);
      setLoggedInUser(null);
      setCurrentTab('home');
      setNotifications(prev => [{ id: Date.now(), text: 'Session expired due to inactivity.', type: 'warning', time: new Date().toLocaleTimeString() }, ...prev]);
    }, SESSION_TIMEOUT_MS);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const events = ['mousedown', 'keydown', 'scroll', 'mousemove'];
    const handler = () => resetSessionTimer();
    events.forEach(e => window.addEventListener(e, handler));
    resetSessionTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, handler));
      if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    };
  }, [isAuthenticated, resetSessionTimer]);

  // ─── Notification Helper ──────────────────────────────
  const addNotification = useCallback((text, type = 'info') => {
    setNotifications(prev => [{ id: Date.now(), text, type, time: new Date().toLocaleTimeString() }, ...prev]);
  }, []);

  // ─── Search Results ───────────────────────────────────
  const searchResults = searchQuery.trim().length > 0
    ? patients.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];


  // ─── Actions ──────────────────────────────────────────
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

  // Drag-and-Drop handlers
  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (!dropped || !dropped.type.startsWith('image/')) return;
    setFile(dropped);
    setResultUrl(null);
    setShowAnnotated(false);
    setLastScanResult(null);
    const reader = new FileReader();
    reader.onload = (evt) => setPreviewUrl(evt.target.result);
    reader.readAsDataURL(dropped);
  };

  const handleScan = async () => {
    if (!file) return;
    const fd = new FormData();
    fd.append('img', file);
    fd.append('confidence', defaultConfidence.toString());
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/scan-with-mask`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      const annotatedUrl = `data:image/png;base64,${data.annotated_image}`;
      setResultUrl(annotatedUrl);
      setShowAnnotated(true);
      const maxConfidence = data.confidences?.length > 0 ? Math.max(...data.confidences) : 0;
      setLastScanResult({ tumorCount: data.num_detections, modelConfidence: maxConfidence, fileName: file.name });
      showToast('Scan completed successfully', 'success');
      logAudit('scan_upload', `Scanned ${file.name} — ${data.num_detections} detection(s)`);
      addNotification(`Scan complete: ${data.num_detections} detection(s) in ${file.name}`, data.num_detections > 0 ? 'warning' : 'success');
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

  const handleLogout = () => {
    logAudit('logout', 'User logged out');
    setIsAuthenticated(false);
    setLoggedInUser(null);
    setCurrentTab('home');
  };

  // ─── RBAC: Check permissions ──────────────────────────
  const userRole = loggedInUser?.role || 'Physician';
  const canEdit = userRole === 'Radiologist' || userRole === 'Admin';
  const isAdmin = userRole === 'Admin';

  // ─── Render Workspace ─────────────────────────────────
  const renderWorkspace = () => (
    <div className="dashboard-grid">
      <div className="card workspace-card">
        <div className="workspace-header">
          <h2>MRI Workspace</h2>
          <div className="workspace-actions">
            <button className="btn-secondary" onClick={openFilePicker}>
              <Icons.Upload /> Upload Scan
            </button>
            <button className="btn-primary" onClick={handleScan} disabled={!file || loading || !canEdit}>
              <Icons.Scan /> {loading ? 'Scanning...' : 'Run Detection'}
            </button>
          </div>
        </div>
        <div
          className={`image-viewer-area ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {loading && <div className="loading-overlay">Processing MRI Data...</div>}
          {!file && !previewUrl && (
            <div className="upload-placeholder" onClick={openFilePicker} style={{ cursor: 'pointer' }}>
              <Icons.Upload />
              <p>{isDragOver ? 'Drop your MRI scan here!' : 'Select or drag & drop an MRI scan here'}</p>
            </div>
          )}
          {(previewUrl || resultUrl) && (
            <img
              src={showAnnotated && resultUrl ? resultUrl : previewUrl}
              alt={showAnnotated ? 'Annotated MRI' : 'Original MRI Preview'}
              className="scan-image scaled-mri zoomable-image"
            />
          )}
        </div>
      </div>

      <div className="details-panel">
        <div className="card">
          <h3 className="section-title">Record Assignment</h3>
          <select className="patient-select" value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)}>
            {patients.map(p => (<option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>))}
          </select>
          <button
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={!resultUrl || !lastScanResult || !canEdit}
            onClick={() => {
              addScanToPatient(selectedPatientId, {
                imageUrl: previewUrl,
                annotatedUrl: resultUrl,
                tumorCount: lastScanResult.tumorCount,
                modelConfidence: lastScanResult.modelConfidence
              });
              showToast('Saved to Patient Record', 'success');
              logAudit('scan_upload', `Saved scan to patient ${selectedPatientId}`);
              addNotification(`New scan saved for patient ${selectedPatientId}`, 'success');
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
              <div style={{ marginTop: '16px' }}>
                <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowAnnotated(!showAnnotated)}>
                  {showAnnotated ? 'Hide AI overlay' : 'Show AI overlay'}
                </button>
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center' }}>Awaiting scan execution...</p>
          )}
        </div>
      </div>
    </div>
  );

  // ─── Login Screen ─────────────────────────────────────
  if (!isAuthenticated) {
    return <LoginView onLogin={(user) => {
      setLoggedInUser(user);
      setIsAuthenticated(true);
      setAuditLog(prev => [{
        timestamp: new Date().toLocaleString(),
        type: 'login',
        description: `${user.name} logged in`,
        userName: user.name,
        userId: user.id,
      }, ...prev]);
      setNotifications(prev => [{ id: Date.now(), text: `Welcome back, ${user.name}!`, type: 'success', time: new Date().toLocaleTimeString() }, ...prev]);
    }} />;
  }

  // ─── Top bar title helper ─────────────────────────────
  const tabTitles = {
    home: 'Dashboard',
    workspace: 'Workspace',
    patients: 'Patient Records',
    patientDetail: 'Patient Detail',
    studies: 'Imaging Studies',
    reports: 'AI Reports',
    settings: 'Settings',
    auditLog: 'Audit Trail',
  };

  return (
    <div className="app-layout">
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Icons.Dashboard />
          <div className="sidebar-title">NeuroScan AI</div>
        </div>
        <nav className="nav-menu">
          <div className={`nav-item ${currentTab === 'home' ? 'active' : ''}`} onClick={() => setCurrentTab('home')}>
            <Icons.Home /> Home
          </div>
          <div className={`nav-item ${currentTab === 'workspace' ? 'active' : ''}`} onClick={() => setCurrentTab('workspace')}>
            <Icons.Dashboard /> Workspace
          </div>
          <div className={`nav-item ${currentTab === 'patients' ? 'active' : ''}`} onClick={() => setCurrentTab('patients')}>
            <Icons.Patients /> Patients
          </div>
          <div className={`nav-item ${currentTab === 'studies' ? 'active' : ''}`} onClick={() => setCurrentTab('studies')}>
            <Icons.Studies /> Studies
          </div>
          <div className={`nav-item ${currentTab === 'reports' ? 'active' : ''}`} onClick={() => setCurrentTab('reports')}>
            <Icons.Reports /> Reports
          </div>
          {isAdmin && (
            <div className={`nav-item ${currentTab === 'auditLog' ? 'active' : ''}`} onClick={() => setCurrentTab('auditLog')}>
              <Icons.Shield /> Audit Log
            </div>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className={`nav-item ${currentTab === 'settings' ? 'active' : ''}`} onClick={() => setCurrentTab('settings')}>
            <Icons.Settings /> Settings
          </div>
          <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? <Icons.Sun /> : <Icons.Moon />}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-title">{tabTitles[currentTab] || 'Overview'}</div>
          <div className="topbar-actions">
            {/* Search */}
            <div className="search-box" style={{ position: 'relative' }}>
              <Icons.Search />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {}}
              />
              {searchQuery.trim().length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  borderRadius: '8px', marginTop: '4px', maxHeight: '240px', overflowY: 'auto',
                  zIndex: 100, boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                }}>
                  {searchResults.length === 0 ? (
                    <div style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>No patients found.</div>
                  ) : searchResults.map(p => (
                    <div key={p.id} style={{
                      padding: '10px 16px', cursor: 'pointer', fontSize: '14px',
                      borderBottom: '1px solid var(--border-color)',
                    }}
                    onClick={() => {
                      setSelectedPatientId(p.id);
                      setCurrentTab('patientDetail');
                      setSearchQuery('');
                      logAudit('patient_view', `Searched and opened patient: ${p.name}`);
                    }}>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: {p.id} · {p.status}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <button className="theme-toggle" style={{ position: 'relative', border: 'none', background: 'transparent', cursor: 'pointer', padding: '8px', display: 'flex' }} onClick={() => setShowNotifPanel(!showNotifPanel)}>
                <Icons.Bell style={{ width: '22px', height: '22px', color: 'var(--text-main)' }} />
                {notifications.length > 0 && (
                  <span style={{
                    position: 'absolute', top: '2px', right: '4px',
                    width: '16px', height: '16px', borderRadius: '50%',
                    backgroundColor: 'var(--danger)', color: '#fff', fontSize: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold',
                    border: '2px solid var(--bg-app)'
                  }}>{notifications.length > 9 ? '9+' : notifications.length}</span>
                )}
              </button>

              {showNotifPanel && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, width: '320px',
                  backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  borderRadius: '12px', marginTop: '8px', maxHeight: '360px', overflowY: 'auto',
                  zIndex: 200, boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icons.Bell style={{ width: '16px', height: '16px', color: 'var(--primary)' }} />
                      Notifications
                    </span>
                    <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => setNotifications([])}>Clear All</button>
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>All caught up!</div>
                  ) : notifications.slice(0, 10).map(n => (
                    <div key={n.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-color)', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 500 }}>{n.text}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{n.time}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile + Logout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="user-profile">
                <div className="avatar">{loggedInUser ? loggedInUser.name.charAt(0) : 'U'}</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{loggedInUser?.name}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{userRole}</span>
                </div>
              </div>
              <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="view-container">
          {currentTab === 'home' && (
            <DashboardHomeView
              loggedInUser={loggedInUser}
              onNavigate={(tab, patientId) => {
                if (patientId) setSelectedPatientId(patientId);
                setCurrentTab(tab);
              }}
            />
          )}
          {currentTab === 'workspace' && renderWorkspace()}
          {currentTab === 'patients' && (
            <PatientsView
              onPatientSelect={(id) => {
                setSelectedPatientId(id);
                setCurrentTab('patientDetail');
                logAudit('patient_view', `Opened patient record: ${id}`);
              }}
            />
          )}
          {currentTab === 'patientDetail' && (
            <PatientDetailView
              patientId={selectedPatientId}
              onBack={() => setCurrentTab('patients')}
              onCompare={() => setCurrentTab('studies')}
              canEdit={canEdit}
            />
          )}
          {currentTab === 'studies' && <StudiesView patientId={selectedPatientId} />}
          {currentTab === 'reports' && <ReportsView patientId={selectedPatientId} />}
          {currentTab === 'settings' && (
            <SettingsView isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          )}
          {currentTab === 'auditLog' && isAdmin && <AuditLogView auditLog={auditLog} />}
        </div>
      </main>

      {/* Toast */}
      {toastMessage && (
        <div className={`toast toast--${toastMessage.type}`}>{toastMessage.text}</div>
      )}
    </div>
  );
}
