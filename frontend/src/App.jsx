// import { useState, useCallback, useEffect } from "react";
// import axios from "axios";
// import "./App.css";
// import NotesProcessor from "./components/NotesProcessor";
// import MeetingAssistant from "./components/MeetingAssistant";
// import MeetingTranscriber from "./components/MeetingTranscriber";
// import ChatAssistant from "./components/ChatAssistant";
// import StudySchedule from "./components/StudySchedule";
// import Login from "./components/Login";

// function App() {
//   const [activeTab, setActiveTab] = useState("notes");
//   const [context, setContext] = useState("");
//   const [authed, setAuthed] = useState(
//     () => !!localStorage.getItem("ama_auth"),
//   );

//   // Configure axios on mount and whenever auth token changes
//   useEffect(() => {
//     const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
//     axios.defaults.baseURL = baseURL;
//     const token = localStorage.getItem("ama_auth") || sessionStorage.getItem("ama_auth");
//     if (token) {
//       axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//     } else {
//       delete axios.defaults.headers.common["Authorization"];
//     }
//   }, [authed]);

//   // Persist active tab across reloads and restore on mount
//   useEffect(() => {
//     const savedTab = localStorage.getItem("ama_active_tab");
//     if (savedTab) setActiveTab(savedTab);
//   }, []);
//   useEffect(() => {
//     localStorage.setItem("ama_active_tab", activeTab);
//   }, [activeTab]);

//   const handleLoggedIn = useCallback(() => {
//     setAuthed(true);
//   }, []);

//   const handleLogout = useCallback(() => {
//     localStorage.removeItem("ama_auth");
//     sessionStorage.removeItem("ama_auth");
//     delete axios.defaults.headers.common["Authorization"];
//     setAuthed(false);
//     setActiveTab("notes");
//     setContext("");
//   }, []);

//   return (
//     <div className="app">
//       {!authed ? (
//         <Login onLogin={handleLoggedIn} />
//       ) : (
//         <>
//           <header className="header">
//             <div className="header-content">
//               <div className="header-text">
//                 <h1>🎯 ADHD Meeting Assistant</h1>
//                 <p className="tagline">
//                   Focus-friendly tools for students with ADHD/Autism
//                 </p>
//               </div>
//               <button
//                 onClick={handleLogout}
//                 className="logout-btn"
//                 title="Logout"
//               >
//                 👋 Logout
//               </button>
//             </div>
//           </header>

//           <nav className="tabs">
//             <button
//               className={activeTab === "notes" ? "tab active" : "tab"}
//               onClick={() => setActiveTab("notes")}
//             >
//               📝 Process Notes
//             </button>
//             <button
//               className={activeTab === "liveRecording" ? "tab active" : "tab"}
//               onClick={() => setActiveTab("liveRecording")}
//             >
//               🎙️ Live Recording
//             </button>
//             <button
//               className={activeTab === "meeting" ? "tab active" : "tab"}
//               onClick={() => setActiveTab("meeting")}
//             >
//               🎥 Upload Media
//             </button>
//             <button
//               className={activeTab === "chat" ? "tab active" : "tab"}
//               onClick={() => setActiveTab("chat")}
//             >
//               💬 Ask Questions
//             </button>
//             <button
//               className={activeTab === "schedule" ? "tab active" : "tab"}
//               onClick={() => setActiveTab("schedule")}
//             >
//               📅 Study Schedule
//             </button>
//           </nav>

//           <main className="content">
//             <div style={{ display: activeTab === "notes" ? "block" : "none" }}>
//               <NotesProcessor setContext={setContext} />
//             </div>
//             <div style={{ display: activeTab === "liveRecording" ? "block" : "none" }}>
//               <MeetingAssistant setContext={setContext} />
//             </div>
//             <div style={{ display: activeTab === "meeting" ? "block" : "none" }}>
//               <MeetingTranscriber setContext={setContext} />
//             </div>
//             <div style={{ display: activeTab === "chat" ? "block" : "none" }}>
//               <ChatAssistant context={context} />
//             </div>
//             <div style={{ display: activeTab === "schedule" ? "block" : "none" }}>
//               <StudySchedule />
//             </div>
//           </main>
//         </>
//       )}
//     </div>
//   );
// }

// export default App;
/////
////
////



import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import "./App.css";
import NotesProcessor from "./components/NotesProcessor";
import MeetingAssistant from "./components/MeetingAssistant";
import MeetingTranscriber from "./components/MeetingTranscriber";
import ChatAssistant from "./components/ChatAssistant";
import StudySchedule from "./components/StudySchedule";
import Login from "./components/Login";
import Icon from "./components/Icon";

function App() {
  const [activeTab, setActiveTab] = useState("notes");
  const [context, setContext] = useState("");
  const [authed, setAuthed] = useState(
    () => !!localStorage.getItem("ama_auth"),
  );

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
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("ama_auth");
    sessionStorage.removeItem("ama_auth");
    delete axios.defaults.headers.common["Authorization"];
    setAuthed(false);
    setActiveTab("notes");
    setContext("");
  }, []);

  return (
    <div className="app">
      {!authed ? (
        <Login onLogin={handleLoggedIn} />
      ) : (
        <>
          <header className="header">
            <div className="header-content">
              <div className="header-text">
                <h1>ADHD Meeting Assistant</h1>
                <p className="tagline">
                  Focus-friendly tools for students with ADHD/Autism
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="logout-btn"
                title="Logout"
              >
                Logout
              </button>
            </div>
          </header>

          <nav className="tabs">
            <button
              className={activeTab === "notes" ? "tab active" : "tab"}
              onClick={() => setActiveTab("notes")}
            >
              <span style={{marginRight:8}}><Icon name="file" size={18} /></span>
              Process Notes
            </button>
            <button
              className={activeTab === "liveRecording" ? "tab active" : "tab"}
              onClick={() => setActiveTab("liveRecording")}
            >
              <span style={{marginRight:8}}><Icon name="record-dot" size={14} /></span>
              Live Recording
            </button>
            <button
              className={activeTab === "meeting" ? "tab active" : "tab"}
              onClick={() => setActiveTab("meeting")}
            >
              <span style={{marginRight:8}}><Icon name="video" size={16} /></span>
              Upload Media
            </button>
            <button
              className={activeTab === "chat" ? "tab active" : "tab"}
              onClick={() => setActiveTab("chat")}
            >
              <span style={{marginRight:8}}><Icon name="message-circle" size={16} /></span>
              Ask Questions
            </button>
            <button
              className={activeTab === "schedule" ? "tab active" : "tab"}
              onClick={() => setActiveTab("schedule")}
            >
              <span style={{marginRight:8}}><Icon name="calendar" size={16} /></span>
              Study Schedule
            </button>
          </nav>

          <main className="content">
            <div style={{ display: activeTab === "notes" ? "block" : "none" }}>
              <NotesProcessor setContext={setContext} />
            </div>
            <div style={{ display: activeTab === "liveRecording" ? "block" : "none" }}>
              <MeetingAssistant setContext={setContext} />
            </div>
            <div style={{ display: activeTab === "meeting" ? "block" : "none" }}>
              <MeetingTranscriber setContext={setContext} />
            </div>
            <div style={{ display: activeTab === "chat" ? "block" : "none" }}>
              <ChatAssistant context={context} />
            </div>
            <div style={{ display: activeTab === "schedule" ? "block" : "none" }}>
              <StudySchedule />
            </div>
          </main>
        </>
      )}
    </div>
  );
}

export default App;