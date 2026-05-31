import { Clock, Zap, ChevronRight } from 'lucide-react'

const categoryColors = {
  work: 'bg-blue-500',
  personal: 'bg-purple-500',
  study: 'bg-indigo-500',
  health: 'bg-green-500',
  general: 'bg-slate-500'
}

const priorityLabels = {
  1: 'High',
  2: 'Medium',
  3: 'Low'
}

const ScheduleView = ({ schedule, onSlotClick }) => {
  if (!schedule || !schedule.slots) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No schedule available</p>
          <p className="text-sm text-slate-400 mt-1">Generate a schedule to see your day</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Today's Schedule</h3>
          <p className="text-sm text-slate-500">{schedule.date}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">{schedule.summary?.total_tasks || 0}</p>
            <p className="text-xs text-slate-500">Tasks</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent-600">
              {Math.round((schedule.summary?.total_duration || 0) / 60)}h
            </p>
            <p className="text-xs text-slate-500">Duration</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">
              {schedule.summary?.productivity_score || 0}%
            </p>
            <p className="text-xs text-slate-500">Productivity</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {schedule.slots.map((slot, index) => (
          <div
            key={index}
            onClick={() => onSlotClick && onSlotClick(slot)}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group"
          >
            <div className="w-20 text-sm font-medium text-slate-600">
              {slot.start}
            </div>
            
            <div className={`w-1 h-10 rounded-full ${categoryColors[slot.category] || categoryColors.general}`} />
            
            <div className="flex-1">
              <p className="font-medium text-slate-900 group-hover:text-primary-600 transition-colors">
                {slot.task}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-slate-500">{slot.category}</span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500">Priority: {priorityLabels[slot.priority]}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {slot.productivity_boost > 0.8 && (
                <div className="flex items-center text-xs text-green-600">
                  <Zap className="w-3 h-3 mr-1" />
                  High focus
                </div>
              )}
              <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>

      {schedule.slots.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-500">No tasks scheduled for today</p>
        </div>
      )}
    </div>
  )
}

export default ScheduleView