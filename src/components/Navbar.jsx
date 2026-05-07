import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuRef = useRef();
  const buttonRef = useRef();

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        closeMenu();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <nav className="navbar-container">

      <div className="nav-logo">🌍 GeoQuiz Junior</div>

      <div
        ref={buttonRef}
        className={`hamburger ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      
      {isOpen && <div className="nav-backdrop" onClick={closeMenu}></div>}

      
      <div
        ref={menuRef}
        className={`nav-group ${isOpen ? "mobile-open" : ""}`}
      >
        <Link to="/" onClick={closeMenu} className="nav-item">Home</Link>
        <Link to="/about" onClick={closeMenu} className="nav-item">About</Link>
        <Link to="/contact" onClick={closeMenu} className="nav-item">Contact</Link>

        {user && (
          <>
            <Link to="/quizzes" onClick={closeMenu} className="nav-item">Quizzes</Link>
            <Link to="/dashboard" onClick={closeMenu} className="nav-item">Dashboard</Link>
            <Link to="/leaderboard" onClick={closeMenu} className="nav-item">Leaderboard</Link>
          </>
        )}

        {user ? (
          <div className="nav-user-actions">
            <span className="nav-user-info">👑 {user.name}</span>

            {user.role === "admin" && (
              <Link to="/admin" onClick={closeMenu} className="admin-red-link">
                Admin
              </Link>
            )}

            <button
              onClick={() => {
                logout();
                closeMenu();
              }}
              className="nav-logout-btn"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="nav-user-actions">
            <Link to="/login" onClick={closeMenu} className="nav-item">Login</Link>
            <Link to="/register" onClick={closeMenu} className="nav-item">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
}