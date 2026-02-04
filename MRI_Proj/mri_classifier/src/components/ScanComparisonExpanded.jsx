// src/components/ScanComparisonExpanded.jsx
import React, { useRef, useState } from 'react';
import API_BASE_URL from '../config';
import './ScanComparisonExpanded.css';

export default function ScanComparisonExpanded() {
    // State for images
    const [previousImage, setPreviousImage] = useState(null);
    const [previousPreview, setPreviousPreview] = useState(null);
    const [previousDimensions, setPreviousDimensions] = useState(null);
    const [currentImage, setCurrentImage] = useState(null);
    const [currentPreview, setCurrentPreview] = useState(null);
    const [currentDimensions, setCurrentDimensions] = useState(null);

    // State for scan results
    const [previousResult, setPreviousResult] = useState(null);
    const [currentResult, setCurrentResult] = useState(null);

    // State for comparison
    const [isComparing, setIsComparing] = useState(false);
    const [comparisonComplete, setComparisonComplete] = useState(false);

    // File input refs
    const previousInputRef = useRef(null);
    const currentInputRef = useRef(null);

    // Get image dimensions from file
    const getImageDimensions = (file) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                resolve({ width: img.width, height: img.height });
                URL.revokeObjectURL(img.src);
            };
            img.onerror = () => {
                resolve(null);
            };
            img.src = URL.createObjectURL(file);
        });
    };

    // Handle file selection
    const handleFileSelect = async (file, type) => {
        if (!file) return;

        // Validate file type (images and videos only)
        const validTypes = ['image/', 'video/'];
        const isValid = validTypes.some(t => file.type.startsWith(t));

        if (!isValid) {
            alert('Please select an image or video file.');
            return;
        }

        // Get image dimensions
        const dimensions = await getImageDimensions(file);

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);

        if (type === 'previous') {
            setPreviousImage(file);
            setPreviousPreview(previewUrl);
            setPreviousDimensions(dimensions);
            setPreviousResult(null);
        } else {
            setCurrentImage(file);
            setCurrentPreview(previewUrl);
            setCurrentDimensions(dimensions);
            setCurrentResult(null);
        }

        // Reset comparison when new image uploaded
        setComparisonComplete(false);
    };

    // Calculate tumour area from boxes (absolute pixels)
    const calculateAbsoluteArea = (boxes) => {
        if (!boxes || boxes.length === 0) return 0;
        return boxes.reduce((total, box) => {
            const width = box[2] - box[0];
            const height = box[3] - box[1];
            return total + (width * height);
        }, 0);
    };

    // Calculate tumour area as percentage of total image area
    const calculatePercentageArea = (boxes, dimensions) => {
        if (!boxes || boxes.length === 0 || !dimensions) return 0;
        const absoluteArea = calculateAbsoluteArea(boxes);
        const imageArea = dimensions.width * dimensions.height;
        return (absoluteArea / imageArea) * 100;
    };

    // Scan a single image
    const scanImage = async (file) => {
        const formData = new FormData();
        formData.append('img', file);
        formData.append('confidence', '0.5');

        const response = await fetch(`${API_BASE_URL}/scan-with-mask`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Scan failed');
        }

        return await response.json();
    };

    // Handle comparison
    const handleCompare = async () => {
        if (!previousImage || !currentImage) return;

        setIsComparing(true);
        setComparisonComplete(false);

        try {
            // Scan both images in parallel
            const [prevResult, currResult] = await Promise.all([
                scanImage(previousImage),
                scanImage(currentImage),
            ]);

            setPreviousResult(prevResult);
            setCurrentResult(currResult);
            setComparisonComplete(true);
        } catch (error) {
            console.error('Comparison failed:', error);
            alert('Failed to compare scans. Please try again.');
        } finally {
            setIsComparing(false);
        }
    };

    // Calculate comparison metrics using normalized percentages
    const getComparisonMetrics = () => {
        if (!previousResult || !currentResult || !previousDimensions || !currentDimensions) return null;

        // Calculate normalized percentage areas
        const prevAreaPercent = calculatePercentageArea(previousResult.boxes, previousDimensions);
        const currAreaPercent = calculatePercentageArea(currentResult.boxes, currentDimensions);

        // Difference in percentage points
        const areaDiffPercent = currAreaPercent - prevAreaPercent;

        // Relative percentage change (how much did the tumour grow/shrink)
        const relativeChange = prevAreaPercent > 0
            ? ((areaDiffPercent / prevAreaPercent) * 100).toFixed(1)
            : currAreaPercent > 0 ? 100 : 0;

        return {
            prevCount: previousResult.num_detections,
            currCount: currentResult.num_detections,
            prevAreaPercent: prevAreaPercent.toFixed(2),
            currAreaPercent: currAreaPercent.toFixed(2),
            areaDiffPercent: areaDiffPercent.toFixed(2),
            relativeChange,
            isGrowth: areaDiffPercent > 0.001,  // Small threshold to avoid floating point issues
            isReduction: areaDiffPercent < -0.001,
            noChange: Math.abs(areaDiffPercent) <= 0.001,
        };
    };

    const metrics = getComparisonMetrics();

    return (
        <div className="scan-comparison-expanded">
            {/* Top Section: Upload buttons and image previews */}
            <div className="comparison-upload-section">
                <div className="comparison-column">
                    <input
                        ref={previousInputRef}
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => handleFileSelect(e.target.files[0], 'previous')}
                        style={{ display: 'none' }}
                    />
                    <button
                        className="comparison-upload-btn"
                        onClick={() => previousInputRef.current?.click()}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Previous Image
                    </button>
                    <div className="comparison-image-container">
                        {previousPreview ? (
                            <img src={previousPreview} alt="Previous scan" />
                        ) : (
                            <div className="image-placeholder">
                                <span>No image</span>
                            </div>
                        )}
                    </div>
                    {previousDimensions && (
                        <div className="image-dimensions">
                            {previousDimensions.width} × {previousDimensions.height} px
                        </div>
                    )}
                </div>

                <div className="comparison-column">
                    <input
                        ref={currentInputRef}
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => handleFileSelect(e.target.files[0], 'current')}
                        style={{ display: 'none' }}
                    />
                    <button
                        className="comparison-upload-btn"
                        onClick={() => currentInputRef.current?.click()}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Current Image
                    </button>
                    <div className="comparison-image-container">
                        {currentPreview ? (
                            <img src={currentPreview} alt="Current scan" />
                        ) : (
                            <div className="image-placeholder">
                                <span>No image</span>
                            </div>
                        )}
                    </div>
                    {currentDimensions && (
                        <div className="image-dimensions">
                            {currentDimensions.width} × {currentDimensions.height} px
                        </div>
                    )}
                </div>
            </div>

            {/* Compare Button */}
            <div className="comparison-action-section">
                <button
                    className="compare-btn"
                    onClick={handleCompare}
                    disabled={!previousImage || !currentImage || isComparing}
                >
                    {isComparing ? (
                        <>
                            <span className="spinner-icon"></span>
                            Comparing...
                        </>
                    ) : (
                        <>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            Compare Scans
                        </>
                    )}
                </button>
            </div>

            {/* Results Section */}
            {comparisonComplete && metrics && (
                <div className="comparison-results-section">
                    <h3 className="results-title">Comparison Results</h3>

                    <div className="results-grid">
                        {/* Previous Scan Results */}
                        <div className="result-card">
                            <div className="result-card-header">Previous Scan</div>
                            <div className="result-card-body">
                                {previousResult?.annotated_image && (
                                    <div className="annotated-image-container">
                                        <img
                                            src={`data:image/png;base64,${previousResult.annotated_image}`}
                                            alt="Previous annotated"
                                        />
                                    </div>
                                )}
                                <div className="result-stats">
                                    <div className="stat">
                                        <span className="stat-label">Tumours Detected</span>
                                        <span className="stat-value">{metrics.prevCount}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">Tumour Coverage</span>
                                        <span className="stat-value">{metrics.prevAreaPercent}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Current Scan Results */}
                        <div className="result-card">
                            <div className="result-card-header">Current Scan</div>
                            <div className="result-card-body">
                                {currentResult?.annotated_image && (
                                    <div className="annotated-image-container">
                                        <img
                                            src={`data:image/png;base64,${currentResult.annotated_image}`}
                                            alt="Current annotated"
                                        />
                                    </div>
                                )}
                                <div className="result-stats">
                                    <div className="stat">
                                        <span className="stat-label">Tumours Detected</span>
                                        <span className="stat-value">{metrics.currCount}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">Tumour Coverage</span>
                                        <span className="stat-value">{metrics.currAreaPercent}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comparison Summary */}
                    <div className={`comparison-summary ${metrics.isGrowth ? 'growth' : metrics.isReduction ? 'reduction' : 'stable'}`}>
                        <div className="summary-icon">
                            {metrics.isGrowth ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                    <polyline points="17 6 23 6 23 12" />
                                </svg>
                            ) : metrics.isReduction ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                                    <polyline points="17 18 23 18 23 12" />
                                </svg>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            )}
                        </div>
                        <div className="summary-content">
                            <div className="summary-label">
                                {metrics.isGrowth ? 'Tumour Growth Detected' :
                                    metrics.isReduction ? 'Tumour Reduction Detected' :
                                        'No Significant Change'}
                            </div>
                            <div className="summary-value">
                                {metrics.noChange ? (
                                    'Coverage is equal'
                                ) : (
                                    <>
                                        {metrics.isGrowth ? '+' : ''}{metrics.relativeChange}% relative change
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
