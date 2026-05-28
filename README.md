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

```
Image Acquisition (Drone / CCTV / Mobile)
        ↓
Image Preprocessing (Resize, Normalize)
        ↓
AI Image Analysis (CNN / MobileNetV2)
        ↓
Risk Prediction Engine (High Risk / Warning / Safe)
        ↓
Weather + Seismic Fusion
        ↓
Visualization & Alert System (Dashboard + Popup Alerts)
```

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

```
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
│
├── docs/
│   └── presentation.pdf        # Makeathon presentation slides
│
├── .gitignore
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/RockGuard-AI.git
cd RockGuard-AI
```

---

### 2️⃣ Backend Setup

```bash
cd rockguard-backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```
# Run the backend server
uvicorn main:app --reload
```

Backend will be running at: `http://127.0.0.1:8000`

---

### 3️⃣ Frontend Setup

```bash
cd ../rockguard-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be running at: `http://localhost:5173`

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

- **Architecture:** MobileNetV2 (Transfer Learning)
- **Input:** 224×224 RGB rock slope image
- **Output:** 3-class probability [High Risk, Safe, Warning]
- **Preprocessing:** `mobilenet_v2.preprocess_input` normalization
- **Decision Logic:**
  - `High Risk` if probability > 0.40
  - `Warning` if probability > 0.40
  - Otherwise `Safe`

### Dataset Sources
- Google Drive shared crack dataset
- GitHub — [Konskyrt](https://github.com/konskyrt) crack detection & segmentation images
- GitHub — [Ravishankar](https://github.com/) rock test images
- GitHub — [Kangcheng Liu](https://github.com/) UAV inspection crack dataset

---

## 📚 Research References

| # | Paper | Publisher | Method |
|---|---|---|---|
| 1 | Rockfall Runout Range Prediction Using Improved KNN | IEEE Access (2023) | Improved KNN |
| 2 | Rockfall Trajectory Prediction Using Computer Vision & Control Theory | Conference (2022) | CV + Control Theory |
| 3 | GSS-PSO Neural Networks for Slope Risk Prediction | Journal of Intelligent Systems (2021) | GSS-PSO + Neural Networks |
| 4 | Deep Learning and IoT-Based Rock-Fall Early Warning | MDPI Applied Sciences (2023) | Deep Learning + IoT |
| 5 | Comparative Analysis: ML vs DL for Rockfall Prediction | IGDTUW Conference (2022) | RF, XGBoost, CNN, LSTM |

---

## 🌍 Impact & Benefits

- **Enhanced Mine Safety** — Prevents accidents before collapse
- **Reduces Fatalities** — Early evacuation alerts
- **Data-Driven Decisions** — AI insights replace manual inspections
- **Low-Cost Deployment** — Uses existing CCTV and drone infrastructure
- **Scalable** — From single mines to state-level monitoring systems
- **Offline Capable** — Works in remote low-connectivity zones

---

## 🎯 Target Users

- Mining companies & safety teams
- Government authorities (DGMS / Mining Dept.)
- Public Sector Units (PSUs) — large open-pit mines
- Researchers & consultants studying slope stability
- Smart mine integrators & OEM surveillance platforms

---

## 🚧 Known Limitations & Future Work

- [ ] Image quality can degrade in poor lighting — augmentation pipeline being improved
- [ ] Model needs more diverse labeled datasets across rock types
- [ ] Add SMS/Email alert integration (Twilio / EmailJS)
- [ ] Deploy on cloud (Render / Railway) for remote access
- [ ] Add drone live-stream real-time inference
