import React, { useState, useRef } from 'react';
import API_BASE_URL from '../config';
import './ScanComparison.css';

/**
 * ScanComparison Component
 * Allows users to compare two MRI scans and view change metrics
 */
export default function ScanComparison({ isExpanded = false }) {
  const [fixedFile, setFixedFile] = useState(null);
  const [movingFile, setMovingFile] = useState(null);
  const [fixedPreview, setFixedPreview] = useState(null);
  const [movingPreview, setMovingPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [fixedAnnotated, setFixedAnnotated] = useState(null);
  const [movingAnnotated, setMovingAnnotated] = useState(null);
  const [error, setError] = useState(null);
  
  const fixedInputRef = useRef(null);
  const movingInputRef = useRef(null);

  const handleFixedFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    setFixedFile(file);
    setError(null);
    const reader = new FileReader();
    reader.onload = (evt) => setFixedPreview(evt.target.result);
    reader.readAsDataURL(file);
  };

  const handleMovingFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    setMovingFile(file);
    setError(null);
    const reader = new FileReader();
    reader.onload = (evt) => setMovingPreview(evt.target.result);
    reader.readAsDataURL(file);
  };

  const handleCompare = async () => {
    if (!fixedFile || !movingFile) {
      setError('Please select both images to compare');
      return;
    }

    setLoading(true);
    setError(null);
    setMetrics(null);
    setFixedAnnotated(null);
    setMovingAnnotated(null);

    try {
      const formData = new FormData();
      formData.append('fixed_img', fixedFile);
      formData.append('moving_img', movingFile);
      formData.append('confidence', '0.5');
      formData.append('return_annotated', 'true');

      const response = await fetch(`${API_BASE_URL}/compare-scans`, {
        method: 'POST',
        body: formData,
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (!response.ok) {
        let errorMessage = 'Comparison failed';
        if (isJson) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || 'Comparison failed';
          } catch (e) {
            // If JSON parsing fails, try to get text
            const text = await response.text();
            errorMessage = text || 'Comparison failed';
          }
        } else {
          const text = await response.text();
          errorMessage = text || 'Comparison failed';
        }
        throw new Error(errorMessage);
      }

      // Parse response
      let result;
      if (isJson) {
        result = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Unexpected response format: ${text.substring(0, 100)}`);
      }
      
      setMetrics(result.metrics);
      
      if (result.fixed_annotated) {
        setFixedAnnotated(`data:image/png;base64,${result.fixed_annotated}`);
      }
      
      if (result.moving_annotated) {
        setMovingAnnotated(`data:image/png;base64,${result.moving_annotated}`);
      }
    } catch (err) {
      console.error('Comparison error:', err);
      setError(err.message || 'Failed to compare scans');
    } finally {
      setLoading(false);
    }
  };

  const resetComparison = () => {
    setFixedFile(null);
    setMovingFile(null);
    setFixedPreview(null);
    setMovingPreview(null);
    setMetrics(null);
    setFixedAnnotated(null);
    setMovingAnnotated(null);
    setError(null);
    if (fixedInputRef.current) fixedInputRef.current.value = '';
    if (movingInputRef.current) movingInputRef.current.value = '';
  };

  // Compact preview view (when not expanded)
  if (!isExpanded) {
    return (
      <div className="scan-comparison-preview">
        <div className="preview-header">
          <svg className="preview-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="18" rx="1"></rect>
            <rect x="14" y="3" width="7" height="18" rx="1"></rect>
            <line x1="6.5" y1="8" x2="6.5" y2="8"></line>
            <line x1="6.5" y1="12" x2="6.5" y2="12"></line>
            <line x1="6.5" y1="16" x2="6.5" y2="16"></line>
            <line x1="17.5" y1="8" x2="17.5" y2="8"></line>
            <line x1="17.5" y1="12" x2="17.5" y2="12"></line>
            <line x1="17.5" y1="16" x2="17.5" y2="16"></line>
          </svg>
          <div className="preview-title-section">
            <div className="preview-title">Scan Comparison</div>
            <div className="preview-subtitle">Compare two MRI scans</div>
          </div>
        </div>
        
        <div className="preview-content">
          {fixedPreview || movingPreview ? (
            <div className="preview-info-message">
              <svg className="info-message-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="18" rx="1"></rect>
                <rect x="14" y="3" width="7" height="18" rx="1"></rect>
                <line x1="6.5" y1="8" x2="6.5" y2="8"></line>
                <line x1="6.5" y1="12" x2="6.5" y2="12"></line>
                <line x1="6.5" y1="16" x2="6.5" y2="16"></line>
                <line x1="17.5" y1="8" x2="17.5" y2="8"></line>
                <line x1="17.5" y1="12" x2="17.5" y2="12"></line>
                <line x1="17.5" y1="16" x2="17.5" y2="16"></line>
              </svg>
              <div className="info-message-text">Scan Comparison</div>
              <div className="info-message-hint">Expand to compare scans and view metrics</div>
            </div>
          ) : (
            <div className="preview-info-message">
              <svg className="info-message-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="18" rx="1"></rect>
                <rect x="14" y="3" width="7" height="18" rx="1"></rect>
                <line x1="6.5" y1="8" x2="6.5" y2="8"></line>
                <line x1="6.5" y1="12" x2="6.5" y2="12"></line>
                <line x1="6.5" y1="16" x2="6.5" y2="16"></line>
                <line x1="17.5" y1="8" x2="17.5" y2="8"></line>
                <line x1="17.5" y1="12" x2="17.5" y2="12"></line>
                <line x1="17.5" y1="16" x2="17.5" y2="16"></line>
              </svg>
              <div className="info-message-text">Scan Comparison</div>
              <div className="info-message-hint">Select two scans to compare</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full expanded view
  return (
    <div className="scan-comparison">
      {/* File Selection */}
      <div className="comparison-controls">
        <div className="file-select-group">
          <label className="file-label">Reference Scan</label>
          <input
            ref={fixedInputRef}
            type="file"
            accept="image/*"
            onChange={handleFixedFileChange}
            className="file-input"
          />
          {fixedPreview && (
            <div className="preview-thumbnail">
              <img src={fixedPreview} alt="Fixed scan preview" />
            </div>
          )}
        </div>

        <div className="file-select-group">
          <label className="file-label">New Scan</label>
          <input
            ref={movingInputRef}
            type="file"
            accept="image/*"
            onChange={handleMovingFileChange}
            className="file-input"
          />
          {movingPreview && (
            <div className="preview-thumbnail">
              <img src={movingPreview} alt="Moving scan preview" />
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="comparison-actions">
        <button
          className="compare-button"
          onClick={handleCompare}
          disabled={!fixedFile || !movingFile || loading}
        >
          {loading ? 'Comparing...' : 'Compare Scans'}
        </button>
        {(metrics || error) && (
          <button
            className="reset-button"
            onClick={resetComparison}
            disabled={loading}
          >
            Reset
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="loading-indicator">
          <div className="spinner-small"></div>
          <span>Detecting tumours and comparing scans...</span>
        </div>
      )}

      {/* Process Steps Visualization */}
      {metrics && (
        <div className="process-steps">
          <h3 className="process-title">Comparison Process</h3>
          
          {/* Step 1: Original Scans */}
          <div className="process-step">
            <div className="step-header">
              <div className="step-number">1</div>
              <div className="step-title">Original Scans</div>
            </div>
            <div className="step-content">
              <div className="step-images">
                {fixedPreview && (
                  <div className="step-image-item">
                    <label>Reference Scan</label>
                    <img src={fixedPreview} alt="Reference scan" />
                    <div className="step-description">Original reference image</div>
                  </div>
                )}
                {movingPreview && (
                  <div className="step-image-item">
                    <label>New Scan</label>
                    <img src={movingPreview} alt="New scan" />
                    <div className="step-description">New scan to compare</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Tumour Detection */}
          {(fixedAnnotated || movingAnnotated) && (
            <div className="process-step">
              <div className="step-header">
                <div className="step-number">2</div>
                <div className="step-title">Tumour Detection</div>
              </div>
              <div className="step-content">
                <div className="step-description-box">
                  <p>YOLO model detects tumours in both scans and draws bounding boxes around each detected tumor.</p>
                  <p>Each bounding box represents a detected tumour region (rectangular/square area).</p>
                </div>
                <div className="step-images">
                  {fixedAnnotated && (
                    <div className="step-image-item">
                      <label>Reference Scan - Detected Tumours</label>
                      <img src={fixedAnnotated} alt="Reference scan with detections" />
                      <div className="step-description">
                        {metrics.fixed_scan?.num_tumors || 0} tumour(s) detected
                      </div>
                    </div>
                  )}
                  {movingAnnotated && (
                    <div className="step-image-item">
                      <label>New Scan - Detected Tumours</label>
                      <img src={movingAnnotated} alt="New scan with detections" />
                      <div className="step-description">
                        {metrics.moving_scan?.num_tumors || 0} tumour(s) detected
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Size Measurement */}
          {metrics && (
            <div className="process-step">
              <div className="step-header">
                <div className="step-number">3</div>
                <div className="step-title">Size Measurement</div>
              </div>
              <div className="step-content">
                <div className="step-description-box">
                  <p>Calculate tumour area for each bounding box: <code>area = width × height</code></p>
                  <p><strong>Normalization:</strong> Tumour sizes are normalized as a percentage of total image area to account for varying image resolutions.</p>
                  <p>This ensures accurate comparison regardless of image pixel dimensions (e.g., 25×25 vs 75×75 images).</p>
                </div>
                {metrics.fixed_scan && metrics.moving_scan && (
                  <div className="step-description-box" style={{ marginTop: '12px' }}>
                    <p><strong>Reference Scan:</strong> {metrics.fixed_scan.num_tumors} tumour(s)</p>
                    <p style={{ marginLeft: '20px' }}>
                      Total area: {metrics.fixed_scan.total_area_pixels?.toFixed(0) || '0'} pixels² 
                      ({metrics.fixed_scan.total_area_percent?.toFixed(2) || '0.00'}% of image)
                    </p>
                    <p><strong>New Scan:</strong> {metrics.moving_scan.num_tumors} tumour(s)</p>
                    <p style={{ marginLeft: '20px' }}>
                      Total area: {metrics.moving_scan.total_area_pixels?.toFixed(0) || '0'} pixels² 
                      ({metrics.moving_scan.total_area_percent?.toFixed(2) || '0.00'}% of image)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Comparison Results */}
          {metrics && metrics.comparison && (
            <div className="process-step">
              <div className="step-header">
                <div className="step-number">4</div>
                <div className="step-title">Comparison Results</div>
              </div>
              <div className="step-content">
                <div className="step-description-box">
                  <p>Direct comparison of tumour sizes and counts between scans.</p>
                  <p>No image alignment is performed - tumours are compared as detected.</p>
                  <p><strong>Area Change Calculation:</strong> The normalized area change is calculated as the difference in percentage of image area: <code>Change = New Scan % - Reference Scan %</code></p>
                  <p>For example, if Reference = 5.2% and New = 7.8%, the change is +2.6 percentage points (growth).</p>
                </div>
                
                {/* Comparison Metrics */}
                <div className="metrics-section">
                  <h4>Area Comparison (Normalized by Image Size)</h4>
                  <div className="metrics-grid">
                    <div className="metric-item">
                      <span className="metric-label">Area Change (Normalized %)</span>
                      <span className="metric-value">
                        {metrics.comparison.area_percent_change > 0 ? '+' : ''}
                        {metrics.comparison.area_percent_change?.toFixed(2) || '0.00'}%
                        {metrics.comparison.area_growth && (
                          <span className="metric-indicator growth">↑ Growth</span>
                        )}
                        {metrics.comparison.area_shrinkage && (
                          <span className="metric-indicator shrinkage">↓ Shrinkage</span>
                        )}
                      </span>
                      <div className="metric-hint">Percentage point change in tumour area relative to image size</div>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Reference: Total Area</span>
                      <span className="metric-value">
                        {metrics.fixed_scan?.total_area_percent?.toFixed(2) || '0.00'}%
                      </span>
                      <div className="metric-hint">
                        {metrics.fixed_scan?.total_area_pixels?.toFixed(0) || '0'} pixels² 
                        ({metrics.fixed_scan?.image_size?.width || '?'} × {metrics.fixed_scan?.image_size?.height || '?'})
                      </div>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">New Scan: Total Area</span>
                      <span className="metric-value">
                        {metrics.moving_scan?.total_area_percent?.toFixed(2) || '0.00'}%
                      </span>
                      <div className="metric-hint">
                        {metrics.moving_scan?.total_area_pixels?.toFixed(0) || '0'} pixels² 
                        ({metrics.moving_scan?.image_size?.width || '?'} × {metrics.moving_scan?.image_size?.height || '?'})
                      </div>
                    </div>
                  </div>
                </div>

                <div className="metrics-section">
                  <h4>Tumour Count</h4>
                  <div className="metrics-grid">
                    <div className="metric-item">
                      <span className="metric-label">Tumour Count Change</span>
                      <span className="metric-value">
                        {metrics.comparison.tumor_count_change > 0 ? '+' : ''}
                        {metrics.comparison.tumor_count_change || 0}
                      </span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">New Tumours Detected</span>
                      <span className="metric-value">
                        {metrics.comparison.new_tumors_detected || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Individual Tumor Details */}
                {metrics.fixed_scan?.tumors && metrics.fixed_scan.tumors.length > 0 && (
                  <div className="metrics-section">
                    <h4>Reference Scan Tumours</h4>
                    <div className="tumor-list">
                      {metrics.fixed_scan.tumors.map((tumor, idx) => (
                        <div key={idx} className="tumor-item">
                          <div className="tumor-info">
                            <span className="tumor-id">Tumour {tumor.id}</span>
                            <span className="tumor-details">
                              Area: {tumor.area_percent?.toFixed(2) || tumor.area?.toFixed(0) || '0'}% of image
                              {tumor.area && ` (${tumor.area.toFixed(0)} px²)`} | 
                              Size: {tumor.width.toFixed(0)} × {tumor.height.toFixed(0)} px | 
                              Confidence: {(tumor.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {metrics.moving_scan?.tumors && metrics.moving_scan.tumors.length > 0 && (
                  <div className="metrics-section">
                    <h4>New Scan Tumours</h4>
                    <div className="tumor-list">
                      {metrics.moving_scan.tumors.map((tumor, idx) => {
                        const isNew = metrics.comparison.new_tumors?.some(nt => nt.id === tumor.id);
                        return (
                          <div key={idx} className={`tumor-item ${isNew ? 'new-tumor' : ''}`}>
                            <div className="tumor-info">
                              <span className="tumor-id">
                                Tumour {tumor.id}
                                {isNew && <span className="new-badge">NEW</span>}
                              </span>
                              <span className="tumor-details">
                                Area: {tumor.area_percent?.toFixed(2) || tumor.area?.toFixed(0) || '0'}% of image
                                {tumor.area && ` (${tumor.area.toFixed(0)} px²)`} | 
                                Size: {tumor.width.toFixed(0)} × {tumor.height.toFixed(0)} px | 
                                Confidence: {(tumor.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
