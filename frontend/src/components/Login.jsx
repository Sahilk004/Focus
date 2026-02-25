import { useState, useEffect } from "react";
import axios from "axios";
import Icon from "./Icon";

function Login({ onLogin }) {
  const [name, setName] = useState("");
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

    if (mode === "signup" && !name.trim()) {
      setError("Please enter your full name");
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
      const payload = mode === "signup"
        ? { name, username: email, password }
        : { username: email, password };

      const response = await axios.post(`${baseURL}${endpoint}`, payload);
      const token = response.data?.token;

      if (!token) {
        throw new Error("No token returned by server");
      }

      // Store token and user info
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("ama_auth", token);

      if (response.data.user) {
        storage.setItem("ama_user", JSON.stringify(response.data.user));
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-200/40 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl animate-pulse-slow delay-700"></div>
      </div>

      <div className="w-full max-w-5xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2 relative z-10 animate-fade-in border border-white/50">

        {/* Left Panel */}
        <div className="p-8 md:p-12 bg-gradient-to-br from-white to-primary-50 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 to-primary-600"></div>

          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-primary-100 rounded-xl text-primary-600">
                <Icon name="message-circle" size={28} />
              </div>
              <span className="text-xl font-bold text-dark-900 tracking-tight">FocusFlow</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl font-extrabold text-dark-900 leading-tight">
                {mode === "signup" ? "Start your journey" : "Welcome back"}
              </h1>
              <p className="text-lg text-dark-500 font-medium leading-relaxed">
                {mode === "signup"
                  ? "Join thousands of students using FocusFlow to master their studies."
                  : "Sign in to access your personalized study assistant."}
              </p>
            </div>

            <div className="mt-8 md:mt-12 p-6 bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-primary-700 font-bold">
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                Focus-friendly Features
              </div>
              <ul className="space-y-3">
                {[
                  "Scannable summaries & action items",
                  "Video & Audio transcription",
                  "Smart study scheduling"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-dark-600 font-medium">
                    <Icon name="check-circle" size={18} className="text-primary-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 flex gap-4 opacity-50 justify-center md:justify-start">
            <Icon name="message-circle" className="text-primary-300 animate-bounce delay-100" />
            <Icon name="video" className="text-primary-300 animate-bounce delay-200" />
            <Icon name="calendar" className="text-primary-300 animate-bounce delay-300" />
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-white/40">
          <div className="max-w-md w-full mx-auto">
            {/* Social Login */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-dark-200 rounded-xl font-semibold text-dark-700 hover:bg-dark-50 hover:border-dark-300 transition-all shadow-sm group"
              onClick={() => alert("Social sign-in not configured in demo")}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 group-hover:scale-110 transition-transform">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white/0 backdrop-blur-xl text-dark-400 font-medium backdrop-filter">Or continue with</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "signup" && (
                <div className="animate-slide-up">
                  <label htmlFor="name" className="block text-sm font-bold text-dark-700 mb-1.5 ml-1">
                    Full Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-400 group-focus-within:text-primary-500 transition-colors">
                      <Icon name="user" size={18} />
                    </div>
                    <input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="glass-input pl-10 w-full"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-dark-700 mb-1.5 ml-1">
                  {mode === "signup" ? "Email Address" : "Email"}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-400 group-focus-within:text-primary-500 transition-colors">
                    <Icon name="mail" size={18} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input pl-10 w-full"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold text-dark-700 mb-1.5 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-400 group-focus-within:text-primary-500 transition-colors">
                    <Icon name="lock" size={18} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-input pl-10 w-full pr-12"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-dark-400 hover:text-dark-600 transition-colors"
                  >
                    <Icon name={showPassword ? "eye" : "eye-off"} size={18} />
                  </button>
                </div>
                {mode === "signup" && (
                  <p className="mt-2 text-xs text-dark-400 font-medium">
                    Must be 6–16 characters with upper, lower, number, & special char.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${remember ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white border-dark-300 group-hover:border-dark-400'}`}>
                    {remember && <Icon name="check-circle" size={12} stroke={3} />}
                  </div>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-dark-600 font-medium group-hover:text-dark-800 transition-colors">Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => alert("Not configured in demo")}
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full btn-primary flex items-center justify-center gap-2 mt-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === "signup" ? "Create Account" : "Sign In"}</span>
                    <Icon name="arrow-right" size={18} />
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-slide-up">
                <Icon name="warning" className="text-red-500 flex-shrink-0" size={20} />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div className="mt-8 text-center">
              <p className="text-dark-500 font-medium">
                {mode === "signup" ? "Already have an account?" : "Don't have an account?"}
                <button
                  type="button"
                  onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                  className="ml-2 text-primary-600 font-bold hover:text-primary-700 transition-colors hover:underline decoration-2 underline-offset-4"
                  disabled={isLoading}
                >
                  {mode === "signup" ? "Sign in" : "Create one"}
                </button>
              </p>
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs text-dark-400">
                By continuing, you agree to our <a href="#" className="underline hover:text-dark-600">Terms</a> and <a href="#" className="underline hover:text-dark-600">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;