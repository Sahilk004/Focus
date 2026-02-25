import { useState, useRef } from "react";
import axios from "axios";
import Icon from "./Icon";

function MeetingTranscriber({ setContext }) {
  const [file, setFile] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [inputType, setInputType] = useState("file"); // "file" or "youtube"
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size === 0) {
        setError("File appears to be empty. Please select a valid file.");
        return;
      }

      if (selectedFile.size > 100 * 1024 * 1024) {
        setError("File size too large. Please select a file smaller than 100MB.");
        return;
      }

      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0];

      if (droppedFile.size === 0) {
        setError("File appears to be empty. Please select a valid file.");
        return;
      }

      if (droppedFile.size > 100 * 1024 * 1024) {
        setError("File size too large. Please select a file smaller than 100MB.");
        return;
      }

      if (
        droppedFile.type.startsWith("video/") ||
        droppedFile.type.startsWith("audio/") ||
        droppedFile.name
          .toLowerCase()
          .match(/\.(mp4|mov|avi|webm|mp3|wav|m4a|aac|flac)$/)
      ) {
        setFile(droppedFile);
        setError(null);
        setResult(null);
      } else {
        setError("Please upload a video or audio file");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasFile = file !== null;
    const hasYoutubeUrl = youtubeUrl.trim() !== "";

    if (!hasFile && !hasYoutubeUrl) {
      setError("Please upload a file or enter a YouTube URL");
      return;
    }

    if (inputType === "youtube" && !hasYoutubeUrl) {
      setError("Please enter a YouTube URL");
      return;
    }

    if (inputType === "file" && !hasFile) {
      setError("Please select a file");
      return;
    }

    if (inputType === "youtube") {
      const youtubeRegex =
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
      if (!youtubeRegex.test(youtubeUrl)) {
        setError("Please enter a valid YouTube URL");
        return;
      }
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let response;

      if (inputType === "youtube") {
        response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"
          }/api/transcribe-media`,
          { url: youtubeUrl }
        );
      } else if (file) {
        if (file.size === 0) {
          throw new Error("File is empty or corrupted");
        }

        const formData = new FormData();
        formData.append("media", file);

        response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"
          }/api/transcribe-media`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            timeout: 300000,
          }
        );
      }

      if (response.data.success) {
        setResult(response.data);

        if (setContext) {
          const contextData = {
            transcript: response.data.transcript || "",
            analysis: response.data.analysis || "",
            notes: response.data.notes || [],
            flashcards: response.data.flashcards || [],
            quiz: response.data.quiz || [],
          };
          setContext(contextData);
        }
      } else {
        setError(response.data.error || "Unknown error occurred");
      }
    } catch (err) {
      console.error("Processing error:", err);

      let errorMessage = "Failed to process content. ";
      if (err.response?.status === 404) {
        errorMessage +=
          "API endpoint not found. Please check if the backend server is running.";
      } else if (err.response?.status === 500) {
        errorMessage += "Server error occurred. Please try again later.";
      } else if (err.code === "NETWORK_ERROR") {
        errorMessage +=
          "Cannot connect to server. Please check your connection.";
      } else if (err.response?.data?.details) {
        errorMessage += err.response.data.details;
      } else if (err.response?.data?.error) {
        errorMessage += err.response.data.error;
      } else {
        errorMessage += err.message || "Please try again.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setYoutubeUrl("");
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
      <div className="glass-panel p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Icon name="video" size={14} />
            AI-Powered
          </div>
          <h2 className="text-2xl font-bold text-dark-900 mb-2">Upload Video & Audio</h2>
          <p className="text-dark-500 max-w-lg mx-auto">
            Upload video/audio files or paste YouTube links to get transcripts
            with AI-powered summaries and key insights.
          </p>
        </div>

        <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 mb-8 flex gap-3">
          <div className="p-1 bg-white rounded-md h-fit text-primary-500 shadow-sm">
            <Icon name="info" size={16} />
          </div>
          <div>
            <h3 className="font-bold text-primary-800 text-sm">Tip: Use Audio for Faster Uploads</h3>
            <p className="text-sm text-primary-700 mt-1">
              For the best experience, upload just the audio (MP3, WAV, M4A) from your video or meeting.
              If using YouTube, try extracting the audio first if the link fails.
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          <div className="bg-dark-50 p-1 rounded-xl flex gap-1">
            <button
              onClick={() => {
                setInputType("file");
                setYoutubeUrl("");
                setError(null);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${inputType === "file"
                ? "bg-white text-primary-600 shadow-sm"
                : "text-dark-500 hover:text-dark-900 hover:bg-dark-100"
                }`}
            >
              Upload File
            </button>
            <button
              onClick={() => {
                setInputType("youtube");
                setFile(null);
                setError(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${inputType === "youtube"
                ? "bg-white text-primary-600 shadow-sm"
                : "text-dark-500 hover:text-dark-900 hover:bg-dark-100"
                }`}
            >
              YouTube URL
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {inputType === "youtube" ? (
            <div className="space-y-2">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-400 group-focus-within:text-primary-500">
                  <Icon name="video" size={18} />
                </div>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => {
                    setYoutubeUrl(e.target.value);
                    setError(null);
                    setResult(null);
                  }}
                  placeholder="https://youtube.com/watch?v=..."
                  disabled={loading}
                  className="w-full pl-10 pr-10 py-3 bg-white border border-dark-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all shadow-sm"
                />
                {youtubeUrl && (
                  <button
                    type="button"
                    onClick={() => setYoutubeUrl("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-dark-400 hover:text-dark-600 cursor-pointer"
                    disabled={loading}
                  >
                    <Icon name="x" size={16} />
                  </button>
                )}
              </div>
              <p className="text-xs text-dark-500 pl-1">
                Enter any YouTube video URL to extract transcript and generate study materials
              </p>
            </div>
          ) : (
            <div
              className={`border-3 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 relative overflow-hidden group ${dragOver
                ? "border-primary-500 bg-primary-50 scale-[1.01]"
                : file
                  ? "border-success-500 bg-success-50/30"
                  : "border-dark-200 bg-dark-50/50 hover:border-primary-400 hover:bg-white"
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept="video/,audio/,.mp4,.mov,.avi,.webm,.mp3,.wav,.m4a,.aac,.flac"
                className="hidden"
              />

              {!file ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform duration-300">
                    <Icon name="upload" size={32} stroke={1.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-dark-800">Drop your file here or click to browse</h3>
                    <p className="text-dark-400 text-sm mt-1">
                      Supports video and audio files up to 100MB
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center max-w-xs mx-auto">
                    {["MP4", "MP3", "WAV", "M4A"].map((fmt) => (
                      <span key={fmt} className="px-2 py-1 bg-dark-100 text-dark-500 rounded text-xs font-bold">
                        {fmt}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="relative flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm animate-fade-in">
                  <div className="p-3 bg-primary-100 text-primary-600 rounded-lg">
                    {file.type.startsWith("video/") ? (
                      <Icon name="video" size={24} />
                    ) : (
                      <Icon name="music" size={24} />
                    )}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <h4 className="font-semibold text-dark-900 truncate">{file.name}</h4>
                    <p className="text-xs text-dark-500">
                      {formatFileSize(file.size)} • {file.type.startsWith("video/") ? "Video" : "Audio"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                    className="p-2 hover:bg-red-50 text-dark-400 hover:text-red-500 rounded-full transition-colors"
                  >
                    <Icon name="x" size={20} />
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              (inputType === "file" && !file) ||
              (inputType === "youtube" && !youtubeUrl.trim())
            }
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <Icon name="bot" size={20} className="group-hover:rotate-12 transition-transform" />
                {inputType === "youtube" ? "Process YouTube Video" : "Transcribe Media"}
                <Icon name="arrow-right" size={18} className="opacity-70 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-slide-up">
          <div className="p-1.5 bg-red-100 text-red-600 rounded-lg">
            <Icon name="alert-triangle" size={18} />
          </div>
          <div>
            <h4 className="font-bold text-red-900 text-sm">Processing Failed</h4>
            <p className="text-red-700 text-sm mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="glass-panel p-0 overflow-hidden animate-slide-up">
          <div className="p-4 border-b border-white/20 bg-white/40 flex items-center justify-between">
            <h3 className="font-bold text-lg text-primary-800 flex items-center gap-2">
              <Icon name="check-circle" size={20} className="text-success-500" />
              Processing Complete
            </h3>
            <div className="flex gap-2">
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-dark-200 rounded-lg text-sm font-medium text-dark-600 hover:text-primary-600 hover:border-primary-200 transition-colors shadow-sm"
                onClick={() => {
                  const content = result.transcript
                    ? result.transcript +
                    (result.analysis ? "\n\n" + result.analysis : "")
                    : result.processed || "Processed content";
                  navigator.clipboard?.writeText(content);
                }}
              >
                <Icon name="copy" size={14} /> Copy
              </button>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-dark-200 rounded-lg text-sm font-medium text-dark-600 hover:text-primary-600 hover:border-primary-200 transition-colors shadow-sm"
                onClick={() => {
                  const content = result.transcript
                    ? `Transcript:\n${result.transcript}\n\n${result.analysis ? `Analysis:\n${result.analysis}` : ""
                    }`
                    : result.processed || "Processed content";
                  const blob = new Blob([content], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${inputType === "youtube" ? "youtube" : "media"}-transcript-${Date.now()}.txt`;
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
            {result.transcript && (
              <div className="space-y-3">
                <h3 className="font-bold text-dark-800 flex items-center gap-2">
                  <Icon name="file-text" size={18} className="text-primary-500" />
                  Transcript
                </h3>
                <div className="p-4 bg-white rounded-xl border border-dark-100 text-dark-600 text-sm leading-relaxed max-h-60 overflow-y-auto">
                  {result.transcript}
                </div>
              </div>
            )}

            {/* Analysis */}
            {result.analysis && (
              <div className="space-y-3">
                <h3 className="font-bold text-dark-800 flex items-center gap-2">
                  <Icon name="sparkles" size={18} className="text-primary-500" />
                  Key Insights
                </h3>
                <div
                  className="prose prose-sm max-w-none prose-p:text-dark-600 prose-headings:font-serif prose-headings:text-primary-900"
                  dangerouslySetInnerHTML={{
                    __html: result.analysis
                      .replace(/\\(.?)\\*/g, "<strong class='text-primary-700'>$1</strong>")
                      .replace(/\n/g, "<br/>")
                      .replace(/#{3}\s(.*?)$/gm, "<h4 class='text-lg font-bold font-serif text-primary-900 mt-4 mb-2'>$1</h4>")
                      .replace(/#{2}\s(.*?)$/gm, "<h3 class='text-xl font-bold font-serif text-primary-900 mt-6 mb-3'>$1</h3>")
                      .replace(/#{1}\s(.*?)$/gm, "<h2 class='text-2xl font-bold font-serif text-primary-900 mt-8 mb-4 border-b border-primary-200 pb-2'>$1</h2>"),
                  }}
                />
              </div>
            )}

            {/* Flashcards */}
            {Array.isArray(result.flashcards) && result.flashcards.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-dark-800 flex items-center gap-2">
                  <Icon name="layers" size={18} className="text-primary-500" />
                  Flashcards
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.flashcards.map((fc, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-xl border border-dark-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-xs font-bold text-primary-600 uppercase mb-2">Question</div>
                      <p className="font-medium text-dark-900 mb-3">{fc.question}</p>
                      <div className="text-xs font-bold text-success-600 uppercase mb-2">Answer</div>
                      <p className="text-sm text-dark-600">{fc.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MeetingTranscriber;