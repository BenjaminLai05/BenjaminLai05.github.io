import React, { useState, useEffect } from 'react';
import { getPatientStory } from '../data/patientStories';
import './PatientInfo.css';

/**
 * PatientInfo Component
 * Displays patient information in a narrative, document-style format
 * Text fields are editable but changes don't persist after refresh
 */
export default function PatientInfo({ selectedPatient, isExpanded = false }) {
  // Local state for editable fields (resets on refresh)
  const [editedNarrative, setEditedNarrative] = useState('');
  const [editedAge, setEditedAge] = useState('');
  const [editedGender, setEditedGender] = useState('');
  
  const patientStory = selectedPatient ? getPatientStory(selectedPatient) : null;
  
  // Reset edits when patient changes
  useEffect(() => {
    if (patientStory) {
      setEditedNarrative(patientStory.Narrative || '');
      setEditedAge(patientStory.Age?.toString() || '');
      setEditedGender(patientStory.Gender || '');
    }
  }, [selectedPatient, patientStory]);

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
              {editedAge || patientStory.Age} years old, {editedGender || patientStory.Gender}
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

  // Full expanded view with editable fields
  return (
    <div className="patient-info">
      {/* Header Section */}
      <div className="patient-info-header">
        <div className="patient-name-section">
          <h2 className="patient-name">{patientStory.Name}</h2>
          <div className="patient-age-gender-editable">
            <input
              type="text"
              className="editable-field editable-field--small"
              value={editedAge}
              onChange={(e) => setEditedAge(e.target.value)}
              placeholder="Age"
            />
            <span className="age-separator">years old,</span>
            <input
              type="text"
              className="editable-field editable-field--small"
              value={editedGender}
              onChange={(e) => setEditedGender(e.target.value)}
              placeholder="Gender"
            />
          </div>
        </div>
        <div className={`risk-badge risk-badge--${patientStory.RiskLevel.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')}`}>
          <span className="risk-label">Risk Level</span>
          <span className="risk-value">{patientStory.RiskLevel}</span>
        </div>
      </div>

      {/* Editable Narrative Content */}
      <div className="patient-narrative">
        <div className="narrative-edit-hint">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          <span>Click to edit (changes won't be saved)</span>
        </div>
        <textarea
          className="narrative-textarea"
          value={editedNarrative}
          onChange={(e) => setEditedNarrative(e.target.value)}
          placeholder="Enter patient narrative information..."
        />
      </div>
    </div>
  );
}

