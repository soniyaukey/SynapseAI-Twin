import { useState, useEffect } from 'react'
import { User, Bell, Shield, Palette, Database, HelpCircle, ExternalLink } from 'lucide-react'
import { api } from '../services/api'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const [user, setUser] = useState({
    id: 1,
    name: 'Loading...',
    email: 'Loading...',
    timezone: 'America/New_York'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    taskReminders: true,
    productivityReports: true,
    aiSuggestions: true
  })

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ]

// Fetch user data from backend
  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const response = await api.get('/users/1')
      const userData = response.data
      if (userData && (userData.id || userData.name)) {
        setUser({
          id: userData.id || 1,
          name: userData.name || 'Demo User',
          email: userData.email || 'demo@synapseai.com',
          timezone: 'America/New_York'
        })
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      const response = await api.put('/users/1', {
        name: user.name,
        email: user.email
      })
      alert('Profile saved successfully!')
      console.log('Profile saved, refetching...')
      await fetchUserProfile()
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationChange = (key) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key]
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-2">
            <nav className="space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Profile Settings</h2>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-700">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <button className="btn-primary">Change Photo</button>
                    <p className="text-xs text-slate-500 mt-2">JPG, PNG or GIF. Max 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={user.name}
                      onChange={(e) => setUser({ ...user, name: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      onChange={(e) => setUser({ ...user, email: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={user.timezone}
                      onChange={(e) => setUser({ ...user, timezone: e.target.value })}
                      className="input"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <button onClick={handleSaveProfile} className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Notification Preferences</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">Email Notifications</p>
                    <p className="text-sm text-slate-500">Receive updates via email</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('email')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notifications.email ? 'bg-primary-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      notifications.email ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">Push Notifications</p>
                    <p className="text-sm text-slate-500">Receive push notifications</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('push')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notifications.push ? 'bg-primary-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      notifications.push ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">Task Reminders</p>
                    <p className="text-sm text-slate-500">Get reminded about upcoming tasks</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('taskReminders')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notifications.taskReminders ? 'bg-primary-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      notifications.taskReminders ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">Productivity Reports</p>
                    <p className="text-sm text-slate-500">Weekly productivity summary</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('productivityReports')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notifications.productivityReports ? 'bg-primary-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      notifications.productivityReports ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-slate-900">AI Suggestions</p>
                    <p className="text-sm text-slate-500">Personalized AI recommendations</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('aiSuggestions')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notifications.aiSuggestions ? 'bg-primary-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      notifications.aiSuggestions ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Privacy Settings</h2>
              
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-medium text-slate-900">Data Collection</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    SynapseAI collects data to provide personalized productivity insights. 
                    Your data is encrypted and never shared with third parties.
                  </p>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">Share Analytics</p>
                    <p className="text-sm text-slate-500">Help improve AI by sharing anonymous usage data</p>
                  </div>
                  <button className="w-12 h-6 bg-primary-600 rounded-full">
                    <div className="w-5 h-5 bg-white rounded-full shadow transform translate-x-6" />
                  </button>
                </div>

                <div className="pt-4">
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                    Delete all my data
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Appearance Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <button className="p-4 border-2 border-primary-600 rounded-lg text-center">
                      <div className="w-8 h-8 bg-slate-900 rounded mx-auto mb-2"></div>
                      <p className="text-sm font-medium">Dark</p>
                    </button>
                    <button className="p-4 border border-slate-200 rounded-lg text-center hover:border-slate-300">
                      <div className="w-8 h-8 bg-white border rounded mx-auto mb-2"></div>
                      <p className="text-sm font-medium">Light</p>
                    </button>
                    <button className="p-4 border border-slate-200 rounded-lg text-center hover:border-slate-300">
                      <div className="w-8 h-8 bg-gradient-to-r from-slate-900 to-slate-100 rounded mx-auto mb-2"></div>
                      <p className="text-sm font-medium">System</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Data Management</h2>
              
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-medium text-slate-900">Export Data</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Download all your data in JSON format
                  </p>
                  <button className="btn-secondary mt-3">Export All Data</button>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-medium text-slate-900">Database</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Connected to MySQL 8.0
                  </p>
                  <p className="text-xs text-slate-500 mt-2">Host: localhost:3306</p>
                </div>
              </div>
            </div>
          )}

          {/* Help Tab */}
          {activeTab === 'help' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Help & Support</h2>
              
              <div className="space-y-4">
                <a href="#" className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center space-x-3">
                    <HelpCircle className="w-5 h-5 text-slate-600" />
                    <span className="font-medium">Documentation</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </a>

                <a href="#" className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center space-x-3">
                    <HelpCircle className="w-5 h-5 text-slate-600" />
                    <span className="font-medium">Report a Bug</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </a>

                <a href="#" className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center space-x-3">
                    <HelpCircle className="w-5 h-5 text-slate-600" />
                    <span className="font-medium">Contact Support</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </a>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-sm text-slate-500 text-center">
                  SynapseAI Twin v1.0.0 • Built with ❤️ for productivity
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings