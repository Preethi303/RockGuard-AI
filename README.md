# 🪨 RockGuard AI — AI-Based Rockfall Prediction and Alert System

## 📌 Overview

**RockGuard AI** is an intelligent, image-driven system that predicts rockfall risks in open-pit mines **before collapse occurs**. It combines Computer Vision, Deep Learning, and real-time Weather + Seismic intelligence to classify risk zones as **Safe**, **Warning**, or **High Risk** — and triggers automated alerts to mining safety teams.

---

## 🚨 Problem Statement

Open-pit mines face constant threat of rockfalls due to slope instability, weather changes, and geological stress. Traditional monitoring relies on expensive physical sensors or manual inspections — both slow and unreliable. Workers are at risk without timely warnings.

**RockGuard AI solves this by:**
- Detecting early cracks and slope instability using drone/CCTV images
- Fusing AI predictions with live weather and seismic data
- Delivering real-time risk alerts to authorities

---

## 🧠 How It Works

Image Acquisition (Drone / CCTV / Mobile)
↓
Image Preprocessing (Resize, Normalize)
↓
AI Image Analysis (CNN / ResNet)
↓
Risk Prediction Engine (High Risk / Warning / Safe)
↓
Weather + Seismic Fusion
↓
Visualization & Alert System (Dashboard + Popup Alerts)

Code

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔍 AI Image Analysis | ResNet-based CNN model trained on crack/rockfall datasets |
| 🌦️ Weather Intelligence | Live data from Open-Meteo API (temp, humidity, rainfall, wind) |
| 🌍 Seismic Monitoring | Real-time earthquake data from USGS GeoJSON feed |
| 📊 Risk Fusion Score | Combines ML + Weather + Seismic into a final risk percentage |
| 🚨 Instant Alerts | Popup alerts + alert log for High Risk predictions |
| 📈 History Chart | Risk trend visualization using Recharts |
| 🔌 Hybrid Mode | Works offline (local server) + optional cloud sync |
| 📱 Existing Infrastructure | No new sensors needed — uses CCTV, drones, mobile cameras |

---

## 🛠️ Tech Stack

### Backend
- **Python** — FastAPI framework
- **TensorFlow / Keras** — ResNet deep learning model (`rockfall_final.h5`)
- **Pillow + NumPy** — Image preprocessing
- **Uvicorn** — ASGI server

### Frontend
- **React.js** (Vite)
- **Recharts** — Risk trend line chart
- **React Circular Progressbar** — Confidence gauge
- **Open-Meteo API** — Free live weather
- **USGS Earthquake API** — Real-time seismic data

---

## 📁 Project Structure

RockGuard-AI/
├── rockguard-backend/
│   ├── main.py                 # FastAPI app + /predict endpoint
│   ├── rockfall_final.h5       # Trained CNN model (not in repo — see below)
│   ├── requirements.txt        # Python dependencies
│   └── .gitignore
│
├── rockguard-frontend/
│   ├── src/
│   │   ├── App.jsx             # Main React dashboard
│   │   └── App.css             # Styling
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .gitignore
├── .gitignore
└── README.md


---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm

---

### 4️⃣ Using the App

1. Open `http://localhost:5173` in your browser  
2. Upload a rock slope image (drone/CCTV/mobile photo)  
3. The system will:  
   - Analyze the image using the AI model  
   - Fetch live weather and seismic data  
   - Show a fused risk score (Safe / Warning / High Risk)  
   - Trigger an alert popup if High Risk is detected  

---

## 🎯 Risk Classification

| Level | Description | Action |
|---|---|---|
| ✅ **Safe** | No visible instability detected | Continue operations normally |
| ⚠️ **Warning** | Minor cracks or slope stress detected | Increase monitoring frequency |
| 🚨 **High Risk** | Significant instability / high crack density | Immediate evacuation alert |

---

## 📊 Model Details

- **Architecture:** ResNet (Transfer Learning)
- **Input:** 224×224 RGB rock slope image
- **Output:** 3-class probability [High Risk, Safe, Warning]
- **Preprocessing:** `resnet.preprocess_input` normalization
- **Decision Logic:**
  - `High Risk` if probability > 0.40
  - `Warning` if probability > 0.40
  - Otherwise `Safe`

### Dataset Sources
- Google Drive shared crack dataset
- GitHub — [Konskyrt](https://github.com/konskyrt) crack detection & segmentation images
- GitHub — [Ravishankar](https://github.com/) rock test images
- GitHub — [Kangcheng Liu](https://github.com/) UAV inspection crack dataset
