// import { useState } from 'react'
// import axios from 'axios'

// function StudySchedule() {
//   const [examDate, setExamDate] = useState('')
//   const [startDate, setStartDate] = useState('')
//   const [endDate, setEndDate] = useState('')
//   const [topics, setTopics] = useState('')
//   const [hoursPerDay, setHoursPerDay] = useState('2')
//   const [loading, setLoading] = useState(false)
//   const [schedule, setSchedule] = useState(null)
//   const [error, setError] = useState(null)

//   const handleSubmit = async (e) => {
//     e.preventDefault()
    
//     if (!topics) {
//       setError('Please fill in topics')
//       return
//     }
//     if (startDate && endDate && startDate > endDate) {
//       setError('Start date cannot be after end date')
//       return
//     }

//     setLoading(true)
//     setError(null)

//     try {
//       const response = await axios.post('/api/study-schedule', {
//         examDate,
//         startDate,
//         endDate,
//         topics,
//         hoursPerDay
//       })
      
//       setSchedule(response.data.schedule)
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to generate schedule')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleDownloadPdf = () => {
//     if (!schedule) return
//     const html = schedule
//       .replace(/\\(.?)\\*/g, '<strong>$1</strong>')
//       .replace(/\n/g, '<br/>')

//     const printable = `<!doctype html>
// <html>
//   <head>
//     <meta charset="utf-8" />
//     <title>Study Schedule</title>
//     <style>
//       @media print {
//         @page { margin: 16mm; }
//       }
//       body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #111827; padding: 24px; }
//       h1,h2,h3 { margin: 0 0 12px; }
//       .muted { color: #6b7280; margin-bottom: 16px; }
//       .content { line-height: 1.6; font-size: 14px; }
//       .content strong { color: #111827; }
//       .header { margin-bottom: 16px; }
//       .brand { font-weight: 800; color: #4f46e5; }
//       .divider { height: 1px; background: #e5e7eb; margin: 12px 0 18px; }
//     </style>
//   </head>
//   <body>
//     <div class="header">
//       <h2 class="brand">Study Schedule</h2>
//       <div class="muted">Exported from ADHD Meeting Assistant</div>
//       <div class="divider"></div>
//     </div>
//     <div class="content">${html}</div>
//     <script>
//       window.onload = function(){
//         window.print();
//         setTimeout(function(){ window.close(); }, 300);
//       };
//     </script>
//   </body>
// </html>`

//     const w = window.open('', '_blank', 'width=900,height=1000')
//     if (w) {
//       w.document.open()
//       w.document.write(printable)
//       w.document.close()
//     }
//   }

//   return (
//     <div className="component">
//       <h2>📅 Study Schedule</h2>
//       <p className="description">
//         Create an ADHD-friendly study schedule with manageable daily tasks and built-in breaks.
//       </p>

//       <form onSubmit={handleSubmit} className="schedule-form">
//         <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
//           <div>
//             <label htmlFor="start-date">Start Date</label>
//             <input
//               type="date"
//               id="start-date"
//               value={startDate}
//               onChange={(e) => setStartDate(e.target.value)}
//               className="form-input"
//             />
//           </div>
//           <div>
//             <label htmlFor="end-date">End Date</label>
//             <input
//               type="date"
//               id="end-date"
//               value={endDate}
//               onChange={(e) => setEndDate(e.target.value)}
//               className="form-input"
//             />
//           </div>
//         </div>

//         <div className="form-group">
//           <label htmlFor="exam-date">Exam Date (optional)</label>
//           <input
//             type="date"
//             id="exam-date"
//             value={examDate}
//             onChange={(e) => setExamDate(e.target.value)}
//             className="form-input"
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="topics">Topics to Study</label>
//           <textarea
//             id="topics"
//             value={topics}
//             onChange={(e) => setTopics(e.target.value)}
//             placeholder="e.g., Calculus: derivatives, integrals; Physics: mechanics, thermodynamics"
//             rows="4"
//             className="form-input"
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="hours">Hours Available Per Day</label>
//           <select
//             id="hours"
//             value={hoursPerDay}
//             onChange={(e) => setHoursPerDay(e.target.value)}
//             className="form-input"
//           >
//             <option value="1">1 hour</option>
//             <option value="2">2 hours</option>
//             <option value="3">3 hours</option>
//             <option value="4">4 hours</option>
//             <option value="5">5 hours</option>
//           </select>
//         </div>

