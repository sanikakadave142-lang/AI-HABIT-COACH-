from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
import time
import json
import base64
import hmac
import hashlib

from ai.prediction import predict_habit


app = Flask(__name__)
CORS(app)


# ==========================================
# Database Connection
# ==========================================

def get_db():

    conn = sqlite3.connect("habit.db")
    conn.row_factory = sqlite3.Row

    return conn


# ==========================================
# Create Database Tables
# ==========================================

def init_db():

    conn = get_db()

    # ======================================
    # Users Table
    # ======================================

    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)

    # ======================================
    # Habits Table
    # ======================================

    conn.execute("""
        CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT,
            target TEXT,
            status TEXT DEFAULT 'Pending',
            user_id INTEGER
        )
    """)

    # ======================================
    # Habit Logs Table
    # ======================================

    conn.execute("""
        CREATE TABLE IF NOT EXISTS habit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            status TEXT NOT NULL,
            duration INTEGER,
            user_id INTEGER,
            FOREIGN KEY (habit_id) REFERENCES habits(id)
        )
    """)

    # ======================================
    # Daily Schedule Table
    # ======================================

    conn.execute("""
        CREATE TABLE IF NOT EXISTS daily_schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            habit_id INTEGER,
            schedule_date TEXT NOT NULL,
            schedule_time TEXT,
            notes TEXT,
            FOREIGN KEY (habit_id) REFERENCES habits(id)
        )
    """)

    # ======================================
    # Reminders Table
    # ======================================

    conn.execute("""
        CREATE TABLE IF NOT EXISTS reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            habit_id INTEGER,
            reminder_time TEXT NOT NULL,
            repeat_pattern TEXT DEFAULT 'Daily',
            enabled INTEGER DEFAULT 1,
            FOREIGN KEY (habit_id) REFERENCES habits(id)
        )
    """)

    # ======================================
    # Achievements Table
    # ======================================

    conn.execute("""
        CREATE TABLE IF NOT EXISTS achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            achieved_date TEXT,
            type TEXT
        )
    """)

    # ======================================
    # AI Recommendations Table
    # ======================================

    conn.execute("""
        CREATE TABLE IF NOT EXISTS ai_recommendations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            habit_id INTEGER,
            prediction TEXT,
            recommendation TEXT,
            confidence REAL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (habit_id) REFERENCES habits(id)
        )
    """)

    # ======================================
    # Migration - Habits user_id
    # ======================================

    habit_columns = conn.execute(
        "PRAGMA table_info(habits)"
    ).fetchall()

    habit_column_names = [
        column["name"]
        for column in habit_columns
    ]

    if "user_id" not in habit_column_names:

        conn.execute("""
            ALTER TABLE habits
            ADD COLUMN user_id INTEGER
        """)

    # ======================================
    # Migration - Habit Logs user_id
    # ======================================

    log_columns = conn.execute(
        "PRAGMA table_info(habit_logs)"
    ).fetchall()

    log_column_names = [
        column["name"]
        for column in log_columns
    ]

    if "user_id" not in log_column_names:

        conn.execute("""
            ALTER TABLE habit_logs
            ADD COLUMN user_id INTEGER
        """)

    # ======================================
    # Existing Data -> User 1
    # ======================================

    conn.execute("""
        UPDATE habits
        SET user_id = 1
        WHERE user_id IS NULL
    """)

    conn.execute("""
        UPDATE habit_logs
        SET user_id = 1
        WHERE user_id IS NULL
    """)

    conn.commit()
    conn.close()

# Initialize database
init_db()


# ==========================================
# Home
# ==========================================

@app.route("/", methods=["GET"])
def home():

    return "AI Habit Coach Backend is Running"


# ==========================================
# Register User
# ==========================================

@app.route("/register", methods=["POST"])
def register():

    data = request.get_json(silent=True) or {}

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:

        return jsonify({
            "message": "All fields are required"
        }), 400

    conn = get_db()

    try:

        conn.execute("""
            INSERT INTO users
            (name, email, password)
            VALUES (?, ?, ?)
        """, (
            name,
            email,
            password
        ))

        conn.commit()

        return jsonify({
            "message": "User registered successfully"
        }), 201

    except sqlite3.IntegrityError:

        return jsonify({
            "message": "Email already registered"
        }), 400

    finally:

        conn.close()


