# Aether-Scan Pro Studio

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/utachicodes/aether-studio/ci.yml?branch=main)](https://github.com/utachicodes/aether-studio/actions)

**Aether-Scan Pro Studio** is an industrial-grade, on-the-fly 3D reconstruction and novel view synthesis platform. Transformed from a research prototype into a high-density Digital Content Creation (DCC) workstation, it is designed for rapid architectural visualization and large-scale novel view synthesis (NVS).

This platform serves as the **Flagship Visualization Engine** for the **DAUST Campus Innovation Lab**, powering high-fidelity spatial outreach and recruitment tours through real-time 3D Gaussian Splatting.

<div align="center">
  <img src="aether-studio/public/favicon.ico" width="48" height="48" style="margin-bottom: 20px;">
  <h2>Industrial Technical Rendering Workstation</h2>
</div>

---

## Features

### 1. High-Density DCC Workspace (Next.js)
A professional, charcoal-themed workstation featuring a modular multi-pane architecture:
- **Scene Hierarchy**: Industrial-grade tree for managing cameras, keyframes, and radiance fields.
- **Technical Inspector**: Deep-calibration grid for managing loss thresholds, learning rates, and splat density.
- **Blueprint CAD Engine**: Integrated architectural map layer for DAUST Campus hotspots and spatial orientation.
- **Telemetry Console**: Real-time scrolling technical logs and performance analytics.

### 2. Live 3D Viewport (WebSocket Bridge)
A low-latency, real-time feedback loop for Gaussian Splatting:
- **Remote Rendering**: High-fidelity 3D rendering happens on the GPU-accelerated backend.
- **Interactive Session**: Orbit, pan, and zoom through the reconstruction as it happens on the server.
- **Live "Splatting"**: Visual confirmation of the model evolution from sparse point clouds to photorealistic radiance fields.

### 3. Universal Backend Engine (FastAPI)
A centralized API backbone for managing the end-to-end 3D lifecycle:
- **Session Management**: Secure, multi-scene handling for different university departments.
- **Video Processor**: Automated frame extraction and monocular depth estimation pipeline.
- **Export Engine**: One-click industrial bundling of `.ply` models, `.splat` scenes, and technical metadata.

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

## ⚖ Acknowledgments & Lore
**Aether-Scan Pro Studio** is an evolution of the revolutionary "On-the-fly Reconstruction" research.

### Original Research Developers (Past Devs):
*   [Andreas Meuleman](https://ameuleman.github.io/), [Ishaan Shah](https://ishaanshah.xyz/), [Alexandre Lanvin](https://scholar.google.com/citations?hl=fr&user=e1s7mGsAAAAJ), [Bernhard Kerbl](https://snosixtyboo.github.io/), [George Drettakis](https://www-sop.inria.fr/members/George.Drettakis/)

*Original work funded by the European Research Council (ERC) Advanced Grant NERPHYS (101141721) and the OPAL infrastructure of the Université Côte d'Azur.*

---
**Crafted for Innovation by UtachiLabs.**
