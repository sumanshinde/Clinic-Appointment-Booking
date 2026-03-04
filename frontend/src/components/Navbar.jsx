import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const links = [
        { to: '/', label: 'Home' },
        { to: '/booking', label: 'Book Appointment' },
        { to: '/admin', label: 'Admin' },
    ];

    return (
        <div className="navbar-wrapper">
            <nav className="navbar container">
                <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
                    <Activity className="brand-icon" size={26} />
                    <span className="brand-text">Aarogyam Clinic</span>
                </Link>

                <button
                    className="menu-toggle"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
                    {links.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
                            onClick={() => setMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
