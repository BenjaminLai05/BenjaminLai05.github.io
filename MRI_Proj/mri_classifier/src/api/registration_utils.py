"""
Utility functions for image registration using SimpleITK
Aligns two MRI scans so they can be compared pixel-by-pixel
"""
import numpy as np
import SimpleITK as sitk
from PIL import Image
from typing import Tuple, Optional
import logging

log = logging.getLogger(__name__)


def register_images(
    fixed_image: np.ndarray,
    moving_image: np.ndarray,
    registration_type: str = "rigid"
) -> Tuple[np.ndarray, sitk.Transform]:
    """
    Register (align) a moving image to a fixed image.
    
    Args:
        fixed_image: Reference image to align to (numpy array, grayscale or RGB)
        moving_image: Image to be aligned (numpy array, same format as fixed)
        registration_type: "rigid" (translation + rotation) or "affine" (includes scaling/shearing)
    
    Returns:
        Tuple of (registered_image, transform)
        - registered_image: Aligned moving image as numpy array
        - transform: SimpleITK transform object (can be saved/reused)
    """
    log.info(f"Starting {registration_type} registration...")
    
    # Convert to grayscale if RGB
    if len(fixed_image.shape) == 3:
        fixed_gray = np.mean(fixed_image, axis=2)
    else:
        fixed_gray = fixed_image.copy()
    
    if len(moving_image.shape) == 3:
        moving_gray = np.mean(moving_image, axis=2)
    else:
        moving_gray = moving_image.copy()
    
    # Resize moving image to match fixed image size if different
    if fixed_gray.shape != moving_gray.shape:
        log.info(f"   Resizing moving image from {moving_gray.shape} to {fixed_gray.shape}")
        from PIL import Image as PILImage
        moving_pil = PILImage.fromarray(moving_gray.astype(np.uint8))
        moving_pil = moving_pil.resize((fixed_gray.shape[1], fixed_gray.shape[0]), PILImage.Resampling.LANCZOS)
        moving_gray = np.array(moving_pil)
    
    # Convert to float32 for SimpleITK (required for registration)
    fixed_gray = fixed_gray.astype(np.float32)
    moving_gray = moving_gray.astype(np.float32)
    
    # Normalize to 0-1 range for better registration
    fixed_gray = (fixed_gray - fixed_gray.min()) / (fixed_gray.max() - fixed_gray.min() + 1e-8)
    moving_gray = (moving_gray - moving_gray.min()) / (moving_gray.max() - moving_gray.min() + 1e-8)
    
    # Convert numpy arrays to SimpleITK images
    fixed_sitk = sitk.GetImageFromArray(fixed_gray)
    moving_sitk = sitk.GetImageFromArray(moving_gray)
    
    # Set spacing (assume 1mm spacing if not specified)
    fixed_sitk.SetSpacing([1.0, 1.0])
    moving_sitk.SetSpacing([1.0, 1.0])
    
    # Initialize transform based on type
    if registration_type == "rigid":
        # Use Euler2DTransform (translation + rotation)
        transform = sitk.Euler2DTransform()
        # Initialize with identity (no transformation)
        transform.SetIdentity()
    else:  # affine
        # Use AffineTransform (includes scaling and shearing)
        transform = sitk.AffineTransform(2)
        transform.SetIdentity()
    
    # Set up registration
    registration_method = sitk.ImageRegistrationMethod()
    
    # Similarity metric - use MeanSquares for faster/simpler registration
    # (MattesMutualInformation can be more robust but slower)
    registration_method.SetMetricAsMeanSquares()
    
    # Optimizer settings - use simpler optimizer
    registration_method.SetOptimizerAsRegularStepGradientDescent(
        learningRate=2.0,
        minStep=0.01,
        numberOfIterations=50,
        relaxationFactor=0.5,
        gradientMagnitudeTolerance=1e-4
    )
    registration_method.SetOptimizerScalesFromPhysicalShift()
    
    # Interpolator
    registration_method.SetInterpolator(sitk.sitkLinear)
    
    # Set initial transform
    registration_method.SetInitialTransform(transform, inPlace=True)
    
    # Execute registration
    log.info("Running registration optimizer...")
    final_transform = registration_method.Execute(fixed_sitk, moving_sitk)
    
    log.info(f"Optimizer stop condition: {registration_method.GetOptimizerStopConditionDescription()}")
    log.info(f"Final metric value: {registration_method.GetMetricValue():.6f}")
    log.info(f"Number of iterations: {registration_method.GetOptimizerIteration()}")
    
    # Apply transform to moving image
    registered_sitk = sitk.Resample(
        moving_sitk,
        fixed_sitk,
        final_transform,
        sitk.sitkLinear,
        0.0,
        moving_sitk.GetPixelID()
    )
    
    # Convert back to numpy
    registered_image = sitk.GetArrayFromImage(registered_sitk)
    
    # Convert back to uint8 for display (0-255 range)
    registered_image = (registered_image * 255).astype(np.uint8)
    
    log.info("Registration completed successfully")
    
    return registered_image, final_transform


