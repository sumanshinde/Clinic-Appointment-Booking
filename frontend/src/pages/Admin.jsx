import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Calendar, Clock, User, Phone, Check, X, RefreshCw,
    Shield, LogOut, Filter, CalendarDays, LayoutDashboard, Stethoscope
} from 'lucide-react';
import './Admin.css';

const API = 'http://localhost:5000';

// ─── Login Screen ─────────────────────────────────

const LoginScreen = ({ onLogin }) => {
    const [creds, setCreds] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post(`${API}/api/admin/login`, creds, { withCredentials: true });
            onLogin(res.data.username);
        } catch {
            setError('Invalid username or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page animate-fade-in">
            <div className="glass-panel login-card">
                <div className="login-brand">
                    <div className="login-icon">
                        <Shield size={32} color="var(--primary-light)" />
                    </div>
                    <h2>Admin Login</h2>
                    <p>Sign in to access the clinic dashboard</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="input-label"><User size={13} /> Username</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="admin"
                            value={creds.username}
                            onChange={e => setCreds(p => ({ ...p, username: e.target.value }))}
                            required
                            autoComplete="username"
                        />
                    </div>
                    <div className="form-group">
                        <label className="input-label"><Shield size={13} /> Password</label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="••••••••"
                            value={creds.password}
                            onChange={e => setCreds(p => ({ ...p, password: e.target.value }))}
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    {error && <div className="error-message" style={{ marginBottom: '16px' }}>⚠ {error}</div>}
                    <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                        {loading ? 'Signing in...' : <><Shield size={16} /> Sign In</>}
                    </button>
                </form>
                <div className="login-hint">
                    Demo credentials: <strong>admin</strong> / <strong>admin123</strong>
                </div>
            </div>
        </div>
    );
};

// ─── Stat Card ────────────────────────────────────

const StatCard = ({ icon, label, value, type }) => (
    <div className="stat-card">
        <div className={`stat-card-icon ${type}`}>{icon}</div>
        <div className="stat-card-info">
            <div className="number">{value ?? '—'}</div>
            <div className="label">{label}</div>
        </div>
    </div>
);

// ─── Badge Helper ─────────────────────────────────

const StatusBadge = ({ status }) => {
    const cls = status === 'Approved' ? 'badge-approved' : status === 'Cancelled' ? 'badge-cancelled' : 'badge-pending';
    return <span className={`badge-status ${cls}`}>{status}</span>;
};

// ─── Appointment Card ─────────────────────────────

