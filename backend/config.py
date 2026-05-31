"""
Configuration settings for SynapseAI Twin backend.
Handles database connection and application settings.
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database Configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'root'),
    'database': os.getenv('DB_NAME', 'synapse_ai_twin'),
    'charset': 'utf8mb4'
}

# Flask Configuration
SECRET_KEY = os.getenv('SECRET_KEY', 'synapse-ai-twin-secret-key-2024')
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

# ML Model Configuration
MODEL_CONFIG = {
    'task_prediction': {
        'model_path': 'models/task_predictor.pkl',
        'accuracy_threshold': 0.7
    },
    'habit_detection': {
        'n_clusters': 5,
        'algorithm': 'kmeans'
    },
    'scheduler': {
        'max_daily_hours': 16,
        'min_task_duration': 15  # minutes
    }
}

# NLP Configuration
NLP_CONFIG = {
    'model': 'en_core_web_sm',
    'date_patterns': [
        r'today', r'tomorrow', r'next week', 
        r'\d{1,2}/\d{1,2}/\d{2,4}'
    ]
}

# API Configuration
API_CONFIG = {
    'prefix': '/api/v1',
    'cors_origins': ['http://localhost:5173', 'http://localhost:3000']
}