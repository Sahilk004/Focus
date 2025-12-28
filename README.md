# 🎯 ByteForge - FocusFlow

> **Real-Time Meeting Assistant for ADHD and Neurodivergent Students**

A comprehensive full-stack web application designed to help students with ADHD and Autism manage their studies more effectively. The platform processes notes, transcribes audio/video content, generates intelligent summaries, and provides an AI-powered chat assistant with context-aware responses.

---

## ✨ Features

### 📝 Process Notes
- Upload and process PDF and text files
- Extract text content from PDFs using advanced parsing
- Generate ADHD-friendly summaries with key concepts, digestible chunks, and study tips
- Automatically break down complex content into manageable sections

### 🎙️ Live Recording
- Real-time meeting and lecture recording using browser MediaRecorder API
- Instant transcription of recorded audio
- Role-aware summaries tailored to user's perspective (Student, Developer, etc.)
- Automatic generation of study artifacts (notes, flashcards, quizzes)

### 🎥 Upload Media
- Upload audio/video files or provide YouTube URLs
- Multiple transcription strategies with intelligent fallback:
  - Supadata API for fast transcriptions
  - AssemblyAI for comprehensive summaries
  - Local transcription via Groq Whisper
- Download and process YouTube videos automatically
- Generate study materials from video content

### 💬 Ask Questions (Smart Chat)
- Context-aware AI chat assistant
- **Intelligent Resource Filtering**: Automatically detects when you mention specific resources
  - "PDF notes" → Uses only PDF/notes context
  - "YouTube video" → Uses only video/YouTube context
  - "Live recording" → Uses only recording context
  - No mention → Uses all available context
- Retrieves context from all previous sessions stored in database
- Real-time conversation with ADHD-friendly responses

