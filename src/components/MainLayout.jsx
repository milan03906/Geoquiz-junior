import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";

export default function MainLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="layout">
  <Navbar />
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <p>&copy; 2026 GeoQuiz Junior - Sva prava zadržana.</p>
      </footer>
    </div>
  );
}