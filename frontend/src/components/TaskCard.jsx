import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react'

const priorityColors = {
  1: 'bg-red-100 text-red-800 border-red-200',
  2: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  3: 'bg-green-100 text-green-800 border-green-200'
}

const priorityLabels = {
  1: 'High',
  2: 'Medium',
  3: 'Low'
}

const statusIcons = {
  pending: Circle,
  in_progress: Clock,
  completed: CheckCircle
}

const categoryColors = {
  work: 'bg-blue-100 text-blue-800',
  personal: 'bg-purple-100 text-purple-800',
  study: 'bg-indigo-100 text-indigo-800',
  health: 'bg-green-100 text-green-800',
  general: 'bg-slate-100 text-slate-800'
}

const TaskCard = ({ task, onStatusChange, onDelete }) => {
  const StatusIcon = statusIcons[task.status] || Circle

  const handleStatusChange = () => {
    if (onStatusChange) {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed'
      onStatusChange(task.id, { status: newStatus })
    }
  }

  return (
    <div className="card group hover:scale-[1.01] transition-transform">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <button
            onClick={handleStatusChange}
            className={`mt-0.5 transition-colors ${
              task.status === 'completed' 
                ? 'text-green-500' 
                : 'text-slate-400 hover:text-primary-500'
            }`}
          >
            <StatusIcon className="w-5 h-5" />
          </button>
          
          <div className="flex-1">
            <h3 className={`font-medium text-slate-900 ${
              task.status === 'completed' ? 'line-through text-slate-500' : ''
            }`}>
              {task.title}
            </h3>
            
            {task.description && (
              <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
            
            <div className="flex items-center space-x-2 mt-3">
              <span className={`badge ${priorityColors[task.priority]}`}>
                {priorityLabels[task.priority]}
              </span>
              
              {task.category && (
                <span className={`badge ${categoryColors[task.category] || categoryColors.general}`}>
                  {task.category}
                </span>
              )}
              
              {task.estimated_duration && (
                <span className="text-xs text-slate-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {task.estimated_duration} min
                </span>
              )}
            </div>
          </div>
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(task.id)}
            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
          >
            <AlertCircle className="w-4 h-4" />
          </button>
        )}
      </div>

      {task.due_date && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Due: {new Date(task.due_date).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  )
}

export default TaskCard