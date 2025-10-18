#!/usr/bin/env python3
"""
Python dependency checker for analytics service
"""

import sys
import json
from datetime import datetime

def check_dependencies():
    """Check if all required Python packages are installed"""
    required_packages = [
        'pandas',
        'numpy', 
        'pymongo',
        'python-dateutil',
        'textblob',
        'matplotlib',
        'seaborn',
        'scikit-learn',
        'wordcloud',
        'python-dotenv'
    ]
    
    missing_packages = []
    installed_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            installed_packages.append(package)
        except ImportError:
            missing_packages.append(package)
    
    result = {
        "error": len(missing_packages) > 0,
        "message": "Dependency check completed",
        "installed": installed_packages,
        "missing": missing_packages,
        "total_required": len(required_packages),
        "installed_count": len(installed_packages),
        "missing_count": len(missing_packages),
        "timestamp": datetime.now().isoformat()
    }
    
    if missing_packages:
        result["message"] = f"Missing {len(missing_packages)} required packages"
        result["install_command"] = f"pip3 install {' '.join(missing_packages)}"
    else:
        result["message"] = "All dependencies are installed"
    
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    check_dependencies()
