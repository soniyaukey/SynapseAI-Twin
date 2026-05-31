import { useState, useEffect } from 'react'
import { Calendar, Clock, RefreshCw, Zap, ChevronLeft, ChevronRight } from 'lucide-react'
import ScheduleView from '../components/ScheduleView'
import { mockData } from '../services/api'

const Schedule = () => {
  const [schedule, setSchedule] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    // Simulate loading schedule
    setTimeout(() => {
      setSchedule(mockData.schedule)
      setLoading(false)
    }, 600)
  }, [])

  const handleGenerateSchedule = () => {
    setGenerating(true)
    
    // Simulate schedule generation
    setTimeout(() => {
      const newSchedule = {
        ...mockData.schedule,
        date: selectedDate.toISOString().split('T')[0],
        slots: mockData.schedule.slots.map((slot, i) => ({
          ...slot,
          start: `${9 + i}:00`,
          end: `${10 + i}:00`
        }))
      }
      setSchedule(newSchedule)
      setGenerating(false)
    }, 1500)
  }

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    setSelectedDate(newDate)
  }

  const goToNextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
          <div className="h-16 bg-slate-200 rounded mb-6"></div>
          <div className="h-96 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Smart Schedule</h1>
          <p className="text-slate-600 mt-1">AI-powered daily schedule optimization</p>
        </div>
        <button
          onClick={handleGenerateSchedule}
          disabled={generating}
          className="btn-primary flex items-center space-x-2"
        >
          <RefreshCw className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
          <span>{generating ? 'Generating...' : 'Regenerate Schedule'}</span>
        </button>
      </div>

      {/* Date Navigation */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousDay}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              <span className="text-lg font-semibold text-slate-900">
                {formatDate(selectedDate)}
              </span>
            </div>
            <button
              onClick={goToToday}
              className="text-sm text-primary-600 hover:text-primary-700 mt-1"
            >
              Go to today
            </button>
          </div>

          <button
            onClick={goToNextDay}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Schedule View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ScheduleView schedule={schedule} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Productivity Tips */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-slate-900">Productivity Tips</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">Best Focus Time</p>
                <p className="text-sm text-green-600">9 AM - 11 AM</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Break Recommendation</p>
                <p className="text-sm text-blue-600">Take 5 min break every hour</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-800">Deep Work Window</p>
                <p className="text-sm text-purple-600">2-3 hours optimal</p>
              </div>
            </div>
          </div>

          {/* Time Statistics */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="w-5 h-5 text-slate-600" />
              <h3 className="font-semibold text-slate-900">Time Distribution</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Work</span>
                  <span className="font-medium">65%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div className="h-2 bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Personal</span>
                  <span className="font-medium">20%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div className="h-2 bg-purple-500 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Break</span>
                  <span className="font-medium">15%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div className="h-2 bg-green-500 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                + Add time block
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                + Add meeting
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                + Add break
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Schedule