def register_and_apply_to_mask(
    fixed_image: np.ndarray,
    moving_image: np.ndarray,
    moving_mask: np.ndarray,
    registration_type: str = "rigid"
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Register moving image to fixed image, and apply the same transform to the mask.
    
    Args:
        fixed_image: Reference image
        moving_image: Image to be aligned
        moving_mask: Mask corresponding to moving_image
        registration_type: "rigid" or "affine"
    
    Returns:
        Tuple of (registered_image, registered_mask)
    """
    log.info("Registering image and mask...")
    
    # Register the images
    registered_image, transform = register_images(
        fixed_image, moving_image, registration_type
    )
    
    # Convert mask to SimpleITK format (keep as uint8 for binary masks)
    if len(moving_mask.shape) == 3:
        mask_gray = np.mean(moving_mask, axis=2).astype(np.uint8)
    else:
        mask_gray = moving_mask.astype(np.uint8)
    
    moving_mask_sitk = sitk.GetImageFromArray(mask_gray)
    moving_mask_sitk.SetSpacing([1.0, 1.0])
    
    # Get fixed image for reference frame (convert to float32 like in register_images)
    if len(fixed_image.shape) == 3:
        fixed_gray = np.mean(fixed_image, axis=2).astype(np.float32)
    else:
        fixed_gray = fixed_image.astype(np.float32)
    
    # Normalize
    fixed_gray = (fixed_gray - fixed_gray.min()) / (fixed_gray.max() - fixed_gray.min() + 1e-8)
    
    fixed_sitk = sitk.GetImageFromArray(fixed_gray)
    fixed_sitk.SetSpacing([1.0, 1.0])
    
    # Apply same transform to mask (use nearest neighbor to preserve binary values)
    registered_mask_sitk = sitk.Resample(
        moving_mask_sitk,
        fixed_sitk,
        transform,
        sitk.sitkNearestNeighbor,  # Nearest neighbor for binary masks
        0.0,
        moving_mask_sitk.GetPixelID()
    )
    
    registered_mask = sitk.GetArrayFromImage(registered_mask_sitk)
    
    log.info("Mask registration completed")
    
    return registered_image, registered_mask


def preprocess_for_registration(
    image: np.ndarray,
    normalize: bool = True,
    resize_to: Optional[Tuple[int, int]] = None
) -> np.ndarray:
    """
    Preprocess image for better registration results.
    
    Args:
        image: Input image as numpy array
        normalize: Whether to normalize intensity values
        resize_to: Optional (width, height) to resize to
    
    Returns:
        Preprocessed image
    """
    processed = image.copy()
    
    # Convert to grayscale if RGB
    if len(processed.shape) == 3:
        processed = np.mean(processed, axis=2)
    
    # Resize if specified
    if resize_to:
        from PIL import Image as PILImage
        pil_img = PILImage.fromarray(processed.astype(np.uint8))
        pil_img = pil_img.resize(resize_to, PILImage.Resampling.LANCZOS)
        processed = np.array(pil_img)
    
    # Normalize intensity
    if normalize:
        processed = processed.astype(np.float32)
        processed = (processed - processed.min()) / (processed.max() - processed.min() + 1e-8)
        processed = (processed * 255).astype(np.uint8)
    
    return processed

