"""
Utility functions for computing change metrics between two aligned scans
"""
import numpy as np
from typing import Dict, Tuple, Optional
import logging

log = logging.getLogger(__name__)


def compute_change_metrics(
    fixed_image: np.ndarray,
    registered_image: np.ndarray,
    fixed_mask: Optional[np.ndarray] = None,
    registered_mask: Optional[np.ndarray] = None,
    intensity_threshold: float = 10.0
) -> Dict:
    """
    Compute comprehensive change metrics between two aligned scans.
    
    Args:
        fixed_image: Reference image (numpy array, grayscale or RGB)
        registered_image: Aligned image to compare (numpy array, same format)
        fixed_mask: Optional mask for fixed image (binary or confidence-weighted)
        registered_mask: Optional mask for registered image (binary or confidence-weighted)
        intensity_threshold: Threshold for considering a pixel as "changed" (default: 10.0)
    
    Returns:
        Dictionary containing all computed metrics
    """
    log.info("Computing change metrics...")
    
    # Convert to grayscale if RGB
    if len(fixed_image.shape) == 3:
        fixed_gray = np.mean(fixed_image, axis=2).astype(np.float32)
    else:
        fixed_gray = fixed_image.astype(np.float32)
    
    if len(registered_image.shape) == 3:
        registered_gray = np.mean(registered_image, axis=2).astype(np.float32)
    else:
        registered_gray = registered_image.astype(np.float32)
    
    # Ensure same size
    if fixed_gray.shape != registered_gray.shape:
        from PIL import Image as PILImage
        registered_pil = PILImage.fromarray(registered_gray.astype(np.uint8), mode='L')
        registered_pil = registered_pil.resize(
            (fixed_gray.shape[1], fixed_gray.shape[0]),
            PILImage.Resampling.LANCZOS
        )
        registered_gray = np.array(registered_pil).astype(np.float32)
    
    # Compute absolute difference
    diff_image = np.abs(fixed_gray - registered_gray)
    
    # Overall image metrics
    metrics = {
        "overall": {
            "mean_intensity_fixed": float(np.mean(fixed_gray)),
            "mean_intensity_registered": float(np.mean(registered_gray)),
            "mean_intensity_change": float(np.mean(registered_gray) - np.mean(fixed_gray)),
            "mean_intensity_change_percent": float(
                ((np.mean(registered_gray) - np.mean(fixed_gray)) / (np.mean(fixed_gray) + 1e-8)) * 100
            ),
            "mean_absolute_difference": float(np.mean(diff_image)),
            "max_absolute_difference": float(np.max(diff_image)),
            "std_absolute_difference": float(np.std(diff_image)),
        }
    }
    
    # Pixel-level change metrics
    changed_pixels = diff_image > intensity_threshold
    total_pixels = diff_image.size
    
    metrics["pixel_changes"] = {
        "total_pixels": int(total_pixels),
        "changed_pixels": int(np.sum(changed_pixels)),
        "unchanged_pixels": int(total_pixels - np.sum(changed_pixels)),
        "change_fraction": float(np.sum(changed_pixels) / total_pixels),
        "change_percentage": float((np.sum(changed_pixels) / total_pixels) * 100),
        "intensity_threshold_used": float(intensity_threshold)
    }
    
    # Mask-based metrics (if masks provided)
    if fixed_mask is not None or registered_mask is not None:
        mask_metrics = compute_mask_based_metrics(
            fixed_gray,
            registered_gray,
            fixed_mask,
            registered_mask,
            intensity_threshold
        )
        metrics["mask_based"] = mask_metrics
    
    # Regional intensity changes (if masks provided)
    if fixed_mask is not None:
        metrics["fixed_mask_region"] = compute_region_metrics(
            fixed_gray,
            registered_gray,
            fixed_mask,
            "fixed_mask"
        )
    
    if registered_mask is not None:
        metrics["registered_mask_region"] = compute_region_metrics(
            fixed_gray,
            registered_gray,
            registered_mask,
            "registered_mask"
        )
    
    # Dice coefficient (if both masks provided)
    if fixed_mask is not None and registered_mask is not None:
        dice = compute_dice_coefficient(fixed_mask, registered_mask)
        metrics["mask_overlap"] = {
            "dice_coefficient": float(dice),
            "intersection_over_union": float(compute_iou(fixed_mask, registered_mask))
        }
    
    log.info("Change metrics computed successfully")
    
    return metrics


