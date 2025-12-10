"""
Utility functions for comparing tumors between two scans without registration
"""
import numpy as np
from typing import Dict, List, Tuple
import logging

log = logging.getLogger(__name__)


def calculate_box_area(box: np.ndarray) -> float:
    """
    Calculate area of a bounding box.
    
    Args:
        box: Bounding box in format [x1, y1, x2, y2]
    
    Returns:
        Area in pixels
    """
    x1, y1, x2, y2 = box
    width = max(0, x2 - x1)
    height = max(0, y2 - y1)
    return width * height


def calculate_box_center(box: np.ndarray) -> Tuple[float, float]:
    """
    Calculate center point of a bounding box.
    
    Args:
        box: Bounding box in format [x1, y1, x2, y2]
    
    Returns:
        Tuple of (center_x, center_y)
    """
    x1, y1, x2, y2 = box
    center_x = (x1 + x2) / 2.0
    center_y = (y1 + y2) / 2.0
    return (center_x, center_y)


def compute_tumor_comparison(
    fixed_boxes: np.ndarray,
    fixed_confidences: np.ndarray,
    moving_boxes: np.ndarray,
    moving_confidences: np.ndarray,
    fixed_image_size: Tuple[int, int],
    moving_image_size: Tuple[int, int],
    confidence_threshold: float = 0.5
) -> Dict:
    """
    Compare tumors between two scans by analyzing bounding boxes directly.
    Uses percentage-based normalization to account for varying image sizes.
    
    Args:
        fixed_boxes: Array of bounding boxes from reference scan [[x1, y1, x2, y2], ...]
        fixed_confidences: Array of confidence scores for fixed scan
        moving_boxes: Array of bounding boxes from new scan [[x1, y1, x2, y2], ...]
        moving_confidences: Array of confidence scores for moving scan
        fixed_image_size: Tuple of (width, height) for fixed image
        moving_image_size: Tuple of (width, height) for moving image
        confidence_threshold: Minimum confidence to include (default: 0.5)
    
    Returns:
        Dictionary containing comparison metrics with percentage-based normalization
    """
    log.info("Computing tumor comparison with percentage normalization...")
    
    # Calculate total image areas
    fixed_width, fixed_height = fixed_image_size
    moving_width, moving_height = moving_image_size
    fixed_total_pixels = fixed_width * fixed_height
    moving_total_pixels = moving_width * moving_height
    
    log.info("   Fixed image: %dx%d = %d pixels", fixed_width, fixed_height, fixed_total_pixels)
    log.info("   Moving image: %dx%d = %d pixels", moving_width, moving_height, moving_total_pixels)
    
    # Handle empty arrays
    if len(fixed_boxes) == 0:
        fixed_boxes = np.array([]).reshape(0, 4)
        fixed_confidences = np.array([])
    if len(moving_boxes) == 0:
        moving_boxes = np.array([]).reshape(0, 4)
        moving_confidences = np.array([])
    
    # Filter by confidence threshold
    if len(fixed_boxes) > 0:
        fixed_mask = fixed_confidences >= confidence_threshold
        fixed_boxes_filtered = fixed_boxes[fixed_mask]
        fixed_confidences_filtered = fixed_confidences[fixed_mask]
    else:
        fixed_boxes_filtered = np.array([]).reshape(0, 4)
        fixed_confidences_filtered = np.array([])
    
    if len(moving_boxes) > 0:
        moving_mask = moving_confidences >= confidence_threshold
        moving_boxes_filtered = moving_boxes[moving_mask]
        moving_confidences_filtered = moving_confidences[moving_mask]
    else:
        moving_boxes_filtered = np.array([]).reshape(0, 4)
        moving_confidences_filtered = np.array([])
    
    # Calculate areas for each tumor (in pixels)
    fixed_areas = [calculate_box_area(box) for box in fixed_boxes_filtered]
    moving_areas = [calculate_box_area(box) for box in moving_boxes_filtered]
    
    # Calculate total areas (in pixels)
    total_fixed_area = sum(fixed_areas) if fixed_areas else 0.0
    total_moving_area = sum(moving_areas) if moving_areas else 0.0
    
    # Calculate percentage of image area for each tumor and totals
    fixed_area_percent = (total_fixed_area / fixed_total_pixels * 100) if fixed_total_pixels > 0 else 0.0
    moving_area_percent = (total_moving_area / moving_total_pixels * 100) if moving_total_pixels > 0 else 0.0
    
    # Calculate percentage change
    area_percent_change = moving_area_percent - fixed_area_percent
    
    # Count tumors
    num_fixed_tumors = len(fixed_boxes_filtered)
    num_moving_tumors = len(moving_boxes_filtered)
    
    # Calculate area change
    area_change = total_moving_area - total_fixed_area
    area_change_percent = (area_change / (total_fixed_area + 1e-8)) * 100 if total_fixed_area > 0 else 0.0
    
    # Individual tumor details (with percentage normalization)
    fixed_tumors = []
    for i, (box, conf, area) in enumerate(zip(fixed_boxes_filtered, fixed_confidences_filtered, fixed_areas)):
        center_x, center_y = calculate_box_center(box)
        area_percent = (area / fixed_total_pixels * 100) if fixed_total_pixels > 0 else 0.0
        fixed_tumors.append({
            "id": i + 1,
            "box": box.tolist(),
            "center": [float(center_x), float(center_y)],
            "area": float(area),
            "area_percent": float(area_percent),
            "confidence": float(conf),
            "width": float(box[2] - box[0]),
            "height": float(box[3] - box[1])
        })
    
    moving_tumors = []
    for i, (box, conf, area) in enumerate(zip(moving_boxes_filtered, moving_confidences_filtered, moving_areas)):
        center_x, center_y = calculate_box_center(box)
        area_percent = (area / moving_total_pixels * 100) if moving_total_pixels > 0 else 0.0
        moving_tumors.append({
            "id": i + 1,
            "box": box.tolist(),
            "center": [float(center_x), float(center_y)],
            "area": float(area),
            "area_percent": float(area_percent),
            "confidence": float(conf),
            "width": float(box[2] - box[0]),
            "height": float(box[3] - box[1])
        })
    
    # Determine new tumors (tumors in moving but not in fixed)
    # Simple heuristic: if number increased, mark new ones
    new_tumors = []
    if num_moving_tumors > num_fixed_tumors:
        # Mark the extra tumors as new
        num_new = num_moving_tumors - num_fixed_tumors
        new_tumors = moving_tumors[-num_new:] if num_new > 0 else []
    
    # Build result (convert numpy types to Python native types for JSON serialization)
    result = {
        "fixed_scan": {
            "num_tumors": int(num_fixed_tumors),
            "image_size": {"width": int(fixed_width), "height": int(fixed_height)},
            "total_area_pixels": float(total_fixed_area),
            "total_area_percent": float(fixed_area_percent),
            "tumors": fixed_tumors
        },
        "moving_scan": {
            "num_tumors": int(num_moving_tumors),
            "image_size": {"width": int(moving_width), "height": int(moving_height)},
            "total_area_pixels": float(total_moving_area),
            "total_area_percent": float(moving_area_percent),
            "tumors": moving_tumors
        },
        "comparison": {
            "area_change_pixels": float(area_change),
            "area_change_percent_pixels": float(area_change_percent),
            "area_percent_change": float(area_percent_change),
            "area_growth": bool(area_percent_change > 0),
            "area_shrinkage": bool(area_percent_change < 0),
            "tumor_count_change": int(num_moving_tumors - num_fixed_tumors),
            "new_tumors_detected": int(len(new_tumors)),
            "new_tumors": new_tumors
        }
    }
    
    log.info("Tumor comparison complete: %d -> %d tumors, area change: %.2f%% (normalized)", 
             num_fixed_tumors, num_moving_tumors, area_percent_change)
    
    return result

