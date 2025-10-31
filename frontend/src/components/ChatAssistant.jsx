// import { useState, useRef, useEffect } from "react";
// import axios from "axios";

// function ChatAssistant({ context }) {
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [chatHistory, setChatHistory] = useState([]);
//   const [error, setError] = useState(null);
//   const [isTyping, setIsTyping] = useState(false);
//   const chatHistoryRef = useRef(null);
//   const inputRef = useRef(null);

//   useEffect(() => {
//     if (chatHistoryRef.current) {
//       chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
//     }
//   }, [chatHistory, loading]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!message.trim()) return;

//     const userMessage = message;
//     setMessage("");
//     setLoading(true);
//     setError(null);
//     setIsTyping(true);

//     // Add user message to history
//     setChatHistory((prev) => [
//       ...prev,
//       { type: "user", content: userMessage, timestamp: Date.now() },
//     ]);

//     try {
//       // Simulate typing delay
//       await new Promise((resolve) => setTimeout(resolve, 500));

//       const response = await axios.post("/api/chat", {
//         message: userMessage,
//         context: context,
//       });

//       setIsTyping(false);

//       // Add assistant response to history
//       setChatHistory((prev) => [
//         ...prev,
//         {
//           type: "assistant",
//           content: response.data.response,
//           timestamp: Date.now(),
//         },
//       ]);
//     } catch (err) {
//       setIsTyping(false);
//       setError(err.response?.data?.error || "Failed to get response");
//     } finally {
//       setLoading(false);
//       // Focus back to input
//       setTimeout(() => inputRef.current?.focus(), 100);
//     }
//   };

//   const clearChat = () => {
//     setChatHistory([]);
//     setError(null);
//   };

//   const copyToClipboard = (text) => {
//     navigator.clipboard?.writeText(text);
//     // You could add a toast notification here
//   };

//   return (
//     <div className="component">
//       <div className="component-header">
//         <div className="header-content">
//           <h2>💬 Ask Questions</h2>
//           <div className="feature-badge">Smart Chat</div>
//         </div>
//         <p className="description">
//           Have questions about your notes or meetings? Ask here and get clear,
//           ADHD-friendly answers with instant responses tailored to your needs.
//         </p>
//       </div>

//       {context && (
//         <div className="context-indicator modern-context">
//           <div className="context-content">
//             <span className="context-icon">✅</span>
//             <div>
//               <strong>Context Active</strong>
//               <p>Using content from previous tab for better answers</p>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="chat-container modern-chat card">
//         <div className="chat-header">
//           <div className="chat-status">
//             <div className="status-dot"></div>
//             <span>AI Assistant Ready</span>
//           </div>
//           {chatHistory.length > 0 && (
//             <button
//               onClick={clearChat}
//               className="clear-chat-btn"
//               title="Clear chat"
//             >
//               🗑️ Clear
//             </button>
//           )}
//         </div>

//         <div className="chat-history" ref={chatHistoryRef}>
//           {chatHistory.length === 0 ? (
//             <div className="empty-state modern-empty">
//               <div className="empty-icon">💭</div>
//               <h3>Ready to help!</h3>
//               <p>
//                 Ask me anything about your notes, meetings, or study materials.
//               </p>
//               <div className="suggestion-chips">
//                 <button
//                   className="suggestion-chip"
//                   onClick={() => setMessage("Summarize the key points")}
//                 >
//                   Summarize key points
//                 </button>
//                 <button
//                   className="suggestion-chip"
//                   onClick={() => setMessage("Create practice questions")}
//                 >
//                   Create practice questions
//                 </button>
//                 <button
//                   className="suggestion-chip"
//                   onClick={() => setMessage("Explain complex topics")}
//                 >
//                   Explain complex topics
//                 </button>
//               </div>
//             </div>
//           ) : (
//             chatHistory.map((msg, idx) => (
//               <div
//                 key={idx}
//                 className={`chat-message modern-message ${msg.type}`}
//               >
//                 <div className="message-header">
//                   <div className="message-avatar">
//                     {msg.type === "user" ? "👤" : "🤖"}
//                   </div>
//                   <div className="message-info">
//                     <span className="message-sender">
//                       {msg.type === "user" ? "You" : "AI Assistant"}
//                     </span>
//                     <span className="message-time">
//                       {new Date(msg.timestamp).toLocaleTimeString([], {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}
//                     </span>
//                   </div>
//                   {msg.type === "assistant" && (
//                     <button
//                       className="copy-btn"
//                       onClick={() => copyToClipboard(msg.content)}
//                       title="Copy message"
//                     >
//                       📋
//                     </button>
//                   )}
//                 </div>
//                 <div
//                   className="message-content"
//                   dangerouslySetInnerHTML={{
//                     __html: msg.content
//                       .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
//                       .replace(/\n/g, "<br/>")
//                       .replace(/#{3}\s(.*?)$/gm, "<h4>$1</h4>")
//                       .replace(/#{2}\s(.*?)$/gm, "<h3>$1</h3>")
//                       .replace(/#{1}\s(.*?)$/gm, "<h2>$1</h2>"),
//                   }}
//                 />
//               </div>
//             ))
//           )}
//           {(loading || isTyping) && (
//             <div className="chat-message modern-message assistant">
//               <div className="message-header">
//                 <div className="message-avatar">🤖</div>
//                 <div className="message-info">
//                   <span className="message-sender">AI Assistant</span>
//                 </div>
//               </div>
//               <div className="message-content typing-indicator">
//                 <div className="typing-dots">
//                   <span></span>
//                   <span></span>
//                   <span></span>
//                 </div>
//                 <span className="typing-text">Thinking...</span>
//               </div>
//             </div>
//           )}
//         </div>

