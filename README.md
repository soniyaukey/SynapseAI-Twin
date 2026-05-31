# SynapseAI Twin - AI Digital Twin for Productivity

A complete AI-powered productivity system that learns user behavior and acts as a digital twin to predict tasks, generate smart schedules, analyze productivity, and provide personalized suggestions.

## 🚀 Project Overview

SynapseAI Twin is an intelligent productivity assistant that uses machine learning and NLP to:
- **Predict next tasks** based on time and past behavior
- **Generate smart schedules** auto-arranging tasks by priority & deadlines
- **Detect habits** using clustering algorithms
- **Parse NLP input** (e.g., "Finish assignment tomorrow by 5pm")
- **Provide productivity insights** via a beautiful dashboard

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Python Flask API |
| Database | MySQL 8.0 |
| ML | scikit-learn, TensorFlow |
| NLP | spaCy |

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **Python** (v3.9 or higher)
3. **MySQL** (v8.0 or higher)

## 🔧 Installation & Setup

### Step 1: Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python app.py
```

### Step 2: Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🎯 How to Run

**Terminal 1 - Backend:**
```bash
cd backend
python app.py
```
Server runs at: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
App opens at: `http://localhost:5173`

## 📱 Features

1. **Dashboard** - Overview of tasks, schedule, and productivity
2. **Tasks** - Add tasks via form or NLP input
3. **Schedule** - AI-generated daily schedule
4. **Analytics** - Productivity trends and detected habits
5. **Settings** - Profile and notification management

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/tasks` | GET/POST | Get/Create tasks |
| `/api/v1/predict/next-tasks` | GET | Get task predictions |
| `/api/v1/schedule/generate` | POST | Generate schedule |
| `/api/v1/habits` | GET | Get detected habits |
| `/api/v1/analytics/productivity` | GET | Get productivity data |
| `/api/v1/nlp/parse` | POST | Parse NLP input |

## 🆘 Troubleshooting

- **MySQL not available?** The app uses mock data automatically
- **spaCy model error:** `python -m spacy download en_core_web_sm`
- **Port in use?** Change port in `app.py` or `vite.config.js`

## 📄 License

MIT License

## 👨‍💻 Author

Built with ❤️ for productivity enthusiasts and students learning AI/ML.
│   │       └── api.js          # API service
│
└── README.md                   # Project documentation
```

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Python Flask API
- **Database**: MySQL 8.0
- **ML**: scikit-learn, TensorFlow
- **NLP**: spaCy

## Features
1. Task prediction based on time and past behavior
2. Smart scheduler (auto arrange tasks based on priority & deadlines)
3. Habit detection using clustering
4. NLP-based task input parsing
5. Productivity insights dashboard

## Getting Started
See README.md for detailed setup instructions.