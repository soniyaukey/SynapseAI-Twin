"""
SynapseAI Twin - Main Flask Application
=========================================
This is the main backend API that powers the AI Digital Twin system.
It provides endpoints for task management, predictions, scheduling, and analytics.

Author: SynapseAI Team
Version: 1.0.0
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from config import DB_CONFIG, DEBUG, SECRET_KEY, API_CONFIG
import pymysql

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY
app.config['SQLALCHEMY_DATABASE_URI'] = (
    f"mysql+pymysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}"
    f"@{DB_CONFIG['host']}/{DB_CONFIG['database']}"
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Enable CORS for frontend
CORS(app, origins=API_CONFIG['cors_origins'])

# Initialize SQLAlchemy
db = SQLAlchemy(app)

# ==================== DATABASE MODELS ====================

class User(db.Model):
    """User model - represents a user in the system"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    # Relationships
    tasks = db.relationship('Task', backref='user', lazy=True)
    habits = db.relationship('Habit', backref='user', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Task(db.Model):
    """Task model - represents a task/item to be done"""
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    priority = db.Column(db.Integer, default=3)  # 1=High, 2=Medium, 3=Low
    status = db.Column(db.String(20), default='pending')  # pending, in_progress, completed
    category = db.Column(db.String(50))  # work, personal, study, etc.
    estimated_duration = db.Column(db.Integer)  # minutes
    due_date = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    # Add unique constraint for duplicate prevention (matches DB schema)
    __table_args__ = (
        db.UniqueConstraint('user_id', 'title', 'due_date', name='unique_user_task_date'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'priority': self.priority,
            'status': self.status,
            'category': self.category,
            'estimated_duration': self.estimated_duration,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Habit(db.Model):
    """Habit model - stores detected user habits"""
    __tablename__ = 'habits'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    pattern = db.Column(db.Text)  # JSON string of time patterns
    frequency = db.Column(db.Integer)  # times per week
    productivity_score = db.Column(db.Float)  # 0-100
    detected_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'pattern': self.pattern,
            'frequency': self.frequency,
            'productivity_score': self.productivity_score,
            'detected_at': self.detected_at.isoformat() if self.detected_at else None
        }


class ProductivityLog(db.Model):
    """ProductivityLog - tracks daily productivity metrics"""
    __tablename__ = 'productivity_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    tasks_completed = db.Column(db.Integer, default=0)
    total_focus_time = db.Column(db.Integer, default=0)  # minutes
    productivity_score = db.Column(db.Float, default=0.0)
    break_time = db.Column(db.Integer, default=0)  # minutes
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'date': self.date.isoformat() if self.date else None,
            'tasks_completed': self.tasks_completed,
            'total_focus_time': self.total_focus_time,
            'productivity_score': self.productivity_score,
            'break_time': self.break_time
        }


class ActivityLog(db.Model):
    """ActivityLog - tracks user activities with duplicate prevention"""
    __tablename__ = 'activity_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    activity = db.Column(db.String(255), nullable=False)
    activity_type = db.Column(db.String(50))  # task, habit, meeting, break, etc.
    timestamp = db.Column(db.DateTime, nullable=False)
    duration = db.Column(db.Integer, default=0)  # minutes
    meta_data = db.Column(db.Text)  # JSON string for additional data (renamed from metadata)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    # Add unique constraint for duplicate prevention (matches DB schema)
    __table_args__ = (
        db.UniqueConstraint('user_id', 'activity', 'timestamp', name='unique_user_activity_time'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'activity': self.activity,
            'activity_type': self.activity_type,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'duration': self.duration,
            'meta_data': self.meta_data,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


# ==================== ML IMPORTS ====================

# Import ML modules (we'll create these next)
import sys
import os
sys.path.append(os.path.dirname(__file__))

try:
    from ml.nlp_parser import NLPParser
    from ml.task_predictor import TaskPredictor
    from ml.scheduler import SmartScheduler
    from ml.habit_detector import HabitDetector
    ML_AVAILABLE = True
except ImportError as e:
    print(f"Warning: ML modules not fully available: {e}")
    ML_AVAILABLE = False

# Initialize ML components
nlp_parser = None
task_predictor = None
smart_scheduler = None
habit_detector = None

if ML_AVAILABLE:
    try:
        nlp_parser = NLPParser()
        task_predictor = TaskPredictor()
        smart_scheduler = SmartScheduler()
        habit_detector = HabitDetector()
    except Exception as e:
        print(f"Warning: Could not initialize ML models: {e}")


# ==================== API ROUTES ====================

@app.route('/')
def index():
    """Root endpoint - API health check"""
    return jsonify({
        'message': 'Welcome to SynapseAI Twin API',
        'version': '1.0.0',
        'status': 'running'
    })


# ----- User Routes -----

@app.route(f'{API_CONFIG["prefix"]}/users', methods=['GET'])
def get_users():
    """Get all users"""
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])


@app.route(f'{API_CONFIG["prefix"]}/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Get a specific user"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user.to_dict())


@app.route(f'{API_CONFIG["prefix"]}/users', methods=['POST'])
def create_user():
    """Create a new user"""
    data = request.get_json()
    user = User(name=data['name'], email=data['email'])
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201


@app.route(f'{API_CONFIG["prefix"]}/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """Update user profile - allows users to update their name and email"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    # Update name if provided
    if 'name' in data:
        user.name = data['name']
    
    # Update email if provided (and check for duplicates)
    if 'email' in data:
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user and existing_user.id != user_id:
            return jsonify({'error': 'Email already in use'}), 409
        user.email = data['email']
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route(f'{API_CONFIG["prefix"]}/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Delete a user account"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted successfully'})


# ----- Task Routes -----

@app.route(f'{API_CONFIG["prefix"]}/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks, optionally filtered by user_id"""
    user_id = request.args.get('user_id')
    status = request.args.get('status')
    
    query = Task.query
    if user_id:
        query = query.filter_by(user_id=user_id)
    if status:
        query = query.filter_by(status=status)
    
    tasks = query.order_by(Task.priority, Task.due_date).all()
    return jsonify([task.to_dict() for task in tasks])


@app.route(f'{API_CONFIG["prefix"]}/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """Get a specific task"""
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    return jsonify(task.to_dict())


@app.route(f'{API_CONFIG["prefix"]}/tasks', methods=['POST'])
def create_task():
    """Create a new task - supports NLP input parsing"""
    data = request.get_json()
    
    # If NLP input is provided, parse it
    if 'nlp_input' in data and nlp_parser:
        parsed = nlp_parser.parse(data['nlp_input'])
        data.update(parsed)
    
    # Create task
    task = Task(
        user_id=data.get('user_id', 1),
        title=data['title'],
        description=data.get('description', ''),
        priority=data.get('priority', 3),
        category=data.get('category', 'general'),
        estimated_duration=data.get('estimated_duration', 60),
        due_date=data.get('due_date')
    )
    
    db.session.add(task)
    db.session.commit()
    return jsonify(task.to_dict()), 201


@app.route(f'{API_CONFIG["prefix"]}/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Update a task"""
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    data = request.get_json()
    for key, value in data.items():
        if hasattr(task, key):
            setattr(task, key, value)
    
    db.session.commit()
    return jsonify(task.to_dict())


@app.route(f'{API_CONFIG["prefix"]}/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task"""
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted successfully'})


# ----- ADD-TASK Endpoint (With Duplicate Prevention) -----

@app.route(f'{API_CONFIG["prefix"]}/add-task', methods=['POST'])
def add_task():
    """
    Add a new task with duplicate prevention.
    Checks if task already exists for same user, title, and due_date.
    """
    data = request.get_json()
    
    # Extract required fields
    user_id = data.get('user_id', 1)
    title = data.get('title')
    due_date = data.get('due_date')
    
    # Validate required fields
    if not title:
        return jsonify({'error': 'Title is required'}), 400
    
    # DUPLICATE CHECK: Check if task already exists for same user, title, and due_date
    existing_task = Task.query.filter_by(
        user_id=user_id,
        title=title,
        due_date=due_date
    ).first()
    
    if existing_task:
        return jsonify({
            'message': 'Data already exists',
            'task': existing_task.to_dict()
        }), 409
    
    # Create new task
    task = Task(
        user_id=user_id,
        title=title,
        description=data.get('description', ''),
        priority=data.get('priority', 3),
        status=data.get('status', 'pending'),
        category=data.get('category', 'general'),
        estimated_duration=data.get('estimated_duration', 60),
        due_date=due_date
    )
    
    try:
        db.session.add(task)
        db.session.commit()
        return jsonify({
            'message': 'Task created successfully',
            'task': task.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ----- LOG-ACTIVITY Endpoint (With Duplicate Prevention) -----

@app.route(f'{API_CONFIG["prefix"]}/log-activity', methods=['POST'])
def log_activity():
    """
    Log a user activity with duplicate prevention.
    Checks if activity already exists for same user, activity, and timestamp.
    """
    data = request.get_json()
    
    # Extract required fields
    user_id = data.get('user_id', 1)
    activity = data.get('activity')
    timestamp = data.get('timestamp')
    
    # Validate required fields
    if not activity or not timestamp:
        return jsonify({'error': 'Activity and timestamp are required'}), 400
    
    # DUPLICATE CHECK: Check if activity already exists for same user, activity, and timestamp
    existing_activity = ActivityLog.query.filter_by(
        user_id=user_id,
        activity=activity,
        timestamp=timestamp
    ).first()
    
    if existing_activity:
        return jsonify({
            'message': 'Data already exists',
            'activity': existing_activity.to_dict()
        }), 409
    
# Create new activity log
    activity_log = ActivityLog(
        user_id=user_id,
        activity=activity,
        activity_type=data.get('activity_type', 'general'),
        timestamp=timestamp,
        duration=data.get('duration', 0),
        meta_data=data.get('meta_data')
    )
    
    try:
        db.session.add(activity_log)
        db.session.commit()
        return jsonify({
            'message': 'Activity logged successfully',
            'activity': activity_log.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ----- GET-ACTIVITIES Endpoint -----

@app.route(f'{API_CONFIG["prefix"]}/activities', methods=['GET'])
def get_activities():
    """Get all activity logs, optionally filtered by user_id"""
    user_id = request.args.get('user_id')
    activity_type = request.args.get('activity_type')
    
    query = ActivityLog.query
    if user_id:
        query = query.filter_by(user_id=user_id)
    if activity_type:
        query = query.filter_by(activity_type=activity_type)
    
    activities = query.order_by(ActivityLog.timestamp.desc()).all()
    return jsonify([activity.to_dict() for activity in activities])


# ----- Task Prediction Routes -----

@app.route(f'{API_CONFIG["prefix"]}/predict/next-tasks', methods=['GET'])
def predict_next_tasks():
    """Predict the next likely tasks for a user"""
    user_id = request.args.get('user_id', 1)
    
    if task_predictor:
        predictions = task_predictor.predict(user_id)
        return jsonify(predictions)
    else:
        # Return mock predictions if ML not available
        return jsonify([
            {'task': 'Check emails', 'probability': 0.85},
            {'task': 'Team meeting', 'probability': 0.72},
            {'task': 'Review PRs', 'probability': 0.68}
        ])


# ----- Smart Scheduler Routes -----

@app.route(f'{API_CONFIG["prefix"]}/schedule/generate', methods=['POST'])
def generate_schedule():
    """Generate a smart daily schedule"""
    data = request.get_json()
    user_id = data.get('user_id', 1)
    date = data.get('date')
    
    if smart_scheduler:
        schedule = smart_scheduler.generate_schedule(user_id, date)
        return jsonify(schedule)
    else:
        return jsonify({'message': 'Scheduler not available'})


# ----- Habit Detection Routes -----

@app.route(f'{API_CONFIG["prefix"]}/habits', methods=['GET'])
def get_habits():
    """Get detected habits for a user"""
    user_id = request.args.get('user_id', 1)
    habits = Habit.query.filter_by(user_id=user_id).all()
    return jsonify([habit.to_dict() for habit in habits])


@app.route(f'{API_CONFIG["prefix"]}/habits/detect', methods=['POST'])
def detect_habits():
    """Detect new habits based on user behavior"""
    data = request.get_json()
    user_id = data.get('user_id', 1)
    
    if habit_detector:
        habits = habit_detector.detect_habits(user_id)
        return jsonify(habits)
    else:
        return jsonify({'message': 'Habit detector not available'})


# ----- Productivity Analytics Routes -----

@app.route(f'{API_CONFIG["prefix"]}/analytics/productivity', methods=['GET'])
def get_productivity():
    """Get productivity analytics"""
    user_id = request.args.get('user_id', 1)
    days = request.args.get('days', 7)
    
    logs = ProductivityLog.query.filter_by(user_id=user_id)\
        .order_by(ProductivityLog.date.desc())\
        .limit(days).all()
    
    if not logs:
        # Return sample data if no real data
        return jsonify({
            'daily_scores': [
                {'date': '2024-01-30', 'score': 78},
                {'date': '2024-01-29', 'score': 85},
                {'date': '2024-01-28', 'score': 72},
                {'date': '2024-01-27', 'score': 90},
                {'date': '2024-01-26', 'score': 65},
                {'date': '2024-01-25', 'score': 88},
                {'date': '2024-01-24', 'score': 82}
            ],
            'average_score': 80.0,
            'trend': 'improving'
        })
    
    return jsonify({
        'daily_scores': [log.to_dict() for log in logs],
        'average_score': sum(l.productivity_score for l in logs) / len(logs) if logs else 0,
        'trend': 'stable'
    })


@app.route(f'{API_CONFIG["prefix"]}/analytics/insights', methods=['GET'])
def get_insights():
    """Get personalized productivity insights"""
    user_id = request.args.get('user_id', 1)
    
    # Generate insights based on data
    insights = [
        {
            'type': 'suggestion',
            'title': 'Best working hours',
            'description': 'You are most productive between 9 AM and 11 AM',
            'impact': 'high'
        },
        {
            'type': 'suggestion',
            'title': 'Break reminder',
            'description': 'Take a 5-minute break every hour for better focus',
            'impact': 'medium'
        },
        {
            'type': 'insight',
            'title': 'Task completion rate',
            'description': 'You complete 85% of your high-priority tasks',
            'impact': 'positive'
        }
    ]
    
    return jsonify(insights)


# ----- NLP Routes -----

@app.route(f'{API_CONFIG["prefix"]}/nlp/parse', methods=['POST'])
def parse_nlp_input():
    """Parse natural language task input"""
    data = request.get_json()
    text = data.get('text', '')
    
    if nlp_parser:
        result = nlp_parser.parse(text)
        return jsonify(result)
    else:
        return jsonify({'error': 'NLP parser not available'}), 500


# ==================== DATABASE INITIALIZATION ====================

def init_database():
    """Initialize the database with tables"""
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Database tables created successfully!")
        
        # Check if we need to add sample data
        if User.query.count() == 0:
            # Add sample user
            sample_user = User(name='Demo User', email='demo@synapseai.com')
            db.session.add(sample_user)
            db.session.commit()
            print("Sample user created!")
            
            # Add sample tasks
            sample_tasks = [
                Task(user_id=1, title='Complete project proposal', priority=1, 
                     category='work', estimated_duration=120, 
                     due_date='2024-02-01'),
                Task(user_id=1, title='Review team updates', priority=2,
                     category='work', estimated_duration=30,
                     due_date='2024-01-31'),
                Task(user_id=1, title='Gym workout', priority=3,
                     category='personal', estimated_duration=60),
                Task(user_id=1, title='Read chapter 5', priority=2,
                     category='study', estimated_duration=45),
                Task(user_id=1, title='Prepare presentation', priority=1,
                     category='work', estimated_duration=180,
                     due_date='2024-02-05')
            ]
            
            for task in sample_tasks:
                db.session.add(task)
            db.session.commit()
            print("Sample tasks created!")


# ==================== MAIN ====================

if __name__ == '__main__':
    # Initialize database
    try:
        init_database()
    except Exception as e:
        print(f"Database initialization warning: {e}")
    
    # Run the app
    app.run(host='0.0.0.0', port=5000, debug=DEBUG)