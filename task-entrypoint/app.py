from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import os

app = Flask(__name__)
CORS(app)

DB_HOST = os.environ.get("DB_HOST", "postgres")
DB_NAME = os.environ.get("DB_NAME", "task_db")
DB_USER = os.environ.get("DB_USER", "taskuser")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "password123")

def get_db_connection():
    return psycopg2.connect(
        dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST
    )

@app.route("/api/task", methods=["GET"])
def get_tasks():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, title, description, due_date, status FROM tasks WHERE status = %s ORDER BY due_date;", ('Выполняется',))
        rows = cur.fetchall()
        cur.close()
        conn.close()

        tasks = []
        for row in rows:
            tasks.append({
                "id": row[0],
                "title": row[1],
                "description": row[2],
                "due_date": row[3].isoformat(),
                "status": row[4]
            })

        return jsonify(tasks), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/task/<int:task_id>", methods=["PATCH"])
def update_task_status(task_id):
    data = request.get_json()
    new_status = data.get("status")
    if new_status not in ['Выполняется', 'Завершено', 'Удалена']:
        return jsonify({"error": "Неверный статус"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("UPDATE tasks SET status = %s WHERE id = %s", (new_status, task_id))
        if cur.rowcount == 0:
            cur.close()
            conn.close()
            return jsonify({"error": "Задача не найдена"}), 404
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Существующий POST /api/task для создания задачи с дефолтным статусом "Выполняется"
@app.route("/api/task", methods=["POST"])
def create_task():
    data = request.get_json()
    title = data.get("title")
    description = data.get("description")
    due_date = data.get("due_date")

    if not title or not due_date:
        return jsonify({"error": "Missing title or due_date"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO tasks (title, description, due_date, status)
            VALUES (%s, %s, %s, 'Выполняется');
        """, (title, description, due_date))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"status": "success"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/task/completed", methods=["GET"])
def get_completed_tasks():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT id, title, description, due_date, status
            FROM tasks
            WHERE status IN (%s, %s, %s)
            ORDER BY due_date;
        """, ('Завершено', 'Просрочено', 'Удалена'))
        rows = cur.fetchall()
        cur.close()
        conn.close()

        tasks = []
        for row in rows:
            tasks.append({
                "id": row[0],
                "title": row[1],
                "description": row[2],
                "due_date": row[3].isoformat(),
                "status": row[4]
            })

        return jsonify(tasks), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)