//         <form onSubmit={handleSubmit} className="chat-form modern-form">
//           <div className="input-wrapper">
//             <textarea
//               ref={inputRef}
//               value={message}
//               onChange={(e) => {
//                 setMessage(e.target.value);
//                 // Auto-resize textarea
//                 const textarea = e.target;
//                 textarea.style.height = "auto";
//                 textarea.style.height =
//                   Math.min(textarea.scrollHeight, 120) + "px";
//               }}
//               placeholder="Ask me anything about your notes... (Shift+Enter for new line)"
//               disabled={loading}
//               className="chat-input modern-input"
//               rows={3}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter" && !e.shiftKey) {
//                   e.preventDefault();
//                   handleSubmit(e);
//                 }
//               }}
//             />
//             <button
//               type="submit"
//               disabled={loading || !message.trim()}
//               className="send-btn"
//               title="Send message (Enter)"
//             >
//               {loading ? <span className="loading-spinner small"></span> : "🚀"}
//             </button>
//           </div>
//         </form>

//         {error && (
//           <div className="error modern-error">
//             <div className="error-content">
//               <span className="error-icon">⚠️</span>
//               <div>
//                 <strong>Something went wrong</strong>
//                 <p>{error}</p>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       <style jsx>{`
//         .component-header {
//           text-align: center;
//           margin-bottom: 2rem;
//         }

//         .header-content {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 1rem;
//           margin-bottom: 1rem;
//         }

//         .feature-badge {
//           background: linear-gradient(135deg, #667eea, #764ba2);
//           color: white;
//           padding: 0.25rem 0.75rem;
//           border-radius: 2rem;
//           font-size: 0.75rem;
//           font-weight: 700;
//           text-transform: uppercase;
//           letter-spacing: 0.05em;
//         }

//         .modern-context {
//           border: none;
//           background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
//           border-radius: 1rem;
//           padding: 1.5rem;
//           margin-bottom: 2rem;
//           box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
//         }

//         .context-content {
//           display: flex;
//           align-items: flex-start;
//           gap: 1rem;
//         }

//         .context-icon {
//           font-size: 1.5rem;
//         }

//         .context-content strong {
//           color: #1e40af;
//           display: block;
//           margin-bottom: 0.25rem;
//           font-weight: 700;
//         }

//         .context-content p {
//           margin: 0;
//           color: #1e40af;
//           opacity: 0.8;
//         }

//         .modern-chat {
//           display: flex;
//           flex-direction: column;
//           height: 650px;
//           width: 100%;
//           max-width: none;
//         }

//         .chat-header {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           padding: 1rem 1.5rem;
//           border-bottom: 1px solid var(--gray-200);
//         }

//         .chat-status {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           font-weight: 600;
//           color: var(--gray-700);
//         }

//         .status-dot {
//           width: 8px;
//           height: 8px;
//           border-radius: 50%;
//           background: var(--success-color);
//           animation: pulse 2s infinite;
//         }

