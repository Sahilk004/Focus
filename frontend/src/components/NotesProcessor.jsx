// import { useState, useRef } from "react";
// import axios from "axios";

// function NotesProcessor({ setContext }) {
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState(null);
//   const [dragOver, setDragOver] = useState(false);
//   const [progress, setProgress] = useState(0);

//   const fileInputRef = useRef(null);

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile) {
//       setFile(selectedFile);
//       setError(null);
//       setResult(null);
//     }
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     setDragOver(true);
//   };

//   const handleDragLeave = (e) => {
//     e.preventDefault();
//     setDragOver(false);
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     setDragOver(false);

//     const droppedFiles = e.dataTransfer.files;
//     if (droppedFiles.length > 0) {
//       const droppedFile = droppedFiles[0];
//       if (
//         droppedFile.type === "text/plain" ||
//         droppedFile.type === "application/pdf" ||
//         droppedFile.type === "application/vnd.ms-powerpoint" ||
//         droppedFile.type ===
//           "application/vnd.openxmlformats-officedocument.presentationml.presentation"
//       ) {
//         setFile(droppedFile);
//         setError(null);
//         setResult(null);
//       } else {
//         setError("Please upload a .txt, .pdf, or .pptx file");
//       }
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!file) {
//       setError("Please select a file");
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setProgress(0);

//     try {
//       // Simulate progress for better UX
//       const progressInterval = setInterval(() => {
//         setProgress((prev) => Math.min(prev + Math.random() * 30, 90));
//       }, 200);

//       const formData = new FormData();
//       formData.append("file", file);

//       const response = await axios.post("/api/process-notes", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       clearInterval(progressInterval);
//       setProgress(100);

//       setTimeout(() => {
//         setResult(response.data.processed);
//         setContext(response.data.processed);
//       }, 500);
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to process content");
//     } finally {
//       setTimeout(() => {
//         setLoading(false);
//         setProgress(0);
//       }, 500);
//     }
//   };

//   const clearFile = () => {
//     setFile(null);
//     setResult(null);
//     setError(null);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   const formatFileSize = (bytes) => {
//     if (bytes === 0) return "0 Bytes";
//     const k = 1024;
//     const sizes = ["Bytes", "KB", "MB", "GB"];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
//   };

//   return (
//     <div className="component">
//       <div className="component-header">
//         <div className="header-content">
//           <h2>📝 Process Your Notes</h2>
//           <div className="feature-badge">AI-Powered</div>
//         </div>
//         <p className="description">
//           Upload your notes, PDFs, or PowerPoint presentations to get
//           ADHD-friendly study guides with key points and summaries.
//         </p>
//       </div>

//       <div className="upload-section card">
//         <form onSubmit={handleSubmit} className="upload-form">
//           <div
//             className={`file-drop-zone ${dragOver ? "drag-over" : ""} ${file ? "has-file" : ""}`}
//             onDragOver={handleDragOver}
//             onDragLeave={handleDragLeave}
//             onDrop={handleDrop}
//             onClick={() => fileInputRef.current?.click()}
//           >
//             <input
//               ref={fileInputRef}
//               type="file"
//               onChange={handleFileChange}
//               accept=".txt,.pdf,.pptx"
//               className="file-input-hidden"
//             />

//             {!file ? (
//               <div className="drop-zone-content">
//                 <div className="upload-icon">📎</div>
//                 <h3>Drop your file here or click to browse</h3>
//                 <p>
//                   Supports text documents, PDFs, and PowerPoint presentations
//                 </p>
//                 <div className="supported-formats">
//                   <span className="format-badge">TXT</span>
//                   <span className="format-badge">PDF</span>
//                   <span className="format-badge">PPTX</span>
//                 </div>
//               </div>
//             ) : (
//               <div className="file-preview">
//                 <div className="file-info">
//                   <div className="file-icon">
//                     {file.type === "application/pdf"
//                       ? "📄"
//                       : file.type === "application/vnd.ms-powerpoint" ||
//                           file.type ===
//                             "application/vnd.openxmlformats-officedocument.presentationml.presentation"
//                         ? "📊"
//                         : "📝"}
//                   </div>
//                   <div className="file-details">
//                     <h4>{file.name}</h4>
//                     <p>
//                       {formatFileSize(file.size)} •{" "}
//                       {file.type.includes("pdf")
//                         ? "PDF Document"
//                         : file.type.includes("presentation")
//                           ? "PowerPoint Presentation"
//                           : "Text File"}
//                     </p>
//                   </div>
//                 </div>
//                 <button
//                   type="button"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     clearFile();
//                   }}
//                   className="remove-file-btn"
//                   disabled={loading}
//                 >
//                   ✕
//                 </button>
//               </div>
//             )}
//           </div>

//           {loading && (
//             <div className="progress-section">
//               <div className="progress-bar">
//                 <div
//                   className="progress-fill"
//                   style={{ width: `${progress}%` }}
//                 ></div>
//               </div>
//               <p className="progress-text">
//                 Processing your content... {Math.round(progress)}%
//               </p>
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={loading || !file}
//             className={`btn-primary submit-btn ${loading ? "loading" : ""}`}
//           >
//             {loading ? (
//               <>
//                 <span className="loading-spinner"></span>
//                 Processing...
//               </>
//             ) : (
//               <>
//                 <span className="btn-icon">✨</span>
//                 Process Content
//               </>
//             )}
//           </button>
//         </form>
//       </div>

//       {error && (
//         <div className="error modern-error">
//           <div className="error-content">
//             <span className="error-icon">⚠️</span>
//             <div>
//               <h4>Processing Failed</h4>
//               <p>{error}</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {result && (
//         <div className="result modern-result card">
//           <div className="result-header">
//             <h3>✅ Your Study Guide is Ready!</h3>
//             <div className="result-actions">
//               <button
//                 className="action-btn copy-btn"
//                 onClick={() => navigator.clipboard?.writeText(result)}
//               >
//                 📋 Copy
//               </button>
//               <button
//                 className="action-btn download-btn"
//                 onClick={() => {
//                   const blob = new Blob([result], { type: "text/plain" });
//                   const url = URL.createObjectURL(blob);
//                   const a = document.createElement("a");
//                   a.href = url;
//                   a.download = `study-guide-${Date.now()}.txt`;
//                   a.click();
//                   URL.revokeObjectURL(url);
//                 }}
//               >
//                 💾 Download
//               </button>
//             </div>
//           </div>
//           <div
//             className="result-content"
//             dangerouslySetInnerHTML={{
//               __html: result
//                 .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
//                 .replace(/\n/g, "<br/>")
//                 .replace(/#{3}\s(.*?)$/gm, "<h4>$1</h4>")
//                 .replace(/#{2}\s(.*?)$/gm, "<h3>$1</h3>")
//                 .replace(/#{1}\s(.*?)$/gm, "<h2>$1</h2>"),
//             }}
//           />
//         </div>
//       )}

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

//         .upload-section {
//           margin-bottom: 2rem;
//         }

//         .file-drop-zone {
//           border: 3px dashed var(--gray-300);
//           border-radius: 1.5rem;
//           padding: 2rem;
//           text-align: center;
//           cursor: pointer;
//           transition: all 0.3s ease;
//           background: var(--gray-50);
//           position: relative;
//           overflow: hidden;
//         }

//         .file-drop-zone::before {
//           content: "";
//           position: absolute;
//           top: 0;
//           left: -100%;
//           width: 100%;
//           height: 100%;
//           background: linear-gradient(
//             90deg,
//             transparent,
//             rgba(102, 126, 234, 0.1),
//             transparent
//           );
//           transition: left 0.5s;
//         }

//         .file-drop-zone:hover::before {
//           left: 100%;
//         }

//         .file-drop-zone:hover {
//           border-color: var(--primary-color);
//           background: rgba(102, 126, 234, 0.05);
//           transform: translateY(-2px);
//           box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
//         }

//         .file-drop-zone.drag-over {
//           border-color: var(--primary-color);
//           background: rgba(102, 126, 234, 0.1);
//           transform: scale(1.02);
//         }

//         .file-drop-zone.has-file {
//           border-color: var(--success-color);
//           background: rgba(16, 185, 129, 0.05);
//         }

//         .file-input-hidden {
//           display: none;
//         }

//         .drop-zone-content h3 {
//           margin: 1rem 0 0.5rem 0;
//           color: var(--gray-700);
//           font-weight: 700;
//         }

//         .drop-zone-content p {
//           color: var(--gray-500);
//           margin-bottom: 1rem;
//         }

//         .upload-icon {
//           font-size: 3rem;
//           margin-bottom: 1rem;
//           animation: bounce 2s infinite;
//         }

//         @keyframes bounce {
//           0%,
//           100% {
//             transform: translateY(0);
//           }
//           50% {
//             transform: translateY(-10px);
//           }
//         }

//         .supported-formats {
//           display: flex;
//           gap: 0.5rem;
//           justify-content: center;
//         }

//         .format-badge {
//           background: var(--gray-200);
//           color: var(--gray-600);
//           padding: 0.25rem 0.5rem;
//           border-radius: 0.5rem;
//           font-size: 0.75rem;
//           font-weight: 600;
//         }

//         .file-preview {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           background: white;
//           padding: 1rem;
//           border-radius: 1rem;
//           box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
//         }

//         .file-info {
//           display: flex;
//           align-items: center;
//           gap: 1rem;
//         }

//         .file-icon {
//           font-size: 2rem;
//         }

//         .file-details h4 {
//           margin: 0;
//           color: var(--gray-800);
//           font-weight: 600;
//         }

//         .file-details p {
//           margin: 0.25rem 0 0 0;
//           color: var(--gray-500);
//           font-size: 0.9rem;
//         }

//         .remove-file-btn {
//           background: var(--danger-color);
//           color: white;
//           border: none;
//           width: 2rem;
//           height: 2rem;
//           border-radius: 50%;
//           cursor: pointer;
//           transition: all 0.2s ease;
//           font-weight: bold;
//         }

//         .remove-file-btn:hover {
//           background: #dc2626;
//           transform: scale(1.1);
//         }

//         .progress-section {
//           margin: 1.5rem 0;
//         }

//         .progress-bar {
//           width: 100%;
//           height: 8px;
//           background: var(--gray-200);
//           border-radius: 4px;
//           overflow: hidden;
//           margin-bottom: 0.5rem;
//         }

//         .progress-fill {
//           height: 100%;
//           background: linear-gradient(
//             90deg,
//             var(--primary-color),
//             var(--primary-dark)
//           );
//           transition: width 0.3s ease;
//           position: relative;
//         }

//         .progress-fill::after {
//           content: "";
//           position: absolute;
//           top: 0;
//           left: 0;
//           bottom: 0;
//           right: 0;
//           background: linear-gradient(
//             90deg,
//             transparent,
//             rgba(255, 255, 255, 0.3),
//             transparent
//           );
//           animation: shimmer 1.5s infinite;
//         }

//         @keyframes shimmer {
//           0% {
//             transform: translateX(-100%);
//           }
//           100% {
//             transform: translateX(100%);
//           }
//         }

//         .progress-text {
//           text-align: center;
//           color: var(--gray-600);
//           font-weight: 600;
//           margin: 0;
//         }

//         .submit-btn {
//           width: 100%;
//           margin-top: 1rem;
//           position: relative;
//         }

//         .btn-icon {
//           margin-right: 0.5rem;
//         }

//         .modern-error {
//           border-left: 4px solid var(--danger-color);
//         }

//         .error-content {
//           display: flex;
//           align-items: flex-start;
//           gap: 1rem;
//         }

//         .error-content h4 {
//           margin: 0 0 0.25rem 0;
//           color: var(--danger-color);
//           font-weight: 700;
//         }

//         .error-content p {
//           margin: 0;
//           color: #991b1b;
//         }

//         .modern-result {
//           border-left: 4px solid var(--success-color);
//         }

//         .result-header {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           margin-bottom: 1.5rem;
//           padding-bottom: 1rem;
//           border-bottom: 1px solid var(--gray-200);
//         }

//         .result-actions {
//           display: flex;
//           gap: 0.5rem;
//         }

//         .action-btn {
//           background: var(--gray-100);
//           border: 1px solid var(--gray-300);
//           color: var(--gray-700);
//           padding: 0.5rem 1rem;
//           border-radius: 0.75rem;
//           font-weight: 600;
//           cursor: pointer;
//           transition: all 0.2s ease;
//           font-size: 0.9rem;
//         }

//         .action-btn:hover {
//           background: var(--gray-200);
//           transform: translateY(-1px);
//           box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
//         }

//         .result-content {
//           line-height: 1.8;
//         }

//         .result-content h2 {
//           color: var(--primary-color);
//           font-weight: 800;
//           margin: 1.5rem 0 1rem 0;
//           font-size: 1.4rem;
//         }

//         .result-content h3 {
//           color: var(--gray-700);
//           font-weight: 700;
//           margin: 1.25rem 0 0.75rem 0;
//           font-size: 1.2rem;
//         }

//         .result-content h4 {
//           color: var(--gray-600);
//           font-weight: 600;
//           margin: 1rem 0 0.5rem 0;
//           font-size: 1.1rem;
//         }

//         @media (max-width: 768px) {
//           .result-header {
//             flex-direction: column;
//             gap: 1rem;
//             align-items: flex-start;
//           }

//           .result-actions {
//             width: 100%;
//             justify-content: stretch;
//           }

//           .action-btn {
//             flex: 1;
//             text-align: center;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

// export default NotesProcessor;
//////





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
    <div className="component">
      <div className="component-header">
        <div className="header-content">
          <h2>Process Your Notes</h2>
          <div className="feature-badge">AI-Powered</div>
        </div>
        <p className="description">
          Upload your notes, PDFs, or PowerPoint presentations to get
          ADHD-friendly study guides with key points and summaries.
        </p>
      </div>

      <div className="upload-section card">
        <form onSubmit={handleSubmit} className="upload-form">
          <div
            className={`file-drop-zone ${dragOver ? "drag-over" : ""} ${file ? "has-file" : ""}`}
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
              className="file-input-hidden"
            />

            {!file ? (
              <div className="drop-zone-content">
                <div className="upload-icon">
                  <Icon name="upload" size={48} />
                </div>
                <h3>Drop your file here or click to browse</h3>
                <p>
                  Supports text documents, PDFs, and PowerPoint presentations
                </p>
                <div className="supported-formats">
                  <span className="format-badge">TXT</span>
                  <span className="format-badge">PDF</span>
                  <span className="format-badge">PPTX</span>
                </div>
              </div>
            ) : (
              <div className="file-preview">
                <div className="file-info">
                  <div className="file-icon">
                    {file.type === "application/pdf" ? (
                      <Icon name="file-pdf" />
                    ) : file.type === "application/vnd.ms-powerpoint" ||
                      file.type ===
                        "application/vnd.openxmlformats-officedocument.presentationml.presentation" ? (
                      <Icon name="file-ppt" />
                    ) : (
                      <Icon name="file" />
                    )}
                  </div>
                  <div className="file-details">
                    <h4>{file.name}</h4>
                    <p>
                      {formatFileSize(file.size)} •{" "}
                      {file.type.includes("pdf")
                        ? "PDF Document"
                        : file.type.includes("presentation")
                        ? "PowerPoint Presentation"
                        : "Text File"}
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

          {loading && (
            <div className="progress-section">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="progress-text">
                Processing your content... {Math.round(progress)}%
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !file}
            className={`btn-primary submit-btn ${loading ? "loading" : ""}`}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Processing...
              </>
            ) : (
              <>
                <span className="btn-icon">
                  <Icon name="arrow-right" size={18} />
                </span>
                Process Content
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
            <h3>Your Study Guide is Ready!</h3>
            <div className="result-actions">
              <button
                className="action-btn copy-btn"
                onClick={() => navigator.clipboard?.writeText(result)}
              >
                <Icon name="copy" size={16} /> Copy
              </button>
              <button
                className="action-btn download-btn"
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
                <Icon name="download" size={16} /> Download
              </button>
            </div>
          </div>
          <div
            className="result-content"
            dangerouslySetInnerHTML={{
              __html: result
                .replace(/\\(.?)\\*/g, "<strong>$1</strong>")
                .replace(/\n/g, "<br/>")
                .replace(/#{3}\s(.*?)$/gm, "<h4>$1</h4>")
                .replace(/#{2}\s(.*?)$/gm, "<h3>$1</h3>")
                .replace(/#{1}\s(.*?)$/gm, "<h2>$1</h2>"),
            }}
          />
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

        .upload-section {
          margin-bottom: 2rem;
        }

        .file-drop-zone {
          border: 3px dashed var(--gray-300);
          border-radius: 1.5rem;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: var(--gray-50);
          position: relative;
          overflow: hidden;
        }

        .file-drop-zone::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(102, 126, 234, 0.1),
            transparent
          );
          transition: left 0.5s;
        }

        .file-drop-zone:hover::before {
          left: 100%;
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

        .drop-zone-content h3 {
          margin: 1rem 0 0.5rem 0;
          color: var(--gray-700);
          font-weight: 700;
        }

        .drop-zone-content p {
          color: var(--gray-500);
          margin-bottom: 1rem;
        }

        .upload-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .supported-formats {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }

        .format-badge {
          background: var(--gray-200);
          color: var(--gray-600);
          padding: 0.25rem 0.5rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .file-preview {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          padding: 1rem;
          border-radius: 1rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .file-icon {
          font-size: 2rem;
        }

        .file-details h4 {
          margin: 0;
          color: var(--gray-800);
          font-weight: 600;
        }

        .file-details p {
          margin: 0.25rem 0 0 0;
          color: var(--gray-500);
          font-size: 0.9rem;
        }

        .remove-file-btn {
          background: var(--danger-color);
          color: white;
          border: none;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: bold;
        }

        .remove-file-btn:hover {
          background: #dc2626;
          transform: scale(1.1);
        }

        .progress-section {
          margin: 1.5rem 0;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: var(--gray-200);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(
            90deg,
            var(--primary-color),
            var(--primary-dark)
          );
          transition: width 0.3s ease;
          position: relative;
        }

        .progress-fill::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .progress-text {
          text-align: center;
          color: var(--gray-600);
          font-weight: 600;
          margin: 0;
        }

        .submit-btn {
          width: 100%;
          margin-top: 1rem;
          position: relative;
        }

        .btn-icon {
          margin-right: 0.5rem;
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

        .result-content {
          line-height: 1.8;
        }

        .result-content h2 {
          color: var(--primary-color);
          font-weight: 800;
          margin: 1.5rem 0 1rem 0;
          font-size: 1.4rem;
        }

        .result-content h3 {
          color: var(--gray-700);
          font-weight: 700;
          margin: 1.25rem 0 0.75rem 0;
          font-size: 1.2rem;
        }

        .result-content h4 {
          color: var(--gray-600);
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
          font-size: 1.1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
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
        }
      `}</style>
    </div>
  );
}

export default NotesProcessor;