import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import "./App.css";
import Layout from "./components/Layout";
import NotesProcessor from "./components/NotesProcessor";
import MeetingAssistant from "./components/MeetingAssistant";
import MeetingTranscriber from "./components/MeetingTranscriber";
import ChatAssistant from "./components/ChatAssistant";
import StudySchedule from "./components/StudySchedule";
import Login from "./components/Login";

function App() {
  const [activeTab, setActiveTab] = useState("notes");
  const [context, setContext] = useState("");
  const [authed, setAuthed] = useState(
    () => !!localStorage.getItem("ama_auth"),
  );
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("ama_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Configure axios on mount and whenever auth token changes
  useEffect(() => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
    axios.defaults.baseURL = baseURL;
    const token = localStorage.getItem("ama_auth") || sessionStorage.getItem("ama_auth");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [authed]);

  // Persist active tab across reloads and restore on mount
  useEffect(() => {
    const savedTab = localStorage.getItem("ama_active_tab");
    if (savedTab) setActiveTab(savedTab);
  }, []);
  useEffect(() => {
    localStorage.setItem("ama_active_tab", activeTab);
  }, [activeTab]);

  const handleLoggedIn = useCallback(() => {
    setAuthed(true);
    const savedUser = localStorage.getItem("ama_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("ama_auth");
    localStorage.removeItem("ama_user");
    sessionStorage.removeItem("ama_auth");
    sessionStorage.removeItem("ama_user");
    delete axios.defaults.headers.common["Authorization"];
    setAuthed(false);
    setUser(null);
    setActiveTab("notes");
    setContext("");
  }, []);

  return (
    <div className="app font-sans text-dark-900 bg-dark-50 min-h-screen">
      {!authed ? (
        <Login onLogin={handleLoggedIn} />
      ) : (
        <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} user={user}>
          {/* Notes Processing Tab */}
          <div className={activeTab === "notes" ? "block h-full animate-fade-in" : "hidden"}>
            <div className="max-w-4xl mx-auto pt-8">
              <div className="mb-8 pl-4 border-l-4 border-primary-500">
                <h2 className="text-3xl font-bold text-dark-900">Process Notes</h2>
                <p className="text-dark-500 mt-1">Transform your study materials into easy-to-read guides</p>
              </div>
              <NotesProcessor setContext={setContext} />
            </div>
          </div>

          {/* Live Recording Tab */}
          <div className={activeTab === "liveRecording" ? "block h-full animate-fade-in" : "hidden"}>
            <div className="max-w-4xl mx-auto pt-8">
              <MeetingAssistant setContext={setContext} />
            </div>
          </div>

          {/* Upload Media Tab */}
          <div className={activeTab === "meeting" ? "block h-full animate-fade-in" : "hidden"}>
            <div className="max-w-4xl mx-auto pt-8">
              <MeetingTranscriber setContext={setContext} />
            </div>
          </div>

          {/* Chat Tab */}
          <div className={activeTab === "chat" ? "block h-full animate-fade-in" : "hidden"}>
            <div className="h-full">
              <ChatAssistant context={context} />
            </div>
          </div>

          {/* Study Schedule Tab */}
          <div className={activeTab === "schedule" ? "block h-full animate-fade-in" : "hidden"}>
            <div className="max-w-4xl mx-auto pt-8">
              <StudySchedule />
            </div>
          </div>
        </Layout>
      )}
    </div>
  );
}

export default App;