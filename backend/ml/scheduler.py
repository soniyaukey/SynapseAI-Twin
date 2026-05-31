"""
Smart Scheduler Module
======================
This module generates intelligent daily schedules based on:
- Task priorities and deadlines
- User's productivity patterns
- Time availability
- Task categories and durations

It uses a greedy algorithm to optimize task scheduling.
"""

import json
import os
from datetime import datetime, timedelta
from collections import defaultdict


class SmartScheduler:
    """
    Smart task scheduler that arranges tasks optimally.
    Considers priorities, deadlines, and productivity patterns.
    """
    
    def __init__(self):
        """Initialize the scheduler"""
        # Define productivity patterns (hour -> productivity score)
        self.productivity_pattern = {
            6: 0.4, 7: 0.5, 8: 0.7, 9: 0.95, 10: 0.98, 11: 0.92,
            12: 0.6, 13: 0.5, 14: 0.85, 15: 0.88, 16: 0.80, 17: 0.75,
            18: 0.5, 19: 0.4, 20: 0.6, 21: 0.5, 22: 0.3
        }
        
        # Work hours configuration
        self.work_start = 9
        self.work_end = 18
        self.break_hours = [12, 13]  # Lunch break
    
    def generate_schedule(self, user_id, date=None, tasks=None):
        """
        Generate a smart daily schedule.
        
        Args:
            user_id: User ID
            date: Date for schedule (default: today)
            tasks: List of tasks to schedule (optional - will fetch from DB if not provided)
            
        Returns:
            dict: Generated schedule with time slots
        """
        if date is None:
            date = datetime.now().strftime('%Y-%m-%d')
        
        # If no tasks provided, use sample tasks
        if tasks is None:
            tasks = self._get_sample_tasks()
        
        # Sort tasks by priority and deadline
        sorted_tasks = self._sort_tasks(tasks)
        
        # Generate schedule
        schedule = self._create_time_slots(sorted_tasks, date)
        
        return schedule
    
    def _get_sample_tasks(self):
        """Get sample tasks for demonstration"""
        return [
            {'id': 1, 'title': 'Project proposal', 'priority': 1, 'duration': 120, 'category': 'work'},
            {'id': 2, 'title': 'Team standup', 'priority': 2, 'duration': 30, 'category': 'work'},
            {'id': 3, 'title': 'Code review', 'priority': 2, 'duration': 60, 'category': 'work'},
            {'id': 4, 'title': 'Gym workout', 'priority': 3, 'duration': 60, 'category': 'health'},
            {'id': 5, 'title': 'Read documentation', 'priority': 3, 'duration': 45, 'category': 'study'},
            {'id': 6, 'title': 'Client call', 'priority': 1, 'duration': 45, 'category': 'work'},
        ]
    
    def _sort_tasks(self, tasks):
        """
        Sort tasks by priority and deadline.
        
        Args:
            tasks: List of task dictionaries
            
        Returns:
            list: Sorted tasks
        """
        def sort_key(task):
            priority = task.get('priority', 3)
            duration = task.get('duration', 60)
            
            # Higher priority (lower number) comes first
            # For same priority, shorter tasks first
            return (priority, duration)
        
        return sorted(tasks, key=sort_key)
    
    def _create_time_slots(self, tasks, date):
        """
        Create time slots for scheduled tasks.
        
        Args:
            tasks: List of sorted tasks
            date: Date string
            
        Returns:
            dict: Schedule with time slots
        """
        schedule = {
            'date': date,
            'slots': [],
            'summary': {
                'total_tasks': len(tasks),
                'total_duration': 0,
                'productivity_score': 0
            }
        }
        
        current_time = self.work_start
        total_productivity = 0
        
        for task in tasks:
            # Skip if task duration exceeds available time
            duration_hours = task.get('duration', 60) / 60
            
            # Check if within work hours
            if current_time >= self.work_end:
                break
            
            # Skip break hours
            if current_time in self.break_hours:
                current_time = self.break_hours[1] + 1
            
            # Get productivity score for this hour
            productivity = self.productivity_pattern.get(current_time, 0.5)
            
            # Calculate end time
            end_time = current_time + duration_hours
            
            # Create time slot
            slot = {
                'start': f"{int(current_time):02d}:{int((current_time % 1) * 60):02d}",
                'end': f"{int(end_time):02d}:{int((end_time % 1) * 60):02d}",
                'task': task.get('title', 'Untitled'),
                'category': task.get('category', 'general'),
                'priority': task.get('priority', 3),
                'productivity_boost': productivity
            }
            
            schedule['slots'].append(slot)
            schedule['summary']['total_duration'] += task.get('duration', 60)
            total_productivity += productivity
            
            # Move to next time slot
            current_time = end_time
        
        # Calculate average productivity
        if schedule['slots']:
            schedule['summary']['productivity_score'] = round(
                total_productivity / len(schedule['slots']) * 100, 1
            )
        
        return schedule
    
    def optimize_schedule(self, schedule):
        """
        Optimize an existing schedule for better productivity.
        
        Args:
            schedule: Current schedule dictionary
            
        Returns:
            dict: Optimized schedule
        """
        slots = schedule.get('slots', [])
        
        # Reorder slots based on productivity pattern
        high_productivity = [s for s in slots if s.get('productivity_boost', 0) > 0.8]
        low_productivity = [s for s in slots if s.get('productivity_boost', 0) <= 0.8]
        
        # Put high-priority tasks in high-productivity slots
        optimized = high_productivity + low_productivity
        
        schedule['slots'] = optimized
        return schedule
    
    def suggest_breaks(self, schedule):
        """
        Suggest optimal break times in the schedule.
        
        Args:
            schedule: Current schedule
            
        Returns:
            list: Suggested break times
        """
        suggestions = []
        
        # Suggest break after 2 hours of work
        work_duration = 0
        for slot in schedule.get('slots', []):
            duration = slot.get('duration', 0)
            if isinstance(duration, str):
                try:
                    h, m = map(int, duration.split(':'))
                    duration = h * 60 + m
                except:
                    duration = 60
            
            work_duration += duration
            
            if work_duration >= 120:  # 2 hours
                suggestions.append({
                    'after': slot.get('end'),
                    'duration': 15,
                    'type': 'short_break'
                })
                work_duration = 0
        
        return suggestions
    
    def get_availability(self, date, working_hours=None):
        """
        Get available time slots for a given date.
        
        Args:
            date: Date to check
            working_hours: Optional custom working hours
            
        Returns:
            list: Available time slots
        """
        if working_hours is None:
            working_hours = (self.work_start, self.work_end)
        
        start, end = working_hours
        available = []
        
        current = start
        while current < end:
            # Skip break hours
            if current not in self.break_hours:
                available.append({
                    'start': f"{int(current):02d}:00",
                    'end': f"{int(current + 1):02d}:00",
                    'available': True
                })
            current += 1
        
        return available


# Test the scheduler
if __name__ == '__main__':
    scheduler = SmartScheduler()
    
    print("Testing Smart Scheduler:")
    print("=" * 50)
    
    # Generate schedule
    schedule = scheduler.generate_schedule(user_id=1)
    
    print(f"\nSchedule for {schedule['date']}:")
    print(f"Total tasks: {schedule['summary']['total_tasks']}")
    print(f"Total duration: {schedule['summary']['total_duration']} minutes")
    print(f"Productivity score: {schedule['summary']['productivity_score']}%")
    
    print("\nTime Slots:")
    for slot in schedule['slots']:
        print(f"  {slot['start']} - {slot['end']}: {slot['task']} ({slot['category']})")
    
    print("\nAvailable time slots:")
    availability = scheduler.get_availability('2024-01-30')
    for slot in availability[:5]:
        print(f"  {slot['start']} - {slot['end']}")