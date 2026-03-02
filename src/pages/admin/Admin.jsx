import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import AdminBG from "../../assets/bg4.jpg";
import "../../App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `http://${window.location.hostname}:5000`;

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/login`, {
        email,
        password,
      });
      const token = response?.data?.data?.token;
      if (!token) {
        throw new Error("Login response did not include a token.");
      }
      login(token);
      navigate("/admin/dashboard");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Invalid email or password";
      setError(message);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url(${AdminBG})` }}
    >
      <div className="absolute inset-0 bg-blue-950/90" />

      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen p-6 lg:p-12 gap-12">
        <section className="flex-1 text-white flex flex-col justify-center space-y-6">
          <p className="uppercase tracking-[0.4em] text-sm text-blue-200">
            Document Tracking System
          </p>
          <h1 className="text-4xl lg:text-6xl font-bold leading-snug">
            Manage, monitor, and move documents with confidence.
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl">
            A centralized command center that keeps every letter, memo, and
            request in motion. Stay ahead with live dashboards, instant alerts,
            and detailed audit trails.
          </p>

          <div className="flex flex-wrap gap-6">
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 w-48 backdrop-blur">
              <p className="text-3xl font-semibold">1.2K+</p>
              <p className="text-sm uppercase tracking-wide text-blue-200">
                Documents tracked
              </p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 w-48 backdrop-blur">
              <p className="text-3xl font-semibold">24/7</p>
              <p className="text-sm uppercase tracking-wide text-blue-200">
                Monitoring
              </p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 w-48 backdrop-blur">
              <p className="text-3xl font-semibold">8</p>
              <p className="text-sm uppercase tracking-wide text-blue-200">
                Active offices
              </p>
            </div>
          </div>
        </section>

        <section className="w-full max-w-md ml-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl">
          <div className="p-8 space-y-8">
            <div>
              <p className="text-sm uppercase tracking-[0.6em] text-blue-200">
                Admin Access
              </p>
              <h2 className="text-3xl font-semibold text-white mt-2">
                Sign in to continue
              </h2>
              <p className="text-blue-100 mt-1">
                Use your official admin credentials to access the control
                center.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-100">
                  Email address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@dts.gov"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-100">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-900/30 hover:scale-[1.01] transition-transform"
              >
                Login
              </button>

              {error && (
                <p className="text-red-300 text-sm" role="alert">
                  {error}
                </p>
              )}
            </form>

            <div className="text-xs text-blue-200">
              Access is monitored and logged. Contact ICT support if you need
              help with your account.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminLogin;
