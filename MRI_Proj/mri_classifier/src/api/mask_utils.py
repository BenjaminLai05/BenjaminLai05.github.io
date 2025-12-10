"""
Utility functions for converting YOLO bounding boxes to pixel masks
"""
import numpy as np
import cv2
from typing import Tuple, Optional


def boxes_to_binary_mask(
    boxes: np.ndarray,
    image_shape: Tuple[int, int],
    confidences: Optional[np.ndarray] = None
) -> np.ndarray:
    """
    Convert YOLO bounding boxes to a binary pixel mask.
    
    Args:
        boxes: Array of bounding boxes in format [[x1, y1, x2, y2], ...]
               Shape: (N, 4) where N is number of detections
        image_shape: Tuple of (height, width) of the image
        confidences: Optional array of confidence scores. If provided, only boxes
                    above a threshold (0.5) are included. Shape: (N,)
    
    Returns:
        Binary mask as numpy array of shape (height, width) with dtype uint8
        Values are 0 (background) or 255 (detected region)
    """
    height, width = image_shape
    mask = np.zeros((height, width), dtype=np.uint8)
    
    # Filter boxes by confidence if provided
    if confidences is not None:
        boxes = boxes[confidences >= 0.5]
    
    # Draw rectangles for each bounding box
    for box in boxes:
        x1, y1, x2, y2 = box.astype(int)
        # Ensure coordinates are within image bounds
        x1 = max(0, min(x1, width - 1))
        y1 = max(0, min(y1, height - 1))
        x2 = max(0, min(x2, width - 1))
        y2 = max(0, min(y2, height - 1))
        
        # Fill rectangle in mask
        mask[y1:y2, x1:x2] = 255
    
    return mask


def boxes_to_confidence_mask(
    boxes: np.ndarray,
    confidences: np.ndarray,
    image_shape: Tuple[int, int]
) -> np.ndarray:
    """
    Convert YOLO bounding boxes to a confidence-weighted mask.
    
    Each pixel in the mask contains the confidence value (0.0-1.0) where
    overlapping boxes use the maximum confidence.
    
    Args:
        boxes: Array of bounding boxes in format [[x1, y1, x2, y2], ...]
               Shape: (N, 4)
        confidences: Array of confidence scores. Shape: (N,)
        image_shape: Tuple of (height, width) of the image
    
    Returns:
        Confidence mask as numpy array of shape (height, width) with dtype float32
        Values range from 0.0 (background) to 1.0 (highest confidence)
    """
    height, width = image_shape
    mask = np.zeros((height, width), dtype=np.float32)
    
    # Draw rectangles with confidence values
    for box, conf in zip(boxes, confidences):
        x1, y1, x2, y2 = box.astype(int)
        # Ensure coordinates are within image bounds
        x1 = max(0, min(x1, width - 1))
        y1 = max(0, min(y1, height - 1))
        x2 = max(0, min(x2, width - 1))
        y2 = max(0, min(y2, height - 1))
        
        # Use maximum confidence for overlapping regions
        mask[y1:y2, x1:x2] = np.maximum(mask[y1:y2, x1:x2], conf)
    
    return mask


def extract_boxes_and_confidences(yolo_results) -> Tuple[np.ndarray, np.ndarray]:
    """
    Extract bounding boxes and confidence scores from YOLO results.
    
    Args:
        yolo_results: Results object from ultralytics YOLO model.predict()
    
    Returns:
        Tuple of (boxes, confidences)
        - boxes: numpy array of shape (N, 4) with format [x1, y1, x2, y2]
        - confidences: numpy array of shape (N,) with confidence scores
    """
    if len(yolo_results.boxes) == 0:
        return np.array([]).reshape(0, 4), np.array([])
    
    boxes = yolo_results.boxes.xyxy.cpu().numpy()  # [[x1, y1, x2, y2], ...]
    confidences = yolo_results.boxes.conf.cpu().numpy()  # [conf1, conf2, ...]
    
    return boxes, confidences