# ==========================================
# Login User
# ==========================================

@app.route("/login", methods=["POST"])
def login():

    data = request.get_json(silent=True) or {}

    email = data.get("email")
    password = data.get("password")

    if not email or not password:

        return jsonify({
            "message": "Email and password are required"
        }), 400

    conn = get_db()

    user = conn.execute("""
        SELECT *
        FROM users
        WHERE email = ?
        AND password = ?
    """, (
        email,
        password
    )).fetchone()

    conn.close()

    if user:

        return jsonify({
            "message": "Login successful",
            "user_id": user["id"],
            "name": user["name"]
        })

    return jsonify({
        "message": "Invalid email or password"
    }), 401


# ==========================================
# Get Profile
# ==========================================

@app.route("/profile/<int:user_id>", methods=["GET"])
def get_profile(user_id):

    conn = get_db()

    user = conn.execute("""
        SELECT id, name, email
        FROM users
        WHERE id = ?
    """, (
        user_id,
    )).fetchone()

    conn.close()

    if not user:

        return jsonify({
            "message": "User not found"
        }), 404

    return jsonify(dict(user))


# ==========================================
# Update Profile
# ==========================================

@app.route("/profile/<int:user_id>", methods=["PUT"])
def update_profile(user_id):

    data = request.get_json(silent=True) or {}

    name = data.get("name")
    email = data.get("email")

    if not name or not email:

        return jsonify({
            "message": "Name and email are required"
        }), 400

    conn = get_db()

    try:

        cursor = conn.execute("""
            UPDATE users
            SET name = ?, email = ?
            WHERE id = ?
        """, (
            name,
            email,
            user_id
        ))

        if cursor.rowcount == 0:

            conn.close()

            return jsonify({
                "message": "User not found"
            }), 404

        conn.commit()

        return jsonify({
            "message": "Profile updated successfully"
        })

    except sqlite3.IntegrityError:

        return jsonify({
            "message": "Email already registered"
        }), 400

    finally:

        conn.close()


# ==========================================
# Add Habit
# ==========================================

@app.route("/habits", methods=["POST"])
def add_habit():

    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")
    name = data.get("name")
    category = data.get("category")
    target = data.get("target")

    if not user_id or not name:

        return jsonify({
            "message": "User ID and habit name are required"
        }), 400

    conn = get_db()

    user = conn.execute(
        """
        SELECT id
        FROM users
        WHERE id = ?
        """,
        (
            user_id,
        )
    ).fetchone()

    if not user:

        conn.close()

        return jsonify({
            "message": "User not found"
        }), 404

    cursor = conn.execute("""
        INSERT INTO habits
        (
            name,
            category,
            target,
            user_id
        )
        VALUES (?, ?, ?, ?)
    """, (
        name,
        category,
        target,
        user_id
    ))

    conn.commit()

    habit_id = cursor.lastrowid

    conn.close()

    return jsonify({
        "message": "Habit added successfully",
        "habit_id": habit_id
    }), 201


# ==========================================
# Get Habits
# ==========================================

@app.route("/habits", methods=["GET"])
def get_habits():

    user_id = request.args.get(
        "user_id",
        type=int
    )

    if not user_id:

        return jsonify({
            "message": "user_id is required"
        }), 400

    conn = get_db()

    habits = conn.execute("""
        SELECT
            id,
            name,
            category,
            target,
            status,
            user_id
        FROM habits
        WHERE user_id = ?
        ORDER BY id DESC
    """, (
        user_id,
    )).fetchall()

    conn.close()

    return jsonify([
        dict(habit)
        for habit in habits
    ])


# ==========================================
# Update Habit
# ==========================================

