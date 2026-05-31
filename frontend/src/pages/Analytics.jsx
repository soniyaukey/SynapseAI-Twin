import { useState, useEffect } from 'react'
import { BarChart3, Clock, Target, TrendingUp, Calendar, Award } from 'lucide-react'
import ProductivityChart from '../components/ProductivityChart'
import SuggestionPanel from '../components/SuggestionPanel'
import { mockData } from '../services/api'

const Analytics = () => {
  const [productivity, setProductivity] = useState(null)
  const [habits, setHabits] = useState([])
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState(7)

  useEffect(() => {
    // Simulate loading analytics data
    setTimeout(() => {
      setProductivity(mockData.productivity)
      setHabits(mockData.habits)
      setInsights(mockData.insights)
      setLoading(false)
    }, 600)
  }, [])

  const stats = [
    {
      label: 'Average Productivity',
      value: productivity ? `${Math.round(productivity.average_score)}%` : '0%',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Tasks Completed',
      value: '47',
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Focus Time',
      value: '32h',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Streak',
      value: '5 days',
      icon: Award,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    }
  ]

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-slate-200 rounded-xl"></div>
            <div className="h-80 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-600 mt-1">Track your productivity and habits</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center space-x-2 bg-white rounded-lg border border-slate-200 p-1">
          {[7, 14, 30].map(days => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                timeRange === days
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Chart */}
        <div className="lg:col-span-2">
          <ProductivityChart data={productivity} type="area" />
        </div>

        {/* Insights */}
        <div>
          <SuggestionPanel suggestions={insights} title="AI Insights" />
        </div>
      </div>

      {/* Habits Section */}
      <div className="mt-8">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-5 h-5 text-slate-600" />
          <h2 className="text-xl font-semibold text-slate-900">Detected Habits</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit, index) => (
            <div key={index} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-slate-900">{habit.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Typical time: {habit.pattern.typical_time}
                  </p>
                </div>
                <span className={`badge ${
                  habit.consistency === 'high' ? 'badge-success' :
                  habit.consistency === 'medium' ? 'badge-warning' : 'badge-error'
                }`}>
                  {habit.consistency}
                </span>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Frequency</p>
                  <p className="text-lg font-semibold">{habit.frequency}x/week</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Productivity</p>
                  <p className="text-lg font-semibold">{habit.productivity_score}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="mt-8 card">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-5 h-5 text-slate-600" />
          <h2 className="text-xl font-semibold text-slate-900">Weekly Summary</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-3xl font-bold text-primary-600">47</p>
            <p className="text-sm text-slate-600">Tasks Completed</p>
            <p className="text-xs text-green-600 mt-1">+12% from last week</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">32h</p>
            <p className="text-sm text-slate-600">Focus Time</p>
            <p className="text-xs text-green-600 mt-1">+5h from last week</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">80%</p>
            <p className="text-sm text-slate-600">Completion Rate</p>
            <p className="text-xs text-green-600 mt-1">+8% from last week</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics