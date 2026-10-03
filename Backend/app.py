from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
import hashlib
import hmac
import base64
import time

app = Flask(__name__)
CORS(app)

# ==========================================================
# DATABASE
# ==========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "habit.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)

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

    conn.execute("""
        CREATE TABLE IF NOT EXISTS habit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            status TEXT NOT NULL,
            duration INTEGER DEFAULT 0,
            user_id INTEGER
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS daily_schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            habit_id INTEGER,
            time TEXT,
            date TEXT
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            habit_id INTEGER,
            reminder_time TEXT,
            message TEXT
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT,
            description TEXT,
            date TEXT
        )
    """)

    conn.commit()
    conn.close()


# ==========================================================
# PASSWORD
# ==========================================================

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


# ==========================================================
# HOME
# ==========================================================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "AI Habit Coach Backend is Running",
        "status": "success"
    })


# ==========================================================
# REGISTER
# ==========================================================

@app.route("/register", methods=["POST"])
def register():

    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", "")).strip()

    if not name or not email or not password:
        return jsonify({
            "message": "Name, email and password are required"
        }), 400

    conn = get_db()

    existing = conn.execute(
        "SELECT id FROM users WHERE LOWER(email) = ?",
        (email,)
    ).fetchone()

    if existing:
        conn.close()
        return jsonify({
            "message": "Account already exists. Please login."
        }), 409

    hashed = hash_password(password)

    cursor = conn.execute("""
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
    """, (name, email, hashed))

    user_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Registration successful",
        "user_id": user_id,
        "name": name,
        "email": email
    }), 201


# ==========================================================
# LOGIN
# ==========================================================

@app.route("/login", methods=["POST"])
def login():

    data = request.get_json(silent=True) or {}

    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", "")).strip()

    if not email or not password:
        return jsonify({
            "message": "Email and password are required"
        }), 400

    conn = get_db()

    user = conn.execute("""
        SELECT id, name, email, password
        FROM users
        WHERE LOWER(email) = ?
    """, (email,)).fetchone()

    conn.close()

    if not user:
        return jsonify({
            "message": "Invalid email or password"
        }), 401

    if hash_password(password) != user["password"]:
        return jsonify({
            "message": "Invalid email or password"
        }), 401

    return jsonify({
        "message": "Login successful",
        "user_id": user["id"],
        "name": user["name"],
        "email": user["email"]
    })


# ==========================================================
# PROFILE
# ==========================================================

@app.route("/profile/<int:user_id>", methods=["GET"])
def get_profile(user_id):

    conn = get_db()

    user = conn.execute("""
        SELECT id, name, email
        FROM users
        WHERE id = ?
    """, (user_id,)).fetchone()

    conn.close()

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify(dict(user))


@app.route("/profile/<int:user_id>", methods=["PUT"])
def update_profile(user_id):

    data = request.get_json(silent=True) or {}

    name = data.get("name")
    email = data.get("email")

    conn = get_db()

    user = conn.execute(
        "SELECT * FROM users WHERE id = ?",
        (user_id,)
    ).fetchone()

    if not user:
        conn.close()
        return jsonify({"message": "User not found"}), 404

    new_name = name if name else user["name"]
    new_email = email if email else user["email"]

    conn.execute("""
        UPDATE users
        SET name = ?, email = ?
        WHERE id = ?
    """, (new_name, new_email, user_id))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Profile updated successfully"
    })


# ==========================================================
# ADD HABIT
# ==========================================================

@app.route("/habits", methods=["POST"])
def add_habit():

    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")
    name = str(data.get("name", "")).strip()
    category = str(data.get("category", "")).strip()
    target = str(data.get("target", "")).strip()
    status = str(data.get("status", "Pending")).strip()

    if not user_id or not name:
        return jsonify({
            "message": "user_id and habit name are required"
        }), 400

    conn = get_db()

    cursor = conn.execute("""
        INSERT INTO habits
        (name, category, target, status, user_id)
        VALUES (?, ?, ?, ?, ?)
    """, (
        name,
        category,
        target,
        status,
        user_id
    ))

    habit_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Habit added successfully",
        "habit_id": habit_id
    }), 201