@app.route("/habits/<int:habit_id>", methods=["PUT"])
def update_habit(habit_id):

    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")
    name = data.get("name")
    category = data.get("category")
    target = data.get("target")
    status = data.get("status")

    if not user_id:

        return jsonify({
            "message": "user_id is required"
        }), 400

    conn = get_db()

    habit = conn.execute("""
        SELECT *
        FROM habits
        WHERE id = ?
        AND user_id = ?
    """, (
        habit_id,
        user_id
    )).fetchone()

    if not habit:

        conn.close()

        return jsonify({
            "message": "Habit not found"
        }), 404

    # Keep old values if they are not sent
    updated_name = (
        name
        if name is not None
        else habit["name"]
    )

    updated_category = (
        category
        if category is not None
        else habit["category"]
    )

    updated_target = (
        target
        if target is not None
        else habit["target"]
    )

    updated_status = (
        status
        if status is not None
        else habit["status"]
    )

    conn.execute("""
        UPDATE habits
        SET
            name = ?,
            category = ?,
            target = ?,
            status = ?
        WHERE id = ?
        AND user_id = ?
    """, (
        updated_name,
        updated_category,
        updated_target,
        updated_status,
        habit_id,
        user_id
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Habit updated successfully"
    })


# ==========================================
# Delete Habit
# ==========================================

@app.route("/habits/<int:habit_id>", methods=["DELETE"])
def delete_habit(habit_id):

    user_id = request.args.get(
        "user_id",
        type=int
    )

    if not user_id:

        return jsonify({
            "message": "user_id is required"
        }), 400

    conn = get_db()

    habit = conn.execute("""
        SELECT *
        FROM habits
        WHERE id = ?
        AND user_id = ?
    """, (
        habit_id,
        user_id
    )).fetchone()

    if not habit:

        conn.close()

        return jsonify({
            "message": "Habit not found"
        }), 404

    conn.execute("""
        DELETE FROM habit_logs
        WHERE habit_id = ?
        AND user_id = ?
    """, (
        habit_id,
        user_id
    ))

    conn.execute("""
        DELETE FROM habits
        WHERE id = ?
        AND user_id = ?
    """, (
        habit_id,
        user_id
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Habit deleted successfully"
    })


# ==========================================
# Add Habit Log
# ==========================================

@app.route("/habit-log", methods=["POST"])
def add_habit_log():

    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")
    habit_id = data.get("habit_id")
    date = data.get("date")
    status = data.get("status")
    duration = data.get("duration", 0)

    if not user_id or not habit_id or not date or not status:

        return jsonify({
            "message":
            "User ID, habit ID, date and status are required"
        }), 400

    conn = get_db()

    # ======================================
    # Check Habit Belongs To User
    # ======================================

    habit = conn.execute("""
        SELECT id
        FROM habits
        WHERE id = ?
        AND user_id = ?
    """, (
        habit_id,
        user_id
    )).fetchone()

    if not habit:

        conn.close()

        return jsonify({
            "message": "Habit not found for this user"
        }), 404

    # ======================================
    # Check Duplicate Daily Log
    # ======================================

    existing_log = conn.execute("""
        SELECT id
        FROM habit_logs
        WHERE user_id = ?
        AND habit_id = ?
        AND date = ?
    """, (
        user_id,
        habit_id,
        date
    )).fetchone()

    if existing_log:

        conn.execute("""
            UPDATE habit_logs
            SET
                status = ?,
                duration = ?
            WHERE id = ?
        """, (
            status,
            duration,
            existing_log["id"]
        ))

        conn.commit()
        conn.close()

        return jsonify({
            "message":
            "Today's habit log already exists. It was updated.",
            "log_id":
            existing_log["id"]
        })


    # ======================================
    # Add New Daily Log
    # ======================================

    cursor = conn.execute("""
        INSERT INTO habit_logs
        (
            habit_id,
            date,
            status,
            duration,
            user_id
        )
        VALUES (?, ?, ?, ?, ?)
    """, (
        habit_id,
        date,
        status,
        duration,
        user_id
    ))

    conn.commit()

    log_id = cursor.lastrowid

    conn.close()

    return jsonify({
        "message": "Habit log added successfully",
        "log_id": log_id
    }), 201


