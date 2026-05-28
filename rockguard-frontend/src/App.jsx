import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "./App.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

function App() {
  const [riskLevel, setRiskLevel] = useState("Safe");
  const [probability, setProbability] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [rainfall] = useState("Moderate");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [crackStatus, setCrackStatus] = useState("No Image");
  const [systemMode] = useState("Offline Mode");
  const [showAlertPopup, setShowAlertPopup] = useState(false);
  const [finalRisk, setFinalRisk] = useState("SAFE");
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [quake, setQuake] = useState(null);
  const [quakeLoading, setQuakeLoading] = useState(false);
  const [fusion, setFusion] = useState({
    ml: 0,
    weather: 0,
    seismic: 0,
    final: 0,
  });
  const [alerts, setAlerts] = useState([]);
  const [systemHealth] = useState({
    model: "Loaded",
    camera: "Connected",
    lastUpdate: "2 min ago",
  });

  // 🔥 CALL BACKEND
  const sendToBackend = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Prediction failed");

    return await res.json();
  };

  useEffect(() => {
    fetchWeather();
    fetchEarthquake();
  }, []);

  const fetchWeather = async (lat = 11.0168, lon = 76.9558) => {
    try {
      setWeatherLoading(true);

      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,rain`
      );

      if (!res.ok) {
        throw new Error("Weather API failed");
      }

      const data = await res.json();

      setWeather({
        temp: data.current?.temperature_2m ?? 0,
        humidity: data.current?.relative_humidity_2m ?? 0,
        wind: data.current?.wind_speed_10m ?? 0,
        rainfall: data.current?.rain ?? 0,
        condition: "Live Data",
      });
    } catch (err) {
      console.error("Weather fetch failed", err);
      setWeather(null);
    } finally {
      setWeatherLoading(false);
    }
  };

  const fetchEarthquake = async (lat = 11.0168, lon = 76.9558) => {
    try {
      setQuakeLoading(true);

      const res = await fetch(
        "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
      );

      if (!res.ok) throw new Error("Quake API failed");

      const data = await res.json();

      if (!data.features?.length) {
        setQuake(null);
        return;
      }

      let nearest = null;
      let minDist = Infinity;

      data.features.forEach((q) => {
        const [qLon, qLat] = q.geometry.coordinates;
        const dist = calculateDistanceKm(lat, lon, qLat, qLon);
        if (dist < minDist) {
          minDist = dist;
          nearest = q;
        }
      });

      if (!nearest) {
        setQuake(null);
        return;
      }

      const mag = nearest.properties.mag ?? 0;

      let risk = "LOW";
      if (mag >= 5) risk = "HIGH";
      else if (mag >= 3.5) risk = "MODERATE";

      setQuake({
        magnitude: mag.toFixed(1),
        distance: minDist.toFixed(1),
        time: new Date(nearest.properties.time).toLocaleString(),
        risk,
      });
    } catch (err) {
      console.error("Quake fetch failed", err);
      setQuake(null);
    } finally {
      setQuakeLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;
    const latestFile = files[files.length - 1];
    setImagePreview(URL.createObjectURL(latestFile));
    setLoading(true);
    setCrackStatus("Analyzing...");

    setTimeout(async () => {
      try {
        const result = await sendToBackend(latestFile);

        const label = result.class;
        const conf = result.confidence;
        const confidence = conf * 100;

        let mlRisk = 0;

        if (label === "High Risk") {
          mlRisk = 85 + confidence * 0.15; // 85–100
        } else if (label === "Warning") {
          mlRisk = 45 + confidence * 0.25; // 45–70
        } else {
          mlRisk = confidence * 0.2; // 0–20
        }

        setProbability(conf);

        if (label === "High Risk") {
          setRiskLevel("High Danger");
          setCrackStatus("Crack Detected");
        } else if (label === "Warning") {
          setRiskLevel("Warning");
          setCrackStatus("Minor Instability");
        } else {
          setRiskLevel("Safe");
          setCrackStatus("Stable Surface");
        }

        setHistory((prev) => {
          const updated = [
            ...prev,
            {
              time: `T${prev.length + 1}`,
              risk: mlRisk.toFixed(2),
            },
          ];
          return updated.slice(-5);
        });

        const weatherImpact = weather?.rainfall
          ? Math.min(weather.rainfall * 10, 30)
          : 5;

        const seismicImpact =
          quake?.risk === "HIGH" ? 35 : quake?.risk === "MODERATE" ? 20 : 5;

        const finalScore = Math.min(
          mlRisk * 0.65 + weatherImpact * 0.2 + seismicImpact * 0.15,
          100
        );

        setFusion({
          ml: mlRisk.toFixed(1),
          weather: weatherImpact.toFixed(1),
          seismic: seismicImpact.toFixed(1),
          final: finalScore.toFixed(1),
        });
      } catch (err) {
        console.error(err);
        setCrackStatus("Prediction failed");
      }

      setLoading(false);
    }, 1200);
  };

  const getRiskColor = () => {
    if (riskLevel === "High Danger") return "#ff4c4c";
    if (riskLevel === "Warning") return "#ffc107";
    return "#218338";
  };

  // ⭐ UPDATED: if ANY single factor > 80, force EVACUATE
  // Also lowered combined thresholds for better sensitivity
  const getFusionRiskLevel = () => {
    const final = Number(fusion.final);
    const ml = Number(fusion.ml);
    const weatherScore = Number(fusion.weather);
    const seismicScore = Number(fusion.seismic);

    // If any individual risk factor exceeds 80 → always EVACUATE
    if (ml > 80 || weatherScore > 80 || seismicScore > 80) {
      return "EVACUATE";
    }

    // Combined score thresholds
    if (final >= 55) return "EVACUATE";
    if (final >= 30) return "WARNING";
    return "SAFE";
  };

  useEffect(() => {
    setFinalRisk(getFusionRiskLevel());
  }, [fusion.final, fusion.ml, fusion.weather, fusion.seismic]);

  useEffect(() => {
    if (finalRisk === "EVACUATE") {
      const newAlert = {
        id: Date.now(),
        risk: "EVACUATE",
        location: "Zone A - Rock Slope",
        time: new Date().toLocaleTimeString(),
      };

      setAlerts((prev) => {
        if (prev[0]?.risk === "EVACUATE") return prev;
        return [newAlert, ...prev].slice(0, 5);
      });

      setShowAlertPopup(true);
      setTimeout(() => setShowAlertPopup(false), 4000);
    }
  }, [finalRisk]);

  const getActionPlan = () => {
    if (finalRisk === "EVACUATE") {
      return {
        text: "Immediate evacuation and area closure required.",
        color: "#ef4444",
        icon: "🚨",
      };
    }

    if (finalRisk === "WARNING") {
      return {
        text: "Perform scaling and apply shotcrete reinforcement.",
        color: "#facc15",
        icon: "⚠️",
      };
    }

    return {
      text: "No immediate action required. Continue routine monitoring.",
      color: "#22c55e",
      icon: "✅",
    };
  };

  const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <div className="app">
      <header className="header container">
        <div>
          <h1>RockGuard AI</h1>
          <p>AI-Based Rockfall Prediction & Alert System</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div className="mode-indicator">🏭 {systemMode}</div>

          <div
            style={{
              background: "rgba(239,68,68,0.2)",
              padding: "8px 14px",
              borderRadius: 999,
              fontWeight: 600,
            }}
          >
            🚨 {alerts.length} Alerts
          </div>
        </div>
      </header>

      <div className={`final-risk container ${finalRisk.toLowerCase()}`}>
        <h2>FINAL SAFETY DECISION</h2>
        <h1>{finalRisk}</h1>

        <div
          style={{
            marginTop: 16,
            padding: "14px 18px",
            borderRadius: 12,
            background: "rgba(2,6,23,0.6)",
            border: "1px solid rgba(148,163,184,0.25)",
            fontSize: 15,
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: getActionPlan().color }}>
            {getActionPlan().icon} Suggested Action
          </strong>

          <p style={{ marginTop: 6 }}>{getActionPlan().text}</p>
        </div>
      </div>

      <div className="cards container">
        {/* Combined Risk Confidence */}
        <div className="card risk-card">
          <h2>Combined Risk Confidence</h2>

          <div style={{ width: 120, margin: "10px auto" }}>
            <CircularProgressbar
              value={Number(fusion.final)}
              text={`${fusion.final}%`}
              styles={buildStyles({
                pathColor:
                  fusion.final > 70
                    ? "#ef4444"
                    : fusion.final > 40
                    ? "#facc15"
                    : "#22c55e",
                textColor: "#fff",
                trailColor: "#333",
              })}
            />
          </div>

          <h3 style={{ marginTop: 10 }}>{riskLevel}</h3>

          <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.7 }}>
            {/* ⭐ Highlight whichever factor triggered EVACUATE */}
            <p
              style={{
                color: Number(fusion.ml) > 80 ? "#ef4444" : "inherit",
                fontWeight: Number(fusion.ml) > 80 ? 700 : 400,
              }}
            >
              🧠 ML: {fusion.ml}%{Number(fusion.ml) > 80 ? " ⚠️" : ""}
            </p>
            <p
              style={{
                color: Number(fusion.weather) > 80 ? "#ef4444" : "inherit",
                fontWeight: Number(fusion.weather) > 80 ? 700 : 400,
              }}
            >
              🌧 Weather: {fusion.weather}%
              {Number(fusion.weather) > 80 ? " ⚠️" : ""}
            </p>
            <p
              style={{
                color: Number(fusion.seismic) > 80 ? "#ef4444" : "inherit",
                fontWeight: Number(fusion.seismic) > 80 ? 700 : 400,
              }}
            >
              🌍 Seismic: {fusion.seismic}%
              {Number(fusion.seismic) > 80 ? " ⚠️" : ""}
            </p>
          </div>
        </div>

        {/* Weather Card */}
        <div className="card">
          <h2>Weather Info</h2>

          {weatherLoading && <p>Fetching weather...</p>}

          {!weatherLoading && weather && (
            <>
              <p>🌡 Temp: {weather.temp}°C</p>
              <p>🌧 Rain (1h): {weather.rainfall} mm</p>
              <p>💧 Humidity: {weather.humidity}%</p>
              <p>🌬 Wind: {weather.wind} m/s</p>
              <p>☁ Condition: {weather.condition}</p>
            </>
          )}

          {!weatherLoading && !weather && (
            <p style={{ color: "#f87171" }}>Weather unavailable</p>
          )}
        </div>

        {/* Seismic Activity Card */}
        <div className="card">
          <h2>Seismic Activity</h2>

          {quakeLoading && <p>Checking seismic feed...</p>}

          {!quakeLoading && quake && (
            <>
              <p>🌍 Last Tremor: M {quake.magnitude}</p>
              <p>📏 Distance: {quake.distance} km</p>
              <p>🕒 Time: {quake.time}</p>
              <p>
                🚨 Seismic Risk:{" "}
                <strong
                  style={{
                    color:
                      quake.risk === "HIGH"
                        ? "#ef4444"
                        : quake.risk === "MODERATE"
                        ? "#facc15"
                        : "#22c55e",
                  }}
                >
                  {quake.risk}
                </strong>
              </p>
            </>
          )}

          {!quakeLoading && !quake && (
            <p style={{ color: "#f87171" }}>No recent seismic activity</p>
          )}
        </div>
      </div>

      {loading && (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>AI analyzing slope...</p>
        </div>
      )}

      <div className="upload-section">
        <label className={`upload-btn ${loading ? "disabled" : ""}`}>
          {loading ? "Analyzing..." : "📤 Upload Slope Image"}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={loading}
            hidden
          />
        </label>
      </div>

      {imagePreview && (
        <div className="preview">
          <h3>Last Analyzed Image</h3>
          <img src={imagePreview} alt="preview" />
          <p className="crack-status">Status: {crackStatus}</p>
        </div>
      )}

      <div className="chart-section container">
        <h2>Risk Trend</h2>
        {history.length === 0 ? (
          <p style={{ color: "#aaa" }}>
            No data yet. Upload images to see trend.
          </p>
        ) : (
          <div
            style={{
              width: "100%",
              height: 300,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <ResponsiveContainer>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="time" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Line
                  type="natural"
                  dataKey="risk"
                  stroke="#ff4c4c"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Alert History Panel */}
      <div className="chart-section container">
        <h2>Recent Alerts</h2>

        {alerts.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>No alerts triggered yet.</p>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              style={{
                padding: "12px 16px",
                marginBottom: 10,
                borderRadius: 10,
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.35)",
                textAlign: "left",
              }}
            >
              🚨 <strong>{alert.risk}</strong> — {alert.location}
              <div style={{ fontSize: 12, opacity: 0.7 }}>{alert.time}</div>
            </div>
          ))
        )}
      </div>

      {finalRisk === "EVACUATE" && !loading && (
        <div className="alert">
          🚨 HIGH ROCKFALL RISK DETECTED
          <button className="alert-btn">Send Alert</button>
        </div>
      )}

      {showAlertPopup && (
        <div className="alert-popup">🚨 High Rockfall Risk Detected!</div>
      )}
    </div>
  );
}

export default App;