const AppointmentCard = ({ appt, onStatusChange }) => {
    const initials = appt.patient_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const dateStr = new Date(appt.appointment_date + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });

    return (
        <div className="appt-card animate-fade-in">
            <div className="appt-card-top">
                <div className="patient-row">
                    <div className="patient-avatar">{initials}</div>
                    <div className="patient-details">
                        <div className="name">{appt.patient_name}</div>
                        <div className="phone">
                            <Phone size={12} /> {appt.phone}
                        </div>
                        <div className="appt-id">ID #{appt.id}</div>
                    </div>
                </div>
                <StatusBadge status={appt.status} />
            </div>

            <div className="appt-card-body">
                <div className="appt-info-row">
                    <Calendar size={14} />
                    <span>Date</span>
                    <span className="info-val">{dateStr}</span>
                </div>
                <div className="appt-info-row">
                    <Clock size={14} />
                    <span>Time</span>
                    <span className="info-val">{appt.time_slot}</span>
                </div>
                <div className="appt-info-row">
                    <Stethoscope size={14} />
                    <span>Doctor</span>
                    <span className="info-val">{appt.doctor_name}</span>
                </div>
                <div className="appt-info-row">
                    <Clock size={14} />
                    <span>Booked At</span>
                    <span className="info-val">{new Date(appt.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
                </div>
            </div>

            {appt.status === 'Pending' && (
                <div className="appt-card-footer">
                    <button
                        className="btn btn-success appt-action-btn"
                        onClick={() => onStatusChange(appt.id, 'Approved')}
                    >
                        <Check size={15} /> Approve
                    </button>
                    <button
                        className="btn btn-danger appt-action-btn"
                        onClick={() => onStatusChange(appt.id, 'Cancelled')}
                    >
                        <X size={15} /> Cancel
                    </button>
                </div>
            )}

            {appt.status !== 'Pending' && (
                <div className="appt-card-footer">
                    <button
                        className="btn btn-secondary appt-action-btn"
                        onClick={() => onStatusChange(appt.id, 'Pending')}
                        style={{ opacity: 0.7 }}
                    >
                        ↩ Reset to Pending
                    </button>
                </div>
            )}
        </div>
    );
};

// ─── Main Admin Dashboard ─────────────────────────

const AdminDashboard = ({ username, onLogout }) => {
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (dateFilter) params.date = dateFilter;
            if (statusFilter !== 'All') params.status = statusFilter;

            const [appRes, statsRes] = await Promise.all([
                axios.get(`${API}/api/appointments`, { params, withCredentials: true }),
                axios.get(`${API}/api/appointments/stats`, { withCredentials: true })
            ]);
            setAppointments(appRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [dateFilter, statusFilter]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleStatusChange = async (id, status) => {
        try {
            await axios.put(`${API}/api/appointments/${id}/status`, { status }, { withCredentials: true });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post(`${API}/api/admin/logout`, {}, { withCredentials: true });
        } catch { }
        onLogout();
    };

    const clearFilters = () => {
        setDateFilter('');
        setStatusFilter('All');
    };

    const statusPills = [
        { label: 'All', value: 'All' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Approved', value: 'Approved' },
        { label: 'Cancelled', value: 'Cancelled' },
    ];

    return (
        <div className="admin-page container animate-fade-in">
            {/* ─── Top Bar ─── */}
            <div className="admin-topbar">
                <div className="admin-topbar-left">
                    <h1><LayoutDashboard size={24} style={{ display: 'inline', marginRight: 10, color: 'var(--primary-light)' }} />Admin Dashboard</h1>
                    <p>Welcome back, <strong>{username}</strong> · Manage all clinic appointments</p>
                </div>
                <div className="admin-topbar-actions">
                    <button className="btn btn-secondary" onClick={fetchData} disabled={loading}>
                        <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
                    </button>
                    <button className="btn btn-danger" onClick={handleLogout}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </div>

            {/* ─── Stats ─── */}
            <div className="stats-row">
                <StatCard icon={<CalendarDays size={22} />} label="Total Appointments" value={stats?.total} type="total" />
                <StatCard icon={<Clock size={22} />} label="Pending" value={stats?.pending} type="pending" />
                <StatCard icon={<Check size={22} />} label="Approved" value={stats?.approved} type="approved" />
                <StatCard icon={<X size={22} />} label="Cancelled" value={stats?.cancelled} type="cancelled" />
            </div>

            {/* ─── Filters ─── */}
            <div className="filters-bar">
                <div className="filter-group">
                    <CalendarDays size={16} />
                    <label>Date:</label>
                    <input
                        type="date"
                        className="filter-input"
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <Filter size={16} />
                    <label>Status:</label>
                    <div className="status-filter-pills">
                        {statusPills.map(p => {
                            const isActive = statusFilter === p.value;
                            const activeClass = isActive
                                ? (p.value === 'All' ? 'active' : `active-${p.value.toLowerCase()}`)
                                : '';
                            return (
                                <button
                                    key={p.value}
                                    className={`pill ${activeClass}`}
                                    onClick={() => setStatusFilter(p.value)}
                                >
                                    {p.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
                {(dateFilter || statusFilter !== 'All') && (
                    <button className="btn btn-secondary btn-sm filter-clear" onClick={clearFilters}>
                        <X size={14} /> Clear Filters
                    </button>
                )}
            </div>

            {/* ─── Results ─── */}
            <p className="results-info">
                Showing <strong>{appointments.length}</strong> appointment{appointments.length !== 1 ? 's' : ''}
                {dateFilter && ` on ${new Date(dateFilter + 'T00:00:00').toLocaleDateString('en-IN', { dateStyle: 'long' })}`}
                {statusFilter !== 'All' && ` · Status: ${statusFilter}`}
            </p>

            {/* ─── Grid ─── */}
            <div className="appointments-grid">
                {loading && appointments.length === 0 ? (
                    <div className="empty-card glass-panel">
                        <div className="loading-spinner"></div>
                        <p>Loading appointments...</p>
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="empty-card glass-panel">
                        <CalendarDays size={52} color="var(--text-dim)" />
                        <h3>No Appointments Found</h3>
                        <p>Try adjusting the filters or check back later.</p>
                    </div>
                ) : (
                    appointments.map(appt => (
                        <AppointmentCard
                            key={appt.id}
                            appt={appt}
                            onStatusChange={handleStatusChange}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

// ─── Root Admin Component ─────────────────────────

const Admin = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        axios.get(`${API}/api/admin/status`, { withCredentials: true })
            .then(res => {
                if (res.data.logged_in) {
                    setLoggedIn(true);
                    setUsername(res.data.username);
                }
            })
            .catch(() => { })
            .finally(() => setChecking(false));
    }, []);

    if (checking) {
        return (
            <div className="login-page animate-fade-in">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!loggedIn) {
        return <LoginScreen onLogin={(u) => { setUsername(u); setLoggedIn(true); }} />;
    }

    return <AdminDashboard username={username} onLogout={() => { setLoggedIn(false); setUsername(''); }} />;
};

export default Admin;
