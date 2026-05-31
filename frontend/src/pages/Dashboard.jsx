import { useState, useEffect } from 'react'
import { Brain, CheckSquare, Calendar, TrendingUp, Zap, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import TaskCard from '../components/TaskCard'
import ScheduleView from '../components/ScheduleView'
import ProductivityChart from '../components/ProductivityChart'
import SuggestionPanel from '../components/SuggestionPanel'
import { mockData } from '../services/api'

const Dashboard = () => {
  const [tasks, setTasks] = useState([])
  const [predictions, setPredictions] = useState([])
  const [schedule, setSchedule] = useState(null)
  const [productivity, setProductivity] = useState(null)
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API loading with mock data
    setTimeout(() => {
      setTasks(mockData.tasks.slice(0, 4))
      setPredictions(mockData.predictions)
      setSchedule(mockData.schedule)
      setProductivity(mockData.productivity)
      setInsights(mockData.insights)
      setLoading(false)
    }, 800)
  }, [])

  const stats = [
    {
      label: 'Tasks Today',
      value: tasks.filter(t => t.status !== 'completed').length,
      icon: CheckSquare,
      color: 'bg-blue-500',
      link: '/tasks'
    },
    {
      label: 'Scheduled Hours',
      value: schedule ? Math.round(schedule.summary.total_duration / 60) : 0,
      icon: Calendar,
      color: 'bg-purple-500',
      link: '/schedule'
    },
    {
      label: 'Productivity',
      value: productivity ? `${Math.round(productivity.average_score)}%` : '0%',
      icon: TrendingUp,
      color: 'bg-green-500',
      link: '/analytics'
    },
    {
      label: 'AI Predictions',
      value: predictions.length,
      icon: Brain,
      color: 'bg-amber-500',
      link: '/tasks'
    }
  ]

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-96 bg-slate-200 rounded-xl lg:col-span-2"></div>
            <div className="h-96 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Welcome back! 👋</h1>
        <p className="text-slate-600 mt-2">Here's your productivity overview for today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Link
              key={index}
              to={stat.link}
              className="card hover:scale-[1.02] transition-transform cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>View details</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tasks & Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Tasks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">Upcoming Tasks</h2>
              <Link to="/tasks" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-3">
              {tasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>

          {/* AI Predictions */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-semibold text-slate-900">Next Predicted Tasks</h2>
            </div>
            <div className="card">
              <div className="space-y-3">
                {predictions.map((pred, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{pred.task}</p>
                      <p className="text-sm text-slate-500">{pred.reason}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-primary-600">{Math.round(pred.probability * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Schedule & Insights */}
        <div className="space-y-6">
          {/* Schedule */}
          <ScheduleView schedule={schedule} />

          {/* Productivity Chart */}
          <ProductivityChart data={productivity} type="area" />

          {/* AI Insights */}
          <SuggestionPanel suggestions={insights} title="Productivity Insights" />
        </div>
      </div>
    </div>
  )
}

export default Dashboard