//         .clear-chat-btn {
//           background: var(--gray-100);
//           border: 1px solid var(--gray-300);
//           color: var(--gray-600);
//           padding: 0.5rem 1rem;
//           border-radius: 0.75rem;
//           font-weight: 600;
//           cursor: pointer;
//           transition: all 0.2s ease;
//           font-size: 0.9rem;
//         }

//         .clear-chat-btn:hover {
//           background: var(--gray-200);
//           transform: translateY(-1px);
//         }

//         .modern-empty {
//           flex: 1;
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           padding: 2rem;
//           text-align: center;
//         }

//         .empty-icon {
//           font-size: 4rem;
//           margin-bottom: 1rem;
//           opacity: 0.7;
//         }

//         .modern-empty h3 {
//           color: var(--gray-700);
//           margin-bottom: 0.5rem;
//           font-weight: 700;
//         }

//         .modern-empty p {
//           color: var(--gray-500);
//           margin-bottom: 2rem;
//         }

//         .suggestion-chips {
//           display: flex;
//           flex-wrap: wrap;
//           gap: 0.5rem;
//           justify-content: center;
//         }

//         .suggestion-chip {
//           background: var(--gray-100);
//           border: 1px solid var(--gray-300);
//           color: var(--gray-700);
//           padding: 0.5rem 1rem;
//           border-radius: 2rem;
//           font-size: 0.9rem;
//           font-weight: 500;
//           cursor: pointer;
//           transition: all 0.2s ease;
//         }

//         .suggestion-chip:hover {
//           background: var(--primary-color);
//           color: white;
//           border-color: var(--primary-color);
//           transform: translateY(-1px);
//         }

//         .modern-message {
//           margin-bottom: 1.5rem;
//           animation: messageSlideIn 0.3s ease-out;
//         }

//         .message-header {
//           display: flex;
//           align-items: center;
//           gap: 0.75rem;
//           margin-bottom: 0.5rem;
//         }

//         .message-avatar {
//           width: 32px;
//           height: 32px;
//           border-radius: 50%;
//           background: var(--gray-100);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-size: 1rem;
//         }

//         .message-info {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           flex: 1;
//         }

//         .message-sender {
//           font-weight: 700;
//           color: var(--gray-700);
//           font-size: 0.9rem;
//         }

//         .message-time {
//           font-size: 0.75rem;
//           color: var(--gray-400);
//         }

//         .copy-btn {
//           background: none;
//           border: none;
//           color: var(--gray-400);
//           cursor: pointer;
//           padding: 0.25rem;
//           border-radius: 0.25rem;
//           transition: all 0.2s ease;
//         }

//         .copy-btn:hover {
//           background: var(--gray-100);
//           color: var(--gray-600);
//         }

//         .modern-message.user .message-avatar {
//           background: var(--primary-color);
//           color: white;
//         }

//         .modern-message.assistant .message-avatar {
//           background: var(--gray-200);
//         }

//         .modern-message.user .message-content {
//           background: var(--primary-gradient);
//           color: white;
//           margin-left: 2.75rem;
//           padding: 1rem 1.25rem;
//           border-radius: 1.25rem;
//           border-top-left-radius: 0.25rem;
//           max-width: 80%;
//           align-self: flex-end;
//         }

//         .modern-message.assistant .message-content {
//           background: var(--gray-50);
//           color: var(--gray-700);
//           margin-left: 2.75rem;
//           padding: 1rem 1.25rem;
//           border-radius: 1.25rem;
//           border-top-left-radius: 0.25rem;
//           max-width: 85%;
//           border: 1px solid var(--gray-200);
//         }

//         .typing-indicator {
//           display: flex;
//           align-items: center;
//           gap: 0.75rem;
//         }

//         .typing-dots {
//           display: flex;
//           gap: 0.25rem;
//         }

//         .typing-dots span {
//           width: 8px;
//           height: 8px;
//           border-radius: 50%;
//           background: var(--gray-400);
//           animation: typing 1.4s infinite ease-in-out;
//         }

//         .typing-dots span:nth-child(1) {
//           animation-delay: -0.32s;
//         }

//         .typing-dots span:nth-child(2) {
//           animation-delay: -0.16s;
//         }

//         @keyframes typing {
//           0%,
//           80%,
//           100% {
//             transform: scale(0.8);
//             opacity: 0.5;
//           }
//           40% {
//             transform: scale(1);
//             opacity: 1;
//           }
//         }

