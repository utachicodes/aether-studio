# Aether-Scan Studio

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/utachicodes/aether-studio)](https://github.com/utachicodes/aether-studio/stargazers)
[![GitHub Repo Size](https://img.shields.io/github/repo-size/utachicodes/aether-studio)](https://github.com/utachicodes/aether-studio)
[![Python Version](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/downloads/release/python-3120/)
[![Build Status](https://img.shields.io/github/actions/workflow/status/utachicodes/aether-studio/ci.yml?branch=main)](https://github.com/utachicodes/aether-studio/actions)

Aether-Scan Studio is a high-performance platform for internal 3D reconstruction and novel view synthesis. Built for rapid visualization and large-scale spatial modeling, it streamlines the transition from raw data to immersive radiance fields.

This system powers spatial outreach and recruitment initiatives for the **DAUST Campus Innovation Lab**, providing real-time 3D Gaussian Splatting for high-fidelity digital twins.

---

## Features

### 1. Collaborative DCC Workspace (Next.js)
A professional workstation with a modular multi-pane architecture:
- **Scene Hierarchy**: Manage cameras, keyframes, and radiance fields in real-time.
- **Technical Inspector**: Calibrate loss thresholds, learning rates, and splat density.
- **Architectural Engine**: Integrated map layers for campus hotspots and spatial orientation.
- **Telemetry Console**: Technical logs and performance analytics for monitoring reconstructions.

### 2. Live 3D Viewport (WebSocket Bridge)
Real-time feedback loop for Gaussian Splatting with low-latency updates:
- **Remote Rendering**: High-fidelity 3D rendering on GPU-accelerated backends.
- **Interactive Session**: Perform orbit, pan, and zoom operations during live training.
- **Visual Synthesis**: Monitor the evolution from sparse point clouds to photorealistic radiance fields.

### 3. Unified Backend API (FastAPI)
A centralized backbone for the 3D reconstruction lifecycle:
- **Session Handling**: Multi-scene management for institutional departments.
- **Ingestion Pipeline**: Automated frame extraction from video or direct 2D image-set uploads.
- **Export System**: Direct bundling of `.ply` models, `.splat` scenes, and technical metadata.

---

## Quick Start

### 1. Backend Reconstruction API
Ensure your environment is set up (see [Technical Setup](#technical-setup)).
```bash
# Start the production-grade API server
python api_server.py
```
*Port: 8001 | Handles video ingestion & reconstruction orchestration.*

### 2. Aether-Studio Pro Workstation
```bash
cd aether-studio
npm install
npm run dev
```
*Port: 3001 | Access the Industrial Workspace at http://localhost:3001.*

---

## 🏛 DAUST Flagship Integration
The studio comes pre-configured for the **DAUST Campus Recruitment Mission**:
- **Hotspots**: Integrated data for Mechanical & Aero, Electronic & Comp, Civil, and residential housing.
- **Recruitment Profiles**: Technical profiles for labs, students, and research focus areas built into the Entity Inspector.

---

## 🏗 Technical Setup

### Primary Environment
Tested on Windows 11 / Ubuntu 22.04 with PyTorch 2.7.0+ and CUDA 12.8.

```bash
conda create -n aetherscan python=3.12 -y
conda activate aetherscan
pip install -r requirements.txt
```

### Dependencies
- **Core**: PyTorch, Cupy, OpenCV
- **UI**: Next.js, Three.js, Framer Motion, Tailwind CSS
- **Bridge**: WebSockets, FastAPI, Uvicorn

---

## 🛠 Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=threedotjs&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)
![CUDA](https://img.shields.io/badge/CUDA-76B900?style=for-the-badge&logo=nvidia&logoColor=white)

---

## 🏗 Operations

### Finalize Reconstruction
Aether-Scan Studio is an advanced neural reconstruction platform built for the next generation of spatial intelligence.

Developed and Maintained by **utachicodes**.
