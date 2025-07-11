import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
        window.location.reload();
    };

    return (
        <nav className="bookapp-navbar">
            <div className="bookapp-navbar-brand">
                <Link to="/" className="bookapp-navbar-item">Book App</Link>
            </div>
            <div className="bookapp-navbar-menu">
                <Link to="/home" className="bookapp-navbar-item">Recommended</Link>
                <Link to="/search" className="bookapp-navbar-item">Search</Link>
                <Link to="/discussion" className="bookapp-navbar-item">Discuss</Link>
                <Link to="/profile" className="bookapp-navbar-item">Profile</Link>
                <button className="bookapp-navbar-item bookapp-logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