# ==========================================================
# GET HABITS
# ==========================================================

@app.route("/habits", methods=["GET"])
def get_habits():

    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({
            "message": "user_id is required"
        }), 400

    conn = get_db()

    habits = conn.execute("""
        SELECT id, name, category, target, status, user_id
        FROM habits
        WHERE user_id = ?
        ORDER BY id DESC
    """, (user_id,)).fetchall()

    conn.close()

    return jsonify([dict(h) for h in habits])


# ==========================================================
# UPDATE HABIT
# ==========================================================

@app.route("/habits/<int:habit_id>", methods=["PUT"])
def update_habit(habit_id):

    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")

    if not user_id:
        return jsonify({
            "message": "user_id is required"
        }), 400

    conn = get_db()

    habit = conn.execute("""
        SELECT *
        FROM habits
        WHERE id = ? AND user_id = ?
    """, (habit_id, user_id)).fetchone()

    if not habit:
        conn.close()
        return jsonify({
            "message": "Habit not found"
        }), 404

    name = data.get("name", habit["name"])
    category = data.get("category", habit["category"])
    target = data.get("target", habit["target"])
    status = data.get("status", habit["status"])

    conn.execute("""
        UPDATE habits
        SET name = ?,
            category = ?,
            target = ?,
            status = ?
        WHERE id = ? AND user_id = ?
    """, (
        name,
        category,
        target,
        status,
        habit_id,
        user_id
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Habit updated successfully",
        "status": status
    })


# ==========================================================
# DELETE HABIT
# ==========================================================

@app.route("/habits/<int:habit_id>", methods=["DELETE"])
def delete_habit(habit_id):

    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({
            "message": "user_id is required"
        }), 400

    conn = get_db()

    result = conn.execute("""
        DELETE FROM habits
        WHERE id = ? AND user_id = ?
    """, (habit_id, user_id))

    conn.commit()
    conn.close()

    if result.rowcount == 0:
        return jsonify({
            "message": "Habit not found"
        }), 404

    return jsonify({
        "message": "Habit deleted successfully"
    })


# ==========================================================
# HABIT LOG
# ==========================================================

@app.route("/habit-log", methods=["POST"])
def add_habit_log():

    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")
    habit_id = data.get("habit_id")
    date = data.get("date")
    status = data.get("status", "Completed")
    duration = data.get("duration", 0)

    if not user_id or not habit_id or not date or not status:
        return jsonify({
            "message": "user_id, habit_id, date and status are required"
        }), 400

    conn = get_db()

    habit = conn.execute("""
        SELECT *
        FROM habits
        WHERE id = ? AND user_id = ?
    """, (habit_id, user_id)).fetchone()

    if not habit:
        conn.close()
        return jsonify({
            "message": "Habit not found"
        }), 404

    existing = conn.execute("""
        SELECT id
        FROM habit_logs
        WHERE habit_id = ?
        AND user_id = ?
        AND date = ?
    """, (
        habit_id,
        user_id,
        date
    )).fetchone()

    if existing:

        conn.execute("""
            UPDATE habit_logs
            SET status = ?, duration = ?
            WHERE id = ?
        """, (
            status,
            duration,
            existing["id"]
        ))

        conn.execute("""
            UPDATE habits
            SET status = ?
            WHERE id = ? AND user_id = ?
        """, (
            status,
            habit_id,
            user_id
        ))

        conn.commit()
        conn.close()

        return jsonify({
            "message": "Habit log updated successfully",
            "status": status
        })

    conn.execute("""
        INSERT INTO habit_logs
        (habit_id, date, status, duration, user_id)
        VALUES (?, ?, ?, ?, ?)
    """, (
        habit_id,
        date,
        status,
        duration,
        user_id
    ))

    # IMPORTANT:
    # Also update main habit status.
    conn.execute("""
        UPDATE habits
        SET status = ?
        WHERE id = ? AND user_id = ?
    """, (
        status,
        habit_id,
        user_id
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Habit completed successfully",
        "status": status
    }), 201


# ==========================================================
# GET HABIT LOG
# ==========================================================

