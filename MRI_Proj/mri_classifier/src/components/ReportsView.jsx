import React, { useRef, useState, useEffect } from 'react';
import { usePatients } from '../context/PatientContext';

export default function ReportsView({ patientId }) {
  const { patients } = usePatients();
  const patient = patients.find(p => p.id === patientId);
  const reportRef = useRef(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [clinicalHistory, setClinicalHistory] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [impressionLines, setImpressionLines] = useState([]);

  // Assuming latestScan and previousScan are derived from patient data or props
  // For this example, let's mock them if not provided, or assume they come from context/props
  // This part needs to be correctly implemented based on how latestScan/previousScan are obtained.
  // For now, let's assume they are available in the scope or derived from patient.history
  const latestScan = patient?.history?.[0]; // Example: latest scan is the first in history
  const previousScan = patient?.history?.[1]; // Example: previous scan is the second in history
  const today = new Date().toLocaleDateString();

  const confidencePercent = latestScan?.modelConfidence ? Math.round(latestScan.modelConfidence * 100) : 0;
  const confidenceLabel = confidencePercent >= 90 ? 'High Accuracy' : confidencePercent >= 70 ? 'Moderate Accuracy' : 'Low Confidence';

  // Initialize editable fields when patient/scan loads
  useEffect(() => {
    if (patient && latestScan) {

      setClinicalHistory(
        previousScan 
          ? `Follow-up scan for patient ${patient.name}. Previous scan date: ${previousScan.date}. This report compares the latest scan (${latestScan.date}) against prior imaging.`
          : `Initial scan for patient ${patient.name}. This report documents baseline AI analysis findings from the scan performed on ${latestScan.date}.`
      );
      
      setAiSummary(
        latestScan.tumorCount === 0
          ? 'No suspicious lesions or tumors were identified by the AI detection model. The scan appears within normal limits. Clinical correlation is recommended.'
          : `The AI detection model identified ${latestScan.tumorCount} potential lesion(s) in the submitted MRI scan. The model's highest detection confidence was ${confidencePercent}%. All findings should be reviewed and correlated clinically by a qualified radiologist.`
      );

      const impressions = latestScan.tumorCount === 0 ? [
        'No abnormal masses or enhancing lesions detected.',
        'Ventricular system appears normal in size and morphology.',
        'No evidence of midline shift or mass effect.'
      ] : [
        `Total lesion candidates detected: ${latestScan.tumorCount}`,
        `Model confidence score: ${confidencePercent}% (${confidenceLabel})`,
        ...(previousScan ? [`Previous scan (${previousScan.date}) documented ${previousScan.tumorCount} lesion(s). Clinical comparison recommended.`] : []),
        'All AI findings are preliminary and require radiologist confirmation.'
      ];
      setImpressionLines(impressions);
    }
  }, [patient, latestScan, previousScan, confidencePercent, confidenceLabel]);

  const handlePrint = () => {
    const printContents = reportRef.current?.innerHTML;
    if (!printContents) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>AI Analysis Report - ${patient?.name || 'Patient'}</title>
          <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color: #1f2937; padding: 40px; }
            h1 { font-size: 22px; font-weight: 800; margin: 0 0 8px 0; }
            h3 { font-size: 15px; font-weight: 700; text-transform: uppercase; margin: 24px 0 8px 0; }
            p { line-height: 1.6; margin: 0 0 16px 0; }
            ul { padding-left: 24px; line-height: 1.6; }
            .header-line { border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 28px; }
            .subtitle { color: #4b5563; font-weight: 500; margin: 0; }
            .metrics-row { display: flex; gap: 24px; margin-bottom: 28px; }
            .metric-box { flex: 1; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
            .metric-box h4 { margin: 0 0 12px 0; font-size: 13px; color: #4b5563; text-transform: uppercase; }
            .big-number { font-size: 42px; font-weight: 800; color: #0ea5e9; line-height: 1; }
            .footer { border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 40px; display: flex; justify-content: space-between; }
            .scan-img { max-width: 100%; max-height: 180px; border-radius: 4px; object-fit: contain; background: #0f1115; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (!patient) {
    return (
      <div className="stub-view">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:48,height:48}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
        <h2>No Patient Selected</h2>
        <p>Select a patient from the Patient Records tab to generate an AI report.</p>
      </div>
    );
  }

  if (!latestScan) {
    return (
      <div className="stub-view">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:48,height:48}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
        <h2>No Scans Available</h2>
        <p>{patient.name} has no scan history to report on. Complete a scan in the Workspace first.</p>
      </div>
    );
  }

  return (
    <div className="reports-view" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '40px' }}>
      
      <div style={{ width: '100%', maxWidth: '900px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>Medical Analysis Report</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className={isEditing ? "btn-primary" : "btn-secondary"} onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Save Edits" : "Edit Report"}
          </button>
          <button className="btn-primary" onClick={handlePrint} disabled={isEditing}>Download PDF</button>
          <button className="btn-secondary" onClick={handlePrint} disabled={isEditing}>Print</button>
        </div>
      </div>

      <div ref={reportRef} className="card report-document" style={{ width: '100%', maxWidth: '900px', backgroundColor: '#ffffff', color: '#1f2937', minHeight: '1056px', padding: '60px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
        
        <div className="header-line" style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '24px', marginBottom: '32px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 800 }}>AI-ASSISTED MRI BRAIN ANALYSIS REPORT</h1>
          <p style={{ margin: 0, fontWeight: 500, color: '#4b5563' }}>
            Patient: {patient.name} (ID: {patient.id}) | Age: {patient.age} | Date: {today} | Scan: {latestScan.type || 'MRI'}
          </p>
        </div>

        <h3 style={{ fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Clinical History</h3>
        {isEditing ? (
          <textarea 
            value={clinicalHistory} 
            onChange={e => setClinicalHistory(e.target.value)} 
            style={{ width: '100%', padding: '12px', marginBottom: '24px', fontFamily: 'inherit', fontSize: '15px', lineHeight: 1.6, border: '1px solid #d1d5db', borderRadius: '6px', minHeight: '80px', resize: 'vertical' }}
          />
        ) : (
          <p style={{ marginTop: 0, marginBottom: '24px', lineHeight: 1.6 }}>{clinicalHistory}</p>
        )}

        <h3 style={{ fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>AI Summary Findings</h3>
        {isEditing ? (
          <textarea 
            value={aiSummary} 
            onChange={e => setAiSummary(e.target.value)} 
            style={{ width: '100%', padding: '12px', marginBottom: '24px', fontFamily: 'inherit', fontSize: '15px', lineHeight: 1.6, border: '1px solid #d1d5db', borderRadius: '6px', minHeight: '80px', resize: 'vertical' }}
          />
        ) : (
          <p style={{ marginTop: 0, marginBottom: '24px', lineHeight: 1.6 }}>{aiSummary}</p>
        )}

        <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
          {/* Scan Thumbnail */}
          <div style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#4b5563', textTransform: 'uppercase' }}>AI Findings Visualization</h4>
            <div style={{ width: '100%', height: '180px', backgroundColor: '#0f1115', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              {latestScan.annotatedUrl 
                ? <img src={latestScan.annotatedUrl} alt="AI Annotated Scan" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                : latestScan.url 
                  ? <img src={latestScan.url} alt="Original Scan" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  : <span>[No scan image available]</span>
              }
            </div>
          </div>

          {/* Confidence Metric Box */}
          <div style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#4b5563', textTransform: 'uppercase' }}>Diagnostic Confidence Score</h4>
            <div style={{ display: 'flex', alignItems: 'end', gap: '12px' }}>
              <span style={{ fontSize: '48px', fontWeight: 800, color: '#0ea5e9', lineHeight: 1 }}>{confidencePercent}%</span>
              <span style={{ paddingBottom: '8px', fontWeight: 600, color: '#4b5563' }}>{confidenceLabel}</span>
            </div>
            <p style={{ margin: '12px 0 0 0', fontSize: '13px', color: '#6b7280' }}>Analysis by NeuroScan AI Engine v4.1</p>
          </div>
        </div>

        <h3 style={{ fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Detailed Impression</h3>
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
            {impressionLines.map((line, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                <span style={{ paddingTop: '8px' }}>•</span>
                <input 
                  type="text" 
                  value={line} 
                  onChange={e => {
                    const newLines = [...impressionLines];
                    newLines[idx] = e.target.value;
                    setImpressionLines(newLines);
                  }}
                  style={{ flex: 1, padding: '8px 12px', fontFamily: 'inherit', fontSize: '15px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
                <button onClick={() => setImpressionLines(impressionLines.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '18px' }}>&times;</button>
              </div>
            ))}
            <button onClick={() => setImpressionLines([...impressionLines, 'New finding...'])} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, cursor: 'pointer', padding: '4px 0' }}>+ Add line</button>
          </div>
        ) : (
          <ul style={{ paddingLeft: '24px', lineHeight: 1.6, marginBottom: '32px' }}>
            {impressionLines.map((line, idx) => <li key={idx} dangerouslySetInnerHTML={{ __html: line }} />)}
          </ul>
        )}

        {/* Scan History Summary Table */}
        {patient.history.length > 1 && (
          <>
            <h3 style={{ fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Scan History Summary</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: '#4b5563' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: '#4b5563' }}>Type</th>
                  <th style={{ textAlign: 'center', padding: '8px 12px', color: '#4b5563' }}>Tumors</th>
                  <th style={{ textAlign: 'center', padding: '8px 12px', color: '#4b5563' }}>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {patient.history.map((s, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '8px 12px' }}>{s.date}</td>
                    <td style={{ padding: '8px 12px' }}>{s.type}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>{s.tumorCount}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>{Math.round(s.modelConfidence * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <div style={{ marginTop: 'auto', borderTop: '2px solid #e5e7eb', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
          <div>
            <p style={{ margin: '0 0 4px 0', fontWeight: 700 }}>Radiologist Sign-off</p>
            <p style={{ margin: 0, color: '#6b7280' }}>Pending Review</p>
          </div>
          <p style={{ margin: 0, color: '#6b7280', fontWeight: 500 }}>Generated {today} - Page 1 of 1</p>
        </div>

      </div>
    </div>
  );
}
