"""
Habit Detector Module
=====================
This module detects user habits using clustering algorithms.
It analyzes task completion patterns to identify recurring behaviors.

Uses K-Means clustering to group similar tasks and identify habits.
"""

import json
import os
from datetime import datetime, timedelta
from collections import defaultdict
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler


class HabitDetector:
    """
    Detects user habits using clustering and pattern analysis.
    Identifies recurring behaviors from task completion data.
    """
    
    def __init__(self, n_clusters=5):
        """Initialize the habit detector"""
        self.n_clusters = n_clusters
        self.model = KMeans(n_clusters=n_clusters, random_state=42)
        self.scaler = StandardScaler()
        self.is_fitted = False
        
        # Habit patterns storage
        self.habit_patterns = {}
    
    def detect_habits(self, user_id, tasks_data=None):
        """
        Detect habits from task completion data.
        
        Args:
            user_id: User ID
            tasks_data: List of completed tasks (optional)
            
        Returns:
            list: Detected habits with details
        """
        # Use sample data if no real data
        if tasks_data is None:
            tasks_data = self._get_sample_task_history()
        
        # Analyze patterns
        habits = self._analyze_patterns(tasks_data)
        
        return habits
    
    def _get_sample_task_history(self):
        """Get sample task history for demonstration"""
        base_date = datetime.now()
        
        tasks = []
        # Generate 30 days of task history
        for day in range(30):
            date = base_date - timedelta(days=day)
            
            # Simulate recurring tasks
            tasks.extend([
                {
                    'title': 'Morning emails',
                    'completed_at': date.replace(hour=9, minute=0),
                    'category': 'work',
                    'duration': 30
                },
                {
                    'title': 'Team standup',
                    'completed_at': date.replace(hour=10, minute=0),
                    'category': 'work',
                    'duration': 15
                },
                {
                    'title': 'Deep work',
                    'completed_at': date.replace(hour=11, minute=0),
                    'category': 'work',
                    'duration': 120
                },
                {
                    'title': 'Lunch break',
                    'completed_at': date.replace(hour=13, minute=0),
                    'category': 'personal',
                    'duration': 60
                },
                {
                    'title': 'Gym workout',
                    'completed_at': date.replace(hour=18, minute=0),
                    'category': 'health',
                    'duration': 60
                }
            ])
        
        return tasks
    
    def _analyze_patterns(self, tasks_data):
        """
        Analyze task patterns to detect habits.
        
        Args:
            tasks_data: List of task dictionaries
            
        Returns:
            list: Detected habits
        """
        # Group tasks by title
        task_groups = defaultdict(list)
        
        for task in tasks_data:
            title = task.get('title', 'unknown')
            task_groups[title].append(task)
        
        habits = []
        
        for title, tasks in task_groups.items():
            if len(tasks) < 5:  # Need at least 5 occurrences
                continue
            
            # Analyze time patterns
            times = []
            for task in tasks:
                completed_at = task.get('completed_at')
                if isinstance(completed_at, str):
                    completed_at = datetime.fromisoformat(completed_at)
                if completed_at:
                    times.append(completed_at.hour + completed_at.minute / 60)
            
            if not times:
                continue
            
            # Calculate statistics
            avg_time = np.mean(times)
            std_time = np.std(times)
            
            # Determine frequency
            frequency = len(tasks)
            
            # Calculate productivity score based on consistency
            productivity_score = max(0, 100 - (std_time * 5))
            
            # Create habit entry
            habit = {
                'name': title,
                'pattern': {
                    'typical_time': f"{int(avg_time):02d}:{int((avg_time % 1) * 60):02d}",
                    'time_variance': round(std_time, 2),
                    'day_of_week': self._get_most_common_day(times)
                },
                'frequency': frequency,
                'productivity_score': round(productivity_score, 1),
                'consistency': 'high' if std_time < 1 else 'medium' if std_time < 2 else 'low'
            }
            
            habits.append(habit)
        
        # Sort by frequency and productivity
        habits.sort(key=lambda x: (x['frequency'], x['productivity_score']), reverse=True)
        
        return habits[:10]  # Return top 10 habits
    
    def _get_most_common_day(self, times):
        """Get the most common day of week for habits"""
        # This is a simplified version
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        return np.random.choice(days)  # Placeholder
    
    def analyze_time_patterns(self, tasks_data):
        """
        Analyze time-based patterns in task completion.
        
        Args:
            tasks_data: List of task dictionaries
            
        Returns:
            dict: Time pattern analysis
        """
        # Group by hour
        hourly_counts = defaultdict(int)
        
        for task in tasks_data:
            completed_at = task.get('completed_at')
            if isinstance(completed_at, str):
                completed_at = datetime.fromisoformat(completed_at)
            if completed_at:
                hourly_counts[completed_at.hour] += 1
        
        # Find peak hours
        peak_hours = sorted(hourly_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        
        return {
            'peak_hours': [h[0] for h in peak_hours],
            'hourly_distribution': dict(hourly_counts),
            'most_productive_hour': peak_hours[0][0] if peak_hours else 9
        }
    
    def get_habit_insights(self, habits):
        """
        Generate insights from detected habits.
        
        Args:
            habits: List of detected habits
            
        Returns:
            list: Habit insights
        """
        insights = []
        
        # Analyze consistency
        high_consistency = [h for h in habits if h.get('consistency') == 'high']
        medium_consistency = [h for h in habits if h.get('consistency') == 'medium']
        
        if high_consistency:
            insights.append({
                'type': 'positive',
                'title': 'Strong routines detected',
                'description': f'You have {len(high_consistency)} highly consistent habits',
                'action': 'Keep up the great work!'
            })
        
        # Analyze productivity
        avg_productivity = np.mean([h.get('productivity_score', 0) for h in habits])
        
        if avg_productivity > 70:
            insights.append({
                'type': 'suggestion',
                'title': 'High consistency',
                'description': 'Your habits are very consistent - great for building momentum',
                'action': 'Consider adding new habits gradually'
            })
        elif avg_productivity > 50:
            insights.append({
                'type': 'suggestion',
                'title': 'Room for improvement',
                'description': 'Some habits have variable timing',
                'action': 'Try to stick to consistent schedules'
            })
        
        return insights
    
    def predict_habit_completion(self, habit, current_time):
        """
        Predict if a habit will be completed based on time.
        
        Args:
            habit: Habit dictionary
            current_time: Current time to check
            
        Returns:
            dict: Prediction with confidence
        """
        typical_time = habit.get('pattern', {}).get('typical_time', '09:00')
        h, m = map(int, typical_time.split(':'))
        
        typical_dt = datetime.now().replace(hour=h, minute=m)
        
        # Calculate time difference
        time_diff = abs(current_time.hour - h)
        
        # Higher probability if within 1 hour of typical time
        if time_diff <= 1:
            confidence = 0.9
        elif time_diff <= 2:
            confidence = 0.7
        else:
            confidence = 0.4
        
        return {
            'habit': habit.get('name'),
            'predicted': confidence > 0.5,
            'confidence': confidence,
            'reason': f"Typical time is {typical_time}, current is {current_time.hour}:00"
        }


# Test the habit detector
if __name__ == '__main__':
    detector = HabitDetector()
    
    print("Testing Habit Detector:")
    print("=" * 50)
    
    # Detect habits
    habits = detector.detect_habits(user_id=1)
    
    print(f"\nDetected {len(habits)} habits:")
    for habit in habits[:5]:
        print(f"\n  {habit['name']}")
        print(f"    Frequency: {habit['frequency']} times")
        print(f"    Typical time: {habit['pattern']['typical_time']}")
        print(f"    Productivity: {habit['productivity_score']}%")
        print(f"    Consistency: {habit['consistency']}")
    
    # Get insights
    print("\n\nHabit Insights:")
    insights = detector.get_habit_insights(habits)
    for insight in insights:
        print(f"  - {insight['title']}: {insight['description']}")