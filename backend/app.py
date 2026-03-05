from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import functools
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///clinic.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'clinic-secret-key-2024'

CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

db = SQLAlchemy(app)

# ─────────────────────────────────────────────
# Models
# ─────────────────────────────────────────────

class Doctor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    doctor_name = db.Column(db.String(100), nullable=False)
    specialization = db.Column(db.String(150), nullable=False)
    photo = db.Column(db.String(300))
    experience = db.Column(db.String(50))
    bio = db.Column(db.Text)
    available = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'doctor_name': self.doctor_name,
            'specialization': self.specialization,
            'photo': self.photo,
            'experience': self.experience,
            'bio': self.bio,
            'available': self.available
        }


class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    doctor_name = db.Column(db.String(100), nullable=False)
    appointment_date = db.Column(db.String(20), nullable=False)
    time_slot = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), default='Pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'patient_name': self.patient_name,
            'phone': self.phone,
            'doctor_name': self.doctor_name,
            'appointment_date': self.appointment_date,
            'time_slot': self.time_slot,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }


class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)


# ─────────────────────────────────────────────
# Seed Data
# ─────────────────────────────────────────────

def seed_data():
    if Doctor.query.count() == 0:
        doctors = [
            Doctor(
                doctor_name="Dr. Amit Sharma",
                specialization="MBBS, MD – General Medicine",
                photo="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
                experience="15+ Years",
                bio="Renowned physician specializing in diagnosing and treating complex medical conditions with a patient-first approach.",
                available=True
            ),
            Doctor(
                doctor_name="Dr. Priya Mehta",
                specialization="MBBS, MS – Gynecology & Obstetrics",
                photo="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400",
                experience="12+ Years",
                bio="Expert in women's health, prenatal care, and minimally invasive gynecological procedures with a compassionate approach.",
                available=True
            ),
            Doctor(
                doctor_name="Dr. Rajesh Patel",
                specialization="MBBS, MD – Pediatrics",
                photo="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
                experience="10+ Years",
                bio="Dedicated pediatrician committed to providing compassionate, comprehensive care for children from birth through adolescence.",
                available=True
            ),
            Doctor(
                doctor_name="Dr. Sunita Joshi",
                specialization="BDS, MDS – Dentistry",
                photo="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
                experience="8+ Years",
                bio="Skilled dental surgeon offering a full range of dental services including cosmetic dentistry, implants, and orthodontics.",
                available=True
            ),
        ]
        db.session.add_all(doctors)

    if Admin.query.count() == 0:
        admin = Admin(username='admin', password='admin123')
        db.session.add(admin)

    db.session.commit()


with app.app_context():
    db.create_all()
    seed_data()


@app.route('/')
def home():
    return jsonify({
        "message": "Welcome to the Aarogyam Clinic API",
        "status": "running"
    })

# ─────────────────────────────────────────────
# Auth helpers
# ─────────────────────────────────────────────

def login_required(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return jsonify({'error': 'Unauthorized. Please log in.'}), 401
        return f(*args, **kwargs)
    return decorated


# ─────────────────────────────────────────────
# Auth routes
# ─────────────────────────────────────────────

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    admin = Admin.query.filter_by(username=data.get('username')).first()
    if admin and admin.password == data.get('password'):
        session['admin_logged_in'] = True
        session['admin_username'] = admin.username
        return jsonify({'message': 'Login successful', 'username': admin.username})
    return jsonify({'error': 'Invalid credentials'}), 401


@app.route('/api/admin/logout', methods=['POST'])
def admin_logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'})


@app.route('/api/admin/status', methods=['GET'])
def admin_status():
    if session.get('admin_logged_in'):
        return jsonify({'logged_in': True, 'username': session.get('admin_username')})
    return jsonify({'logged_in': False})


# ─────────────────────────────────────────────
# Doctor routes
# ─────────────────────────────────────────────

@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    doctors = Doctor.query.filter_by(available=True).all()
    return jsonify([d.to_dict() for d in doctors])


# ─────────────────────────────────────────────
# Appointment routes
# ─────────────────────────────────────────────

@app.route('/api/appointments', methods=['POST'])
def book_appointment():
    data = request.json
    required = ['patient_name', 'phone', 'doctor_name', 'appointment_date', 'time_slot']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'Field "{field}" is required'}), 400

    # Basic phone validation
    phone = data['phone'].strip()
    digits = ''.join(filter(str.isdigit, phone))
    if len(digits) < 10:
        return jsonify({'error': 'Phone number must be at least 10 digits'}), 400

    try:
        new_appointment = Appointment(
            patient_name=data['patient_name'].strip(),
            phone=phone,
            doctor_name=data['doctor_name'],
            appointment_date=data['appointment_date'],
            time_slot=data['time_slot']
        )
        db.session.add(new_appointment)
        db.session.commit()
        return jsonify({
            'message': 'Appointment booked successfully',
            'appointment': new_appointment.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/appointments', methods=['GET'])
@login_required
def get_appointments():
    date_filter = request.args.get('date')
    status_filter = request.args.get('status')
    query = Appointment.query

    if date_filter:
        query = query.filter(Appointment.appointment_date == date_filter)
    if status_filter and status_filter != 'All':
        query = query.filter(Appointment.status == status_filter)

    appointments = query.order_by(Appointment.created_at.desc()).all()
    return jsonify([a.to_dict() for a in appointments])


@app.route('/api/appointments/<int:id>/status', methods=['PUT'])
@login_required
def update_status(id):
    data = request.json
    appointment = db.session.get(Appointment, id)
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404

    new_status = data.get('status')
    if new_status not in ['Pending', 'Approved', 'Cancelled']:
        return jsonify({'error': 'Invalid status value'}), 400

    appointment.status = new_status
    db.session.commit()
    return jsonify({
        'message': 'Status updated successfully',
        'appointment': appointment.to_dict()
    })


@app.route('/api/appointments/stats', methods=['GET'])
@login_required
def get_stats():
    total = Appointment.query.count()
    pending = Appointment.query.filter_by(status='Pending').count()
    approved = Appointment.query.filter_by(status='Approved').count()
    cancelled = Appointment.query.filter_by(status='Cancelled').count()
    return jsonify({
        'total': total,
        'pending': pending,
        'approved': approved,
        'cancelled': cancelled
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)
