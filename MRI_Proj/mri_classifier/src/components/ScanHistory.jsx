import React, { useState, useRef, useEffect } from 'react';
import './ScanHistory.css';
import { getPatientScanHistory } from '../data/patientScanHistory';

export default function ScanHistory({ selectedPatient = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const dropdownRef = useRef(null);

  // Get patient-specific scan history
  const patientHistory = selectedPatient ? getPatientScanHistory(selectedPatient) : { scans: [] };
  const scans = patientHistory.scans || [];
  
  // Convert to format expected by component
  const formattedScans = scans.map((scan, index) => ({
    id: index + 1,
    timestamp: scan.date,
    fileName: scan.image.split('/').pop(),
    thumbnail: scan.image,
    status: scan.status,
    confidence: scan.confidence,
    year: scan.year,
    tumorCount: scan.tumorCount,
    tumorAreaPercent: scan.tumorAreaPercent,
    details: {
      resolution: '512x512',
      fileSize: '2.3 MB',
      scanDuration: '1.2s'
    }
  })).reverse(); // Most recent first

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setExpandedId(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="scan-history" ref={dropdownRef}>
      <button
        className="scan-history__button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg
          className="scan-history__icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="scan-history__text">Scan History</span>
        <span className="scan-history__count">{formattedScans.length}</span>
      </button>

      {isOpen && (
        <div className="scan-history__dropdown">
          <div className="scan-history__header">
            <h3 className="scan-history__title">
              {selectedPatient ? `${selectedPatient}'s Scans` : 'Recent Scans'}
            </h3>
            <span className="scan-history__subtitle">{formattedScans.length} total</span>
          </div>

          {formattedScans.length === 0 ? (
            <div className="scan-history__empty">
              <p>No scan history available{selectedPatient ? ` for ${selectedPatient}` : ''}.</p>
            </div>
          ) : (
            <div className="scan-history__list">
              {formattedScans.map((scan) => (
              <div key={scan.id} className="scan-history__item">
                <button
                  className="scan-history__item-header"
                  onClick={() => toggleExpand(scan.id)}
                >
                  <img
                    src={scan.thumbnail}
                    alt={scan.fileName}
                    className="scan-history__thumbnail"
                  />

                  <div className="scan-history__item-info">
                    <div className="scan-history__item-row">
                      <span className="scan-history__filename">{scan.fileName}</span>
                      <span
                        className={`scan-history__badge scan-history__badge--${scan.status}`}
                      >
                        {scan.status === 'clean' ? 'Clean' : 'Tumour Detected'}
                      </span>
                    </div>
                    <span className="scan-history__timestamp">{scan.timestamp}</span>
                  </div>

                  <svg
                    className={`scan-history__expand-icon ${
                      expandedId === scan.id ? 'scan-history__expand-icon--open' : ''
                    }`}
                    width="12"
                    height="8"
                    viewBox="0 0 12 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 1.5L6 6.5L11 1.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {expandedId === scan.id && (
                  <div className="scan-history__item-details">
                    <div className="scan-history__detail-row">
                      <span className="scan-history__detail-label">Confidence:</span>
                      <span className="scan-history__detail-value">
                        {(scan.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="scan-history__detail-row">
                      <span className="scan-history__detail-label">Resolution:</span>
                      <span className="scan-history__detail-value">
                        {scan.details.resolution}
                      </span>
                    </div>
                    <div className="scan-history__detail-row">
                      <span className="scan-history__detail-label">File Size:</span>
                      <span className="scan-history__detail-value">
                        {scan.details.fileSize}
                      </span>
                    </div>
                    <div className="scan-history__detail-row">
                      <span className="scan-history__detail-label">Scan Duration:</span>
                      <span className="scan-history__detail-value">
                        {scan.details.scanDuration}
                      </span>
                    </div>
                    {scan.tumorCount !== undefined && (
                      <>
                        <div className="scan-history__detail-row">
                          <span className="scan-history__detail-label">Year:</span>
                          <span className="scan-history__detail-value">
                            {scan.year}
                          </span>
                        </div>
                        <div className="scan-history__detail-row">
                          <span className="scan-history__detail-label">Tumor Count:</span>
                          <span className="scan-history__detail-value">
                            {scan.tumorCount}
                          </span>
                        </div>
                        {scan.tumorAreaPercent > 0 && (
                          <div className="scan-history__detail-row">
                            <span className="scan-history__detail-label">Tumor Area:</span>
                            <span className="scan-history__detail-value">
                              {scan.tumorAreaPercent.toFixed(2)}% of image
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          )}
        </div>
      )}
    </div>
  );
}
