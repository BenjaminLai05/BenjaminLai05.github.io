import React from 'react';
import { usePatients } from '../context/PatientContext';
import { Icons } from '../App';

export default function SettingsView({ isDarkMode, setIsDarkMode }) {
  const { defaultConfidence, setDefaultConfidence } = usePatients();

  const handleDownloadDataset = () => {
    // In a real app this would point to a static file or API endpoint
    const link = document.createElement('a');
    link.href = 'https://github.com/BenjaminLai05/BenjaminLai05.github.io/releases/download/1.0/exemplar_dataset.zip';
    link.download = 'exemplar_dataset.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Application Settings</h2>
      </div>

      <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          padding: '12px 24px', 
          borderBottom: '1px solid var(--border-color)', 
          backgroundColor: 'var(--bg-hover)', 
          fontWeight: 600, 
          fontSize: '13px', 
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Preferences & Data
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Theme Setting */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>App Theme</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Toggle between Light and Dark mode variations.</p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ marginRight: '12px', fontSize: '14px', fontWeight: 500 }}>
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </span>
              <div style={{
                width: '44px',
                height: '24px',
                backgroundColor: isDarkMode ? 'var(--primary)' : 'var(--border-color)',
                borderRadius: '12px',
                position: 'relative',
                transition: 'background-color 0.2s'
              }} onClick={() => setIsDarkMode(!isDarkMode)}>
                <div style={{
                  position: 'absolute',
                  top: '2px',
                  left: isDarkMode ? '22px' : '2px',
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#fff',
                  borderRadius: '50%',
                  transition: 'left 0.2s'
                }} />
              </div>
            </label>
          </div>

          {/* Global Confidence Threshold */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>Default Model Confidence Threshold</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px', maxWidth: '500px' }}>
                  Sets the baseline confidence required for the YOLOv12 model to highlight a detected tumor in the Workspace.
                </p>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)' }}>
                {Math.round(defaultConfidence * 100)}%
              </div>
            </div>
            
            <input
              type="range"
              className="slider"
              min="0" max="100"
              value={defaultConfidence * 100}
              onChange={(e) => setDefaultConfidence(parseFloat(e.target.value) / 100)}
              style={{ width: '100%', marginTop: '8px' }}
            />
          </div>

          {/* Dataset Download */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>Exemplar Dataset</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Download the sample MRI dataset for testing the AI analysis tools.</p>
            </div>
            <button className="btn-secondary" onClick={handleDownloadDataset}>
              <Icons.Download style={{ width: '16px', height: '16px' }} /> Download Samples
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
