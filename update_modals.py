import re
import os

INDEX_HTML_PATH = '/Users/benjaminlai/Documents/GitHub/BenjaminLai05.github.io/index.html'
SCRIPT_JS_PATH = '/Users/benjaminlai/Documents/GitHub/BenjaminLai05.github.io/script.js'

def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Global Spelling / Australian English
    replacements = {
        'Optimization': 'Optimisation',
        'optimization': 'optimisation',
        'Normalize': 'Normalise',
        'normalize': 'normalise',
        'Normalizing': 'Normalising',
        'normalizing': 'normalising',
        'Normalized': 'Normalised',
        'normalized': 'normalised',
        'Organization': 'Organisation',
        'organization': 'organisation',
        'Labeled': 'Labelled',
        'labeled': 'labelled',
        'Visualizing': 'Visualising',
        'visualizing': 'visualising',
        'Tumor': 'Tumour',
        'tumor': 'tumour'
    }

    for us, au in replacements.items():
        content = content.replace(us, au)

    # 2. Specific Formatting Updates
    # Strip standard font-sizes from sprint goals to use CSS natively
    content = content.replace(' font-size: 13.5px;', '')
    content = content.replace('font-size: 13.5px;', '')
    
    # In MRI Modal, Important Logins use <code> which looks disjointed.
    # We will remove <code> and </code> for the login credentials
    content = content.replace('User: <code>dr.admin@mri.local</code>', 'User: dr.admin@mri.local')
    content = content.replace('Pass: <code>RadPass2026!</code>', 'Pass: RadPass2026!')
    content = content.replace('User: <code>staff@mri.local</code>', 'User: staff@mri.local')
    content = content.replace('Pass: <code>ClinicianView1</code>', 'Pass: ClinicianView1')

    # Also for WDC Modal
    content = content.replace('User: <code>admin</code>', 'User: admin')
    content = content.replace('Pass: <code>AdminPassword0</code>', 'Pass: AdminPassword0')
    content = content.replace('User: <code>georgew</code>', 'User: georgew')
    content = content.replace('Pass: <code>password7</code>', 'Pass: password7')
    content = content.replace('<code>alliumnotifications@gmail.com</code> / <code>WDCwebapp2024@</code>', 'alliumnotifications@gmail.com / WDCwebapp2024@')

    # 3. NBA Modal Fact Corrections
    old_nba_algo = 'individual player seeds are built using advanced metrics (PER, WS, BPM)'
    new_nba_algo = 'individual player initial ratings are derived from position-normalised z-scores using metrics like AST_TOV, STOCKS_PER36, and Talent Scores. Team ratings are derived by weighting individual player ratings based on actual minutes played'
    content = content.replace(old_nba_algo, new_nba_algo)

    # 4. MRI Modal Fact Corrections
    old_mri_model_1 = 'PyTorch-based detection model'
    new_mri_model_1 = 'YOLO (You Only Look Once) object detection model'
    content = content.replace(old_mri_model_1, new_mri_model_1)

    old_mri_model_2 = 'PyTorch CNN for tumour segmentation'
    new_mri_model_2 = 'YOLO (You Only Look Once) model for tumour detection'
    content = content.replace(old_mri_model_2, new_mri_model_2)

    old_mri_model_3 = 'specialized convolutional neural network architecture trained entirely'
    new_mri_model_3 = 'robust YOLO architecture trained entirely'
    content = content.replace(old_mri_model_3, new_mri_model_3)

    old_mri_model_4 = 'PyTorch / YOLO' # Already there? Wait, the diagram says PyTorch / YOLO. Let's just leave it if it's there.
    # Actually make sure YOLO is emphasized over PyTorch/CNN.
    
    old_mri_metric = 'calculates precise progression metrics over time'
    new_mri_metric = 'calculates precise metrics including changes in tumour count and total tumour area (normalised to total image area)'
    content = content.replace(old_mri_metric, new_mri_metric)

    with open(filepath, 'w') as f:
        f.write(content)
        
update_file(INDEX_HTML_PATH)
update_file(SCRIPT_JS_PATH)
print("Files updated successfully.")
