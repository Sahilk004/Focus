import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Icon from "./Icon";

function MeetingAssistant({ setContext }) {
  const [recordingType, setRecordingType] = useState("audio"); // "audio" or "video"
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

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      const constraints =
        recordingType === "video"
          ? { video: true, audio: true }
          : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recordingType === "video" ? "video/webm" : "audio/webm",
        });
        setRecordedBlob(blob);

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setError(null);

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      setError("Could not access camera/microphone: " + error.message);
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
    if (!recordedBlob) {
      setError("No recording available. Please record something first.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    const fileName = `live_recording_${Date.now()}.webm`;
    formData.append("media", recordedBlob, fileName);

    try {
      const response = await axios.post("/api/transcribe-media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setTranscription(
        response.data.transcript ||
        response.data.processed ||
        "Transcription completed",
      );
      setSummary(
        response.data.analysis || response.data.summary || "Analysis completed",
      );

      const contextContent = response.data.transcript
        ? response.data.transcript +
        (response.data.analysis ? "\n\n" + response.data.analysis : "")
        : response.data.processed || "Content processed successfully";
      setContext(contextContent);
    } catch (err) {
      console.error("Transcription error:", err);
      setError(
        err.response?.data?.error ||
        err.message ||
        "Failed to transcribe media. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFollowup = async (e) => {
    e.preventDefault();
    if (!followupQuestion.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const context = `Transcript: ${transcription}\n\nSummary: ${summary}`;
      const response = await axios.post("/api/chat", {
        message: followupQuestion,
        context: context,
      });

      setFollowupAnswer(response.data.response);
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
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Real-Time
          </div>
          <h2 className="text-2xl font-bold text-dark-900 mb-2">Live Meeting Recording</h2>
          <p className="text-dark-500 max-w-lg mx-auto">
            Record meetings, lectures, or conversations in real-time and get
            instant AI-powered transcriptions with smart summaries.
          </p>
        </div>

        {/* Recording Type Selector */}
        <div className="flex justify-center gap-2 mb-8">
          <div className="bg-dark-50 p-1 rounded-xl flex gap-1">
            <button
              onClick={() => setRecordingType("video")}
              disabled={isRecording}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${recordingType === "video"
                ? "bg-white text-primary-600 shadow-sm"
                : "text-dark-500 hover:text-dark-900 hover:bg-dark-100"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Video + Audio
            </button>
            <button
              onClick={() => setRecordingType("audio")}
              disabled={isRecording}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${recordingType === "audio"
                ? "bg-white text-primary-600 shadow-sm"
                : "text-dark-500 hover:text-dark-900 hover:bg-dark-100"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Audio Only
            </button>
          </div>
        </div>

        {/* Recording Controls */}
        <div className="flex flex-col items-center gap-6">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={loading}
              className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-red-50 hover:bg-red-100 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75 group-hover:opacity-100"></div>
              <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-lg shadow-red-500/30 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Icon name="mic" size={32} className="text-white" />
              </div>
            </button>
          ) : (
            <div className="w-full max-w-md animate-fade-in">
              <div className="flex flex-col items-center gap-4 p-6 bg-red-50 rounded-2xl border border-red-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="font-mono text-2xl font-bold text-red-600 tracking-wider">
                    {formatTime(recordingTime)}
                  </span>
                </div>
                <div className="w-full h-1 bg-red-200 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 animate-progress-indeterminate"></div>
                </div>
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-6 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors shadow-sm font-semibold text-sm"
                >
                  <Icon name="square" size={16} fill="currentColor" />
                  Stop Recording
                </button>
              </div>
            </div>
          )}

          {recordedBlob && !isRecording && (
            <div className="w-full max-w-md animate-slide-up">
              <div className="bg-white p-4 rounded-xl border border-dark-100 shadow-sm flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${recordingType === 'video' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                  <Icon name={recordingType === 'video' ? 'video' : 'mic'} size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-dark-900">Recording Complete</h4>
                  <p className="text-sm text-dark-500">
                    {formatTime(recordingTime)} • {formatFileSize(recordedBlob.size)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={clearRecording}
                    className="p-2 text-dark-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Icon name="trash-2" size={18} />
                  </button>
                  <button
                    onClick={handleTranscribe}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>Transcribe</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-slide-up">
          <div className="p-1.5 bg-red-100 text-red-600 rounded-lg">
            <Icon name="alert-triangle" size={18} />
          </div>
          <div>
            <h4 className="font-bold text-red-900 text-sm">Error</h4>
            <p className="text-red-700 text-sm mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Transcription Results */}
      {transcription && (
        <div className="glass-panel p-0 overflow-hidden animate-slide-up">
          <div className="p-4 border-b border-white/20 bg-white/40 flex items-center justify-between">
            <h3 className="font-bold text-lg text-primary-800 flex items-center gap-2">
              <Icon name="check-circle" size={20} className="text-success-500" />
              Meeting Analysis
            </h3>
            <div className="flex gap-2">
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-dark-200 rounded-lg text-sm font-medium text-dark-600 hover:text-primary-600 hover:border-primary-200 transition-colors shadow-sm"
                onClick={() =>
                  navigator.clipboard?.writeText(
                    transcription + "\n\n" + summary,
                  )
                }
              >
                <Icon name="copy" size={14} /> Copy
              </button>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-dark-200 rounded-lg text-sm font-medium text-dark-600 hover:text-primary-600 hover:border-primary-200 transition-colors shadow-sm"
                onClick={() => {
                  const content = transcription
                    ? `Meeting Transcript:\n${transcription}\n\n${summary ? `AI Summary:\n${summary}` : ""}`
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
                <Icon name="download" size={14} /> Download
              </button>
            </div>
          </div>

          <div className="p-6 space-y-8 bg-white/50">
            {/* Transcript */}
            <div className="space-y-3">
              <h3 className="font-bold text-dark-800 flex items-center gap-2">
                <Icon name="file-text" size={18} className="text-primary-500" />
                Transcript
              </h3>
              <div className="p-4 bg-white rounded-xl border border-dark-100 text-dark-600 text-sm leading-relaxed max-h-60 overflow-y-auto">
                {transcription}
              </div>
            </div>

            {/* AI Summary */}
            {summary && (
              <div className="space-y-3">
                <h3 className="font-bold text-dark-800 flex items-center gap-2">
                  <Icon name="sparkles" size={18} className="text-primary-500" />
                  AI Summary
                </h3>
                <div
                  className="prose prose-sm max-w-none prose-p:text-dark-600 prose-headings:font-serif prose-headings:text-primary-900"
                  dangerouslySetInnerHTML={{
                    __html: summary
                      .replace(/\\(.?)\\*/g, "<strong class='text-primary-700'>$1</strong>")
                      .replace(/\n/g, "<br/>")
                      .replace(/#{3}\s(.*?)$/gm, "<h4 class='text-lg font-bold font-serif text-primary-900 mt-4 mb-2'>$1</h4>")
                      .replace(/#{2}\s(.*?)$/gm, "<h3 class='text-xl font-bold font-serif text-primary-900 mt-6 mb-3'>$1</h3>")
                      .replace(/#{1}\s(.*?)$/gm, "<h2 class='text-2xl font-bold font-serif text-primary-900 mt-8 mb-4 border-b border-primary-200 pb-2'>$1</h2>"),
                  }}
                />
              </div>
            )}

            {/* Follow-up Q&A */}
            <div className="pt-6 border-t border-dark-100">
              <h3 className="font-bold text-dark-800 mb-4 flex items-center gap-2">
                <Icon name="message-circle" size={18} className="text-primary-500" />
                Ask Follow-up Questions
              </h3>

              <div className="space-y-4">
                {followupAnswer && (
                  <div className="p-4 bg-primary-50 rounded-xl border border-primary-100 animate-fade-in">
                    <h4 className="font-semibold text-primary-800 text-sm mb-1">Answer:</h4>
                    <div
                      className="text-dark-700 text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: followupAnswer
                          .replace(/\\(.?)\\*/g, "<strong>$1</strong>")
                          .replace(/\n/g, "<br/>"),
                      }}
                    />
                  </div>
                )}

                <form onSubmit={handleFollowup} className="relative">
                  <input
                    type="text"
                    value={followupQuestion}
                    onChange={(e) => setFollowupQuestion(e.target.value)}
                    placeholder="Ask a question about this meeting..."
                    disabled={loading}
                    className="w-full pl-4 pr-12 py-3 bg-white border border-dark-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all shadow-sm"
                  />
                  <button
                    type="submit"
                    disabled={loading || !followupQuestion.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Icon name="send" size={16} />
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MeetingAssistant;