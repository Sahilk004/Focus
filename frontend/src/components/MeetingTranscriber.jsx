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

      console.log("File selected:", {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
      });

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
        console.log("File selected:", {
          name: droppedFile.name,
          size: droppedFile.size,
          type: droppedFile.type,
        });
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
        console.log("Processing YouTube URL:", youtubeUrl);
        response = await axios.post(
          `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"
          }/api/transcribe-media`,
          { url: youtubeUrl }
        );
      } else if (file) {
        console.log("Processing file:", file.name, file.type, file.size);

        if (file.size === 0) {
          throw new Error("File is empty or corrupted");
        }

        const formData = new FormData();
        formData.append("media", file);

        console.log("FormData created, file appended as 'media'");

        response = await axios.post(
          `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"
          }/api/transcribe-media`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            timeout: 300000,
            onUploadProgress: (progressEvent) => {
              const uploadProgress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              console.log("Upload progress:", uploadProgress + "%");
            },
          }
        );
      }

      console.log("API Response:", response.data);

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
      console.error("Error response:", err.response?.data);

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
    <div className="component">
      <div className="component-header">
        <div className="header-content">
          <h2>Upload Video & Audio</h2>
          <div className="feature-badge">AI-Powered</div>
        </div>
        <p className="description">
          Upload video/audio files or paste YouTube links to get transcripts
          with AI-powered summaries and key insights.
        </p>
      </div>

      <div
        className="audio-upload-tip card"
        style={{
          marginBottom: "2rem",
          background: "#F7F8FA",
          border: "1px solid #edf1f7",
          borderRadius: "1.25rem",
          padding: "1.5rem",
        }}
      >
        <h3 style={{ margin: 0, fontWeight: 700, color: "#363f5f" }}>
          Tip: Use Audio for Faster, Smoother Uploads
        </h3>
        <p style={{ margin: "0.75rem 0", color: "#516170" }}>
          For the best experience, please upload just the{" "}
          <strong>audio</strong> (
          <span style={{ color: "#149C66" }}>MP3</span>,{" "}
          <span style={{ color: "#149C66" }}>WAV</span>,{" "}
          <span style={{ color: "#149C66" }}>M4A</span>, etc.) from your video
          or meeting. This is much <strong>faster</strong> and{" "}
          <strong>more reliable</strong>, and works with very long videos or
          YouTube content that can't be processed automatically.
        </p>
        <ul style={{ paddingLeft: "1.2em", color: "#516170" }}>
          <li>
            For YouTube: Use{" "}
            <a
              href="https://ytmp3.cc/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#4760e7" }}
            >
              ytmp3.cc
            </a>{" "}
            (<em>YouTube to MP3</em>) or{" "}
            <a
              href="https://yt-download.org/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#4760e7" }}
            >
              yt-download.org
            </a>{" "}
            to extract audio from any video.
          </li>
          <li>
            From local video: Use free{" "}
            <a
              href="https://www.videolan.org/vlc/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#4760e7" }}
            >
              VLC Media Player
            </a>{" "}
            (<em>Media → Convert/Save</em>) to get audio-only files.
          </li>
        </ul>
        <p
          style={{
            fontSize: "0.96rem",
            margin: "0.7em 0 0.15em",
            color: "#D17A22",
          }}
        >
          <strong>Note:</strong> If your YouTube link fails or says it can't
          be processed, extracting and uploading audio will always work!
        </p>
      </div>

      {/* Input Type Selector */}
      <div className="input-type-selector">
        <button
          type="button"
          className={`type-btn ${inputType === "file" ? "active" : ""}`}
          onClick={() => {
            setInputType("file");
            setYoutubeUrl("");
            setError(null);
          }}
        >
          Upload File
        </button>
        <button
          type="button"
          className={`type-btn ${inputType === "youtube" ? "active" : ""}`}
          onClick={() => {
            setInputType("youtube");
            setFile(null);
            setError(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
        >
          YouTube
        </button>
      </div>

      <div className="transcription-section card">
        <form onSubmit={handleSubmit} className="transcription-form">
          {inputType === "youtube" ? (
            <div className="youtube-input-section">
              <div className="youtube-input-wrapper">
                <div className="input-icon">
                  <Icon name="video" />
                </div>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => {
                    setYoutubeUrl(e.target.value);
                    setError(null);
                    setResult(null);
                  }}
                  placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                  className="youtube-input"
                  disabled={loading}
                />
                {youtubeUrl && (
                  <button
                    type="button"
                    onClick={() => setYoutubeUrl("")}
                    className="clear-input-btn"
                    disabled={loading}
                  >
                    <Icon name="x" />
                  </button>
                )}
              </div>
              <p className="input-help">
                Enter any YouTube video URL to extract transcript and generate
                study materials
              </p>
            </div>
          ) : (
            <div className="file-upload-section">
              <div
                className={`file-drop-zone ${dragOver ? "drag-over" : ""} ${
                  file ? "has-file" : ""
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
                  className="file-input-hidden"
                />

                {!file ? (
                  <div className="drop-zone-content">
                    <div className="upload-icon">
                      <Icon name="upload" size={48} />
                    </div>
                    <div className="upload-text">
                      <h3>Drop your video or audio file here</h3>
                      <p>or click to browse files</p>
                    </div>
                    <div className="format-info">
                      <p>Supports video and audio files up to 100MB</p>
                      <div className="format-groups">
                        <div className="format-group">
                          <span className="group-label">Video:</span>
                          <span className="format-badge video">MP4</span>
                          <span className="format-badge video">MOV</span>
                          <span className="format-badge video">AVI</span>
                          <span className="format-badge video">WEBM</span>
                        </div>
                        <div className="format-group">
                          <span className="group-label">Audio:</span>
                          <span className="format-badge audio">MP3</span>
                          <span className="format-badge audio">WAV</span>
                          <span className="format-badge audio">M4A</span>
                          <span className="format-badge audio">AAC</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="file-preview">
                    <div className="file-info">
                      <div className="file-icon">
                        {file.type.startsWith("video/") ? (
                          <Icon name="video" />
                        ) : (
                          <Icon name="music" />
                        )}
                      </div>
                      <div className="file-details">
                        <h4>{file.name}</h4>
                        <p>
                          {formatFileSize(file.size)} •{" "}
                          {file.type.startsWith("video/")
                            ? "Video File"
                            : "Audio File"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFile();
                      }}
                      className="remove-file-btn"
                      disabled={loading}
                    >
                      <Icon name="x" />
                    </button>
                  </div>
                )}
              </div>

              <p className="upload-help">
                Upload video files for full transcription or audio files for
                voice-to-text processing
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              (inputType === "file" && !file) ||
              (inputType === "youtube" && !youtubeUrl.trim())
            }
            className={`btn-primary submit-btn ${loading ? "loading" : ""}`}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                {inputType === "youtube"
                  ? "Processing YouTube..."
                  : "Transcribing Media..."}
              </>
            ) : (
              <>
                <span className="btn-icon">
                  <Icon name="arrow-right" size={18} />
                </span>
                {inputType === "youtube"
                  ? "Process YouTube Video"
                  : "Transcribe Media"}
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="error modern-error">
          <div className="error-content">
            <span className="error-icon">
              <Icon name="warning" />
            </span>
            <div>
              <h4>Processing Failed</h4>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="result modern-result card">
          <div className="result-header">
            <h3>
              {inputType === "youtube" ? "YouTube Video" : "Media"}{" "}
              Processing Complete!
            </h3>
            <div className="result-actions">
              <button
                className="action-btn copy-btn"
                onClick={() => {
                  const content = result.transcript
                    ? result.transcript +
                      (result.analysis ? "\n\n" + result.analysis : "")
                    : result.processed || "Processed content";
                  navigator.clipboard?.writeText(content);
                }}
              >
                <Icon name="copy" size={16} /> Copy All
              </button>
              <button
                className="action-btn download-btn"
                onClick={() => {
                  const content = result.transcript
                    ? `Transcript:\n${result.transcript}\n\n${
                        result.analysis ? `Analysis:\n${result.analysis}` : ""
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
                <Icon name="download" size={16} /> Download
              </button>
            </div>
          </div>

          <div className="sections">
            {process.env.NODE_ENV === "development" && (
              <div className="section">
                <h3>Debug Info</h3>
                <div className="result-content">
                  <pre style={{ fontSize: "0.8rem", color: "#666" }}>
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {result.transcript && (
              <div className="section">
                <h3>Transcript</h3>
                <div className="result-content transcript">
                  {result.transcript}
                </div>
              </div>
            )}

            {result.analysis && (
              <div className="section">
                <h3>Key Insights</h3>
                <div
                  className="result-content"
                  dangerouslySetInnerHTML={{
                    __html: result.analysis
                      .replace(/\\(.?)\\*/g, "<strong>$1</strong>")
                      .replace(/\n/g, "<br/>"),
                  }}
                />
              </div>
            )}

            {Array.isArray(result.evidence) && result.evidence.length > 0 && (
              <div className="section">
                <h3>Evidence Links</h3>
                <div className="result-content">
                  <ul>
                    {result.evidence.map((ev, idx) => (
                      <li key={idx} style={{ marginBottom: 8 }}>
                        <div style={{ fontWeight: 600 }}>
                          {ev.bullet || "Related point"}
                        </div>
                        {typeof ev.startIndex === "number" &&
                          typeof ev.endIndex === "number" && (
                            <div
                              style={{ fontSize: "0.85rem", color: "#6b7280" }}
                            >
                              chars {ev.startIndex}–{ev.endIndex}
                            </div>
                          )}
                        {ev.quote && (
                          <blockquote
                            style={{
                              margin: "6px 0",
                              paddingLeft: 12,
                              borderLeft: "3px solid #e5e7eb",
                              color: "#374151",
                            }}
                          >
                            “{ev.quote}”
                          </blockquote>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {result.processed && !result.transcript && (
              <div className="section">
                <h3>Processed Content</h3>
                <div
                  className="result-content"
                  dangerouslySetInnerHTML={{
                    __html: result.processed
                      .replace(/\\(.?)\\*/g, "<strong>$1</strong>")
                      .replace(/\n/g, "<br/>"),
                  }}
                />
              </div>
            )}

            {!result.transcript && !result.analysis && !result.processed && (
              <div className="section">
                <h3>No Content Found</h3>
                <div className="result-content">
                  <p>
                    The processing completed but no readable content was
                    extracted. This could mean:
                  </p>
                  <ul>
                    <li>The file format is not supported</li>
                    <li>The audio/video quality is too poor</li>
                    <li>The content is too short</li>
                    <li>There was an issue with the transcription service</li>
                  </ul>
                  <p>
                    Please try with a different file or check the file quality.
                  </p>
                </div>
              </div>
            )}

            {Array.isArray(result.notes) && result.notes.length > 0 && (
              <div className="section">
                <h3>Study Notes</h3>
                <div className="result-content">
                  <ul>
                    {result.notes.map((n, idx) => (
                      <li key={idx}>{n}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {Array.isArray(result.flashcards) &&
              result.flashcards.length > 0 && (
                <div className="section">
                  <h3>Flashcards</h3>
                  <div className="result-content">
                    <ul>
                      {result.flashcards.map((fc, idx) => (
                        <li key={idx}>
                          <strong>Q:</strong> {fc.question} <br />
                          <strong>A:</strong> {fc.answer}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

            {Array.isArray(result.quiz) && result.quiz.length > 0 && (
              <div className="section">
                <h3>Quiz Questions</h3>
                <div className="result-content">
                  <ol>
                    {result.quiz.map((qz, idx) => (
                      <li key={idx} style={{ marginBottom: 10 }}>
                        <div>{qz.question}</div>
                        {Array.isArray(qz.options) && (
                          <ul>
                            {qz.options.map((opt, i) => (
                              <li key={i} style={{ listStyle: "circle" }}>
                                {opt}
                                {typeof qz.correctIndex === "number" &&
                                qz.correctIndex === i
                                  ? " correct"
                                  : ""}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
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
          background: linear-gradient(135deg, #0ea5e9, #06b6d4);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .input-type-selector {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 2rem;
          padding: 0.5rem;
          background: var(--gray-100);
          border-radius: 1rem;
          width: fit-content;
          margin-left: auto;
          margin-right: auto;
        }

        .type-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          border: none;
          background: transparent;
          color: var(--gray-600);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }

        .type-btn.active {
          background: white;
          color: var(--primary-color);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .type-btn:hover:not(.active) {
          color: var(--primary-color);
          background: rgba(102, 126, 234, 0.1);
        }

        .transcription-section {
          margin-bottom: 2rem;
        }

        .youtube-input-section {
          margin-bottom: 1.5rem;
        }

        .youtube-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          background: white;
          border: 2px solid var(--gray-200);
          border-radius: 1rem;
          padding: 1rem;
          transition: all 0.2s ease;
        }

        .youtube-input-wrapper:focus-within {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .input-icon {
          font-size: 1.2rem;
          margin-right: 0.75rem;
          color: var(--gray-400);
        }

        .youtube-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 1rem;
          font-weight: 500;
          color: var(--gray-700);
        }

        .youtube-input::placeholder {
          color: var(--gray-400);
        }

        .clear-input-btn {
          background: var(--gray-200);
          border: none;
          color: var(--gray-500);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.8rem;
        }

        .clear-input-btn:hover {
          background: var(--danger-color);
          color: white;
        }

        .input-help,
        .upload-help {
          text-align: center;
          color: var(--gray-500);
          font-size: 0.9rem;
          margin-top: 0.75rem;
          margin-bottom: 0;
        }

        .file-upload-section {
          margin-bottom: 1.5rem;
        }

        .file-drop-zone {
          border: 3px dashed var(--gray-300);
          border-radius: 1.5rem;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: var(--gray-50);
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .file-drop-zone:hover {
          border-color: var(--primary-color);
          background: rgba(102, 126, 234, 0.05);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
        }

        .file-drop-zone.drag-over {
          border-color: var(--primary-color);
          background: rgba(102, 126, 234, 0.1);
          transform: scale(1.02);
        }

        .file-drop-zone.has-file {
          border-color: var(--success-color);
          background: rgba(16, 185, 129, 0.05);
        }

        .file-input-hidden {
          display: none;
        }

        .drop-zone-content {
          width: 100%;
        }

        .upload-icon {
          font-size: 3rem;
          color: var(--primary-color);
          margin-bottom: 1rem;
          display: block;
        }

        .upload-text h3 {
          color: var(--gray-800);
          font-weight: 700;
          margin-bottom: 0.5rem;
          font-size: 1.2rem;
        }

        .upload-text p {
          color: var(--gray-600);
          font-size: 0.9rem;
          margin: 0 0 1rem 0;
        }

        .format-info {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--gray-200);
        }

        .format-info p {
          color: var(--gray-500);
          font-size: 0.85rem;
          margin-bottom: 0.75rem;
        }

        .format-groups {
          display: flex;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .format-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .group-label {
          font-weight: 600;
          color: var(--gray-700);
          font-size: 0.85rem;
        }

        .format-badge {
          background: var(--gray-200);
          color: var(--gray-700);
          padding: 0.25rem 0.5rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .format-badge.video {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        }

        .format-badge.audio {
          background: rgba(34, 197, 94, 0.1);
          color: #16a34a;
        }

        .file-preview {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          background: white;
          border: 2px solid var(--success-color);
          border-radius: 1rem;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .file-icon {
          font-size: 2.5rem;
        }

        .file-details h4 {
          color: var(--gray-800);
          font-weight: 700;
          margin: 0 0 0.25rem 0;
          font-size: 1.1rem;
        }

        .file-details p {
          color: var(--gray-600);
          font-size: 0.9rem;
          margin: 0;
        }

        .remove-file-btn {
          background: var(--danger-color);
          color: white;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 700;
          transition: all 0.2s ease;
        }

        .remove-file-btn:hover {
          background: #dc2626;
          transform: scale(1.1);
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
          padding: 1rem;
          border-radius: 0.5rem;
          border-left: 4px solid var(--primary-color);
          font-family: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono",
            Consolas, "Courier New", monospace;
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

        @media (max-width: 768px) {
          .component-header {
            margin-bottom: 1.5rem;
          }

          .header-content {
            flex-direction: column;
            gap: 0.75rem;
          }

          .input-type-selector {
            width: 100%;
            margin-left: 0;
            margin-right: 0;
          }

          .type-btn {
            flex: 1;
            text-align: center;
            padding: 0.75rem 1rem;
            font-size: 0.85rem;
          }

          .file-drop-zone {
            min-height: 150px;
            padding: 1.5rem;
          }

          .upload-icon {
            font-size: 2.5rem;
          }

          .format-groups {
            flex-direction: column;
            gap: 1rem;
            align-items: center;
          }

          .file-preview {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .result-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .result-actions {
            width: 100%;
            justify-content: stretch;
          }

          .action-btn {
            flex: 1;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}

export default MeetingTranscriber;