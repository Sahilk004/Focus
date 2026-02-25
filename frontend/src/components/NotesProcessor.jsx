import { useState, useRef } from "react";
import axios from "axios";
import Icon from "./Icon";

function NotesProcessor({ setContext }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
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
      if (
        droppedFile.type === "text/plain" ||
        droppedFile.type === "application/pdf" ||
        droppedFile.type === "application/vnd.ms-powerpoint" ||
        droppedFile.type ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      ) {
        setFile(droppedFile);
        setError(null);
        setResult(null);
      } else {
        setError("Please upload a .txt, .pdf, or .pptx file");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + Math.random() * 30, 90));
      }, 200);

      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/api/process-notes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearInterval(progressInterval);
      setProgress(100);

      setTimeout(() => {
        setResult(response.data.processed);
        setContext(response.data.processed);
      }, 500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to process content");
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 500);
    }
  };

  const clearFile = () => {
    setFile(null);
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
      {/* Upload Section */}
      <div className="glass-panel p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Icon name="bot" size={14} />
            AI-Powered
          </div>
          <p className="text-dark-500 max-w-lg mx-auto">
            Upload your notes, PDFs, or PowerPoint presentations to get
            ADHD-friendly study guides with key points and summaries.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              accept=".txt,.pdf,.pptx"
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
                    Supports text documents, PDFs, and PowerPoint presentations
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  {["TXT", "PDF", "PPTX"].map((fmt) => (
                    <span key={fmt} className="px-2 py-1 bg-dark-100 text-dark-500 rounded text-xs font-bold">
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="relative flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm animate-fade-in">
                <div className="p-3 bg-primary-100 text-primary-600 rounded-lg">
                  {file.type === "application/pdf" ? (
                    <Icon name="file-pdf" size={24} />
                  ) : file.type.includes("presentation") ? (
                    <Icon name="file-ppt" size={24} />
                  ) : (
                    <Icon name="file" size={24} />
                  )}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h4 className="font-semibold text-dark-900 truncate">{file.name}</h4>
                  <p className="text-xs text-dark-500">
                    {formatFileSize(file.size)} •{" "}
                    {file.type.includes("pdf") ? "PDF Document" : file.type.includes("presentation") ? "PowerPoint" : "Text File"}
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

          {loading && (
            <div className="space-y-2">
              <div className="h-2 w-full bg-dark-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-300 relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                </div>
              </div>
              <p className="text-center text-sm font-medium text-dark-500 animate-pulse">
                Processing your content... {Math.round(progress)}%
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !file}
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
                Generate Study Guide
                <Icon name="arrow-right" size={18} className="opacity-70 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-slide-up">
          <div className="p-1.5 bg-red-100 text-red-600 rounded-lg">
            <Icon name="warning" size={18} />
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
              Your Study Guide
            </h3>
            <div className="flex gap-2">
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-dark-200 rounded-lg text-sm font-medium text-dark-600 hover:text-primary-600 hover:border-primary-200 transition-colors shadow-sm"
                onClick={() => navigator.clipboard?.writeText(result)}
              >
                <Icon name="copy" size={14} /> Copy
              </button>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-dark-200 rounded-lg text-sm font-medium text-dark-600 hover:text-primary-600 hover:border-primary-200 transition-colors shadow-sm"
                onClick={() => {
                  const blob = new Blob([result], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `study-guide-${Date.now()}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Icon name="download" size={14} /> Download
              </button>
            </div>
          </div>
          <div
            className="p-8 prose prose-slate max-w-none prose-headings:text-primary-800 prose-a:text-primary-600 prose-strong:text-dark-900 text-dark-700 leading-relaxed bg-white/50"
            dangerouslySetInnerHTML={{
              __html: result
                .replace(/\\(.?)\\*/g, "<strong class='text-primary-700'>$1</strong>")
                .replace(/\n/g, "<br/>")
                .replace(/#{3}\s(.*?)$/gm, "<h4 class='text-lg font-bold font-serif text-primary-900 mt-4 mb-2'>$1</h4>")
                .replace(/#{2}\s(.*?)$/gm, "<h3 class='text-xl font-bold font-serif text-primary-900 mt-6 mb-3'>$1</h3>")
                .replace(/#{1}\s(.*?)$/gm, "<h2 class='text-2xl font-bold font-serif text-primary-900 mt-8 mb-4 border-b border-primary-200 pb-2'>$1</h2>"),
            }}
          />
        </div>
      )}
    </div>
  );
}

export default NotesProcessor;