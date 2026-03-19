import React, { useState, useEffect } from 'react';
import { usePatients } from '../context/PatientContext';
import API_BASE_URL from '../config';

export default function StudiesView({ patientId }) {
  const { patients } = usePatients();
  const patient = patients.find(p => p.id === patientId);

  const [scan1Index, setScan1Index] = useState('');
  const [scan2Index, setScan2Index] = useState('');
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [images, setImages] = useState({ fixed: null, moving: null });

  // If the patient changes or loads, set default scans to compare (the two most recent)
  useEffect(() => {
    if (patient && patient.history && patient.history.length >= 2) {
      setScan1Index('1'); // older scan (index 1 of sorted desc)
      setScan2Index('0'); // newer scan (index 0 of sorted desc)
    } else {
      setScan1Index('');
      setScan2Index('');
    }
    setMetrics(null);
    setImages({ fixed: null, moving: null });
  }, [patient]);

  const handleGenerateReport = async () => {
    if (!scan1Index || !scan2Index || !patient) return;
    
    setLoading(true);
    setMetrics(null);

    const fixedScan = patient.history[parseInt(scan1Index)];
    const movingScan = patient.history[parseInt(scan2Index)];
    
    // Set previews while loading
    setImages({ fixed: fixedScan.url, moving: movingScan.url });

    try {
      // In a real app, these would be File objects. Since they are currently 
      // static path strings or base64, we simulate grabbing the blob.
      const fetchBlob = async (url) => {
        const r = await fetch(url);
        return await r.blob();
      };

      const fixedBlob = await fetchBlob(fixedScan.url);
      const movingBlob = await fetchBlob(movingScan.url);

      const fd = new FormData();
      fd.append('fixed_img', fixedBlob, 'fixed.png');
      fd.append('moving_img', movingBlob, 'moving.png');
      fd.append('confidence', '0.5');
      fd.append('return_annotated', 'true');

      const res = await fetch(`${API_BASE_URL}/compare-scans`, {
        method: 'POST',
        body: fd
      });

      if (!res.ok) throw new Error('Comparison failed');
      const data = await res.json();
      
      setMetrics(data.metrics);
      if (data.fixed_annotated && data.moving_annotated) {
        setImages({
          fixed: `data:image/png;base64,${data.fixed_annotated}`,
          moving: `data:image/png;base64,${data.moving_annotated}`
        });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to analyze scans. Ensure the Python backend is running.");
    } finally {
      setLoading(false);
    }
  };

  if (!patient || patient.history.length < 2) {
    return (
      <div className="stub-view">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        <h2>Not Enough Data</h2>
        <p>Patient {patient ? patient.name : 'Unknown'} requires at least 2 scans in their history to perform a longitudinal comparison.</p>
      </div>
    );
  }

  return (
    <div className="studies-view" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0' }}>Imaging Studies & Comparison</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Patient: {patient.name} (ID: {patient.id})</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select 
             className="patient-select" 
             style={{ margin: 0, width: '150px' }}
             value={scan1Index}
             onChange={e => setScan1Index(e.target.value)}
          >
            {patient.history.map((h, i) => <option key={i} value={i}>Baseline: {h.date}</option>)}
          </select>
          <span style={{color: 'var(--text-muted)'}}>vs</span>
          <select 
             className="patient-select" 
             style={{ margin: 0, width: '150px' }}
             value={scan2Index}
             onChange={e => setScan2Index(e.target.value)}
          >
            {patient.history.map((h, i) => <option key={i} value={i}>Current: {h.date}</option>)}
          </select>
          <button className="btn-primary" onClick={handleGenerateReport} disabled={loading || scan1Index === scan2Index}>
            {loading ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flex: 1, minHeight: 0 }}>
        
        {/* Comparison Viewer Area */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ flex: 1, display: 'flex', padding: 0, overflow: 'hidden' }}>
            {/* Baseline Scan */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-color)' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-hover)', fontWeight: 600, fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Baseline Scan</span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{scan1Index ? patient.history[scan1Index].date : ''}</span>
              </div>
              <div style={{ flex: 1, backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px' }}>
                {images.fixed ? <img src={images.fixed} alt="Baseline" className="scan-image" /> : 'Select comparison and Run Analysis'}
              </div>
            </div>

            {/* Current Scan */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-hover)', fontWeight: 600, fontSize: '14px', display: 'flex', justifyContent: 'space-between', color: 'var(--primary)' }}>
                <span>Follow-up Scan</span>
                <span style={{ fontWeight: 400 }}>{scan2Index ? patient.history[scan2Index].date : ''}</span>
              </div>
              <div style={{ flex: 1, backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px' }}>
                {images.moving ? <img src={images.moving} alt="Current" className="scan-image" /> : 'Select comparison and Run Analysis'}
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          
          <div className="card">
            <h3 className="section-title">Longitudinal Analysis</h3>
            
            <div className="metric-card">
              <div className="label">Tumor Area Progression</div>
              <div className="value">
                {metrics ? `${metrics.moving_scan.total_area_pixels.toLocaleString()} px²` : '--'}
              </div>
              {metrics && (
                <div className="sub-value" style={{ color: metrics.comparison.area_percent_change > 0 ? 'var(--danger)' : 'var(--success)' }}>
                  {metrics.comparison.area_percent_change > 0 ? '▲' : '▼'} {metrics.comparison.area_percent_change.toFixed(2)}% (vs. previous)
                </div>
              )}
            </div>
            
            <div className="metric-card">
              <div className="label">Tumor Count</div>
              <div className="value">{metrics ? metrics.moving_scan.num_tumors : '--'}</div>
              {metrics && (
                <div className="sub-value" style={{ color: metrics.comparison.tumor_count_change > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                  {metrics.comparison.tumor_count_change === 0 ? 'Unchanged' : 
                   metrics.comparison.tumor_count_change > 0 ? `+${metrics.comparison.tumor_count_change} new lesions` : 
                   `${metrics.comparison.tumor_count_change} lesions`}
                </div>
              )}
            </div>

            {/* Feature: Confidence Delta */}
            <div className="metric-card">
              <div className="label">Max AI Confidence</div>
              <div className="value">
                {metrics ? `${Math.round(Math.max(...metrics.moving_scan.tumors.map(t => t.confidence), 0) * 100)}%` : '--'}
              </div>
              {metrics && metrics.moving_scan.tumors.length > 0 && metrics.fixed_scan.tumors.length > 0 && (
                <div className="sub-value" style={{ color: 'var(--text-muted)' }}>
                  {(() => {
                    const maxM = Math.max(...metrics.moving_scan.tumors.map(t => t.confidence));
                    const maxF = Math.max(...metrics.fixed_scan.tumors.map(t => t.confidence));
                    const diff = ((maxM - maxF) * 100).toFixed(1);
                    return diff > 0 ? `▲ +${diff}%` : `▼ ${diff}%`;
                  })()} vs baseline
                </div>
              )}
            </div>

            {/* Feature: Clinical Recommendation */}
            <div className="metric-card" style={{ backgroundColor: 'var(--bg-hover)', border: 'none' }}>
              <div className="label">AI Recommendation</div>
              <div className="value" style={{ fontSize: '13px', whiteSpace: 'normal', lineHeight: 1.5, marginTop: '4px', fontWeight: 500, color: metrics && metrics.comparison.area_percent_change > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
                {!metrics ? '--' : 
                 metrics.comparison.area_percent_change > 0 || metrics.comparison.tumor_count_change > 0
                   ? "Clinical deterioration detected. Refer to specialist for immediate neurological review."
                   : metrics.moving_scan.num_tumors === 0
                     ? "No lesions detected. Continue standard monitoring protocol."
                     : "Stable or improving lesion criteria. Schedule standard follow-up scan."}
              </div>
            </div>
          </div>

          {metrics && (
            <div className="card">
               <h3 className="section-title">Current Lesions (Follow-up)</h3>
               <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: 1.6 }}>
                 {metrics.moving_scan.tumors.length === 0 ? (
                    <li style={{color: 'var(--text-muted)', listStyle: 'none', marginLeft: '-20px'}}>No tumors detected in follow-up scan.</li>
                 ) : (
                    metrics.moving_scan.tumors.map(t => (
                      <li key={t.id}>
                        <strong>Lesion {t.id}:</strong> {t.area.toLocaleString()} px² (Conf: {(t.confidence * 100).toFixed(1)}%)
                      </li>
                    ))
                 )}
               </ul>
            </div>
          )}

        </div>
      </div>
    
    </div>
  );
}
