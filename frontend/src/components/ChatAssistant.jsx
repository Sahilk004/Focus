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
  }, [chatHistory, loading, isTyping]);

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
    <div className="h-full flex flex-col space-y-6">
      <div className="text-center px-4">
        <div className="flex items-center justify-center gap-3 mb-3">
          <h2 className="text-2xl font-bold text-dark-900">Ask Questions</h2>
          <div className="px-3 py-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
            Smart Chat
          </div>
        </div>
        <p className="text-dark-500 max-w-lg mx-auto">
          Have questions about your notes or meetings? Ask here and get clear,
          ADHD-friendly answers with instant responses tailored to your needs.
        </p>
      </div>

      {(context || mediaContext || transcribeContext || notesContext) && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 shadow-sm animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Icon name="check-circle" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-blue-900 mb-1">Context Active</h4>
              <p className="text-sm text-blue-800/80 leading-relaxed">
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
                className="p-2 bg-white/50 hover:bg-white text-blue-700 rounded-lg transition-colors border border-blue-100 shadow-sm"
                title="Refresh context from database"
              >
                <Icon name="refresh-cw" size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Chat Container */}
      <div className="flex-1 min-h-0 bg-white rounded-3xl border border-dark-100 shadow-sm flex flex-col overflow-hidden relative">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-dark-50 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-success-500 animate-pulse" />
            <span className="font-semibold text-dark-700 text-sm">AI Assistant Ready</span>
          </div>
          {chatHistory.length > 0 && (
            <button
              onClick={clearChat}
              className="px-3 py-1.5 text-xs font-semibold text-dark-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Clear Chat
            </button>
          )}
        </div>

        {/* Chat Messages */}
        <div
          className="flex-1 overflow-y-auto p-8 space-y-8 bg-dark-50/30 scroll-smooth"
          ref={chatHistoryRef}
        >
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-fade-in">
              <div className="w-20 h-20 bg-primary-50 text-primary-500 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                <Icon name="message-circle" size={40} />
              </div>
              <h3 className="text-xl font-bold text-dark-900 mb-2">Ready to help!</h3>
              <p className="text-dark-500 max-w-md mb-8">
                Ask me anything about your notes, meetings, or study materials.
                <br />
                <span className="text-xs text-dark-400 mt-2 block">
                  💡 Tip: Mention "PDF", "youtube", "live recording", or "audio" to get answers from specific resources only.
                </span>
              </p>

              <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                <button
                  className="px-4 py-2 bg-white border border-dark-200 hover:border-primary-300 hover:text-primary-600 rounded-full text-sm font-medium text-dark-600 transition-all shadow-sm hover:shadow-md"
                  onClick={() => setMessage("Summarize the key points")}
                >
                  Summarize key points
                </button>
                <button
                  className="px-4 py-2 bg-white border border-dark-200 hover:border-primary-300 hover:text-primary-600 rounded-full text-sm font-medium text-dark-600 transition-all shadow-sm hover:shadow-md"
                  onClick={() => setMessage("Create practice questions from my PDF notes")}
                >
                  Questions from PDF
                </button>
                <button
                  className="px-4 py-2 bg-white border border-dark-200 hover:border-primary-300 hover:text-primary-600 rounded-full text-sm font-medium text-dark-600 transition-all shadow-sm hover:shadow-md"
                  onClick={() => setMessage("Explain complex topics from the live recording")}
                >
                  Explain from recording
                </button>
              </div>
            </div>
          ) : (
            chatHistory.map((msg, idx) => (
              <div
                key={msg.timestamp || idx}
                className={`flex flex-col gap-2 ${msg.type === 'user' ? 'items-end' : 'items-start'} animate-slide-up`}
              >
                <div className={`flex items-center gap-2 px-2 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${msg.type === 'user' ? 'bg-primary-600 text-white' : 'bg-white text-dark-600 border border-dark-200'
                    }`}>
                    <Icon name={msg.type === 'user' ? 'user' : 'bot'} size={16} />
                  </div>
                  <span className="text-xs font-semibold text-dark-500">
                    {msg.type === "user" ? "You" : "AI Assistant"}
                  </span>
                  <span className="text-[10px] text-dark-400">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {msg.type === "assistant" && (
                    <button
                      className="p-1 text-dark-300 hover:text-primary-500 transition-colors"
                      onClick={() => copyToClipboard(msg.content)}
                      title="Copy message"
                    >
                      <Icon name="copy" size={12} />
                    </button>
                  )}
                </div>

                <div
                  className={`relative max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.type === 'user'
                    ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-tr-sm'
                    : 'bg-white border border-dark-100 text-dark-800 rounded-tl-sm prose prose-sm max-w-none prose-p:my-1 prose-headings:text-dark-900 prose-headings:font-bold prose-headings:my-2 prose-strong:text-dark-900 prose-ul:my-2 prose-li:my-0.5'
                    }`}
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
            <div className="flex flex-col items-start gap-2 animate-fade-in">
              <div className="flex items-center gap-2 px-2">
                <div className="w-8 h-8 rounded-full bg-white text-dark-600 border border-dark-200 flex items-center justify-center shadow-sm">
                  <Icon name="bot" size={16} />
                </div>
                <span className="text-xs font-semibold text-dark-500">AI Assistant</span>
              </div>
              <div className="ml-2 px-4 py-3 bg-white border border-dark-100 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.32s]"></div>
                <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.16s]"></div>
                <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce"></div>
                <span className="text-xs text-dark-400 ml-2 font-medium">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-dark-100">
          <form onSubmit={handleSubmit} className="relative flex items-end gap-3 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  // Auto-resize textarea
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                placeholder="Ask me anything about your notes... (Shift+Enter for new line)"
                disabled={loading}
                rows={1}
                className="w-full pl-5 pr-5 py-3.5 bg-dark-50 border border-dark-200 rounded-2xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none min-h-[52px] max-h-[120px] text-dark-800 placeholder-dark-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="w-[52px] h-[52px] flex items-center justify-center bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
              title="Send message (Enter)"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Icon name="send" size={20} className="ml-0.5" />
              )}
            </button>
          </form>
          {error && (
            <div className="absolute bottom-full left-0 right-0 mb-2 px-6">
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm border border-red-100 flex items-center gap-2 animate-slide-up shadow-sm">
                <Icon name="alert-triangle" size={16} />
                {error}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatAssistant;