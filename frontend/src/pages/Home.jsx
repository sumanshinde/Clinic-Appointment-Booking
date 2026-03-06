import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    Calendar, Phone, MapPin, Clock, Activity,
    Star, Shield, Heart, Zap, Users
} from 'lucide-react';
import './Home.css';

const API = 'https://clinic-appointment-booking-s52j.onrender.com';

const services = [
    {
        icon: '🩺',
        label: 'General Medicine',
        desc: 'Comprehensive diagnosis and treatment for common and complex illnesses by experienced physicians.',
        color: 'rgba(99, 102, 241, 0.15)'
    },
    {
        icon: '🤰',
        label: 'Gynecology',
        desc: "Expert women's healthcare including prenatal care, routine checkups, and minimally invasive procedures.",
        color: 'rgba(244, 114, 182, 0.12)'
    },
    {
        icon: '👶',
        label: 'Pediatrics',
        desc: 'Compassionate and expert medical care for infants, children, and adolescents.',
        color: 'rgba(6, 182, 212, 0.12)'
    },
    {
        icon: '🦷',
        label: 'Dentistry',
        desc: 'Full-spectrum dental services from cleanings to cosmetic procedures and implants.',
        color: 'rgba(245, 158, 11, 0.12)'
    },
];

const Home = () => {
    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        axios.get(`${API}/api/doctors`)
            .then(res => setDoctors(res.data))
            .catch(() => { });
    }, []);

    return (
        <div className="home container animate-fade-in">
            {/* ─── HERO ─── */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="badge-dot"></span>
                        Welcome to Aarogyam Clinic
                    </div>
                    <h1 className="hero-title">
                        Your Health,<br />
                        Our <span className="highlight">Priority</span>.
                    </h1>
                    <p className="hero-description">
                        Experience world-class healthcare delivered with warmth and expertise.
                        Our specialists are here to guide you on your path to wellness.
                    </p>
                    <div className="hero-actions">
                        <Link to="/booking" className="btn btn-primary">
                            <Calendar size={18} /> Book Appointment
                        </Link>
                        <a href="tel:+919876543210" className="btn btn-secondary">
                            <Phone size={18} /> +91 98765 43210
                        </a>
                    </div>
                    <div className="hero-stats">
                        <div className="stat-item">
                            <div className="stat-number">4+</div>
                            <div className="stat-label">Specialists</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">5K+</div>
                            <div className="stat-label">Happy Patients</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">10+</div>
                            <div className="stat-label">Years of Care</div>
                        </div>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="hero-image-container">
                        <img
                            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800"
                            alt="Modern Aarogyam Clinic Building"
                        />
                        <div className="hero-card">
                            <div className="hero-card-icon">
                                <Activity size={24} color="white" />
                            </div>
                            <div className="hero-card-text">
                                <strong>Available 24/7 for Emergencies</strong>
                                <span>Call +91 98765 43210</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── SERVICES ─── */}
            <section className="services-section">
                <div className="section-header">
                    <div className="section-label">Our Specialties</div>
                    <h2 className="section-title gradient-text">What We Offer</h2>
                    <p className="section-subtitle">
                        We provide a wide range of medical services under one roof, ensuring you get the best care possible.
                    </p>
                </div>
                <div className="services-grid">
                    {services.map((s, i) => (
                        <div key={i} className="service-card animate-fade-in-delay">
                            <div className="service-icon-wrapper" style={{ background: s.color }}>
                                <span>{s.icon}</span>
                            </div>
                            <h3>{s.label}</h3>
                            <p>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── DOCTORS ─── */}
            <section className="doctors-section">
                <div className="section-header">
                    <div className="section-label">Our Team</div>
                    <h2 className="section-title gradient-text">Meet Our Doctors</h2>
                    <p className="section-subtitle">
                        Experienced, compassionate specialists dedicated to providing exceptional care.
                    </p>
                </div>
                <div className="doctors-grid">
                    {doctors.map(doc => (
                        <div key={doc.id} className="doctor-card">
                            <div className="doctor-image">
                                <img src={doc.photo} alt={doc.doctor_name} />
                                <div className="doctor-overlay" />
                                <span className="doctor-exp-badge">{doc.experience}</span>
                            </div>
                            <div className="doctor-info">
                                <h3 className="doctor-name">{doc.doctor_name}</h3>
                                <p className="doctor-spec">{doc.specialization}</p>
                                <p className="doctor-bio">{doc.bio}</p>
                                <Link
                                    to={`/booking?doctor=${encodeURIComponent(doc.doctor_name)}`}
                                    className="btn btn-primary doctor-action btn-sm"
                                >
                                    <Calendar size={14} /> Book Consultation
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── CONTACT ─── */}
            <section className="contact-section">
                <div className="section-header">
                    <div className="section-label">Get In Touch</div>
                    <h2 className="section-title gradient-text">Visit Us</h2>
                    <p className="section-subtitle">
                        We're conveniently located and easy to reach. Walk in or schedule an appointment.
                    </p>
                </div>
                <div className="contact-grid">
                    <div className="contact-info-grid">
                        <div className="contact-item">
                            <div className="contact-icon-wrapper">
                                <Phone size={22} />
                            </div>
                            <div className="contact-item-content">
                                <h4>Phone</h4>
                                <a href="tel:+919876543210">+91 98765 43210</a>
                            </div>
                        </div>
                        <div className="contact-item">
                            <div className="contact-icon-wrapper">
                                <MapPin size={22} />
                            </div>
                            <div className="contact-item-content">
                                <h4>Address</h4>
                                <p>123 MG Road, Shivaji Nagar,<br />Pune, Maharashtra – 411001</p>
                            </div>
                        </div>
                        <div className="contact-item">
                            <div className="contact-icon-wrapper">
                                <Clock size={22} />
                            </div>
                            <div className="contact-item-content">
                                <h4>Working Hours</h4>
                                <p>Mon – Sat: 9:00 AM – 7:00 PM<br />Sun: Emergency Only</p>
                            </div>
                        </div>
                        <div className="contact-item">
                            <div className="contact-icon-wrapper">
                                <Users size={22} />
                            </div>
                            <div className="contact-item-content">
                                <h4>Email</h4>
                                <a href="mailto:care@aarogyamclinic.com">care@aarogyamclinic.com</a>
                            </div>
                        </div>
                    </div>
                    <div className="glass-panel contact-map">
                        <iframe
                            src="https://www.openstreetmap.org/export/embed.html?bbox=73.8467%2C18.5200%2C73.8667%2C18.5350&layer=mapnik"
                            title="Aarogyam Clinic Location"
                        ></iframe>
                    </div>
                </div>
            </section>

            {/* ─── CTA ─── */}
            <section className="cta-section">
                <div className="cta-card animate-fade-in">
                    <h2>Ready to Take Control of Your <span className="gradient-text">Health?</span></h2>
                    <p>
                        Don't wait. Book your appointment online in under a minute
                        and get expert medical care from our specialists.
                    </p>
                    <div className="cta-actions">
                        <Link to="/booking" className="btn btn-primary">
                            <Calendar size={18} /> Book an Appointment
                        </Link>
                        <a href="tel:+919876543210" className="btn btn-secondary">
                            <Phone size={18} /> Call Now
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
