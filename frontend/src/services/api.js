/**
 * API Service for SynapseAI Twin Frontend
 * Handles all communication with the Flask backend
 */

import axios from 'axios'

// Base URL - change this to your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// ==================== User APIs ====================

export const getUsers = () => api.get('/users')
export const getUser = (id) => api.get(`/users/${id}`)
export const createUser = (data) => api.post('/users', data)
export const updateUser = (id, data) => api.put(`/users/${id}`, data)

// ==================== Task APIs ====================

export const getTasks = (params) => api.get('/tasks', { params })
export const getTask = (id) => api.get(`/tasks/${id}`)
export const createTask = (data) => api.post('/tasks', data)
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data)
export const deleteTask = (id) => api.delete(`/tasks/${id}`)

// ==================== Prediction APIs ====================

export const getNextTaskPredictions = (userId) => 
  api.get('/predict/next-tasks', { params: { user_id: userId } })

// ==================== Schedule APIs ====================

export const generateSchedule = (data) => api.post('/schedule/generate', data)

// ==================== Habit APIs ====================

export const getHabits = (userId) => 
  api.get('/habits', { params: { user_id: userId } })

export const detectHabits = (userId) => 
  api.post('/habits/detect', { user_id: userId })

// ==================== Analytics APIs ====================

export const getProductivity = (userId, days = 7) => 
  api.get('/analytics/productivity', { params: { user_id: userId, days } })

export const getInsights = (userId) => 
  api.get('/analytics/insights', { params: { user_id: userId } })

// ==================== NLP APIs ====================

export const parseNLPInput = (text) => 
  api.post('/nlp/parse', { text })

// ==================== Mock Data for Development ====================

// When backend is not available, use this mock data
export const mockData = {
  tasks: [
    { id: 1, title: 'Complete project proposal', priority: 1, status: 'pending', category: 'work', estimated_duration: 120 },
    { id: 2, title: 'Team standup meeting', priority: 2, status: 'completed', category: 'work', estimated_duration: 15 },
    { id: 3, title: 'Code review session', priority: 2, status: 'in_progress', category: 'work', estimated_duration: 60 },
    { id: 4, title: 'Gym workout', priority: 3, status: 'pending', category: 'health', estimated_duration: 60 },
    { id: 5, title: 'Read documentation', priority: 3, status: 'pending', category: 'study', estimated_duration: 45 },
    { id: 6, title: 'Client call', priority: 1, status: 'pending', category: 'work', estimated_duration: 45 },
  ],
  
  predictions: [
    { task: 'Check emails', probability: 0.85, reason: 'Typical morning activity' },
    { task: 'Team meeting', probability: 0.72, reason: 'Scheduled for 10 AM' },
    { task: 'Review PRs', probability: 0.68, reason: 'Pending reviews' },
  ],
  
  schedule: {
    date: new Date().toISOString().split('T')[0],
    slots: [
      { start: '09:00', end: '09:30', task: 'Morning planning', category: 'work', priority: 2 },
      { start: '09:30', end: '10:00', task: 'Check emails', category: 'work', priority: 2 },
      { start: '10:00', end: '10:15', task: 'Team standup', category: 'work', priority: 2 },
      { start: '10:15', end: '12:15', task: 'Deep work session', category: 'work', priority: 1 },
      { start: '12:15', end: '13:15', task: 'Lunch break', category: 'personal', priority: 3 },
      { start: '13:15', end: '14:15', task: 'Code review', category: 'work', priority: 2 },
      { start: '14:15', end: '15:15', task: 'Client call', category: 'work', priority: 1 },
      { start: '15:15', end: '16:15', task: 'Write documentation', category: 'work', priority: 2 },
      { start: '16:15', end: '17:15', task: 'Plan tomorrow', category: 'personal', priority: 3 },
    ],
    summary: { total_tasks: 9, total_duration: 480, productivity_score: 85 }
  },
  
  habits: [
    { name: 'Morning emails', pattern: { typical_time: '09:00', time_variance: 0.5 }, frequency: 7, productivity_score: 85, consistency: 'high' },
    { name: 'Team standup', pattern: { typical_time: '10:00', time_variance: 0.2 }, frequency: 5, productivity_score: 92, consistency: 'high' },
    { name: 'Deep work', pattern: { typical_time: '11:00', time_variance: 0.8 }, frequency: 5, productivity_score: 78, consistency: 'medium' },
    { name: 'Lunch break', pattern: { typical_time: '13:00', time_variance: 0.3 }, frequency: 7, productivity_score: 95, consistency: 'high' },
    { name: 'Gym workout', pattern: { typical_time: '18:00', time_variance: 0.5 }, frequency: 4, productivity_score: 88, consistency: 'medium' },
  ],
  
  productivity: {
    daily_scores: [
      { date: '2024-01-30', score: 78 },
      { date: '2024-01-29', score: 85 },
      { date: '2024-01-28', score: 72 },
      { date: '2024-01-27', score: 90 },
      { date: '2024-01-26', score: 65 },
      { date: '2024-01-25', score: 88 },
      { date: '2024-01-24', score: 82 }
    ],
    average_score: 80.0,
    trend: 'improving'
  },
  
  insights: [
    { type: 'suggestion', title: 'Best working hours', description: 'You are most productive between 9 AM and 11 AM', impact: 'high' },
    { type: 'suggestion', title: 'Break reminder', description: 'Take a 5-minute break every hour for better focus', impact: 'medium' },
    { type: 'insight', title: 'Task completion rate', description: 'You complete 85% of your high-priority tasks', impact: 'positive' }
  ]
}

export { api }
export default api