def compute_mask_based_metrics(
    fixed_image: np.ndarray,
    registered_image: np.ndarray,
    fixed_mask: Optional[np.ndarray],
    registered_mask: Optional[np.ndarray],
    intensity_threshold: float
) -> Dict:
    """
    Compute metrics specifically for masked regions.
    """
    metrics = {}
    
    # Normalize masks to binary if needed
    if fixed_mask is not None:
        if fixed_mask.dtype != np.uint8:
            fixed_mask_binary = (fixed_mask > 0.5).astype(np.uint8) * 255
        else:
            fixed_mask_binary = (fixed_mask > 127).astype(np.uint8) * 255
        
        # Compute metrics in fixed mask region
        fixed_region_fixed = fixed_image[fixed_mask_binary > 0]
        fixed_region_registered = registered_image[fixed_mask_binary > 0]
        
        if len(fixed_region_fixed) > 0:
            metrics["fixed_mask_region"] = {
                "mean_intensity_fixed": float(np.mean(fixed_region_fixed)),
                "mean_intensity_registered": float(np.mean(fixed_region_registered)),
                "intensity_change": float(np.mean(fixed_region_registered) - np.mean(fixed_region_fixed)),
                "intensity_change_percent": float(
                    ((np.mean(fixed_region_registered) - np.mean(fixed_region_fixed)) / 
                     (np.mean(fixed_region_fixed) + 1e-8)) * 100
                ),
                "pixel_count": int(len(fixed_region_fixed))
            }
    
    if registered_mask is not None:
        if registered_mask.dtype != np.uint8:
            registered_mask_binary = (registered_mask > 0.5).astype(np.uint8) * 255
        else:
            registered_mask_binary = (registered_mask > 127).astype(np.uint8) * 255
        
        # Compute metrics in registered mask region
        reg_region_fixed = fixed_image[registered_mask_binary > 0]
        reg_region_registered = registered_image[registered_mask_binary > 0]
        
        if len(reg_region_fixed) > 0:
            metrics["registered_mask_region"] = {
                "mean_intensity_fixed": float(np.mean(reg_region_fixed)),
                "mean_intensity_registered": float(np.mean(reg_region_registered)),
                "intensity_change": float(np.mean(reg_region_registered) - np.mean(reg_region_fixed)),
                "intensity_change_percent": float(
                    ((np.mean(reg_region_registered) - np.mean(reg_region_fixed)) / 
                     (np.mean(reg_region_fixed) + 1e-8)) * 100
                ),
                "pixel_count": int(len(reg_region_fixed))
            }
    
    return metrics


def compute_region_metrics(
    fixed_image: np.ndarray,
    registered_image: np.ndarray,
    mask: np.ndarray,
    region_name: str
) -> Dict:
    """
    Compute intensity metrics for a specific masked region.
    """
    # Normalize mask to binary
    if mask.dtype != np.uint8:
        mask_binary = (mask > 0.5).astype(np.uint8) * 255
    else:
        mask_binary = (mask > 127).astype(np.uint8) * 255
    
    # Extract region pixels
    region_fixed = fixed_image[mask_binary > 0]
    region_registered = registered_image[mask_binary > 0]
    
    if len(region_fixed) == 0:
        return {
            "pixel_count": 0,
            "mean_intensity_fixed": 0.0,
            "mean_intensity_registered": 0.0,
            "intensity_change": 0.0
        }
    
    return {
        "pixel_count": int(len(region_fixed)),
        "mean_intensity_fixed": float(np.mean(region_fixed)),
        "mean_intensity_registered": float(np.mean(region_registered)),
        "intensity_change": float(np.mean(region_registered) - np.mean(region_fixed)),
        "intensity_change_percent": float(
            ((np.mean(region_registered) - np.mean(region_fixed)) / 
             (np.mean(region_fixed) + 1e-8)) * 100
        ),
        "std_intensity_fixed": float(np.std(region_fixed)),
        "std_intensity_registered": float(np.std(region_registered))
    }


def compute_area_change(
    fixed_mask: np.ndarray,
    registered_mask: np.ndarray
) -> Dict:
    """
    Compute area change between two masks.
    """
    # Normalize to binary
    if fixed_mask.dtype != np.uint8:
        fixed_binary = (fixed_mask > 0.5).astype(np.uint8)
    else:
        fixed_binary = (fixed_mask > 127).astype(np.uint8)
    
    if registered_mask.dtype != np.uint8:
        registered_binary = (registered_mask > 0.5).astype(np.uint8)
    else:
        registered_binary = (registered_mask > 127).astype(np.uint8)
    
    fixed_area = np.sum(fixed_binary)
    registered_area = np.sum(registered_binary)
    
    area_change = registered_area - fixed_area
    area_change_percent = (area_change / (fixed_area + 1e-8)) * 100
    
    return {
        "fixed_area_pixels": int(fixed_area),
        "registered_area_pixels": int(registered_area),
        "area_change_pixels": int(area_change),
        "area_change_percent": float(area_change_percent),
        "area_growth": area_change > 0,
        "area_shrinkage": area_change < 0
    }


def compute_dice_coefficient(mask1: np.ndarray, mask2: np.ndarray) -> float:
    """
    Compute Dice coefficient (overlap metric) between two masks.
    Range: 0.0 (no overlap) to 1.0 (perfect overlap)
    """
    # Normalize to binary
    if mask1.dtype != np.uint8:
        mask1_binary = (mask1 > 0.5).astype(np.uint8)
    else:
        mask1_binary = (mask1 > 127).astype(np.uint8)
    
    if mask2.dtype != np.uint8:
        mask2_binary = (mask2 > 0.5).astype(np.uint8)
    else:
        mask2_binary = (mask2 > 127).astype(np.uint8)
    
    intersection = np.sum(mask1_binary & mask2_binary)
    union = np.sum(mask1_binary) + np.sum(mask2_binary)
    
    if union == 0:
        return 0.0
    
    dice = (2.0 * intersection) / union
    return float(dice)


def compute_iou(mask1: np.ndarray, mask2: np.ndarray) -> float:
    """
    Compute Intersection over Union (IoU) between two masks.
    Range: 0.0 (no overlap) to 1.0 (perfect overlap)
    """
    # Normalize to binary
    if mask1.dtype != np.uint8:
        mask1_binary = (mask1 > 0.5).astype(np.uint8)
    else:
        mask1_binary = (mask1 > 127).astype(np.uint8)
    
    if mask2.dtype != np.uint8:
        mask2_binary = (mask2 > 0.5).astype(np.uint8)
    else:
        mask2_binary = (mask2 > 127).astype(np.uint8)
    
    intersection = np.sum(mask1_binary & mask2_binary)
    union = np.sum(mask1_binary | mask2_binary)
    
    if union == 0:
        return 0.0
    
    iou = intersection / union
    return float(iou)


def create_change_visualization(
    fixed_image: np.ndarray,
    registered_image: np.ndarray,
    diff_image: Optional[np.ndarray] = None
) -> np.ndarray:
    """
    Create a visualization showing the changes between two images.
    Returns a color-coded difference image.
    """
    # Convert to grayscale if needed
    if len(fixed_image.shape) == 3:
        fixed_gray = np.mean(fixed_image, axis=2)
    else:
        fixed_gray = fixed_image
    
    if len(registered_image.shape) == 3:
        registered_gray = np.mean(registered_image, axis=2)
    else:
        registered_gray = registered_image
    
    # Compute difference if not provided
    if diff_image is None:
        diff_image = registered_gray.astype(np.float32) - fixed_gray.astype(np.float32)
    
    # Normalize difference to -1 to 1 range
    diff_normalized = diff_image / (np.abs(diff_image).max() + 1e-8)
    
    # Create color-coded visualization
    # Red = increased intensity, Blue = decreased intensity
    visualization = np.zeros((*diff_normalized.shape, 3), dtype=np.uint8)
    
    # Red channel for increases
    increases = diff_normalized > 0
    visualization[increases, 0] = (np.abs(diff_normalized[increases]) * 255).astype(np.uint8)
    
    # Blue channel for decreases
    decreases = diff_normalized < 0
    visualization[decreases, 2] = (np.abs(diff_normalized[decreases]) * 255).astype(np.uint8)
    
    # Overlay on grayscale base
    base_gray = fixed_gray.astype(np.float32) / 255.0
    for c in range(3):
        visualization[:, :, c] = np.clip(
            (base_gray * 128 + visualization[:, :, c] * 0.7).astype(np.uint8),
            0, 255
        )
    
    return visualization

