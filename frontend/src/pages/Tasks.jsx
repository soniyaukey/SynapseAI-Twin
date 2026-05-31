import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Sparkles } from 'lucide-react'
import TaskCard from '../components/TaskCard'
import { mockData } from '../services/api'

const Tasks = () => {
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [nlpInput, setNlpInput] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading tasks
    setTimeout(() => {
      setTasks(mockData.tasks)
      setFilteredTasks(mockData.tasks)
      setLoading(false)
    }, 600)
  }, [])

  useEffect(() => {
    let filtered = tasks

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus)
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === parseInt(filterPriority))
    }

    setFilteredTasks(filtered)
  }, [searchQuery, filterStatus, filterPriority, tasks])

  const handleAddTask = () => {
    if (!nlpInput.trim()) return

    // Simulate NLP parsing
    const newTask = {
      id: Date.now(),
      title: nlpInput,
      description: 'Added via NLP input',
      priority: 2,
      status: 'pending',
      category: 'general',
      estimated_duration: 60,
      created_at: new Date().toISOString()
    }

    setTasks([newTask, ...tasks])
    setNlpInput('')
    setShowAddModal(false)
  }

  const handleStatusChange = (taskId, updates) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    ))
  }

  const handleDelete = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId))
  }

  const statusCounts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
          <div className="h-12 bg-slate-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
            ))}
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
          <h1 className="text-3xl font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-600 mt-1">Manage and track your tasks</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* NLP Input Section */}
      {showAddModal && (
        <div className="card mb-6 animate-fadeIn">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-slate-900">AI Task Input</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Try typing naturally! Example: "Finish assignment tomorrow by 5pm" or "Gym workout for 1 hour"
          </p>
          <div className="flex space-x-3">
            <input
              type="text"
              value={nlpInput}
              onChange={(e) => setNlpInput(e.target.value)}
              placeholder="Describe your task in natural language..."
              className="input flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <button onClick={handleAddTask} className="btn-primary">
              Add
            </button>
            <button
              onClick={() => setShowAddModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-slate-400" />
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input w-auto"
            >
              <option value="all">All Status ({statusCounts.all})</option>
              <option value="pending">Pending ({statusCounts.pending})</option>
              <option value="in_progress">In Progress ({statusCounts.in_progress})</option>
              <option value="completed">Completed ({statusCounts.completed})</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="input w-auto"
            >
              <option value="all">All Priority</option>
              <option value="1">High</option>
              <option value="2">Medium</option>
              <option value="3">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-slate-500">No tasks found</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-primary-600 hover:text-primary-700"
            >
              Add your first task
            </button>
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-slate-900">{statusCounts.pending}</p>
          <p className="text-sm text-slate-500">Pending</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-amber-600">{statusCounts.in_progress}</p>
          <p className="text-sm text-slate-500">In Progress</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">{statusCounts.completed}</p>
          <p className="text-sm text-slate-500">Completed</p>
        </div>
      </div>
    </div>
  )
}

export default Tasks