//         <button 
//           type="submit" 
//           disabled={loading}
//           className="btn-primary"
//         >
//           {loading ? '⏳ Creating Schedule...' : '📅 Generate Schedule'}
//         </button>
//       </form>

//       {error && <div className="error">{error}</div>}

//       {schedule && (
//         <div className="result">
//           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//             <h3>✨ Your Study Schedule</h3>
//             <button onClick={handleDownloadPdf} className="action-btn download-btn">💾 Download PDF</button>
//           </div>
//           <div className="result-content" dangerouslySetInnerHTML={{ 
//             __html: schedule.replace(/\\(.?)\\*/g, '<strong>$1</strong>')
//                             .replace(/\n/g, '<br/>')
//           }} />
//         </div>
//       )}
//     </div>
//   )
// }

// export default StudySchedule



import { useState } from 'react'
import axios from 'axios'
import Icon from './Icon'

function StudySchedule() {
  const [examDate, setExamDate] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [topics, setTopics] = useState('')
  const [hoursPerDay, setHoursPerDay] = useState('2')
  const [loading, setLoading] = useState(false)
  const [schedule, setSchedule] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!topics) {
      setError('Please fill in topics')
      return
    }
    if (startDate && endDate && startDate > endDate) {
      setError('Start date cannot be after end date')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.post('/api/study-schedule', {
        examDate,
        startDate,
        endDate,
        topics,
        hoursPerDay
      })
      
      setSchedule(response.data.schedule)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate schedule')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPdf = () => {
    if (!schedule) return
    const html = schedule
      .replace(/\\(.?)\\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')

    const printable = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Study Schedule</title>
    <style>
      @media print {
        @page { margin: 16mm; }
      }
      body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #111827; padding: 24px; }
      h1,h2,h3 { margin: 0 0 12px; }
      .muted { color: #6b7280; margin-bottom: 16px; }
      .content { line-height: 1.6; font-size: 14px; }
      .content strong { color: #111827; }
      .header { margin-bottom: 16px; }
      .brand { font-weight: 800; color: #4f46e5; }
      .divider { height: 1px; background: #e5e7eb; margin: 12px 0 18px; }
    </style>
  </head>
  <body>
    <div class="header">
      <h2 class="brand">Study Schedule</h2>
      <div class="muted">Exported from ADHD Meeting Assistant</div>
      <div class="divider"></div>
    </div>
    <div class="content">${html}</div>
    <script>
      window.onload = function(){
        window.print();
        setTimeout(function(){ window.close(); }, 300);
      };
    </script>
  </body>
</html>`

    const w = window.open('', '_blank', 'width=900,height=1000')
    if (w) {
      w.document.open()
      w.document.write(printable)
      w.document.close()
    }
  }

  return (
    <div className="component">
      <h2>Study Schedule</h2>
      <p className="description">
        Create an ADHD-friendly study schedule with manageable daily tasks and built-in breaks.
      </p>

      <form onSubmit={handleSubmit} className="schedule-form">
        <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label htmlFor="start-date">Start Date</label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <label htmlFor="end-date">End Date</label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="exam-date">Exam Date (optional)</label>
          <input
            type="date"
            id="exam-date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="topics">Topics to Study</label>
          <textarea
            id="topics"
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            placeholder="e.g., Calculus: derivatives, integrals; Physics: mechanics, thermodynamics"
            rows="4"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="hours">Hours Available Per Day</label>
          <select
            id="hours"
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(e.target.value)}
            className="form-input"
          >
            <option value="1">1 hour</option>
            <option value="2">2 hours</option>
            <option value="3">3 hours</option>
            <option value="4">4 hours</option>
            <option value="5">5 hours</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Creating Schedule...' : 'Generate Schedule'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {schedule && (
        <div className="result">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3>Your Study Schedule</h3>
            <button onClick={handleDownloadPdf} className="action-btn download-btn"><Icon name="download" size={16} /> Download PDF</button>
          </div>
          <div className="result-content" dangerouslySetInnerHTML={{ 
            __html: schedule.replace(/\\(.?)\\*/g, '<strong>$1</strong>')
                            .replace(/\n/g, '<br/>')
          }} />
        </div>
      )}
    </div>
  )
}

export default StudySchedule