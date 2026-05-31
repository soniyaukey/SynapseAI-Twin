import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-sm text-primary-600">
          Score: {payload[0].value}%
        </p>
      </div>
    )
  }
  return null
}

const ProductivityChart = ({ data, type = 'line' }) => {
  if (!data || !data.daily_scores) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <p className="text-slate-500">No productivity data available</p>
        </div>
      </div>
    )
  }

  const chartData = data.daily_scores.map(item => ({
    name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    score: item.score,
    fullDate: item.date
  }))

  const TrendIcon = data.trend === 'improving' 
    ? TrendingUp 
    : data.trend === 'declining' 
      ? TrendingDown 
      : Minus

  const trendColor = data.trend === 'improving' 
    ? 'text-green-600' 
    : data.trend === 'declining' 
      ? 'text-red-600' 
      : 'text-slate-600'

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Productivity Trend</h3>
          <p className="text-sm text-slate-500">Last 7 days</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <TrendIcon className={`w-5 h-5 ${trendColor}`} />
          <span className={`text-sm font-medium ${trendColor}`}>
            {data.trend || 'stable'}
          </span>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#0ea5e9" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorScore)" 
              />
            </AreaChart>
          ) : type === 'bar' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="score" 
                fill="#0ea5e9" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#0ea5e9" 
                strokeWidth={2}
                dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#0284c7' }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Average Score</p>
          <p className="text-2xl font-bold text-slate-900">{data.average_score || 0}%</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Best Day</p>
          <p className="text-lg font-semibold text-green-600">
            {Math.max(...(data.daily_scores || []).map(d => d.score))}%
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProductivityChart