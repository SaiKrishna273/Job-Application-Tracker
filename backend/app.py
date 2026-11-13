
from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from pathlib import Path
from datetime import datetime, timedelta, timezone
import jwt
import os


# Load environment variables
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

# Flask configuration
app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

# Database connection
def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        connection_timeout=5,
        use_pure=True
    )


# JWT authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):

        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Token is missing"}), 401

        token = auth_header.split(" ", 1)[1]

        if not app.config["JWT_SECRET_KEY"]:
            return jsonify({"error": "JWT configuration error"}), 500

        try:
            decoded_token = jwt.decode(
                token,
                app.config["JWT_SECRET_KEY"],
                algorithms=["HS256"]
            )

            request.user_id = decoded_token["user_id"]

        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired. Please login again."}), 401

        except (jwt.InvalidTokenError, KeyError):
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)

    return decorated


# Home API
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Welcome to JobPilot Backend!",
        "status": "Running successfully"
    })


# Test database connection
@app.route("/test-db", methods=["GET"])
def test_db():
    connection = None

    try:
        connection = get_db_connection()

        return jsonify({
            "message": "MySQL connected successfully!"
        })

    except mysql.connector.Error:
        app.logger.exception("MySQL connection failed")
        return jsonify({"error": "Database connection failed"}), 500

    finally:
        if connection and connection.is_connected():
            connection.close()


# Flask routing test
@app.route("/hello", methods=["GET"])
def hello():
    return "Hello! Flask routing is working."


# User registration API
@app.route("/register", methods=["POST"])
def register():
    connection = None
    cursor = None

    try:
        data = request.get_json(silent=True)

        if not isinstance(data, dict):
            return jsonify({"error": "Please provide valid JSON data"}), 400

        full_name = data.get("full_name", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not full_name or not email or not password:
            return jsonify({"error": "All fields are required"}), 400

        if len(password) < 8:
            return jsonify({
                "error": "Password must contain at least 8 characters"
            }), 400

        hashed_password = generate_password_hash(password)

        connection = get_db_connection()
        cursor = connection.cursor()

        query = """
            INSERT INTO users (full_name, email, password)
            VALUES (%s, %s, %s)
        """

        cursor.execute(query, (full_name, email, hashed_password))
        connection.commit()

        return jsonify({
            "message": "Registration successful!"
        }), 201

    except mysql.connector.IntegrityError:
        if connection:
            connection.rollback()

        return jsonify({"error": "Email already registered"}), 409

    except mysql.connector.Error:
        if connection:
            connection.rollback()

        app.logger.exception("Registration database error")
        return jsonify({"error": "Database operation failed"}), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


# User login API with JWT
@app.route("/login", methods=["POST"])
def login():
    connection = None
    cursor = None

    try:
        data = request.get_json(silent=True)

        if not isinstance(data, dict):
            return jsonify({"error": "Please provide valid JSON"}), 400

        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not email or not password:
            return jsonify({
                "error": "Email and password are required"
            }), 400

        if not app.config["JWT_SECRET_KEY"]:
            return jsonify({"error": "JWT configuration error"}), 500

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT user_id, full_name, email, password
            FROM users
            WHERE email = %s
            """,
            (email,)
        )

        user = cursor.fetchone()

        if not user or not check_password_hash(user["password"], password):
            return jsonify({"error": "Invalid email or password"}), 401

        token = jwt.encode(
            {
                "user_id": user["user_id"],
                "exp": datetime.now(timezone.utc) + timedelta(hours=2)
            },
            app.config["JWT_SECRET_KEY"],
            algorithm="HS256"
        )

        return jsonify({
            "message": "Login successful!",
            "token": token,
            "user": {
                "user_id": user["user_id"],
                "full_name": user["full_name"],
                "email": user["email"]
            }
        }), 200

    except mysql.connector.Error:
        app.logger.exception("Login database error")
        return jsonify({"error": "Database operation failed"}), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()

# Add job application API
@app.route("/applications", methods=["POST"])
@token_required
def add_application():
    connection = None
    cursor = None

    try:
        data = request.get_json(silent=True)

        if not isinstance(data, dict):
            return jsonify({"error": "Please provide valid JSON"}), 400

        company_name = data.get("company_name", "").strip()
        job_role = data.get("job_role", "").strip()
        location = data.get("location", "").strip()
        salary = data.get("salary", "").strip()
        application_date = data.get("application_date") or None
        interview_date = data.get("interview_date") or None
        job_link = data.get("job_link", "").strip()
        status = data.get("status", "Applied")
        notes = data.get("notes", "").strip()

        if not company_name or not job_role:
            return jsonify({
                "error": "Company name and job role are required"
            }), 400

        allowed_statuses = [
            "Applied", "Assessment", "Interview", "Offer", "Rejected"
        ]

        if status not in allowed_statuses:
            return jsonify({"error": "Invalid application status"}), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        query = """
            INSERT INTO applications
            (
                user_id, company_name, job_role, location,
                salary, application_date, interview_date,
                job_link, status, notes
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        values = (
            request.user_id,
            company_name,
            job_role,
            location,
            salary,
            application_date,
            interview_date,
            job_link,
            status,
            notes
        )

        cursor.execute(query, values)
        connection.commit()

        return jsonify({
            "message": "Job application added successfully!",
            "application_id": cursor.lastrowid
        }), 201

    except mysql.connector.Error:
        if connection:
            connection.rollback()

        app.logger.exception("Add application database error")
        return jsonify({"error": "Database operation failed"}), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()




# Get logged-in user's applications
@app.route("/applications", methods=["GET"])
@token_required
def get_applications():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                application_id,
                company_name,
                job_role,
                location,
                salary,
                application_date,
                interview_date,
                job_link,
                status,
                notes,
                created_at
            FROM applications
            WHERE user_id = %s
            ORDER BY created_at DESC
            """,
            (request.user_id,)
        )

        applications = cursor.fetchall()

        # Convert MySQL date objects into YYYY-MM-DD strings
        for application in applications:
            for field in ["application_date", "interview_date"]:
                value = application.get(field)

                application[field] = (
                    value.isoformat() if value else ""
                )

        return jsonify({
            "message": "Applications fetched successfully!",
            "applications": applications
        }), 200

    except mysql.connector.Error:
        app.logger.exception("Fetch applications database error")
        return jsonify({"error": "Database operation failed"}), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


# Update job application API
@app.route("/applications/<int:application_id>", methods=["PUT"])
@token_required
def update_application(application_id):
    connection = None
    cursor = None

    try:
        data = request.get_json(silent=True)

        if not isinstance(data, dict):
            return jsonify({"error": "Please provide valid JSON"}), 400

        company_name = data.get("company_name", "").strip()
        job_role = data.get("job_role", "").strip()
        location = data.get("location", "").strip()
        salary = data.get("salary", "").strip()
        application_date = data.get("application_date") or None
        interview_date = data.get("interview_date") or None
        job_link = data.get("job_link", "").strip()
        status = data.get("status", "Applied")
        notes = data.get("notes", "").strip()

        if not company_name or not job_role:
            return jsonify({
                "error": "Company name and job role are required"
            }), 400

        allowed_statuses = [
            "Applied", "Assessment", "Interview", "Offer", "Rejected"
        ]

        if status not in allowed_statuses:
            return jsonify({"error": "Invalid application status"}), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        # Check application ownership
        cursor.execute(
            """
            SELECT application_id
            FROM applications
            WHERE application_id = %s AND user_id = %s
            """,
            (application_id, request.user_id)
        )

        if not cursor.fetchone():
            return jsonify({"error": "Application not found"}), 404

        cursor.execute(
            """
            UPDATE applications
            SET company_name = %s,
                job_role = %s,
                location = %s,
                salary = %s,
                application_date = %s,
                interview_date = %s,
                job_link = %s,
                status = %s,
                notes = %s
            WHERE application_id = %s AND user_id = %s
            """,
            (
                company_name,
                job_role,
                location,
                salary,
                application_date,
                interview_date,
                job_link,
                status,
                notes,
                application_id,
                request.user_id
            )
        )

        connection.commit()

        return jsonify({
            "message": "Application updated successfully!"
        }), 200

    except mysql.connector.Error:
        if connection:
            connection.rollback()

        app.logger.exception("Update application database error")
        return jsonify({"error": "Database operation failed"}), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()



# Delete job application API
@app.route("/applications/<int:application_id>", methods=["DELETE"])
@token_required
def delete_application(application_id):
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            DELETE FROM applications
            WHERE application_id = %s AND user_id = %s
            """,
            (application_id, request.user_id)
        )

        connection.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "Application not found"}), 404

        return jsonify({
            "message": "Application deleted successfully!"
        }), 200

    except mysql.connector.Error:
        if connection:
            connection.rollback()

        app.logger.exception("Delete application database error")
        return jsonify({"error": "Database operation failed"}), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


# ==============================
# GET USER PROFILE
# ==============================

@app.route('/profile', methods=['GET'])
@token_required
def get_profile():
    try:
        user_id = request.user_id

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                u.full_name,
                u.email,
                p.target_role,
                p.preferred_location,
                p.linkedin_url,
                p.portfolio_url,
                p.professional_summary
            FROM users u
            LEFT JOIN user_profiles p
                ON u.user_id = p.user_id
            WHERE u.user_id = %s
        """, (user_id,))

        profile = cursor.fetchone()

        cursor.close()
        conn.close()

        if not profile:
            return jsonify({"error": "User not found"}), 404

        return jsonify({"profile": profile}), 200

    except mysql.connector.Error as e:
        return jsonify({"error": str(e)}), 500


# ==============================
# UPDATE USER PROFILE
# ==============================

@app.route('/profile', methods=['PUT'])
@token_required
def update_profile():
    try:
        user_id = request.user_id
        data = request.get_json() or {}

        full_name = data.get('full_name', '').strip()
        target_role = data.get('target_role', '').strip()
        preferred_location = data.get('preferred_location', '').strip()
        linkedin_url = data.get('linkedin_url', '').strip()
        portfolio_url = data.get('portfolio_url', '').strip()
        professional_summary = data.get('professional_summary', '').strip()

        if not full_name:
            return jsonify({"error": "Full name is required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE users
            SET full_name = %s
            WHERE user_id = %s
        """, (full_name, user_id))

        cursor.execute("""
            INSERT INTO user_profiles (
                user_id,
                target_role,
                preferred_location,
                linkedin_url,
                portfolio_url,
                professional_summary
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                target_role = VALUES(target_role),
                preferred_location = VALUES(preferred_location),
                linkedin_url = VALUES(linkedin_url),
                portfolio_url = VALUES(portfolio_url),
                professional_summary = VALUES(professional_summary)
        """, (
            user_id,
            target_role,
            preferred_location,
            linkedin_url,
            portfolio_url,
            professional_summary
        ))

        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({
            "message": "Profile updated successfully!"
        }), 200

    except mysql.connector.Error as e:
        if 'conn' in locals() and conn.is_connected():
            conn.rollback()
            conn.close()

        return jsonify({"error": str(e)}), 500



# Run Flask application
if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5002,
        debug=False,
        use_reloader=False
    )
