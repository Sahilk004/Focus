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
    <div className="space-y-6">
      <div className="glass-panel p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Icon name="calendar" size={14} />
            Smart Planning
          </div>
          <h2 className="text-2xl font-bold text-dark-900 mb-2">Study Schedule Generator</h2>
          <p className="text-dark-500 max-w-lg mx-auto">
            Create an ADHD-friendly study schedule with manageable daily tasks and built-in breaks to keep you on track.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="start-date" className="block text-sm font-semibold text-dark-700">Start Date</label>
              <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-dark-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="end-date" className="block text-sm font-semibold text-dark-700">End Date</label>
              <input
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-dark-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="exam-date" className="block text-sm font-semibold text-dark-700">Exam Date (optional)</label>
              <input
                type="date"
                id="exam-date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-dark-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="hours" className="block text-sm font-semibold text-dark-700">Hours Per Day</label>
              <div className="relative">
                <select
                  id="hours"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-dark-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all shadow-sm appearance-none"
                >
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                  <option value="4">4 hours</option>
                  <option value="5">5 hours</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-dark-400">
                  <Icon name="chevron-down" size={16} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="topics" className="block text-sm font-semibold text-dark-700">Topics to Study</label>
            <textarea
              id="topics"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="e.g., Calculus: derivatives, integrals; Physics: mechanics, thermodynamics"
              rows="4"
              className="w-full px-4 py-3 bg-white border border-dark-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all shadow-sm resize-none"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-2 animate-slide-up">
              <Icon name="alert-triangle" size={18} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating Schedule...
              </>
            ) : (
              <>
                <Icon name="calendar" size={20} className="group-hover:scale-110 transition-transform" />
                Generate Study Plan
                <Icon name="arrow-right" size={18} className="opacity-70 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>

      {schedule && (
        <div className="glass-panel p-0 overflow-hidden animate-slide-up">
          <div className="p-4 border-b border-white/20 bg-white/40 flex items-center justify-between">
            <h3 className="font-bold text-lg text-primary-800 flex items-center gap-2">
              <Icon name="check-circle" size={20} className="text-success-500" />
              Your Study Schedule
            </h3>
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-dark-200 rounded-lg text-sm font-medium text-dark-600 hover:text-primary-600 hover:border-primary-200 transition-colors shadow-sm"
            >
              <Icon name="download" size={14} /> Download PDF
            </button>
          </div>

          <div className="p-6 bg-white/50">
            <div
              className="prose prose-sm max-w-none prose-p:text-dark-600 prose-headings:text-dark-800 prose-ul:list-disc prose-ul:pl-5"
              dangerouslySetInnerHTML={{
                __html: schedule.replace(/\\(.?)\\*/g, '<strong>$1</strong>')
                  .replace(/\n/g, '<br/>')
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default StudySchedule