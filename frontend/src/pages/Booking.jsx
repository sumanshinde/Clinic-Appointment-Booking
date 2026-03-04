import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
    Calendar, Clock, User, Phone, CheckCircle,
    ClipboardList, ChevronRight, Info, Home
} from 'lucide-react';
import './Booking.css';

const API = 'http://localhost:5000';

const TIME_SLOTS = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
];

const Booking = () => {
    const [searchParams] = useSearchParams();
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState({
        patient_name: '',
        phone: '',
        doctor_name: '',
        appointment_date: '',
        time_slot: '',
    });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState(null); // null | 'submitting' | 'success' | 'error'
    const [confirmedAppointment, setConfirmedAppointment] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        axios.get(`${API}/api/doctors`)
            .then(res => {
                setDoctors(res.data);
                const preselect = searchParams.get('doctor');
                const match = res.data.find(d => d.doctor_name === preselect);
                if (match) {
                    setFormData(prev => ({ ...prev, doctor_name: match.doctor_name }));
                }
            })
            .catch(() => { });
    }, [searchParams]);

    const validate = () => {
        const errs = {};
        if (!formData.patient_name.trim()) errs.patient_name = 'Patient name is required';
        if (!formData.phone.trim()) errs.phone = 'Phone is required';
        else if (!/^\d{10,15}$/.test(formData.phone.replace(/\s|-/g, ''))) errs.phone = 'Enter a valid 10-digit phone number';
        if (!formData.doctor_name) errs.doctor_name = 'Please select a doctor';
        if (!formData.appointment_date) errs.appointment_date = 'Please select a date';
        if (!formData.time_slot) errs.time_slot = 'Please select a time slot';
        return errs;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleDoctorSelect = (name) => {
        setFormData(prev => ({ ...prev, doctor_name: name }));
        if (errors.doctor_name) setErrors(prev => ({ ...prev, doctor_name: '' }));
    };

    const handleTimeSlot = (slot) => {
        setFormData(prev => ({ ...prev, time_slot: slot }));
        if (errors.time_slot) setErrors(prev => ({ ...prev, time_slot: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setStatus('submitting');
        setErrorMsg('');
        try {
            const res = await axios.post(`${API}/api/appointments`, formData);
            setConfirmedAppointment(res.data.appointment);
            setStatus('success');
            setFormData({ patient_name: '', phone: '', doctor_name: '', appointment_date: '', time_slot: '' });
        } catch (err) {
            setErrorMsg(err.response?.data?.error || 'Failed to book. Please try again.');
            setStatus('error');
        }
    };

    const today = new Date().toISOString().split('T')[0];

    if (status === 'success' && confirmedAppointment) {
        return (
            <div className="booking-page container animate-fade-in">
                <div className="booking-header">
                    <div className="section-label">Confirmed</div>
                    <h1 className="section-title gradient-text">Appointment Booked!</h1>
                </div>
                <div className="glass-panel booking-form-card" style={{ maxWidth: '620px', margin: '0 auto' }}>
                    <div className="success-state">
                        <div className="success-icon">
                            <CheckCircle size={44} color="var(--success)" />
                        </div>
                        <h2>You're All Set!</h2>
                        <p>
                            Your appointment has been successfully scheduled at Aarogyam Clinic.
                            Please arrive 10 minutes early with your ID.
                        </p>
                        <div className="success-detail-box">
                            <div className="success-detail-row">
                                <span className="key">Patient</span>
                                <span className="val">{confirmedAppointment.patient_name}</span>
                            </div>
                            <div className="success-detail-row">
                                <span className="key">Doctor</span>
                                <span className="val">{confirmedAppointment.doctor_name}</span>
                            </div>
                            <div className="success-detail-row">
                                <span className="key">Date</span>
                                <span className="val">{new Date(confirmedAppointment.appointment_date).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
                            </div>
                            <div className="success-detail-row">
                                <span className="key">Time</span>
                                <span className="val">{confirmedAppointment.time_slot}</span>
                            </div>
                            <div className="success-detail-row">
                                <span className="key">Status</span>
                                <span className="val" style={{ color: 'var(--warning)' }}>Pending Approval</span>
                            </div>
                        </div>
                        <div className="success-actions">
                            <button className="btn btn-primary" onClick={() => { setStatus(null); setConfirmedAppointment(null); }}>
                                <Calendar size={16} /> Book Another
                            </button>
                            <Link to="/" className="btn btn-secondary">
                                <Home size={16} /> Go Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="booking-page container animate-fade-in">
            <div className="booking-header">
                <div className="section-label">Step 1 of 1</div>
                <h1 className="section-title" style={{ background: 'linear-gradient(135deg, #f1f5f9, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Book an <span style={{ background: 'linear-gradient(135deg, var(--secondary-light), var(--primary-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Appointment</span>
                </h1>
                <p className="section-subtitle">
                    Fill in the details below. We'll confirm your slot and notify you shortly.
                </p>
            </div>

            <div className="booking-layout">
                {/* ─── FORM ─── */}
                <div className="glass-panel booking-form-card">
                    <h2 className="booking-form-title">
                        <ClipboardList size={22} /> Patient Information
                    </h2>

                    <form onSubmit={handleSubmit} noValidate>
                        {/* Name */}
                        <div className="form-group">
                            <label className="input-label"><User size={14} /> Patient Name</label>
                            <div className="input-with-icon">
                                <User className="input-icon" size={16} />
                                <input
                                    type="text"
                                    name="patient_name"
                                    className="input-field"
                                    placeholder="Enter full name"
                                    value={formData.patient_name}
                                    onChange={handleChange}
                                    style={{ borderColor: errors.patient_name ? 'var(--danger)' : '' }}
                                />
                            </div>
                            {errors.patient_name && <p className="form-error">⚠ {errors.patient_name}</p>}
                        </div>

                        {/* Phone */}
                        <div className="form-group">
                            <label className="input-label"><Phone size={14} /> Phone Number</label>
                            <div className="input-with-icon">
                                <Phone className="input-icon" size={16} />
                                <input
                                    type="tel"
                                    name="phone"
                                    className="input-field"
                                    placeholder="10-digit mobile number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    style={{ borderColor: errors.phone ? 'var(--danger)' : '' }}
                                />
                            </div>
                            {errors.phone && <p className="form-error">⚠ {errors.phone}</p>}
                        </div>

                        {/* Date */}
                        <div className="form-group">
                            <label className="input-label"><Calendar size={14} /> Appointment Date</label>
                            <div className="input-with-icon">
                                <Calendar className="input-icon" size={16} />
                                <input
                                    type="date"
                                    name="appointment_date"
                                    className="input-field"
                                    value={formData.appointment_date}
                                    onChange={handleChange}
                                    min={today}
                                    style={{ borderColor: errors.appointment_date ? 'var(--danger)' : '', paddingLeft: '42px' }}
                                />
                            </div>
                            {errors.appointment_date && <p className="form-error">⚠ {errors.appointment_date}</p>}
                        </div>

                        {/* Doctor */}
                        <div className="form-group">
                            <label className="input-label"><User size={14} /> Select Doctor</label>
                            <div className="doctor-selector">
                                {doctors.map(doc => (
                                    <button
                                        key={doc.id}
                                        type="button"
                                        className={`doctor-option ${formData.doctor_name === doc.doctor_name ? 'selected' : ''}`}
                                        onClick={() => handleDoctorSelect(doc.doctor_name)}
                                    >
                                        <div className="doc-name">{doc.doctor_name}</div>
                                        <div className="doc-spec">{doc.specialization.split('–')[1]?.trim() || doc.specialization}</div>
                                    </button>
                                ))}
                            </div>
                            {errors.doctor_name && <p className="form-error">⚠ {errors.doctor_name}</p>}
                        </div>

                        {/* Time Slot */}
                        <div className="form-group">
                            <label className="input-label"><Clock size={14} /> Time Slot</label>
                            <div className="time-slots-grid">
                                {TIME_SLOTS.map(slot => (
                                    <button
                                        key={slot}
                                        type="button"
                                        className={`time-slot-btn ${formData.time_slot === slot ? 'selected' : ''}`}
                                        onClick={() => handleTimeSlot(slot)}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                            {errors.time_slot && <p className="form-error">⚠ {errors.time_slot}</p>}
                        </div>

                        {status === 'error' && (
                            <div className="error-message">❌ {errorMsg}</div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary submit-btn"
                            disabled={status === 'submitting'}
                        >
                            {status === 'submitting' ? (
                                <>
                                    <span className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2, display: 'inline-block', marginRight: 4 }}></span>
                                    Booking...
                                </>
                            ) : (
                                <><CheckCircle size={18} /> Confirm Appointment</>
                            )}
                        </button>
                    </form>
                </div>

                {/* ─── SIDEBAR ─── */}
                <aside className="booking-sidebar">
                    <div className="glass-panel info-card">
                        <h3 className="info-card-title"><Info size={18} /> Before You Book</h3>
                        <ul className="info-list">
                            {[
                                'Bring a government-issued photo ID',
                                'Arrive 10 minutes before your slot',
                                'Bring previous medical records if any',
                                'Confirm or cancel 24 hours in advance',
                                'Emergency? Call +91 98765 43210',
                            ].map((tip, i) => (
                                <li key={i} className="info-list-item">
                                    <span>✓</span> {tip}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="glass-panel info-card">
                        <h3 className="info-card-title"><Clock size={18} /> Clinic Hours</h3>
                        {[
                            ['Mon – Fri', '9:00 AM – 7:00 PM'],
                            ['Saturday', '9:00 AM – 5:00 PM'],
                            ['Sunday', 'Emergency Only'],
                        ].map(([day, hrs]) => (
                            <div key={day} className="time-info-row">
                                <span className="time-label">{day}</span>
                                <span className="time-value">{hrs}</span>
                            </div>
                        ))}
                    </div>

                    <div className="glass-panel info-card">
                        <h3 className="info-card-title"><Phone size={18} /> Contact Us</h3>
                        <div className="info-list">
                            <div className="info-list-item">📞 <a href="tel:+919876543210" style={{ color: 'var(--primary-light)', textDecoration: 'none' }}>+91 98765 43210</a></div>
                            <div className="info-list-item">✉️ <a href="mailto:care@aarogyamclinic.com" style={{ color: 'var(--primary-light)', textDecoration: 'none' }}>care@aarogyamclinic.com</a></div>
                            <div className="info-list-item">📍 123 MG Road, Pune – 411001</div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Booking;
