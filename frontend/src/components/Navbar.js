import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon, FiMenu, FiX, FiLogOut, FiLayout } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const updateUser = () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error parsing user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    // Initial load
    updateUser();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        updateUser();
      }
    };

    // Listen for custom login/logout events
    const handleAuthChange = () => {
      updateUser();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleAuthChange);
    window.addEventListener('userLogout', handleAuthChange);

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);

    // Update user on route change (in case login happens)
    updateUser();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleAuthChange);
      window.removeEventListener('userLogout', handleAuthChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Dispatch custom event for other components
    window.dispatchEvent(new Event('userLogout'));
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">FER</span>
          <span className="logo-subtitle">Emotion Recognition</span>
        </Link>

        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <Link to="/" className="navbar-link" onClick={() => setIsOpen(false)}>
            Home
          </Link>
          <Link to="/about" className="navbar-link" onClick={() => setIsOpen(false)}>
            About
          </Link>
          <Link to="/contact" className="navbar-link" onClick={() => setIsOpen(false)}>
            Contact
          </Link>
          
          {user ? (
            <>
              <Link to="/dashboard" className="navbar-link dashboard-link" onClick={() => setIsOpen(false)}>
                <FiLayout className="navbar-icon" />
                Dashboard
              </Link>
              <button className="navbar-link logout-btn" onClick={handleLogout}>
                <FiLogOut className="navbar-icon" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link" onClick={() => setIsOpen(false)}>
                Login
              </Link>
              <Link to="/signup" className="navbar-link signup-link" onClick={() => setIsOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
          
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? <FiMoon /> : <FiSun />}
          </button>
        </div>

        <button className="navbar-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