//         .typing-text {
//           color: var(--gray-500);
//           font-style: italic;
//         }

//         .modern-form {
//           padding: 1rem 1.5rem;
//           border-top: 1px solid var(--gray-200);
//           width: 100%;
//         }

//         .input-wrapper {
//           display: flex;
//           gap: 0.75rem;
//           align-items: flex-end;
//           width: 100%;
//           max-width: none;
//         }

//         .modern-input {
//           flex: 1;
//           width: 100%;
//           min-width: 0;
//           min-height: 80px;
//           max-height: 120px;
//           resize: none;
//           padding: 1.25rem 1.5rem;
//           border: 2px solid var(--gray-200);
//           border-radius: 1.5rem;
//           transition: all 0.2s ease;
//           font-family: inherit;
//           line-height: 1.6;
//           font-size: 1rem;
//           overflow-y: auto;
//         }

//         .modern-input:focus {
//           border-color: var(--primary-color);
//           box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
//           outline: none;
//         }

//         .send-btn {
//           width: 56px;
//           height: 56px;
//           border-radius: 50%;
//           background: var(--primary-gradient);
//           color: white;
//           border: none;
//           cursor: pointer;
//           transition: all 0.2s ease;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-size: 1.3rem;
//           align-self: flex-end;
//           margin-bottom: 2px;
//         }

//         .send-btn:hover:not(:disabled) {
//           transform: scale(1.05);
//           box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
//         }

//         .send-btn:disabled {
//           opacity: 0.5;
//           cursor: not-allowed;
//           transform: none;
//         }

//         .loading-spinner.small {
//           width: 16px;
//           height: 16px;
//           border: 2px solid transparent;
//           border-top: 2px solid currentColor;
//           border-radius: 50%;
//           animation: spin 1s linear infinite;
//         }

//         @media (max-width: 768px) {
//           .modern-chat {
//             height: 500px;
//           }

//           .suggestion-chips {
//             flex-direction: column;
//           }

//           .suggestion-chip {
//             width: 100%;
//             text-align: center;
//           }

//           .modern-message.user .message-content,
//           .modern-message.assistant .message-content {
//             max-width: 95%;
//             margin-left: 1rem;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

// export default ChatAssistant;
///////





import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Icon from "./Icon";

