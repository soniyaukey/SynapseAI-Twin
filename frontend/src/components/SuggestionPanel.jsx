import { Lightbulb, Zap, Clock, Target, ChevronRight } from 'lucide-react'

const iconMap = {
  suggestion: Lightbulb,
  insight: Zap,
  tip: Clock,
  default: Target
}

const impactColors = {
  high: 'bg-red-50 border-red-200 text-red-700',
  medium: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  low: 'bg-green-50 border-green-200 text-green-700',
  positive: 'bg-blue-50 border-blue-200 text-blue-700',
  info: 'bg-slate-50 border-slate-200 text-slate-700'
}

const SuggestionPanel = ({ suggestions = [], title = 'AI Suggestions' }) => {
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        </div>
        <div className="text-center py-6">
          <p className="text-slate-500">No suggestions available</p>
          <p className="text-sm text-slate-400 mt-1">Complete more tasks to get personalized suggestions</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-4">
        <Lightbulb className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => {
          const Icon = iconMap[suggestion.type] || iconMap.default
          
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${impactColors[suggestion.impact] || impactColors.info}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900">
                    {suggestion.title}
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">
                    {suggestion.description}
                  </p>
                  
                  {suggestion.action && (
                    <button className="mt-2 flex items-center text-sm font-medium text-primary-600 hover:text-primary-700">
                      <span>{suggestion.action}</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-500 text-center">
          💡 AI-powered suggestions based on your productivity patterns
        </p>
      </div>
    </div>
  )
}

export default SuggestionPanel