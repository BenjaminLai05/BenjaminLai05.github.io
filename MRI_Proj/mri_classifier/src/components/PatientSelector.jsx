import React, { useState, useRef, useEffect } from 'react';
import './PatientSelector.css';

const MOCK_PATIENTS = [
  'John Smith',
  'Sarah Johnson',
  'Michael Chen',
  'Emily Rodriguez',
  'David Kim',
  'Lisa Anderson',
  'James Wilson',
  'Maria Garcia'
];

export default function PatientSelector({ selectedPatient, onPatientChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handlePatientSelect = (patient) => {
    onPatientChange(patient);
    setIsOpen(false);
  };

  return (
    <div className="patient-selector" ref={dropdownRef}>
      <button
        className="patient-selector__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="patient-selector__text">
          {selectedPatient || 'Patient'}
        </span>
        <svg
          className={`patient-selector__arrow ${isOpen ? 'patient-selector__arrow--open' : ''}`}
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

      {isOpen && (
        <div className="patient-selector__dropdown">
          <div className="patient-selector__list">
            {MOCK_PATIENTS.map((patient, index) => (
              <button
                key={index}
                className={`patient-selector__item ${
                  selectedPatient === patient ? 'patient-selector__item--selected' : ''
                }`}
                onClick={() => handlePatientSelect(patient)}
              >
                {patient}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