# ==========================================
# Get Habit Logs
# ==========================================

@app.route("/habit-log", methods=["GET"])
def get_habit_logs():

    user_id = request.args.get(
        "user_id",
        type=int
    )

    if not user_id:

        return jsonify({
            "message": "user_id is required"
        }), 400

    conn = get_db()

    logs = conn.execute("""
        SELECT
            id,
            habit_id,
            date,
            status,
            duration,
            user_id
        FROM habit_logs
        WHERE user_id = ?
        ORDER BY date DESC, id DESC
    """, (
        user_id,
    )).fetchall()

    conn.close()

    return jsonify([
        dict(log)
        for log in logs
    ])


# ==========================================
# Streak API
# ==========================================

@app.route("/streak", methods=["GET"])
def get_streak():

    user_id = request.args.get(
        "user_id",
        type=int
    )

    if not user_id:

        return jsonify({
            "message": "user_id is required"
        }), 400

    conn = get_db()

    logs = conn.execute("""
        SELECT DISTINCT date, status
        FROM habit_logs
        WHERE user_id = ?
        ORDER BY date DESC
    """, (
        user_id,
    )).fetchall()

    conn.close()

    current_streak = 0

    for log in logs:

        if log["status"] == "Completed":

            current_streak += 1

        else:

            break

    return jsonify({
        "user_id": user_id,
        "current_streak": current_streak
    })


# ==========================================
# Progress API
# ==========================================

@app.route("/progress", methods=["GET"])
def get_progress():

    user_id = request.args.get(
        "user_id",
        type=int
    )

    if not user_id:

        return jsonify({
            "message": "user_id is required"
        }), 400

    conn = get_db()

    total = conn.execute("""
        SELECT COUNT(*) AS count
        FROM habit_logs
        WHERE user_id = ?
    """, (
        user_id,
    )).fetchone()["count"]

    completed = conn.execute("""
        SELECT COUNT(*) AS count
        FROM habit_logs
        WHERE user_id = ?
        AND status = 'Completed'
    """, (
        user_id,
    )).fetchone()["count"]

    missed = conn.execute("""
        SELECT COUNT(*) AS count
        FROM habit_logs
        WHERE user_id = ?
        AND status = 'Missed'
    """, (
        user_id,
    )).fetchone()["count"]

    conn.close()

    if total > 0:

        completion_percentage = round(
            (completed / total) * 100,
            2
        )

    else:

        completion_percentage = 0

    return jsonify({
        "total_logs": total,
        "completed": completed,
        "missed": missed,
        "completion_percentage":
            completion_percentage
    })


# ==========================================
# Daily Schedule - Add
# ==========================================

@app.route("/schedule", methods=["POST"])
def add_schedule():

    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")
    habit_id = data.get("habit_id")
    schedule_date = data.get("schedule_date")
    schedule_time = data.get("schedule_time")
    notes = data.get("notes")

    if not user_id or not schedule_date:

        return jsonify({
            "message":
            "User ID and schedule date are required"
        }), 400

    conn = get_db()

    conn.execute("""
        INSERT INTO daily_schedules
        (
            user_id,
            habit_id,
            schedule_date,
            schedule_time,
            notes
        )
        VALUES (?, ?, ?, ?, ?)
    """, (
        user_id,
        habit_id,
        schedule_date,
        schedule_time,
        notes
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Schedule added successfully"
    }), 201


# ==========================================
# Daily Schedule - Get
# ==========================================

@app.route("/schedule", methods=["GET"])
def get_schedule():

    user_id = request.args.get(
        "user_id",
        type=int
    )

    if not user_id:

        return jsonify({
            "message": "user_id is required"
        }), 400

    conn = get_db()

    schedules = conn.execute("""
        SELECT *
        FROM daily_schedules
        WHERE user_id = ?
        ORDER BY schedule_date, schedule_time
    """, (
        user_id,
    )).fetchall()

    conn.close()

    return jsonify([
        dict(item)
        for item in schedules
    ])


# ==========================================
# Add Reminder
# ==========================================

