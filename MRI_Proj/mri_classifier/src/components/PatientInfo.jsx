import React from 'react';
import { getPatientStory } from '../data/patientStories';
import './PatientInfo.css';

/**
 * PatientInfo Component
 * Displays patient information in a narrative, document-style format
 */
export default function PatientInfo({ selectedPatient, isExpanded = false }) {
  if (!selectedPatient) {
    return (
      <div className="patient-info-empty">
        <svg className="empty-state-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <p className="empty-state-text">Select a patient to view their information</p>
      </div>
    );
  }

  const patientStory = getPatientStory(selectedPatient);

  if (!patientStory) {
    return (
      <div className="patient-info-empty">
        <svg className="empty-state-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <p className="empty-state-text">Patient information not available</p>
      </div>
    );
  }

  // Compact preview view (when not expanded)
  if (!isExpanded) {
    return (
      <div className="patient-info-preview">
        <div className="preview-header">
          <svg className="preview-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <div className="preview-title-section">
            <div className="preview-title">{patientStory.Name}</div>
            <div className="preview-subtitle">
              {patientStory.Age} years old, {patientStory.Gender}
            </div>
          </div>
        </div>
        
        <div className="preview-content">
          <div className="preview-info-message">
            <svg className="info-message-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <div className="info-message-text">Patient Information</div>
            <div className="info-message-hint">Expand for detailed medical history and risk factors</div>
          </div>
        </div>
      </div>
    );
  }

  // Full expanded view
  return (
    <div className="patient-info">
      {/* Header Section */}
      <div className="patient-info-header">
        <div className="patient-name-section">
          <h2 className="patient-name">{patientStory.Name}</h2>
          <span className="patient-age-gender">
            {patientStory.Age} years old, {patientStory.Gender}
          </span>
        </div>
        <div className={`risk-badge risk-badge--${patientStory.RiskLevel.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')}`}>
          <span className="risk-label">Risk Level</span>
          <span className="risk-value">{patientStory.RiskLevel}</span>
        </div>
      </div>

      {/* Narrative Content */}
      <div className="patient-narrative">
        {patientStory.Narrative ? (
          <div className="narrative-text">
            {patientStory.Narrative.split('\n\n').map((paragraph, index) => (
              <p key={index} className="narrative-paragraph">
                {paragraph}
              </p>
            ))}
          </div>
        ) : (
          <p className="narrative-paragraph">
            Patient narrative information is being compiled.
          </p>
        )}
      </div>
    </div>
  );
}