function ChatAssistant({ context }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [mediaContext, setMediaContext] = useState("");
  const [transcribeContext, setTranscribeContext] = useState("");
  const [notesContext, setNotesContext] = useState("");
  const [activeContextType, setActiveContextType] = useState(null); // 'media', 'transcribe', 'notes', or null for all
  const [loadingContext, setLoadingContext] = useState(true);
  const chatHistoryRef = useRef(null);
  const inputRef = useRef(null);

  // Detect resource type from user message
  const detectResourceType = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // PDF/Notes keywords
    const notesKeywords = ['pdf', 'notes', 'note', 'document', 'text file', 'process notes', 'processed notes'];
    if (notesKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'notes';
    }
    
    // Live recording/transcript keywords
    const liveKeywords = ['live recording', 'live transcript', 'live meeting', 'recording', 'meeting recording', 'real-time'];
    if (liveKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'media';
    }
    
    // YouTube/Video/Upload media keywords
    const youtubeKeywords = ['youtube', 'video', 'upload media', 'youtube video', 'video upload'];
    if (youtubeKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'media';
    }
    
    // Audio/Transcribe keywords
    const transcribeKeywords = ['audio', 'transcribe', 'transcription', 'audio file', 'audio upload'];
    if (transcribeKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'transcribe';
    }
    
    return null; // No specific resource mentioned, use all
  };

  // Fetch context from database
  const fetchContextFromDB = async () => {
    try {
      setLoadingContext(true);
      // Fetch media results (for analysis) - includes live transcript and youtube upload
      const mediaResponse = await axios.get("/api/results?type=media");
      // Fetch transcribe results (for analysis) - audio file uploads
      const transcribeResponse = await axios.get("/api/results?type=transcribe");
      // Fetch notes results (for processed) - PDF and text file processing
      const notesResponse = await axios.get("/api/results?type=notes");
      
      // Extract analysis from media results (live transcript, youtube videos)
      let mediaContexts = "";
      if (mediaResponse.data.success && mediaResponse.data.results) {
        const contexts = mediaResponse.data.results
          .filter(result => result.content?.analysis)
          .map(result => `[Media Analysis]\n${result.content.analysis}`)
          .slice(0, 3); // Limit to most recent 3
        if (contexts.length > 0) {
          mediaContexts = contexts.join("\n\n---\n\n");
        }
      }
      setMediaContext(mediaContexts);
      
      // Extract analysis from transcribe results (audio file uploads)
      let transcribeContexts = "";
      if (transcribeResponse.data.success && transcribeResponse.data.results) {
        const contexts = transcribeResponse.data.results
          .filter(result => result.content?.analysis)
          .map(result => `[Audio Transcription Analysis]\n${result.content.analysis}`)
          .slice(0, 3); // Limit to most recent 3
        if (contexts.length > 0) {
          transcribeContexts = contexts.join("\n\n---\n\n");
        }
      }
      setTranscribeContext(transcribeContexts);
      
      // Extract processed from notes results (PDF/text processing)
      let notesContexts = "";
      if (notesResponse.data.success && notesResponse.data.results) {
        const contexts = notesResponse.data.results
          .filter(result => result.content?.processed)
          .map(result => `[Processed Notes]\n${result.content.processed}`)
          .slice(0, 3); // Limit to most recent 3
        if (contexts.length > 0) {
          notesContexts = contexts.join("\n\n---\n\n");
        }
      }
      setNotesContext(notesContexts);
    } catch (err) {
      console.error("Error fetching context from DB:", err);
      setMediaContext("");
      setTranscribeContext("");
      setNotesContext("");
    } finally {
      setLoadingContext(false);
    }
  };

  useEffect(() => {
    fetchContextFromDB();
  }, []);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message;
    setMessage("");
    setLoading(true);
    setError(null);
    setIsTyping(true);

    // Add user message to history
    setChatHistory((prev) => [
      ...prev,
      { type: "user", content: userMessage, timestamp: Date.now() },
    ]);

    try {
      // Simulate typing delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Detect if user mentioned a specific resource type
      const detectedType = detectResourceType(userMessage);
      setActiveContextType(detectedType);

      // Filter context based on detected resource type
      let filteredContext = [];
      
      // Always include prop context (from current tab)
      if (context) {
        filteredContext.push(context);
      }
      
      // Add context based on detected resource type
      if (detectedType === 'notes') {
        if (notesContext) filteredContext.push(notesContext);
      } else if (detectedType === 'media') {
        if (mediaContext) filteredContext.push(mediaContext);
      } else if (detectedType === 'transcribe') {
        if (transcribeContext) filteredContext.push(transcribeContext);
      } else {
        // No specific resource mentioned, use all available context
        if (notesContext) filteredContext.push(notesContext);
        if (mediaContext) filteredContext.push(mediaContext);
        if (transcribeContext) filteredContext.push(transcribeContext);
      }

      const combinedContext = filteredContext.join("\n\n---\n\n");

      const response = await axios.post("/api/chat", {
        message: userMessage,
        context: combinedContext || undefined,
      });

      setIsTyping(false);

      // Add assistant response to history
      setChatHistory((prev) => [
        ...prev,
        {
          type: "assistant",
          content: response.data.response,
          timestamp: Date.now(),
        },
      ]);
      
      // Reset active context type after response for next question
      setActiveContextType(null);
    } catch (err) {
      setIsTyping(false);
      setError(err.response?.data?.error || "Failed to get response");
      setActiveContextType(null);
    } finally {
      setLoading(false);
      // Focus back to input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const clearChat = () => {
    setChatHistory([]);
    setError(null);
    setActiveContextType(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
  };

  return (
    <div className="component">
      <div className="component-header">
        <div className="header-content">
          <h2>Ask Questions</h2>
          <div className="feature-badge">Smart Chat</div>
        </div>
        <p className="description">
          Have questions about your notes or meetings? Ask here and get clear,
          ADHD-friendly answers with instant responses tailored to your needs.
        </p>
      </div>

      {(context || mediaContext || transcribeContext || notesContext) && (
        <div className="context-indicator modern-context">
          <div className="context-content">
            <span className="context-icon">
              <Icon name="check-circle" />
            </span>
            <div style={{ flex: 1 }}>
              <strong>Context Active</strong>
              <p>
                {loadingContext 
                  ? "Loading context from database..." 
                  : activeContextType 
                    ? `Using ${activeContextType === 'notes' ? 'PDF/Notes' : activeContextType === 'media' ? 'YouTube/Live Recording' : 'Audio Transcription'} context only`
                    : context 
                      ? "Using content from previous tab for better answers"
                      : "Using stored results from all resources"}
              </p>
            </div>
            {!loadingContext && (
              <button
                onClick={() => {
                  fetchContextFromDB();
                  setActiveContextType(null);
                }}
                className="refresh-context-btn"
                title="Refresh context from database"
                style={{
                  background: "rgba(255, 255, 255, 0.5)",
                  border: "none",
                  borderRadius: "0.5rem",
                  padding: "0.5rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="refresh-cw" size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="chat-container modern-chat card">
        <div className="chat-header">
          <div className="chat-status">
            <div className="status-dot"></div>
            <span>AI Assistant Ready</span>
          </div>
          {chatHistory.length > 0 && (
            <button
              onClick={clearChat}
              className="clear-chat-btn"
              title="Clear chat"
            >
              Clear
            </button>
          )}
        </div>

        <div className="chat-history" ref={chatHistoryRef}>
          {chatHistory.length === 0 ? (
            <div className="empty-state modern-empty">
              <div className="empty-icon">
                <Icon name="message-circle" size={48} />
              </div>
              <h3>Ready to help!</h3>
              <p>
                Ask me anything about your notes, meetings, or study materials.
                <br />
                <small style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>
                  💡 Tip: Mention "PDF", "youtube", "live recording", or "audio" to get answers from specific resources only.
                </small>
              </p>
              <div className="suggestion-chips">
                <button
                  className="suggestion-chip"
                  onClick={() => setMessage("Summarize the key points")}
                >
                  Summarize key points
                </button>
                <button
                  className="suggestion-chip"
                  onClick={() => setMessage("Create practice questions from my PDF notes")}
                >
                  Questions from PDF
                </button>
                <button
                  className="suggestion-chip"
                  onClick={() => setMessage("Explain complex topics from the live recording")}
                >
                  Explain from recording
                </button>
              </div>
            </div>
          ) : (
            chatHistory.map((msg, idx) => (
              <div
                key={msg.timestamp || idx} // Use timestamp for stable key
                className={`chat-message modern-message ${msg.type}`}
              >
                <div className="message-header">
                  <div className="message-avatar">
                    {msg.type === "user" ? (
                      <Icon name="user" />
                    ) : (
                      <Icon name="bot" />
                    )}
                  </div>
                  <div className="message-info">
                    <span className="message-sender">
                      {msg.type === "user" ? "You" : "AI Assistant"}
                    </span>
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {msg.type === "assistant" && (
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(msg.content)}
                      title="Copy message"
                    >
                      <Icon name="copy" />
                    </button>
                  )}
                </div>
                <div
                  className="message-content"
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\\(.?)\\*/g, "<strong>$1</strong>")
                      .replace(/\n/g, "<br/>")
                      .replace(/#{3}\s(.*?)$/gm, "<h4>$1</h4>")
                      .replace(/#{2}\s(.*?)$/gm, "<h3>$1</h3>")
                      .replace(/#{1}\s(.*?)$/gm, "<h2>$1</h2>"),
                  }}
                />
              </div>
            ))
          )}
          {(loading || isTyping) && (
            <div className="chat-message modern-message assistant">
              <div className="message-header">
                <div className="message-avatar">
                  <Icon name="bot" />
                </div>
                <div className="message-info">
                  <span className="message-sender">AI Assistant</span>
                </div>
              </div>
              <div className="message-content typing-indicator">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="typing-text">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="chat-form modern-form">
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                // Auto-resize textarea
                const textarea = e.target;
                textarea.style.height = "auto";
                textarea.style.height =
                  Math.min(textarea.scrollHeight, 120) + "px";
              }}
              placeholder="Ask me anything about your notes... (Shift+Enter for new line)"
              disabled={loading}
              className="chat-input modern-input"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="send-btn"
              title="Send message (Enter)"
            >
              {loading ? (
                <span className="loading-spinner small"></span>
              ) : (
                <Icon name="send" />
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="error modern-error">
            <div className="error-content">
              <span className="error-icon">
                <Icon name="warning" />
              </span>
              <div>
                <strong>Something went wrong</strong>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .component-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .feature-badge {
          background: linear-gradient(135deg, #0ea5e9, #06b6d4);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .modern-context {
          border: none;
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }

        .context-content {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .context-icon {
          font-size: 1.5rem;
        }

        .context-content strong {
          color: #1e40af;
          display: block;
          margin-bottom: 0.25rem;
          font-weight: 700;
        }

        .context-content p {
          margin: 0;
          color: #1e40af;
          opacity: 0.8;
        }

        .modern-chat {
          display: flex;
          flex-direction: column;
          height: 650px;
          width: 100%;
          max-width: none;
        }

        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--gray-200);
        }

        .chat-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: var(--gray-700);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--success-color);
          animation: pulse 2s infinite;
        }

        .clear-chat-btn {
          background: var(--gray-100);
          border: 1px solid var(--gray-300);
          color: var(--gray-600);
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }

        .clear-chat-btn:hover {
          background: var(--gray-200);
          transform: translateY(-1px);
        }

        .modern-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.7;
        }

        .modern-empty h3 {
          color: var(--gray-700);
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .modern-empty p {
          color: var(--gray-500);
          margin-bottom: 2rem;
        }

        .suggestion-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
        }

        .suggestion-chip {
          background: var(--gray-100);
          border: 1px solid var(--gray-300);
          color: var(--gray-700);
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .suggestion-chip:hover {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
          transform: translateY(-1px);
        }

        .modern-message {
          margin-bottom: 1.5rem;
          animation: messageSlideIn 0.3s ease-out;
        }

        .message-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--gray-100);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }

        .message-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
        }

        .message-sender {
          font-weight: 700;
          color: var(--gray-700);
          font-size: 0.9rem;
        }

        .message-time {
          font-size: 0.75rem;
          color: var(--gray-400);
        }

        .copy-btn {
          background: none;
          border: none;
          color: var(--gray-400);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 0.25rem;
          transition: all 0.2s ease;
        }

        .copy-btn:hover {
          background: var(--gray-100);
          color: var(--gray-600);
        }

        .modern-message.user .message-avatar {
          background: var(--primary-color);
          color: white;
        }

        .modern-message.assistant .message-avatar {
          background: var(--gray-200);
        }

        .modern-message.user .message-content {
          background: var(--primary-gradient);
          color: white;
          margin-left: 2.75rem;
          padding: 1rem 1.25rem;
          border-radius: 1.25rem;
          border-top-left-radius: 0.25rem;
          max-width: 80%;
          align-self: flex-end;
        }

        .modern-message.assistant .message-content {
          background: var(--gray-50);
          color: var(--gray-700);
          margin-left: 2.75rem;
          padding: 1rem 1.25rem;
          border-radius: 1.25rem;
          border-top-left-radius: 0.25rem;
          max-width: 85%;
          border: 1px solid var(--gray-200);
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .typing-dots {
          display: flex;
          gap: 0.25rem;
        }

        .typing-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--gray-400);
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-dots span:nth-child(1) {
          animation-delay: -0.32s;
        }

        .typing-dots span:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes typing {
          0%,
          80%,
          100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .typing-text {
          color: var(--gray-500);
          font-style: italic;
        }

        .modern-form {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--gray-200);
          width: 100%;
        }

        .input-wrapper {
          display: flex;
          gap: 0.75rem;
          align-items: flex-end;
          width: 100%;
          max-width: none;
        }

        .modern-input {
          flex: 1;
          width: 100%;
          min-width: 0;
          min-height: 80px;
          max-height: 120px;
          resize: none;
          padding: 1.25rem 1.5rem;
          border: 2px solid var(--gray-200);
          border-radius: 1.5rem;
          transition: all 0.2s ease;
          font-family: inherit;
          line-height: 1.6;
          font-size: 1rem;
          overflow-y: auto;
        }

        .modern-input:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          outline: none;
        }

        .send-btn {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--primary-gradient);
          color: white;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          align-self: flex-end;
          margin-bottom: 2px;
        }

        .send-btn:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner.small {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes messageSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .modern-chat {
            height: 500px;
          }

          .suggestion-chips {
            flex-direction: column;
          }

          .suggestion-chip {
            width: 100%;
            text-align: center;
          }

          .modern-message.user .message-content,
          .modern-message.assistant .message-content {
            max-width: 95%;
            margin-left: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

export default ChatAssistant;