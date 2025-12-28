import { useState, useEffect } from "react";
import axios from "axios";
import Icon from "./Icon";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("signin");

  useEffect(() => {
    const existing = localStorage.getItem("ama_auth");
    if (existing) {
      onLogin();
    }
  }, [onLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email || !password) {
      setError("Please enter email and password");
      setIsLoading(false);
      return;
    }
    const emailOk = /.+@.+\..+/.test(email);
    if (!emailOk) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/signin";
      const response = await axios.post(`${baseURL}${endpoint}`, {
        username: email,
        password,
      });
      const token = response.data?.token;
      if (!token) {
        throw new Error("No token returned by server");
      }
      if (remember) {
        localStorage.setItem("ama_auth", token);
      } else {
        sessionStorage.setItem("ama_auth", token);
      }
      onLogin();
    } catch (err) {
      const apiError = err.response?.data?.error || err.message || (mode === "signup" ? "Signup failed" : "Signin failed");
      setError(apiError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-card">
          {/* Left Panel - Info */}
          <div className="login-info-panel">
            <div className="login-brand">
              <div className="brand-icon"><Icon name="message-circle" /></div>
              <div className="brand-text">ADHD Meeting Assistant</div>
            </div>

            <div className="welcome-section">
              <h1>{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
              <p>
                {mode === "signup"
                  ? "Sign up to get started with ADHD-friendly tools."
                  : "Sign in to access your ADHD-friendly tools and boost your productivity."}
              </p>
            </div>

            <div className="features-card">
              <div className="feature-header">
                <div className="status-indicator"></div>
                <div className="feature-title">Focus-friendly design</div>
              </div>
              <ul className="features-list">
                <li>Scannable summaries and action items</li>
                <li>Transcribe video, audio, and YouTube links</li>
                <li>Ask questions with saved context</li>
                <li>Smart study scheduling</li>
              </ul>
            </div>

            <div className="decorative-elements">
              <div className="floating-element element-1"><Icon name="message-circle" /></div>
              <div className="floating-element element-2"><Icon name="record-dot" /></div>
              <div className="floating-element element-3"><Icon name="message-circle" /></div>
            </div>
          </div>

          {/* Right Panel - Login Form */}
          <div className="login-form-panel">
            <div className="social-login">
              <button
                type="button"
                className="google-btn"
                onClick={() => alert("Social sign-in not configured in demo")}
              >
                <svg viewBox="0 0 24 24" className="google-icon">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
              <div className="divider">or</div>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  {mode === "signup" ? "Email Address (used as username)" : "Email Address"}
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input modern-input"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input modern-input"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="password-toggle"
                    disabled={isLoading}
                  >
                    {showPassword ? <Icon name="eye" /> : <Icon name="eye-off" />}
                  </button>
                </div>
                {mode === "signup" && (
                  <div style={{ marginTop: 8, color: "#6b7280", fontSize: "0.85rem" }}>
                    Must be 6–16 chars and include upper, lower, number, special.
                  </div>
                )}
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    disabled={isLoading}
                    className="modern-checkbox"
                  />
                  <span className="checkbox-text">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    alert("Password reset flow not configured in demo")
                  }
                  className="forgot-password-btn"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className={`btn-primary login-btn ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    {mode === "signup" ? "Creating account..." : "Signing in..."}
                  </>
                ) : (
                  mode === "signup" ? "Create account" : "Sign in"
                )}
              </button>
            </form>

            {error && (
              <div className="error modern-error">
                <span className="error-icon"><Icon name="warning" /></span>
                {error}
              </div>
            )}

            <div className="signup-prompt">
              {mode === "signup" ? "Already have an account?" : "Don't have an account?"}
              <button
                type="button"
                onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                className="signup-link"
                disabled={isLoading}
              >
                {mode === "signup" ? "Sign in" : "Create one"}
              </button>
            </div>

            <div className="legal-text">
              By continuing, you agree to our <strong>Terms</strong> and{" "}
              <strong>Privacy Policy</strong>.
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          position: relative;
          overflow: hidden;
        }

        .login-container::before {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.1) 0%,
            transparent 70%
          );
          animation: float 8s ease-in-out infinite;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }

        .login-wrapper {
          width: 100%;
          max-width: 1080px;
          position: relative;
          z-index: 1;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          box-shadow:
            0 32px 64px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(255, 255, 255, 0.1);
          overflow: hidden;
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          min-height: 600px;
          animation: slideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Left Panel */
        .login-info-panel {
          padding: 3rem;
          background: linear-gradient(135deg, #f8faff 0%, #ffffff 100%);
          position: relative;
          overflow: hidden;
        }

        .login-brand {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .brand-icon {
          font-size: 2rem;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .brand-text {
          font-weight: 800;
          font-size: 1.2rem;
          color: #0ea5e9;
          background: linear-gradient(135deg, #0ea5e9, #06b6d4);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .welcome-section h1 {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 0.5rem;
          letter-spacing: -0.025em;
        }

        .welcome-section p {
          color: #6b7280;
          font-size: 1.1rem;
          line-height: 1.6;
          font-weight: 500;
        }

        .features-card {
          margin-top: 2rem;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid #e5e7eb;
          border-radius: 1rem;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
        }

        .feature-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #065f46);
          animation: glow 2s infinite;
        }

        @keyframes glow {
          0%,
          100% {
            box-shadow: 0 0 5px rgba(16, 185, 129, 0.5);
          }
          50% {
            box-shadow: 0 0 15px rgba(16, 185, 129, 0.8);
          }
        }

        .feature-title {
          color: #047857;
          font-weight: 700;
          font-size: 1rem;
        }

        .features-list {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .features-list li {
          color: #4b5563;
          line-height: 1.8;
          font-weight: 500;
          padding: 0.25rem 0;
        }

        .decorative-elements {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .floating-element {
          position: absolute;
          font-size: 1.5rem;
          opacity: 0.6;
        }

        .element-1 {
          top: 20%;
          right: 10%;
          animation: float-1 6s ease-in-out infinite;
        }

        .element-2 {
          bottom: 30%;
          right: 20%;
          animation: float-2 8s ease-in-out infinite;
        }

        .element-3 {
          top: 60%;
          right: 5%;
          animation: float-3 7s ease-in-out infinite;
        }

        @keyframes float-1 {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(5deg);
          }
        }

        @keyframes float-2 {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(-5deg);
          }
        }

        @keyframes float-3 {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-12px) rotate(3deg);
          }
        }

        /* Right Panel */
        .login-form-panel {
          padding: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .social-login {
          margin-bottom: 2rem;
        }

        .google-btn {
          width: 100%;
          padding: 1rem;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 1rem;
          font-weight: 600;
          color: #374151;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .google-btn:hover {
          border-color: #d1d5db;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .google-icon {
          width: 20px;
          height: 20px;
        }

        .divider {
          text-align: center;
          margin: 1rem 0;
          color: #9ca3af;
          font-size: 0.9rem;
          position: relative;
        }

        .divider::before,
        .divider::after {
          content: "";
          position: absolute;
          top: 50%;
          width: 40%;
          height: 1px;
          background: #e5e7eb;
        }

        .divider::before {
          left: 0;
        }

        .divider::after {
          right: 0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-label {
          display: block;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #374151;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .modern-input {
          width: 100%;
          padding: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 1rem;
          font-size: 1rem;
          transition: all 0.2s ease;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
        }

        .modern-input:focus {
          outline: none;
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
          transform: translateY(-1px);
        }

        .password-input-wrapper {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 0.5rem;
          transition: background 0.2s ease;
        }

        .password-toggle:hover {
          background: rgba(102, 126, 234, 0.1);
        }

        .form-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 0.5rem 0;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          color: #4b5563;
          font-weight: 500;
        }

        .modern-checkbox {
          width: 1.2rem;
          height: 1.2rem;
          accent-color: #0ea5e9;
        }

        .forgot-password-btn {
          background: none;
          border: none;
          color: #0ea5e9;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s ease;
          font-size: 0.9rem;
        }

        .forgot-password-btn:hover {
          color: #5a67d8;
        }

        .login-btn {
          width: 100%;
          padding: 1rem 2rem;
          margin-top: 1rem;
          position: relative;
          overflow: hidden;
        }

        .login-btn.loading {
          background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
          cursor: not-allowed;
        }

        .loading-spinner {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 0.5rem;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .modern-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          border: 2px solid #ef4444;
          color: #991b1b;
          padding: 1rem;
          border-radius: 1rem;
          margin-top: 1rem;
          font-weight: 600;
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        .signup-prompt {
          text-align: center;
          margin-top: 1.5rem;
          color: #6b7280;
          font-weight: 500;
        }

        .signup-link {
          background: none;
          border: none;
          color: #0ea5e9;
          font-weight: 700;
          cursor: pointer;
          margin-left: 0.25rem;
          transition: color 0.2s ease;
        }

        .signup-link:hover {
          color: #5a67d8;
        }

        .legal-text {
          text-align: center;
          color: #9ca3af;
          font-size: 0.75rem;
          margin-top: 1rem;
          line-height: 1.5;
        }

        .legal-text strong {
          color: #6b7280;
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .login-card {
            grid-template-columns: 1fr;
            margin: 1rem;
          }

          .login-info-panel {
            padding: 2rem;
          }

          .login-form-panel {
            padding: 2rem;
          }

          .welcome-section h1 {
            font-size: 2rem;
          }

          .features-card {
            margin-top: 1.5rem;
            padding: 1rem;
          }
        }

        @media (max-width: 480px) {
          .login-container {
            padding: 0.5rem;
          }

          .login-info-panel,
          .login-form-panel {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;