#!/usr/bin/env python3
"""Setup configuration for CheckMate package."""

from setuptools import setup, find_packages
from pathlib import Path

# Read README
root_dir = Path(__file__).parent
readme_file = root_dir / "README.md"
long_description = readme_file.read_text(encoding="utf-8") if readme_file.exists() else ""

setup(
    name="checkmate-ai",
    # UPDATED: Must match pyproject.toml
    version="1.0.1",
    author="Farhan Saleem",
    author_email="chaudaryfarhann@gmail.com",
    description="AI Code Security Scanner with Human-in-the-Loop Feedback",
    long_description=long_description,
    long_description_content_type="text/markdown",
    
    # UPDATED: Main URL
    url="https://github.com/farhann-saleem/UCS-Hackathon-26",
    license="MIT",
    
    # Package discovery
    packages=find_packages(exclude=["tests*", "docs*"]),
    include_package_data=True,
    
    # Python version
    python_requires=">=3.9",
    
    # Dependencies
    install_requires=[
        "fastapi>=0.115.0",
        "uvicorn[standard]>=0.30.0",
        "pydantic>=2.7.0",
        "pydantic-settings>=2.0.0",
        "aiosqlite>=0.19.0",
        "python-dotenv>=1.0.0",
        "click>=8.1.0",
        "rich>=13.0.0",
    ],
    
    # CLI entry point
    entry_points={
        "console_scripts": [
            "checkmate=checkmate.cli:cli",
        ],
    },
    
    # Metadata
    classifiers=[
        "Development Status :: 4 - Beta",
        "Environment :: Console",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Natural Language :: English",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Programming Language :: Python :: 3.13",
        "Topic :: Security",
        "Topic :: Software Development :: Quality Assurance",
    ],
    
    keywords="security, vulnerability, scanner, ai, feedback, anomaly-detection",
    
    # UPDATED: Correct Links
    project_urls={
        "Homepage": "https://github.com/farhann-saleem/UCS-Hackathon-26",
        "Documentation": "https://github.com/farhann-saleem/UCS-Hackathon-26#readme",
        "Bug Reports": "https://github.com/farhann-saleem/UCS-Hackathon-26/issues",
        "Source": "https://github.com/farhann-saleem/UCS-Hackathon-26",
    },
)