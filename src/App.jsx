import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import Quizzes from "./pages/Quizzes";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import AdminDashboard from "./pages/AdminDashboard";
import AdminQuestions from "./pages/AdminQuestions";
import AdminUsers from "./pages/AdminUsers";
import Navbar from "./components/Navbar";
import Leaderboard from "./pages/Leaderboard";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="unauthorized" element={<Unauthorized />} />

        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="quizzes" element={<Quizzes />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="results/:id" element={<Results />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Route>

        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/questions" element={<AdminQuestions />} />
          <Route path="admin/users" element={<AdminUsers />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}