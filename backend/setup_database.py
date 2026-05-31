"""
SynapseAI Twin - Database Setup Script
Creates the database and tables in MySQL
"""
import pymysql
import sys

# Database connection settings
DB_HOST = 'localhost'
DB_USER = 'root'
DB_PASSWORD = 'root'  # Your MySQL password
DB_CHARSET = 'utf8mb4'

def create_database():
    """Create the synapse_ai_twin database if it doesn't exist"""
    print("=" * 50)
    print("Setting up SynapseAI Twin Database")
    print("=" * 50)
    
    try:
        # Connect to MySQL without database
        print(f"\n[1] Connecting to MySQL at {DB_HOST}...")
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            charset=DB_CHARSET
        )
        print("✅ Connected successfully!")
        
        cursor = connection.cursor()
        
        # Create database
        print("\n[2] Creating database 'synapse_ai_twin'...")
        cursor.execute("CREATE DATABASE IF NOT EXISTS synapse_ai_twin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print("✅ Database created!")
        
        # Use the database
        print("\n[3] Selecting database...")
        cursor.execute("USE synapse_ai_twin")
        print("✅ Using synapse_ai_twin")
        
        # Create Users table
        print("\n[4] Creating tables...")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(120) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """)
        print("  ✅ users table")
        
        # Create Tasks table (with unique constraint for duplicate prevention)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            priority INT DEFAULT 3,
            status VARCHAR(20) DEFAULT 'pending',
            category VARCHAR(50),
            estimated_duration INT,
            due_date DATETIME,
            completed_at DATETIME,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_user_task_date (user_id, title, due_date),
            INDEX idx_user_id (user_id),
            INDEX idx_status (status),
            INDEX idx_priority (priority),
            INDEX idx_due_date (due_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """)
        print("  ✅ tasks table (with duplicate prevention)")
        
        # Create Activity Logs table (with unique constraint for duplicate prevention)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS activity_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            activity VARCHAR(255) NOT NULL,
            activity_type VARCHAR(50),
            timestamp DATETIME NOT NULL,
            duration INT DEFAULT 0,
            meta_data TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_user_activity_time (user_id, activity, timestamp),
            INDEX idx_user_id (user_id),
            INDEX idx_timestamp (timestamp),
            INDEX idx_activity_type (activity_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """)
        print("  ✅ activity_logs table (with duplicate prevention)")
        
        # Create other tables ( Habits, ProductivityLogs, etc.)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS habits (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            pattern TEXT,
            frequency INT,
            productivity_score FLOAT DEFAULT 0,
            detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """)
        print("  ✅ habits table")
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS productivity_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            date DATE NOT NULL,
            tasks_completed INT DEFAULT 0,
            total_focus_time INT DEFAULT 0,
            productivity_score FLOAT DEFAULT 0,
            break_time INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_user_date (user_id, date),
            INDEX idx_user_id (user_id),
            INDEX idx_date (date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """)
        print("  ✅ productivity_logs table")
        
        # Insert sample data
        print("\n[5] Inserting sample data...")
        cursor.execute("SELECT COUNT(*) FROM users")
        if cursor.fetchone()[0] == 0:
            cursor.execute("INSERT INTO users (name, email) VALUES ('Demo User', 'demo@synapseai.com')")
            print("  ✅ Sample user created")
        
        connection.commit()
        
        print("\n" + "=" * 50)
        print("✅ DATABASE SETUP COMPLETE!")
        print("=" * 50)
        print("\nDatabase: synapse_ai_twin")
        print("Tables: users, tasks, activity_logs, habits, productivity_logs")
        print("\nUnique constraints for duplicate prevention:")
        print("  - tasks: (user_id, title, due_date)")
        print("  - activity_logs: (user_id, activity, timestamp)")
        
        cursor.close()
        connection.close()
        
    except pymysql.err.OperationalError as e:
        print(f"\n❌ MySQL Connection Error: {e}")
        print("\nPlease make sure:")
        print("  1. MySQL server is running")
        print("  2. Username is 'root'")
        print("  3. Password is correct (default: 'password')")
        print("\nTo update password, edit setup_database.py")
        return False
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False
    
    return True

if __name__ == '__main__':
    success = create_database()
    sys.exit(0 if success else 1)