@app.route("/habit-log", methods=["GET"])
def get_habit_logs():

    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({
            "message": "user_id is required"
        }), 400

    conn = get_db()

    logs = conn.execute("""
        SELECT
            hl.id,
            hl.habit_id,
            h.name AS habit_name,
            hl.date,
            hl.status,
            hl.duration
        FROM habit_logs hl
        JOIN habits h
        ON h.id = hl.habit_id
        WHERE hl.user_id = ?
        ORDER BY hl.date DESC
    """, (user_id,)).fetchall()

    conn.close()

    return jsonify([dict(log) for log in logs])


# ==========================================================
# PROGRESS
# ==========================================================

@app.route("/progress", methods=["GET"])
def progress():

    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({
            "message": "user_id is required"
        }), 400

    conn = get_db()

    total = conn.execute("""
        SELECT COUNT(*) AS count
        FROM habit_logs
        WHERE user_id = ?
    """, (user_id,)).fetchone()["count"]

    completed = conn.execute("""
        SELECT COUNT(*) AS count
        FROM habit_logs
        WHERE user_id = ?
        AND LOWER(status) = 'completed'
    """, (user_id,)).fetchone()["count"]

    conn.close()

    percentage = 0

    if total > 0:
        percentage = round((completed / total) * 100, 2)

    return jsonify({
        "completed": completed,
        "total_logs": total,
        "completion_percentage": percentage,
        "missed": total - completed
    })


# ==========================================================
# STREAK
# ==========================================================

@app.route("/streak", methods=["GET"])
def streak():

    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({
            "message": "user_id is required"
        }), 400

    conn = get_db()

    logs = conn.execute("""
        SELECT date
        FROM habit_logs
        WHERE user_id = ?
        AND LOWER(status) = 'completed'
        ORDER BY date DESC
    """, (user_id,)).fetchall()

    conn.close()

    return jsonify({
        "current_streak": len(logs)
    })


# ==========================================================
# SCHEDULE
# ==========================================================

@app.route("/schedule", methods=["POST"])
def add_schedule():

    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")
    habit_id = data.get("habit_id")
    schedule_time = data.get("time")
    date = data.get("date")

    conn = get_db()

    cursor = conn.execute("""
        INSERT INTO daily_schedules
        (user_id, habit_id, time, date)
        VALUES (?, ?, ?, ?)
    """, (
        user_id,
        habit_id,
        schedule_time,
        date
    ))

    schedule_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Schedule added successfully",
        "schedule_id": schedule_id
    }), 201


@app.route("/schedule", methods=["GET"])
def get_schedule():

    user_id = request.args.get("user_id")

    conn = get_db()

    rows = conn.execute("""
        SELECT *
        FROM daily_schedules
        WHERE user_id = ?
        ORDER BY time
    """, (user_id,)).fetchall()

    conn.close()

    return jsonify([dict(row) for row in rows])


# ==========================================================
# REMINDERS
# ==========================================================

@app.route("/reminders", methods=["POST"])
def add_reminder():

    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")
    habit_id = data.get("habit_id")
    reminder_time = data.get("reminder_time")
    message = data.get("message")

    conn = get_db()

    cursor = conn.execute("""
        INSERT INTO reminders
        (user_id, habit_id, reminder_time, message)
        VALUES (?, ?, ?, ?)
    """, (
        user_id,
        habit_id,
        reminder_time,
        message
    ))

    reminder_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Reminder added successfully",
        "reminder_id": reminder_id
    }), 201


@app.route("/reminders", methods=["GET"])
def get_reminders():

    user_id = request.args.get("user_id")

    conn = get_db()

    rows = conn.execute("""
        SELECT *
        FROM reminders
        WHERE user_id = ?
        ORDER BY reminder_time
    """, (user_id,)).fetchall()

    conn.close()

    return jsonify([dict(row) for row in rows])


# ==========================================================
# ACHIEVEMENTS
# ==========================================================

@app.route("/achievements", methods=["POST"])
def add_achievement():

    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")
    title = data.get("title")
    description = data.get("description")
    date = data.get("date")

    conn = get_db()

    cursor = conn.execute("""
        INSERT INTO achievements
        (user_id, title, description, date)
        VALUES (?, ?, ?, ?)
    """, (
        user_id,
        title,
        description,
        date
    ))

    achievement_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Achievement added successfully",
        "achievement_id": achievement_id
    }), 201


