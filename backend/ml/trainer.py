"""
ML Model Trainer
================
This module handles training and updating ML models.
It provides utilities for training, evaluating, and updating models.
"""

import json
import os
from datetime import datetime
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib


class MLTrainer:
    """
    Machine Learning model trainer.
    Handles training, evaluation, and model updates.
    """
    
    def __init__(self, models_dir='models'):
        """Initialize the trainer"""
        self.models_dir = models_dir
        os.makedirs(models_dir, exist_ok=True)
        
        self.training_history = []
    
    def train_task_predictor(self, tasks_data):
        """
        Train the task prediction model.
        
        Args:
            tasks_data: List of task dictionaries
            
        Returns:
            dict: Training results
        """
        if len(tasks_data) < 20:
            return {
                'success': False,
                'message': 'Insufficient data for training (need at least 20 tasks)'
            }
        
        # Prepare training data
        X, y = self._prepare_features(tasks_data)
        
        if X is None:
            return {
                'success': False,
                'message': 'Could not prepare features from data'
            }
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train model (using RandomForest as example)
        from sklearn.ensemble import RandomForestClassifier
        
        model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        
        model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        # Cross-validation
        cv_scores = cross_val_score(model, X, y, cv=5)
        
        # Save model
        model_path = os.path.join(self.models_dir, 'task_predictor.pkl')
        joblib.dump(model, model_path)
        
        # Record training
        result = {
            'success': True,
            'model': 'task_predictor',
            'accuracy': round(accuracy, 3),
            'cv_mean': round(cv_scores.mean(), 3),
            'cv_std': round(cv_scores.std(), 3),
            'trained_at': datetime.now().isoformat(),
            'data_size': len(tasks_data)
        }
        
        self.training_history.append(result)
        
        return result
    
    def train_habit_detector(self, tasks_data, n_clusters=5):
        """
        Train the habit detection model.
        
        Args:
            tasks_data: List of task dictionaries
            n_clusters: Number of clusters for K-Means
            
        Returns:
            dict: Training results
        """
        if len(tasks_data) < 30:
            return {
                'success': False,
                'message': 'Insufficient data for habit detection (need at least 30 tasks)'
            }
        
        # Prepare features for clustering
        features = self._extract_habit_features(tasks_data)
        
        if features is None or len(features) < n_clusters:
            return {
                'success': False,
                'message': 'Could not extract sufficient features'
            }
        
        # Train K-Means
        from sklearn.cluster import KMeans
        
        model = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        model.fit(features)
        
        # Calculate silhouette score
        from sklearn.metrics import silhouette_score
        sil_score = silhouette_score(features, model.labels_)
        
        # Save model
        model_path = os.path.join(self.models_dir, 'habit_detector.pkl')
        joblib.dump(model, model_path)
        
        result = {
            'success': True,
            'model': 'habit_detector',
            'n_clusters': n_clusters,
            'silhouette_score': round(sil_score, 3),
            'trained_at': datetime.now().isoformat(),
            'data_size': len(tasks_data)
        }
        
        self.training_history.append(result)
        
        return result
    
    def _prepare_features(self, tasks_data):
        """Prepare features for training"""
        if not tasks_data:
            return None, None
        
        df = pd.DataFrame(tasks_data)
        
        features = []
        labels = []
        
        for i in range(len(df) - 1):
            current = df.iloc[i]
            
            # Extract features
            hour = 9
            if current.get('created_at'):
                try:
                    dt = datetime.fromisoformat(current['created_at'])
                    hour = dt.hour
                except:
                    pass
            
            feature = [
                hour,
                current.get('priority', 3),
                current.get('estimated_duration', 60),
                hash(current.get('category', 'general')) % 10
            ]
            
            features.append(feature)
            labels.append(current.get('title', 'unknown'))
        
        return np.array(features), labels
    
    def _extract_habit_features(self, tasks_data):
        """Extract features for habit detection"""
        if not tasks_data:
            return None
        
        features = []
        
        for task in tasks_data:
            completed_at = task.get('completed_at')
            if isinstance(completed_at, str):
                completed_at = datetime.fromisoformat(completed_at)
            
            if completed_at:
                features.append([
                    completed_at.hour,
                    completed_at.weekday(),
                    task.get('estimated_duration', 60) / 60,  # hours
                    hash(task.get('category', 'general')) % 5
                ])
        
        return np.array(features) if features else None
    
    def evaluate_model(self, model_name, X_test, y_test):
        """
        Evaluate a trained model.
        
        Args:
            model_name: Name of the model
            X_test: Test features
            y_test: Test labels
            
        Returns:
            dict: Evaluation metrics
        """
        model_path = os.path.join(self.models_dir, f'{model_name}.pkl')
        
        if not os.path.exists(model_path):
            return {'error': 'Model not found'}
        
        model = joblib.load(model_path)
        y_pred = model.predict(X_test)
        
        return {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred, average='weighted'),
            'recall': recall_score(y_test, y_pred, average='weighted'),
            'f1': f1_score(y_test, y_pred, average='weighted')
        }
    
    def get_training_history(self):
        """Get training history"""
        return self.training_history
    
    def export_model_info(self):
        """Export model information"""
        info = {
            'models_dir': self.models_dir,
            'available_models': os.listdir(self.models_dir) if os.path.exists(self.models_dir) else [],
            'training_history': self.training_history,
            'exported_at': datetime.now().isoformat()
        }
        
        # Save to file
        info_path = os.path.join(self.models_dir, 'model_info.json')
        with open(info_path, 'w') as f:
            json.dump(info, f, indent=2)
        
        return info


# Test the trainer
if __name__ == '__main__':
    trainer = MLTrainer()
    
    print("Testing ML Trainer:")
    print("=" * 50)
    
    # Sample data
    sample_tasks = [
        {'title': 'Task 1', 'priority': 1, 'category': 'work', 'estimated_duration': 60, 'created_at': '2024-01-30T09:00:00'},
        {'title': 'Task 2', 'priority': 2, 'category': 'work', 'estimated_duration': 30, 'created_at': '2024-01-30T10:00:00'},
        # Add more sample tasks...
    ]
    
    # Note: Need more data for actual training
    print("\nML Trainer initialized successfully!")
    print(f"Models directory: {trainer.models_dir}")