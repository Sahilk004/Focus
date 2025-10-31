import { useState, useRef } from "react";
import axios from "axios";

function MeetingAssistant({ setContext }) {
  const [recordingType, setRecordingType] = useState("audio");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [summary, setSummary] = useState("");
  const [followupQuestion, setFollowupQuestion] = useState("");
  const [followupAnswer, setFollowupAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const intervalRef = useRef(null);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      const constraints =
        recordingType === "video" ? { video: true, audio: true } : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recordingType === "video" ? "video/webm" : "audio/webm",
        });
        setRecordedBlob(blob);
        streamRef.current?.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      intervalRef.current = setInterval(
        () => setRecordingTime((prev) => prev + 1),
        1000
      );
    } catch (err) {
      setError("Could not access camera/microphone: " + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(intervalRef.current);
    }
  };

  const handleTranscribe = async () => {
    if (!recordedBlob) return setError("No recording available.");

    setLoading(true);
    setError(null);
    const formData = new FormData();
    const fileName = `live_recording_${Date.now()}.webm`;
    formData.append("media", recordedBlob, fileName);

    try {
      const { data } = await axios.post("/api/transcribe-media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setTranscription(data.transcript || data.processed || "Transcription done");
      setSummary(data.analysis || data.summary || "Summary complete");
      const contextContent =
        data.transcript +
        (data.analysis ? "\n\n" + data.analysis : "") ||
        data.processed;
      setContext(contextContent);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to transcribe.");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowup = async (e) => {
    e.preventDefault();
    if (!followupQuestion.trim()) return;
    setLoading(true);
    try {
      const context = `Transcript: ${transcription}\n\nSummary: ${summary}`;
      const { data } = await axios.post("/api/chat", {
        message: followupQuestion,
        context,
      });
      setFollowupAnswer(data.response);
      setFollowupQuestion("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to get answer");
    } finally {
      setLoading(false);
    }
  };

  const clearRecording = () => {
    setRecordedBlob(null);
    setRecordingTime(0);
    setTranscription("");
    setSummary("");
    setFollowupAnswer("");
    setError(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // JSX and CSS unchanged from your version except for string fixups
  // You can keep your JSX and <style jsx> part as is
  return (
  <div className="component">
    <div className="component-header">
      <div className="header-content">
        <h2>🎤 Live Meeting Recording</h2>
        <div className="feature-badge">Real-Time</div>
      </div>
      <p className="description">
        Record meetings, lectures, or conversations in real-time and get
        instant AI-powered transcriptions with smart summaries.
      </p>
    </div>

    <div className="meeting-section card">
      {/* Recording Type Selector */}
      <div className="recording-type-selector">
        <button
          type="button"
          className={`recording-type-btn ${
            recordingType === "video" ? "active" : ""
          }`}
          onClick={() => setRecordingType("video")}
          disabled={isRecording}
        >
          🎬 Video + Audio
        </button>
        <button
          type="button"
          className={`recording-type-btn ${
            recordingType === "audio" ? "active" : ""
          }`}
          onClick={() => setRecordingType("audio")}
          disabled={isRecording}
        >
          🎵 Audio Only
        </button>
      </div>

      {/* Recording Controls */}
      <div className="recording-controls">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="record-btn start"
            disabled={loading}
          >
            <span className="record-icon">🔴</span>
            Start Live Recording
          </button>
        ) : (
          <div className="recording-active">
            <div className="recording-status">
              <div className="recording-indicator pulsing">🔴 LIVE RECORDING</div>
              <div className="recording-timer">
                <span className="timer-icon">⏱</span>
                {formatTime(recordingTime)}
              </div>
            </div>
            <button onClick={stopRecording} className="record-btn stop">
              <span className="record-icon">⏹</span>
              Stop Recording
            </button>
          </div>
        )}

        {recordedBlob && !isRecording && (
          <div className="recording-complete-section">
            <div className="recording-preview">
              <div className="preview-info">
                <div className="preview-icon">
                  {recordingType === "video" ? "🎬" : "🎵"}
                </div>
                <div className="preview-details">
                  <h4>Recording Complete</h4>
                  <p>
                    {recordingType === "video" ? "Video" : "Audio"} •{" "}
                    {formatFileSize(recordedBlob.size)} •{" "}
                    {formatTime(recordingTime)} duration
                  </p>
                </div>
              </div>
              <div className="preview-actions">
                <button
                  onClick={handleTranscribe}
                  className="transcribe-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner small"></span>
                      Transcribing...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">✨</span>
                      Transcribe & Analyze
                    </>
                  )}
                </button>
                <button
                  onClick={clearRecording}
                  className="clear-btn"
                  disabled={loading}
                >
                  🗑
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="recording-help">
        {recordingType === "video"
          ? "Record meetings with full video and audio for comprehensive analysis"
          : "Record audio-only meetings for faster processing and smaller file sizes"}
      </p>
    </div>

    {error && (
      <div className="error modern-error">
        <div className="error-content">
          <span className="error-icon">⚠</span>
          <div>
            <h4>Something went wrong</h4>
            <p>{error}</p>
          </div>
        </div>
      </div>
    )}

    {/* Transcription Results */}
    {transcription && (
      <div className="result modern-result card">
        <div className="result-header">
          <h3>✅ Meeting Analysis Complete!</h3>
          <div className="result-actions">
            <button
              className="action-btn copy-btn"
              onClick={() =>
                navigator.clipboard?.writeText(
                  transcription + "\n\n" + summary
                )
              }
            >
              📋 Copy All
            </button>
            <button
              className="action-btn download-btn"
              onClick={() => {
                const content = transcription
                  ? `Meeting Transcript:\n${transcription}\n\n${
                      summary ? `AI Summary:\n${summary}` : ""
                    }`
                  : "Meeting content processed successfully";
                const blob = new Blob([content], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `meeting-${Date.now()}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              💾 Download
            </button>
          </div>
        </div>

        <div className="sections">
          {transcription && (
            <div className="section">
              <h3>📝 Transcription</h3>
              <div className="result-content transcript">{transcription}</div>
            </div>
          )}

          {summary && (
            <div className="section">
              <h3>✨ AI Summary</h3>
              <div
                className="result-content"
                dangerouslySetInnerHTML={{
                  __html: summary
                    .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
                    .replace(/\n/g, "<br/>"),
                }}
              />
            </div>
          )}

          {/* Follow-up Q&A */}
          <div className="section">
            <h3>💬 Ask Follow-up Questions</h3>
            <form onSubmit={handleFollowup} className="followup-form">
              <div className="followup-input-wrapper">
                <input
                  type="text"
                  value={followupQuestion}
                  onChange={(e) => setFollowupQuestion(e.target.value)}
                  placeholder="Ask a question about this meeting..."
                  disabled={loading}
                  className="followup-input"
                />
                <button
                  type="submit"
                  disabled={loading || !followupQuestion.trim()}
                  className="followup-send-btn"
                >
                  {loading ? (
                    <span className="loading-spinner small"></span>
                  ) : (
                    "🚀"
                  )}
                </button>
              </div>
            </form>

            {followupAnswer && (
              <div className="followup-answer">
                <h4>💡 Answer:</h4>
                <div
                  dangerouslySetInnerHTML={{
                    __html: followupAnswer
                      .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
                      .replace(/\n/g, "<br/>"),
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    )}

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
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .meeting-section {
          margin-bottom: 2rem;
        }

        .recording-type-selector {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          margin-bottom: 2rem;
          padding: 0.25rem;
          background: var(--gray-50);
          border-radius: 0.75rem;
          width: fit-content;
          margin-left: auto;
          margin-right: auto;
        }

        .recording-type-btn {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: none;
          background: transparent;
          color: var(--gray-500);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }

        .recording-type-btn.active {
          background: white;
          color: var(--primary-color);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .recording-type-btn:hover:not(.active):not(:disabled) {
          color: var(--primary-color);
          background: rgba(102, 126, 234, 0.05);
        }

        .recording-type-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .recording-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .record-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.25rem 2.5rem;
          border: none;
          border-radius: 2rem;
          font-size: 1.2rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .record-btn.start {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }

        .record-btn.start:hover:not(:disabled) {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
        }

        .record-btn.stop {
          background: linear-gradient(135deg, #6b7280, #4b5563);
          color: white;
        }

        .record-btn.stop:hover {
          background: linear-gradient(135deg, #4b5563, #374151);
          transform: translateY(-2px);
        }

        .record-icon {
          font-size: 1.3rem;
        }

        .recording-active {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          width: 100%;
        }

        .recording-status {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .recording-indicator {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          padding: 1rem 2rem;
          border-radius: 2rem;
          font-weight: 700;
          font-size: 1.1rem;
          letter-spacing: 0.05em;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .recording-indicator.pulsing {
          animation: pulse 1.5s infinite;
        }

        .recording-timer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--warning-color);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 1.5rem;
          font-weight: 600;
          font-size: 1.2rem;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }

        .timer-icon {
          font-size: 1.1rem;
        }

        .recording-complete-section {
          width: 100%;
          max-width: 600px;
        }

        .recording-preview {
          background: white;
          padding: 1.5rem;
          border-radius: 1.5rem;
          border: 2px solid var(--success-color);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.15);
        }

        .preview-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .preview-icon {
          font-size: 2.5rem;
        }

        .preview-details h4 {
          margin: 0;
          color: var(--gray-800);
          font-weight: 700;
          font-size: 1.1rem;
        }

        .preview-details p {
          margin: 0.25rem 0 0 0;
          color: var(--gray-600);
          font-size: 0.9rem;
        }

        .preview-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .transcribe-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: var(--primary-gradient);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .transcribe-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }

        .transcribe-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .clear-btn {
          background: var(--danger-color);
          color: white;
          border: none;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 1rem;
        }

        .clear-btn:hover:not(:disabled) {
          background: #dc2626;
          transform: scale(1.1);
        }

        .recording-help {
          text-align: center;
          color: var(--gray-500);
          font-size: 0.9rem;
          margin: 0;
          font-style: italic;
        }

        .loading-spinner.small {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .btn-icon {
          font-size: 1rem;
        }

        .modern-error {
          border-left: 4px solid var(--danger-color);
        }

        .error-content {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .error-content h4 {
          margin: 0 0 0.25rem 0;
          color: var(--danger-color);
          font-weight: 700;
        }

        .error-content p {
          margin: 0;
          color: #991b1b;
        }

        .modern-result {
          border-left: 4px solid var(--success-color);
        }

        .result-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--gray-200);
        }

        .result-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          background: var(--gray-100);
          border: 1px solid var(--gray-300);
          color: var(--gray-700);
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }

        .action-btn:hover {
          background: var(--gray-200);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .sections {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .section h3 {
          color: var(--gray-800);
          font-weight: 700;
          margin-bottom: 0.75rem;
          font-size: 1.2rem;
        }

        .result-content {
          line-height: 1.7;
          color: var(--gray-700);
        }

        .transcript {
          background: var(--gray-50);
          padding: 1.5rem;
          border-radius: 1rem;
          border-left: 4px solid var(--primary-color);
          font-family:
            "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas,
            "Courier New", monospace;
          font-size: 0.95rem;
        }

        .followup-form {
          margin-bottom: 1rem;
        }

        .followup-input-wrapper {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .followup-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 2px solid var(--gray-200);
          border-radius: 1rem;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .followup-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .followup-send-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--primary-gradient);
          color: white;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }

        .followup-send-btn:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .followup-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .followup-answer {
          background: white;
          padding: 1.5rem;
          border-radius: 1rem;
          border-left: 4px solid var(--success-color);
          box-shadow: var(--shadow-sm);
          animation: slideInLeft 0.5s ease-out;
        }

        .followup-answer h4 {
          color: var(--success-color);
          margin-bottom: 0.75rem;
          font-weight: 700;
          font-size: 1.1rem;
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (max-width: 768px) {
          .recording-type-selector {
            flex-direction: column;
            width: 100%;
          }

          .recording-type-btn {
            width: 100%;
            text-align: center;
          }

          .record-btn {
            padding: 1rem 2rem;
            font-size: 1rem;
          }

          .result-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .result-actions {
            width: 100%;
            justify-content: stretch;
          }

          .action-btn {
            flex: 1;
            text-align: center;
          }

          .followup-input-wrapper {
            flex-direction: column;
          }

          .followup-input {
            width: 100%;
          }

          .followup-send-btn {
            width: 100%;
            border-radius: 1rem;
            height: 44px;
          }
        }
      `}</style>
  </div>
);
}

export default MeetingAssistant;
