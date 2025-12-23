// src/App.js
//---------------------------------------------------------
// React MRI-scanner UI
// 1. Pick image  → preview appears
// 2. Click Scan  → image sent to /scan, server returns boxed PNG
// 3. Button toggles between original and annotated views
//---------------------------------------------------------

import React, { useRef, useState } from 'react';
import ParticlesComponent from './components/particles';
import PatientSelector from './components/PatientSelector';
import ScanHistory from './components/ScanHistory';
import { getPatientChartData } from './data/patientScanHistory';
import ScanComparison from './components/ScanComparison';
import PatientInfo from './components/PatientInfo';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API_BASE_URL from './config';
import './App.css';
import './index.css';

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────── */
export default function App() {
  // ─── State ─────────────────────────────────────────────
  const [file, setFile] = useState(null);     // raw File
  const [previewUrl, setPreviewUrl] = useState(null);     // pre-scan preview
  const [resultUrl, setResultUrl] = useState(null);     // annotated image
  const [showAnnotated, setShowAnnotated] = useState(false);    // which one to show
  const [loading, setLoading] = useState(false);
  const [confidence, setConfidence] = useState(0.5);      // confidence threshold (0.0 - 1.0)
  const [currentView, setCurrentView] = useState(0);      // carousel view index (0 or 1)
  const [tiltDirection, setTiltDirection] = useState(null); // 'left' or 'right' for hover tilt
  const [selectedPatient, setSelectedPatient] = useState(null); // selected patient
  const [expandedContainer, setExpandedContainer] = useState(null); // which container is expanded
  const fileInputRef = useRef(null);

  // Total number of views in the carousel
  const TOTAL_VIEWS = 2;

  // ─── Select file and build data-URL preview ───────────
  const openFilePicker = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const picked = e.target.files[0];
    if (!picked || !picked.type.startsWith('image/')) return;

    setFile(picked);
    setResultUrl(null);           // clear any old annotation
    setShowAnnotated(false);      // start on the original view

    const reader = new FileReader();
    reader.onload = (evt) => setPreviewUrl(evt.target.result);
    reader.readAsDataURL(picked);
  };

  // ─── Hit FastAPI ↗ and receive boxed PNG ↘ ────────────
  const handleScan = async () => {
    if (!file) return;
    const fd = new FormData();
    fd.append('img', file);
    fd.append('confidence', confidence.toString());  // send confidence to backend

    try {
      setLoading(true);
      console.log('[SCAN] sending', file.name, file.size, 'bytes, confidence:', confidence);

      const res = await fetch(`${API_BASE_URL}/scan`, { method: 'POST', body: fd });
      console.log('[SCAN] response status', res.status, res.statusText);

      if (!res.ok) {
        const errText = await res.text();
        console.error('[SCAN] server error:', errText);
        alert('Server error → see console');
        return;
      }

      const blob = await res.blob();
      console.log('[SCAN] blob size', blob.size, 'bytes');
      setResultUrl(URL.createObjectURL(blob));
      setShowAnnotated(true);     // flip to "after" once ready
    } catch (err) {
      console.error('[SCAN] network/JS error', err);
      alert('Fetch failed → see console');
    } finally {
      setLoading(false);
    }
  };

  // ─── Toggle button handler ─────────────────────────────
  const toggleImage = () => {
    if (!resultUrl) return;               // nothing to toggle yet
    setShowAnnotated((prev) => !prev);
  };

  // ─── Add to Patient handler ─────────────────────────────
  const handleAddToPatient = () => {
    if (!selectedPatient) {
      alert('Please select a patient first');
      return;
    }
    if (!resultUrl) {
      alert('Please scan an image first');
      return;
    }
    // TODO: Implement functionality to add scan to patient's history
    alert(`Adding scan to ${selectedPatient}'s history...`);
  };

  // ─── Carousel navigation handlers ──────────────────────
  const handleEdgeHover = (direction) => {
    setTiltDirection(direction);
  };

  const handleEdgeLeave = () => {
    setTiltDirection(null);
  };

  const handleEdgeClick = (direction) => {
    if (direction === 'left') {
      // Wrap around: if at first view, go to last view
      setCurrentView(currentView === 0 ? TOTAL_VIEWS - 1 : currentView - 1);
    } else if (direction === 'right') {
      // Wrap around: if at last view, go to first view
      setCurrentView(currentView === TOTAL_VIEWS - 1 ? 0 : currentView + 1);
    }
  };

  // ─── Render ───────────────────────────────────────────
  return (
    <div className="App">
      <ParticlesComponent id="particles" />

      {/* hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <header className="App-header">
        <div className="container">
          <div className={`blankCard ${tiltDirection ? `tilt-${tiltDirection}` : ''}`}>
            {/* Edge navigation zones - always clickable with wrap-around */}
            <div
              className="edge-zone edge-zone-left"
              onMouseEnter={() => handleEdgeHover('left')}
              onMouseLeave={handleEdgeLeave}
              onClick={() => handleEdgeClick('left')}
            />
            <div
              className="edge-zone edge-zone-right"
              onMouseEnter={() => handleEdgeHover('right')}
              onMouseLeave={handleEdgeLeave}
              onClick={() => handleEdgeClick('right')}
            />

            {/* Carousel container */}
            <div
              className="carousel-container"
              style={{
                transform: `translateX(${-currentView * 100}%)`,
              }}
            >
              {/* View 0: Original content */}
              <div className="carousel-view carousel-view--main">
                {/* Patient Selector and Info Button - absolutely positioned */}
                <div className="main-panel-top-row">
                  <div className="patient-selector-wrapper">
                    <PatientSelector
                      selectedPatient={selectedPatient}
                      onPatientChange={setSelectedPatient}
                    />
                  </div>
                  <button
                    className="info-button"
                    onClick={() => setExpandedContainer('info')}
                    title="Information"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </button>
                </div>

                {/* LEFT panel */}
                <SidePanel
                  side="left"
                  buttons={[
                    { 
                      label: 'Upload', 
                      onClick: openFilePicker,
                      disabled: !selectedPatient
                    },
                    {
                      label: loading ? 'Scanning…' : 'Scan',
                      onClick: handleScan,
                      disabled: !file || loading || !selectedPatient
                    },
                    {
                      label: 'Add to Patient',
                      onClick: handleAddToPatient,
                      disabled: !resultUrl || !selectedPatient
                    },
                    {
                      label: 'Download Result',
                      onClick: () => resultUrl && downloadImage(resultUrl),
                      disabled: !resultUrl
                    },
                  ]}
                />

                {/* MIDDLE panel */}
                <MiddlePanel
                  previewUrl={previewUrl}
                  resultUrl={resultUrl}
                  loading={loading}
                  showAnnotated={showAnnotated}
                  onToggle={toggleImage}
                  confidence={confidence}
                  onConfidenceChange={setConfidence}
                />

                {/* RIGHT panel */}
                <SidePanel
                  side="right"
                  buttons={[]}
                />
              </div>

              {/* View 1: Patient and Scan History */}
              <div className="carousel-view carousel-view--patient-history">
                {/* Content wrapper for centering */}
                <div className="patient-history-content">
                  {/* TOP ROW: Patient Selector and Scan History */}
                  <div className="patient-history-top-row">
                    <div className="patient-selector-wrapper">
                      <PatientSelector
                        selectedPatient={selectedPatient}
                        onPatientChange={setSelectedPatient}
                      />
                    </div>
                    <div className="scan-history-wrapper">
                      <ScanHistory selectedPatient={selectedPatient} />
                    </div>
                  </div>

                  {/* MIDDLE ROW: Two side-by-side empty containers */}
                  <div className="middle-row">
                    <ExpandableContainer
                      title="Scan Comparison"
                      onExpand={() => setExpandedContainer('scan-comparison')}
                    >
                      <ScanComparison isExpanded={false} />
                    </ExpandableContainer>
                    <ExpandableContainer
                      title="Patient Information"
                      onExpand={() => setExpandedContainer('patient-info')}
                    >
                      <PatientInfo selectedPatient={selectedPatient} isExpanded={false} />
                    </ExpandableContainer>
                  </div>

                  {/* BOTTOM ROW: Chart container */}
                  <div className="bottom-row">
                      <ExpandableContainer
                        title="Tumor Detection Confidence"
                        onExpand={() => setExpandedContainer('chart')}
                      >
                        <ConfidenceChartPreview selectedPatient={selectedPatient} />
                      </ExpandableContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MODAL OVERLAY for expanded containers */}
      {expandedContainer && (
        <ModalOverlay
          title={
            expandedContainer === 'scan-comparison' ? 'Scan Comparison' :
            expandedContainer === 'patient-info' ? 'Patient Information' :
            expandedContainer === 'chart' ? 'Tumor Detection Confidence' :
            expandedContainer === 'info' ? 'Application Guide' :
            'Analysis'
          }
          onClose={() => setExpandedContainer(null)}
        >
          <div className="modal-content-wrapper">
            {expandedContainer === 'scan-comparison' && (
              <ScanComparison isExpanded={true} />
            )}
            {expandedContainer === 'patient-info' && (
              <PatientInfo selectedPatient={selectedPatient} isExpanded={true} />
            )}
            {expandedContainer === 'chart' && (
              <ConfidenceChartExpanded selectedPatient={selectedPatient} />
            )}
            {expandedContainer === 'info' && (
              <InfoGuide />
            )}
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

/* --------------------------------------------------------
   Small helpers / sub-components
---------------------------------------------------------*/
function SidePanel({ side, buttons }) {
  return (
    <div className={`side side--${side}`}>
      {buttons.map((btn) =>
        typeof btn === 'string' ? (
          <button key={btn} className="btn">{btn}</button>
        ) : (
          <button
            key={btn.label}
            className="btn"
            onClick={btn.onClick}
            disabled={btn.disabled}
            title={btn.disabled && btn.label === 'Upload' ? 'Please select a patient first' : btn.disabled && btn.label === 'Scan' ? 'Please select a patient and upload an image' : btn.disabled && btn.label === 'Add to Patient' ? 'Please select a patient and scan an image first' : undefined}
          >
            {btn.label}
          </button>
        )
      )}
    </div>
  );
}

function MiddlePanel({
  previewUrl,
  resultUrl,
  loading,
  showAnnotated,
  onToggle,
  confidence,
  onConfidenceChange,
}) {
  return (
    <div className="middle">
      {/* confidence slider – now functional! */}
      <div className="confidence-container">
        <span className="confidence-label">
          Confidence: {confidence.toFixed(2)}
        </span>
        <input
          type="range"
          className="confidence-slider"
          min="0"
          max="100"
          value={confidence * 100}  // convert 0.0-1.0 to 0-100 for slider
          onChange={(e) => onConfidenceChange(parseFloat(e.target.value) / 100)}  // convert back to 0.0-1.0
        />
      </div>

      {/* square image area */}
      <div className="imageContainer">
        {loading && <span className="spinner">Scanning…</span>}

        {!loading && (previewUrl || resultUrl) && (
          <img
            src={showAnnotated && resultUrl ? resultUrl : previewUrl}
            alt={showAnnotated ? 'Annotated MRI' : 'Preview'}
            className="preview-img"
          />
        )}
      </div>

      {/* flip button */}
      <button
        type="button"
        className="rotator-container"
        onClick={onToggle}
        disabled={!resultUrl}
        title={
          !resultUrl
            ? 'Waiting for scan…'
            : showAnnotated
              ? 'Show original'
              : 'Show annotated'
        }
      >
        <img
          src="/images/direction.png"
          alt="Toggle image"
          className="rotator-img"
        />
      </button>
    </div>
  );
}

function downloadImage(url) {
  const a = document.createElement('a');
  a.href = url;
  a.download = 'annotated.png';
  a.click();
}

/* --------------------------------------------------------
   CONFIDENCE CHART EXPANDED COMPONENT
---------------------------------------------------------*/
function ConfidenceChartExpanded({ selectedPatient = null }) {
  // Get patient-specific data or use example data
  const patientData = selectedPatient ? getPatientChartData(selectedPatient) : [];
  
  // Format data for chart (use years as labels)
  const chartData = patientData.length > 0 
    ? patientData.map(scan => ({
        date: scan.year.toString(),
        tumors: scan.tumors,
        confidence: scan.confidence,
        areaPercent: scan.areaPercent
      }))
    : [
        { date: '2020', tumors: 1, confidence: 0.75 },
        { date: '2021', tumors: 2, confidence: 0.82 },
        { date: '2022', tumors: 3, confidence: 0.88 },
        { date: '2023', tumors: 4, confidence: 0.91 },
        { date: '2024', tumors: 5, confidence: 0.94 },
      ];

  return (
    <div className="confidence-chart-expanded">
      <div className="chart-expanded-header">
        <div className="chart-expanded-title">Tumor Count vs Time</div>
        <div className="chart-expanded-subtitle">
          {selectedPatient ? `${selectedPatient}'s scan history` : 'Example data visualization'}
        </div>
      </div>
      
      <div className="chart-expanded-content">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 50, left: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="rgba(255, 255, 255, 0.6)"
              style={{ fontSize: '12px', fontFamily: 'Inter, sans-serif' }}
              tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
              angle={-45}
              textAnchor="end"
              height={60}
                label={{ value: 'Year', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontSize: '13px' } }}
            />
            <YAxis 
              stroke="rgba(255, 255, 255, 0.6)"
              style={{ fontSize: '12px', fontFamily: 'Inter, sans-serif' }}
              tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
              domain={[0, 'dataMax + 1']}
              label={{ value: 'Tumor Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontSize: '13px' } }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(20, 20, 20, 0.98)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'rgba(255, 255, 255, 0.9)',
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                padding: '8px 12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}
              labelStyle={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '4px', fontWeight: 600 }}
              itemStyle={{ color: 'rgba(100, 181, 246, 0.9)' }}
              cursor={{ stroke: 'rgba(100, 181, 246, 0.4)', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Line 
              type="monotone" 
              dataKey="tumors" 
              stroke="rgba(100, 181, 246, 0.9)" 
              strokeWidth={3}
              dot={{ fill: 'rgba(100, 181, 246, 0.9)', r: 5, strokeWidth: 2, stroke: 'rgba(20, 20, 20, 0.95)' }}
              activeDot={{ r: 7, fill: 'rgba(100, 181, 246, 1)', stroke: 'rgba(255, 255, 255, 0.4)', strokeWidth: 2 }}
              isAnimationActive={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* --------------------------------------------------------
   CONFIDENCE CHART PREVIEW COMPONENT
---------------------------------------------------------*/
function ConfidenceChartPreview({ selectedPatient = null }) {
  // Get patient-specific data or use example data
  const patientData = selectedPatient ? getPatientChartData(selectedPatient) : [];
  
  // Format data for chart (use years as labels)
  const chartData = patientData.length > 0 
    ? patientData.map(scan => ({
        date: scan.year.toString(),
        tumors: scan.tumors,
        confidence: scan.confidence,
        areaPercent: scan.areaPercent
      }))
    : [
        { date: '2020', tumors: 1, confidence: 0.75 },
        { date: '2021', tumors: 2, confidence: 0.82 },
        { date: '2022', tumors: 3, confidence: 0.88 },
        { date: '2023', tumors: 4, confidence: 0.91 },
        { date: '2024', tumors: 5, confidence: 0.94 },
      ];

  return (
    <div className="confidence-chart-preview">
      <div className="preview-header">
        <svg className="preview-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
        <div className="preview-title">Tumor Detection Confidence</div>
      </div>
      
      <div className="preview-content">
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 40, bottom: 25, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255, 255, 255, 0.6)"
                style={{ fontSize: '11px', fontFamily: 'Inter, sans-serif' }}
                tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
                label={{ value: 'Year', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontSize: '11px' } }}
              />
              <YAxis 
                stroke="rgba(255, 255, 255, 0.6)"
                style={{ fontSize: '11px', fontFamily: 'Inter, sans-serif' }}
                tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
                domain={[0, 'dataMax + 1']}
                label={{ value: 'Tumor Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontSize: '11px' } }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(20, 20, 20, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px'
                }}
                labelStyle={{ color: 'rgba(255, 255, 255, 0.7)' }}
                cursor={{ stroke: 'rgba(100, 181, 246, 0.4)', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Line 
                type="monotone" 
                dataKey="tumors" 
                stroke="rgba(100, 181, 246, 0.9)" 
                strokeWidth={2.5}
                dot={{ fill: 'rgba(100, 181, 246, 0.9)', r: 4, strokeWidth: 2, stroke: 'rgba(20, 20, 20, 0.95)' }}
                activeDot={{ r: 6, fill: 'rgba(100, 181, 246, 1)', stroke: 'rgba(255, 255, 255, 0.3)', strokeWidth: 2 }}
                isAnimationActive={false}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------
   EXPANDABLE CONTAINER COMPONENT
---------------------------------------------------------*/
function ExpandableContainer({ title, children, onExpand }) {
  return (
    <div className="expandable-container">
      <button
        className="expand-button"
        onClick={onExpand}
        title={`Expand ${title}`}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
      </button>
      <div className="container-content">
        {children}
      </div>
    </div>
  );
}

/* --------------------------------------------------------
   MODAL OVERLAY COMPONENT
---------------------------------------------------------*/
function ModalOverlay({ title, children, onClose }) {
  // Close modal when clicking on backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button
            className="modal-close-button"
            onClick={onClose}
            title="Close"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------
   INFO GUIDE COMPONENT
---------------------------------------------------------*/
function InfoGuide() {
  const handleExemplarDataset = () => {
    // TODO: Implement exemplar dataset functionality
    alert('Exemplar Dataset feature coming soon!');
  };

  return (
    <div className="info-guide">
      <div className="info-section">
        <h3 className="info-section-title">What is this Application?</h3>
        <p className="info-text">
          This is an MRI Tumor Detection and Analysis System designed to assist medical professionals 
          in identifying and tracking brain tumors in MRI scans. The application uses advanced 
          machine learning (YOLO) to automatically detect tumors and provide detailed analysis 
          including tumor count, size, and progression over time.
        </p>
      </div>

      <div className="info-section">
        <h3 className="info-section-title">Purpose</h3>
        <p className="info-text">
          The primary purpose of this application is to:
        </p>
        <ul className="info-list">
          <li>Detect tumors in MRI brain scans with high accuracy</li>
          <li>Track tumor progression over time for individual patients</li>
          <li>Compare scans to identify changes in tumor size and location</li>
          <li>Visualize tumor data through interactive charts and graphs</li>
          <li>Maintain comprehensive patient scan history records</li>
        </ul>
      </div>

      <div className="info-section">
        <h3 className="info-section-title">How to Use</h3>
        <div className="info-steps">
          <div className="info-step">
            <span className="step-number">1</span>
            <div className="step-content">
              <strong>Select a Patient:</strong> Choose a patient from the dropdown menu at the top 
              of the main panel. This will load their scan history and enable all features.
            </div>
          </div>
          <div className="info-step">
            <span className="step-number">2</span>
            <div className="step-content">
              <strong>Upload an Image:</strong> Click the "Upload" button to select an MRI scan 
              image from your device. The image will appear in the preview area.
            </div>
          </div>
          <div className="info-step">
            <span className="step-number">3</span>
            <div className="step-content">
              <strong>Adjust Confidence Threshold:</strong> Use the slider above the image to set 
              the detection sensitivity (0.0 to 1.0). Higher values require more confidence for 
              tumor detection.
            </div>
          </div>
          <div className="info-step">
            <span className="step-number">4</span>
            <div className="step-content">
              <strong>Scan for Tumors:</strong> Click the "Scan" button to analyze the image. The 
              system will detect tumors and display an annotated version with bounding boxes 
              around detected areas.
            </div>
          </div>
          <div className="info-step">
            <span className="step-number">5</span>
            <div className="step-content">
              <strong>Toggle Views:</strong> Use the toggle button to switch between the original 
              and annotated images.
            </div>
          </div>
          <div className="info-step">
            <span className="step-number">6</span>
            <div className="step-content">
              <strong>Add to Patient History:</strong> After scanning, click "Add to Patient" to 
              save the scan to the patient's history for future tracking.
            </div>
          </div>
          <div className="info-step">
            <span className="step-number">7</span>
            <div className="step-content">
              <strong>Download Results:</strong> Save the annotated image by clicking "Download Result".
            </div>
          </div>
          <div className="info-step">
            <span className="step-number">8</span>
            <div className="step-content">
              <strong>View Patient Data:</strong> Switch to the second panel (View 1) to see scan 
              history, patient information, comparison tools, and tumor progression charts.
            </div>
          </div>
        </div>
      </div>

      <div className="info-section">
        <h3 className="info-section-title">Exemplar Dataset</h3>
        <p className="info-text">
          The Exemplar Dataset contains a comprehensive collection of brain MRI images that can be 
          used for testing, training, and reference purposes. This dataset includes both images 
          with detected tumors and clean scans without tumors.
        </p>
        <div className="exemplar-dataset-section">
          <button 
            className="exemplar-dataset-button"
            onClick={handleExemplarDataset}
          >
            Open Exemplar Dataset
          </button>
          <div className="exemplar-dataset-info">
            <p className="info-text">
              <strong>How to use the Exemplar Dataset:</strong>
            </p>
            <ul className="info-list">
              <li>Click the "Open Exemplar Dataset" button above to access the image library</li>
              <li>Browse through categorized images (tumor-positive and clean scans)</li>
              <li>Select any image to load it directly into the application</li>
              <li>Use these images to test the detection system or compare results</li>
              <li>Images are organized by patient cases and scan dates for easy navigation</li>
              <li>Each image includes metadata such as tumor count, confidence scores, and scan dates</li>
            </ul>
            <p className="info-text" style={{ marginTop: '16px', fontStyle: 'italic' }}>
              Note: The exemplar dataset is a curated collection of anonymized MRI scans designed 
              for educational and testing purposes. Always verify results with professional medical 
              consultation for actual patient care.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