@app.route("/reminders", methods=["POST"])
def add_reminder():

    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")
    habit_id = data.get("habit_id")
    reminder_time = data.get("reminder_time")

    repeat_pattern = data.get(
        "repeat_pattern",
        "Daily"
    )

    if not user_id or not reminder_time:

        return jsonify({
            "message":
            "User ID and reminder time are required"
        }), 400

    conn = get_db()

    conn.execute("""
        INSERT INTO reminders
        (
            user_id,
            habit_id,
            reminder_time,
            repeat_pattern
        )
        VALUES (?, ?, ?, ?)
    """, (
        user_id,
        habit_id,
        reminder_time,
        repeat_pattern
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Reminder added successfully"
    }), 201


# ==========================================
# Get Reminders
# ==========================================

@app.route("/reminders", methods=["GET"])
def get_reminders():

    user_id = request.args.get(
        "user_id",
        type=int
    )

    if not user_id:

        return jsonify({
            "message": "user_id is required"
        }), 400

    conn = get_db()

    reminders = conn.execute("""
        SELECT *
        FROM reminders
        WHERE user_id = ?
        ORDER BY reminder_time
    """, (
        user_id,
    )).fetchall()

    conn.close()

    return jsonify([
        dict(item)
        for item in reminders
    ])


# ==========================================
# Add Achievement
# ==========================================

@app.route("/achievements", methods=["POST"])
def add_achievement():

    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")
    title = data.get("title")
    description = data.get("description")
    achieved_date = data.get("achieved_date")
    achievement_type = data.get("type")

    if not user_id or not title:

        return jsonify({
            "message":
            "User ID and title are required"
        }), 400

    conn = get_db()

    conn.execute("""
        INSERT INTO achievements
        (
            user_id,
            title,
            description,
            achieved_date,
            type
        )
        VALUES (?, ?, ?, ?, ?)
    """, (
        user_id,
        title,
        description,
        achieved_date,
        achievement_type
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Achievement added successfully"
    }), 201


# ==========================================
# Get Achievements
# ==========================================

@app.route("/achievements", methods=["GET"])
def get_achievements():

    user_id = request.args.get(
        "user_id",
        type=int
    )

    if not user_id:

        return jsonify({
            "message": "user_id is required"
        }), 400

    conn = get_db()

    achievements = conn.execute("""
        SELECT *
        FROM achievements
        WHERE user_id = ?
        ORDER BY id DESC
    """, (
        user_id,
    )).fetchall()

    conn.close()

    return jsonify([
        dict(item)
        for item in achievements
    ])


# ==========================================
# AI Prediction API
# ==========================================

@app.route("/ai/predict", methods=["POST"])
def ai_predict():

    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")
    habit_id = data.get("habit_id")

    completion_rate = data.get(
        "completion_rate"
    )

    missed_days = data.get(
        "missed_days"
    )

    current_streak = data.get(
        "current_streak"
    )

    frequency = data.get(
        "frequency"
    )

    if (
        completion_rate is None
        or missed_days is None
        or current_streak is None
        or frequency is None
    ):

        return jsonify({
            "message":
            "All AI input fields are required"
        }), 400

    result = predict_habit(
        completion_rate,
        missed_days,
        current_streak,
        frequency
    )

    # ======================================
    # Save AI Recommendation
    # ======================================

    if user_id:

        conn = get_db()

        conn.execute("""
            INSERT INTO ai_recommendations
            (
                user_id,
                habit_id,
                prediction,
                recommendation,
                confidence
            )
            VALUES (?, ?, ?, ?, ?)
        """, (
            user_id,
            habit_id,
            result["prediction"],
            result["recommendation"],
            float(result["confidence"])
        ))

        conn.commit()
        conn.close()

    result["confidence"] = float(
        result["confidence"]
    )

    return jsonify(result)


# ==========================================
# Get AI Recommendations
# ==========================================