@app.route("/achievements", methods=["GET"])
def get_achievements():

    user_id = request.args.get("user_id")

    conn = get_db()

    rows = conn.execute("""
        SELECT *
        FROM achievements
        WHERE user_id = ?
        ORDER BY id DESC
    """, (user_id,)).fetchall()

    conn.close()

    return jsonify([dict(row) for row in rows])


# ==========================================================
# AI PREDICTION
# ==========================================================

@app.route("/ai/predict", methods=["POST"])
def ai_predict():

    data = request.get_json(silent=True) or {}

    completion_rate = float(data.get("completion_rate", 0))
    missed_days = int(data.get("missed_days", 0))
    current_streak = int(data.get("current_streak", 0))

    score = (
        completion_rate * 0.6
        + current_streak * 3
        - missed_days * 5
    )

    if score >= 60:
        prediction = "Likely to Complete"
        confidence = min(99, max(70, round(score)))
        recommendation = "Keep following your current habit routine."
    else:
        prediction = "Needs Improvement"
        confidence = min(99, max(50, round(100 - score)))
        recommendation = "Try a smaller target and maintain a regular routine."

    return jsonify({
        "prediction": prediction,
        "confidence": confidence,
        "recommendation": recommendation
    })


# ==========================================================
# AI ADVICE
# ==========================================================

@app.route("/ai/advice", methods=["POST"])
def ai_advice():

    data = request.get_json(silent=True) or {}

    habit = data.get("habit", "your habit")

    return jsonify({
        "advice": (
            f"Keep working on {habit}. "
            "Start with a small achievable target, "
            "stay consistent, and track your progress every day."
        )
    })


@app.route("/ai/user-advice", methods=["POST"])
def user_advice():

    data = request.get_json(silent=True) or {}

    habit = data.get("habit", "your habit")

    return jsonify({
        "advice": (
            f"Your habit '{habit}' can improve with consistency. "
            "Try setting a realistic daily goal and complete it regularly."
        )
    })


# ==========================================================
# ADMIN LOGIN
# ==========================================================

ADMIN_EMAIL = "admin@habitcoach.com"
ADMIN_PASSWORD = "admin123"


def create_admin_token():

    value = f"{ADMIN_EMAIL}:{time.time()}"

    return base64.b64encode(
        value.encode()
    ).decode()


def verify_admin_token(token):

    if not token:
        return False

    try:
        decoded = base64.b64decode(token.encode()).decode()
        return decoded.startswith(ADMIN_EMAIL + ":")
    except Exception:
        return False


@app.route("/admin/login", methods=["POST"])
def admin_login():

    data = request.get_json(silent=True) or {}

    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", "")).strip()

    if email != ADMIN_EMAIL or password != ADMIN_PASSWORD:
        return jsonify({
            "message": "Invalid admin email or password"
        }), 401

    return jsonify({
        "message": "Admin login successful",
        "token": create_admin_token()
    })


# ==========================================================
# ADMIN USERS
# ==========================================================

@app.route("/admin/users", methods=["GET"])
def admin_users():

    token = request.headers.get("X-Admin-Token", "")

    if not verify_admin_token(token):
        return jsonify({
            "message": "Unauthorized"
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
        ORDER BY u.id ASC, h.id DESC
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
                "category": row["category"],
                "target": row["target"],
                "status": row["status"]
            })

    for user in users.values():

        total = len(user["habits"])

        completed = sum(
            1
            for habit in user["habits"]
            if str(habit["status"]).lower() == "completed"
        )

        user["total_habits"] = total
        user["completed_habits"] = completed
        user["pending_habits"] = total - completed

    return jsonify(list(users.values()))


# ==========================================================
# START SERVER
# ==========================================================

if __name__ == "__main__":

    init_db()

    print("")
    print("======================================")
    print(" AI HABIT COACH BACKEND")
    print("======================================")
    print("Backend running at:")
    print("http://127.0.0.1:5000")
    print("======================================")
    print("")

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )
