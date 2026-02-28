# CrowdPulse 🚨
### AI-Powered Crowd Safety System | AMD Slingshot Hackathon 2026
<img width="1920" height="1080" alt="Screenshot (124)" src="https://github.com/user-attachments/assets/5cb2ede9-f93d-4c6b-af8f-bdf268f98eb0" />

CrowdPulse is a real-time crowd safety platform that predicts dangerous crowd 
density before it becomes a stampede — and delivers AI-generated voice alerts 
directly to the responsible security guard's phone.

Built for Indian public events: temples, Kumbh Mela, railway stations, stadiums.

---

## The Problem
India has lost 2,194+ lives to stampedes since 2000. Existing enterprise crowd 
monitoring solutions cost ₹50–100 lakhs, require full infrastructure overhaul, 
and alert a control room — not the guard at the gate. Most venues have nothing.


## Our Solution
CrowdPulse works on existing CCTV cameras. Zero new hardware. Near-zero cost.

- 🔴 Detects crowd density using CSRNet (heatmaps, not bounding boxes)
- ⚡ Predicts danger 10–15 minutes before it happens
- 📞 Calls the zone guard directly with an AI-generated personalized voice message
- 🤖 Groq LLaMA 3.3 70B generates alerts, incident reports & event analysis
- 📊 Live React dashboard with real-time zone map, alert feed & AI reports
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/54e7ebc8-a1e9-4352-b65f-5652489f2510" />

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Crowd AI | CSRNet (VGG16 + dilated convolutions), PyTorch |
| LLM | Groq API — LLaMA 3.3 70B Versatile |
| Voice Alerts | Twilio Voice API (TwiML, Alice en-IN) |
| Backend | Flask, Flask-CORS, pyngrok |
| Frontend | React, DM Mono + Bebas Neue |
| Runtime | Google Colab (T4 GPU) |

---

## Features

**Live Detection**
- Processes every 30th CCTV frame via CSRNet
- Splits frame into 4 zones (A/B/C/D)
- Classifies each zone: SAFE / MONITOR / WARNING / DANGER / CRITICAL
- Predicts minutes until critical density using rolling growth rate

**AI Alert System (3 Groq integrations)**
- Idea 1: Personalized voice alert message per guard (name, zone, count, safe zone)
- Idea 2: Professional incident report auto-generated after each alert
- Idea 3: End-of-event crowd analysis with peak times, danger timeline & recommendations

**Smart Cooldown**
- 5-minute cooldown per zone prevents spam calls
- Other zones remain independently active

**Live Dashboard (3 pages)**
- Live View: Real-time zone map with color-coded status and alert feed
- AI Reports: Every Groq incident report with timestamp and urgency
- Analysis: Post-event structured crowd analysis

---
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/6adc1ed7-6702-40f6-ba21-d3d4748b1a0c" />

## Project Structure
├── backend/
│   └── CrowdPulse.ipynb    # Full Colab notebook (CSRNet + Flask + Groq + Twilio)
├── frontend/
│   └── src/
│       └── App.jsx         # React dashboard (3 pages)
└── .gitignore

---

## How to Run

**Backend (Google Colab):**
1. Open `CrowdPulse.ipynb` in Google Colab with T4 GPU
2. Set your API keys in the environment cell
3. Run all cells in order


**Frontend (Local):**
1. Update the ngrok URL in `App.jsx`
2. Run `npm install && npm start`
3. Open `localhost:3000`

## Running Locally

To run CrowdPulse, set your API keys in the first cell of the Colab notebook:
```python
import os

os.environ["TWILIO_ACCOUNT_SID"] = "AC7643d4db8c50a9107f64123cfcc3bfed"
os.environ["TWILIO_AUTH_TOKEN"]  = "0f34a7fb79c26b60c84ef9b9531d9ca8"
os.environ["TWILIO_NUMBER"]      = "+18302412244"

os.environ["GROQ_API_KEY"]       = "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"
os.environ["NGROK_AUTH_TOKEN"]   = "3AFLP2roohXoy7bpf3Nqp129gKo_84ugv66HPmxFfDd42PXyd"
print("✅ Runtime API keys injected")
```


*CrowdPulse doesn't wait for tragedy. It sees it coming.*