@app.route(
    "/ai/recommendations",
    methods=["GET"]
)
def get_ai_recommendations():

    user_id = request.args.get(
        "user_id",
        type=int
    )

    if not user_id:

        return jsonify({
            "message": "user_id is required"
        }), 400

    conn = get_db()

    recommendations = conn.execute("""
        SELECT *
        FROM ai_recommendations
        WHERE user_id = ?
        ORDER BY id DESC
    """, (
        user_id,
    )).fetchall()

    conn.close()

    return jsonify([
        dict(item)
        for item in recommendations
    ])

# ======================================================
# ADMIN AUTHENTICATION
# ======================================================

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")
ADMIN_SECRET = os.getenv("ADMIN_SECRET", "")


def create_admin_token():
    payload = {
        "email": ADMIN_EMAIL,
        "exp": int(time.time()) + 7200
    }

    raw = base64.urlsafe_b64encode(
        json.dumps(
            payload,
            separators=(",", ":")
        ).encode()
    ).decode().rstrip("=")

    signature = hmac.new(
        ADMIN_SECRET.encode(),
        raw.encode(),
        hashlib.sha256
    ).hexdigest()

    return raw + "." + signature


def verify_admin_token(token):

    try:
        raw, signature = token.split(".", 1)

        expected_signature = hmac.new(
            ADMIN_SECRET.encode(),
            raw.encode(),
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(
            signature,
            expected_signature
        ):
            return False

        padding = "=" * (-len(raw) % 4)

        payload = json.loads(
            base64.urlsafe_b64decode(
                (raw + padding).encode()
            ).decode()
        )

        if payload.get("email") != ADMIN_EMAIL:
            return False

        if int(time.time()) > int(
            payload.get("exp", 0)
        ):
            return False

        return True

    except Exception:
        return False


# ======================================================
# ADMIN LOGIN
# ======================================================

@app.route("/admin/login", methods=["POST"])
def admin_login():

    data = request.get_json(
        silent=True
    ) or {}

    email = data.get("email")
    password = data.get("password")

    if (
        not ADMIN_EMAIL
        or not ADMIN_PASSWORD
        or not ADMIN_SECRET
    ):
        return jsonify({
            "message":
            "Admin configuration is missing"
        }), 500

    if (
        email != ADMIN_EMAIL
        or password != ADMIN_PASSWORD
    ):
        return jsonify({
            "message":
            "Invalid admin credentials"
        }), 401

    return jsonify({
        "message":
        "Admin login successful",
        "token":
        create_admin_token()
    })


# ======================================================
# ADMIN - ALL USERS
# ======================================================

@app.route("/admin/users", methods=["GET"])
def admin_users():

    token = request.headers.get(
        "X-Admin-Token",
        ""
    )

    if not verify_admin_token(token):

        return jsonify({
            "message":
            "Unauthorized"
        }), 401

    conn = get_db()

    rows = conn.execute("""
        SELECT
            u.id AS user_id,
            u.name AS user_name,
            u.email AS user_email,
            h.id AS habit_id,
            h.name AS habit_name,
            h.category AS category,
            h.target AS target,
            h.status AS status
        FROM users u
        LEFT JOIN habits h
            ON h.user_id = u.id
        ORDER BY
            u.id ASC,
            h.id DESC
    """).fetchall()

    conn.close()

    users = {}

    for row in rows:

        user_id = row["user_id"]

        if user_id not in users:

            users[user_id] = {
                "user_id": user_id,
                "name": row["user_name"],
                "email": row["user_email"],
                "habits": []
            }

        if row["habit_id"] is not None:

            users[user_id]["habits"].append({
                "id": row["habit_id"],
                "name": row["habit_name"],
                "category":
                    row["category"],
                "target":
                    row["target"],
                "status":
                    row["status"]
            })

    for user in users.values():

        total = len(
            user["habits"]
        )

        completed = sum(
            1
            for habit in user["habits"]
            if habit["status"]
            == "Completed"
        )

        user["total_habits"] = total

        user["completed_habits"] = (
            completed
        )

        user["pending_habits"] = (
            total - completed
        )

    return jsonify(
        list(users.values())
    )


# ==========================================
# Run Application
# ==========================================

if __name__ == "__main__":

    init_db()

    app.run(debug=False)