### 📅 Study Schedule Generator
- Create personalized study schedules based on exam dates
- Input topics and available study hours
- AI-generated day-by-day study plans with breaks and variety
- Optimized for ADHD-friendly learning patterns

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database and ODM
- **Groq SDK** - AI/ML services (LLaMA 3.3 & Whisper)
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Multer** - File upload handling
- **pdf-parse** (v2.4.5) - PDF text extraction
- **ytdl-core** - YouTube video downloading
- **Zod** - Input validation

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Axios** - HTTP client
- **CSS3** - Styling with modern features

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local instance or MongoDB Atlas account)
- **Groq API Key** ([Get one here](https://console.groq.com/))

### Optional (for YouTube processing)
- **Supadata API Key** (for fast transcriptions)
- **AssemblyAI API Key** (for advanced transcriptions)
- **yt-dlp** (for YouTube download fallback)
- **FFmpeg** (for audio conversion)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ByteForge
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=3001

# Database
MONGO_URI=mongodb://localhost:27017/focusflow
# Or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/focusflow

# JWT Secret (generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Groq AI API (Required)
GROQ_API_KEY=your_groq_api_key_here

# Optional: YouTube Transcription Services
SUPADATA_API_KEY=your_supadata_key_here
ASSEMBLYAI_API_KEY=your_assemblyai_key_here

# Optional: YouTube Download Settings
ALLOW_YOUTUBE_FALLBACK=true
ENABLE_YTDLP=true
ENABLE_FFMPEG=true
ENABLE_PIPED_FALLBACK=true
ENABLE_ASSEMBLYAI_URL=false
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory (optional):

```env
VITE_API_BASE_URL=http://localhost:3001
```

### 4. Start MongoDB

**Local MongoDB:**
```bash
# If using local MongoDB, make sure it's running
mongod
```

**MongoDB Atlas:**
- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string and add it to `.env`

---

## 🏃 Running the Project

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server will run on `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173` (or port shown in terminal)

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Login

### Features
- `POST /api/process-notes` - Upload and process PDF/text files
- `POST /api/transcribe` - Transcribe audio file
- `POST /api/transcribe-media` - Upload media or YouTube URL
- `POST /api/chat` - Chat with AI assistant
- `POST /api/study-schedule` - Generate study schedule

### Results Management
- `GET /api/results` - List all user results (optional: `?type=notes|media|transcribe`)
- `GET /api/results/:id` - Get specific result
- `DELETE /api/results/:id` - Delete result

### Health Check
- `GET /api/health` - Server status

**Note:** All endpoints except `/api/health` and `/api/auth/*` require JWT authentication.

---

## 📁 Project Structure

```
ByteForge/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB connection
│   │   ├── controllers/          # Business logic
│   │   │   ├── authController.js
│   │   │   ├── chatController.js
│   │   │   ├── mediaController.js
│   │   │   ├── notesController.js
│   │   │   ├── scheduleController.js
│   │   │   ├── transcribeController.js
│   │   │   └── resultsController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js  # JWT verification
│   │   │   ├── errorHandler.js   # Error handling
│   │   │   └── validateInput.js # Input validation
│   │   ├── models/
│   │   │   ├── userModel.js      # User schema
│   │   │   └── resultModel.js    # Results schema
│   │   ├── routes/
│   │   │   ├── api.js            # API routes
│   │   │   └── authRoutes.js    # Auth routes
│   │   ├── utils/
│   │   │   ├── aiGenerator.js    # Groq AI integration
│   │   │   ├── fileHandler.js    # File upload config
│   │   │   ├── tokenUtils.js     # JWT utilities
│   │   │   └── youtube.js        # YouTube processing
│   │   └── server.js             # Express app setup
│   ├── uploads/                  # Temporary file storage
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ChatAssistant.jsx
    │   │   ├── Login.jsx
    │   │   ├── MeetingAssistant.jsx
    │   │   ├── MeetingTranscriber.jsx
    │   │   ├── NotesProcessor.jsx
    │   │   ├── StudySchedule.jsx
    │   │   └── Icon.jsx
    │   ├── App.jsx               # Main component
    │   ├── App.css               # Global styles
    │   └── main.jsx              # React entry point
    └── package.json
```

---

## 🔑 Key Features Explained

### Context-Aware Chat System

The chat assistant intelligently filters context based on your question:
- **Resource Detection**: Analyzes your question for keywords like "PDF", "YouTube", "recording"
- **Smart Filtering**: Only uses relevant stored data from previous sessions
- **Context Combination**: Merges current tab context with database context
- **Real-time Updates**: Automatically loads context from all previous sessions

### Multi-Strategy YouTube Processing

When processing YouTube videos, the system requires:
1. **ytdl-core** (direct download)
2. ffmpeg (installed with ytdl)

This ensures maximum reliability and uptime.

### PDF Processing with Modern API

Uses pdf-parse v2.4.5 with the new PDFParse class API:
- Creates parser instance with buffer data
- Extracts text using `getText()` method
- Properly cleans up resources with `destroy()`
- Handles both PDF and plain text files

### Role-Aware Summaries

Transcriptions can be customized for different roles:
- **Student**: Focus on learning objectives, key concepts
- **Developer**: Technical details, code references
- **Manager**: Action items, decisions, follow-ups
- **Default**: General-purpose summary

---

## 🔒 Security Features

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Authentication**: Secure token-based auth (7-day expiration)
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Zod schema validation for all user inputs
- **CORS Protection**: Configured for secure cross-origin requests
- **Error Handling**: Comprehensive error handling with user-friendly messages

---

## 📝 Usage Examples

### Processing a PDF
1. Navigate to "Process Notes" tab
2. Drag and drop or select a PDF file
3. Wait for processing (shows progress)
4. View the processed, ADHD-friendly breakdown

### Recording a Meeting
1. Go to "Live Recording" tab
2. Click "Start Recording"
3. Speak or let the meeting record
4. Click "Stop Recording"
5. View transcript and AI-generated summary

### Asking Questions
1. Go to "Ask Questions" tab
2. Type: "Summarize the key points from my PDF notes"
3. The system automatically filters to only PDF context
4. Get a precise answer based on your notes

### YouTube Video Processing
1. Go to "Upload Media" tab
2. Paste a YouTube URL
3. System downloads and transcribes automatically
4. Get transcript, summary, flashcards, and quiz

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or Atlas cluster is accessible
- Check `.env` file has correct `MONGO_URI`
- Verify network connectivity

### PDF Parsing Errors
- Ensure PDF files are not corrupted
- Check file size (max 50MB)
- Verify pdf-parse package is installed correctly

### YouTube Download Failures
- Check if video is publicly accessible
- Enable fallback options in `.env`
- Verify yt-dlp is installed if using that option

### AI API Errors
- Verify `GROQ_API_KEY` is set correctly
- Check API quota limits
- Ensure internet connection is stable

---

## 🤝 Contributing

This project was built as a hackathon submission. Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

This project is open source and available for educational purposes.

---

## 🙏 Acknowledgments

- **Groq** for providing fast AI inference
- **MongoDB** for database services
- All open-source libraries used in this project

---

## 📧 Contact

For questions or support, please open an issue on the repository.

---

**Built with ❤️ for ADHD and Neurodivergent Students**
