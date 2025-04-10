"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Book, Plus, Pencil, Trash2, Save, BarChart2, Calendar, MessageSquare, Smile, Brain, Lightbulb } from "lucide-react"
import Sidebar from "@/components/Sidebar"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Pie } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

// Chart options
const lineChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
      },
      grid: {
        color: 'rgba(139, 92, 246, 0.1)',
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
}

const pieChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: '#E9D5FF',
      },
    },
    title: {
      display: false,
    },
  },
}

interface DiaryEntry {
  id: string
  user_id: string
  title: string
  content: string
  mood: string | null
  created_at: string
  updated_at: string
}

interface DiaryAnalytics {
  id: string
  user_id: string
  total_entries: number
  total_words: number
  average_entry_length: number
  mood_distribution: { [key: string]: number }
  writing_streak: number
  last_entry_date: string
  created_at: string
  updated_at: string
}

interface DiaryActivity {
  id: string
  user_id: string
  entry_id: string
  activity_type: 'created' | 'updated' | 'deleted'
  entry_title: string
  entry_mood: string | null
  word_count: number
  created_at: string
}

interface DiaryInsights {
  overallMood: string
  commonThemes: string[]
  suggestions: string[]
  lastUpdated: string
}

interface DiaryAnalysis {
  overallMood: string;
  commonThemes: string[];
  suggestions: string[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [newEntry, setNewEntry] = useState({ title: "", content: "", mood: "" })
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<DiaryAnalytics | null>(null)
  const [recentActivity, setRecentActivity] = useState<DiaryActivity[]>([])
  const [insights, setInsights] = useState<DiaryInsights | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<DiaryAnalysis | null>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchEntries()
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Get or create analytics record
      let { data: analyticsData, error: analyticsError } = await supabase
        .from('diary_analytics')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (analyticsError && analyticsError.code === 'PGRST116') {
        // Create new analytics record if it doesn't exist
        const { data: newAnalytics, error: createError } = await supabase
          .from('diary_analytics')
          .insert([{
            user_id: session.user.id,
            total_entries: 0,
            total_words: 0,
            average_entry_length: 0,
            mood_distribution: {},
            writing_streak: 0,
            last_entry_date: new Date().toISOString()
          }])
          .select()
          .single()

        if (createError) throw createError
        analyticsData = newAnalytics
      }

      // Get recent activity
      const { data: activityData, error: activityError } = await supabase
        .from('diary_activity')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (activityError) throw activityError

      setAnalytics(analyticsData)
      setRecentActivity(activityData || [])
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  const updateAnalytics = async (entry: DiaryEntry, action: 'created' | 'deleted') => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.error('No session found when updating analytics')
        return
      }
      
      if (!analytics) {
        console.error('No analytics data found when updating analytics')
        return
      }

      const wordCount = entry.content.split(/\s+/).length
      const newTotalEntries = action === 'created' 
        ? analytics.total_entries + 1 
        : analytics.total_entries - 1
      const newTotalWords = action === 'created'
        ? analytics.total_words + wordCount
        : analytics.total_words - wordCount
      const newAverageLength = newTotalEntries > 0 
        ? Math.round(newTotalWords / newTotalEntries) 
        : 0

      // Update mood distribution
      const newMoodDistribution = { ...analytics.mood_distribution }
      if (entry.mood) {
        if (action === 'created') {
          newMoodDistribution[entry.mood] = (newMoodDistribution[entry.mood] || 0) + 1
        } else {
          newMoodDistribution[entry.mood] = (newMoodDistribution[entry.mood] || 1) - 1
          if (newMoodDistribution[entry.mood] === 0) {
            delete newMoodDistribution[entry.mood]
          }
        }
      }

      // Calculate writing streak
      const lastEntryDate = new Date(analytics.last_entry_date)
      const currentDate = new Date()
      const daysSinceLastEntry = Math.floor((currentDate.getTime() - lastEntryDate.getTime()) / (1000 * 60 * 60 * 24))
      const newWritingStreak = daysSinceLastEntry <= 1 ? analytics.writing_streak + 1 : 1

      // Update analytics
      const { error: updateError } = await supabase
        .from('diary_analytics')
        .update({
          total_entries: newTotalEntries,
          total_words: newTotalWords,
          average_entry_length: newAverageLength,
          mood_distribution: newMoodDistribution,
          writing_streak: newWritingStreak,
          last_entry_date: action === 'created' ? entry.created_at : analytics.last_entry_date,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id)

      if (updateError) {
        console.error('Error updating diary_analytics:', updateError)
        throw updateError
      }

      // Record activity
      const { error: activityError } = await supabase
        .from('diary_activity')
        .insert([{
          user_id: session.user.id,
          entry_id: entry.id,
          activity_type: action,
          entry_title: entry.title,
          entry_mood: entry.mood,
          word_count: wordCount
        }])

      if (activityError) {
        console.error('Error recording diary_activity:', activityError)
        throw activityError
      }

      // Reload analytics
      loadAnalytics()
    } catch (error) {
      console.error('Error updating analytics:', error)
      // Don't throw the error to prevent the UI from breaking
      // Just log it and continue
    }
  }

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/diary/login")
      }
    } catch (err) {
      console.error("Auth error:", err)
      router.push("/diary/login")
    }
  }

  const fetchEntries = async () => {
    try {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setEntries(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch entries')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('diary_entries')
        .insert([
          {
            user_id: user.id,
            title: newEntry.title,
            content: newEntry.content,
            mood: newEntry.mood || null
          }
        ])
        .select()

      if (error) throw error

      setNewEntry({ title: "", content: "", mood: "" })
      setIsCreating(false)
      fetchEntries()

      // Update analytics for the new entry
      await updateAnalytics(data[0], 'created')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create entry')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      const entry = entries.find(e => e.id === id)
      if (!entry) {
        console.error('Entry not found for deletion:', id)
        return
      }

      // First delete the entry
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting diary entry:', error)
        throw error
      }

      // Update the UI
      setEntries(entries.filter(entry => entry.id !== id))

      // Then update analytics
      try {
        await updateAnalytics(entry, 'deleted')
      } catch (analyticsError) {
        console.error('Error updating analytics after deletion:', analyticsError)
        // Continue even if analytics update fails
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry')
    }
  }

  const analyzeEntries = async () => {
    if (entries.length === 0) {
      console.log('No entries to analyze');
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-diary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entries }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze entries');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Error analyzing entries:', error);
      // You might want to show this error to the user in the UI
      setError(error instanceof Error ? error.message : 'Failed to analyze entries');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (entries.length > 0) {
      analyzeEntries();
    }
  }, [entries]);

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center bg-[#030014]">
          <div className="text-violet-50">Loading...</div>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const moodPieData = {
    labels: Object.keys(analytics?.mood_distribution || {}),
    datasets: [
      {
        data: Object.values(analytics?.mood_distribution || {}),
        backgroundColor: [
          '#A855F7',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#6366F1',
        ],
        borderColor: [
          '#9333EA',
          '#059669',
          '#D97706',
          '#DC2626',
          '#4F46E5',
        ],
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen bg-[#030014] overflow-x-hidden">
        <div className="p-4 sm:p-6 md:p-8 md:pl-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 sm:mb-8 md:mb-12"
          >
            <div className="flex justify-between items-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-violet-50">
                My Diary
              </h1>
              <div className="flex gap-2">
                <button
                  onClick={analyzeEntries}
                  disabled={isAnalyzing || entries.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-violet-50 hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Brain className="h-4 w-4" />
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Entries'}
                </button>
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-violet-50 hover:bg-violet-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  New Entry
                </button>
              </div>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
                {error}
              </div>
            )}
          </motion.div>
        </div>

        <div className="flex-1 flex flex-col px-4 sm:px-6 md:px-8 md:pl-20 pb-4 sm:pb-6 md:pb-8">
          {/* New Entry Form */}
          {isCreating && (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 rounded-lg border border-violet-500/20 bg-violet-950/50 backdrop-blur-sm p-6"
              onSubmit={handleSubmit}
            >
              <input
                type="text"
                placeholder="Title"
                value={newEntry.title}
                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                className="w-full bg-violet-900/50 border border-violet-500/20 rounded-lg px-4 py-2 text-violet-50 mb-4"
                required
              />
              <textarea
                placeholder="Write your thoughts..."
                value={newEntry.content}
                onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                className="w-full bg-violet-900/50 border border-violet-500/20 rounded-lg px-4 py-2 text-violet-50 mb-4 h-32 resize-y"
                required
              />
              <input
                type="text"
                placeholder="Mood (optional)"
                value={newEntry.mood}
                onChange={(e) => setNewEntry({ ...newEntry, mood: e.target.value })}
                className="w-full bg-violet-900/50 border border-violet-500/20 rounded-lg px-4 py-2 text-violet-50 mb-4"
              />
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-lg border border-violet-500/20 text-violet-50 hover:bg-violet-900/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-violet-50 hover:bg-violet-700"
                >
                  <Save className="h-4 w-4" />
                  Save Entry
                </button>
              </div>
            </motion.form>
          )}

          {/* Diary Entries - Moved to top */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-violet-50 mb-4">Your Diary Entries</h2>
            {entries.length === 0 ? (
              <div className="text-center text-violet-200/90 py-12">
                No diary entries yet. Start writing your thoughts!
              </div>
            ) : (
              entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  variants={item}
                  className="rounded-lg border border-violet-500/20 bg-violet-950/50 backdrop-blur-sm p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-violet-50">{entry.title}</h3>
                      <p className="text-sm text-violet-200/90">
                        {new Date(entry.created_at).toLocaleDateString()} at{" "}
                        {new Date(entry.created_at).toLocaleTimeString()}
                        {entry.mood && ` • Mood: ${entry.mood}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDelete(entry.id)}
                        className="p-2 rounded-lg hover:bg-violet-900/50"
                      >
                        <Trash2 className="h-4 w-4 text-violet-400" />
                      </button>
                    </div>
                  </div>
                  <p className="text-violet-200/90 whitespace-pre-wrap">{entry.content}</p>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Analytics Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-violet-500/20 bg-violet-950/50 backdrop-blur-sm p-6 mb-6"
          >
            <h2 className="text-2xl font-bold text-violet-50 mb-4">Analytics Overview</h2>
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-violet-500/20 bg-violet-900/50 p-4">
                  <h3 className="text-lg font-semibold text-violet-200">Total Entries</h3>
                  <p className="text-3xl font-bold text-violet-100">{analytics.total_entries}</p>
                </div>
                <div className="rounded-lg border border-violet-500/20 bg-violet-900/50 p-4">
                  <h3 className="text-lg font-semibold text-violet-200">Writing Streak</h3>
                  <p className="text-3xl font-bold text-violet-100">
                    {analytics.writing_streak} days
                  </p>
                </div>
                <div className="rounded-lg border border-violet-500/20 bg-violet-900/50 p-4">
                  <h3 className="text-lg font-semibold text-violet-200">Mood Types</h3>
                  <p className="text-3xl font-bold text-violet-100">
                    {Object.keys(analytics.mood_distribution).length}
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* AI Analysis Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-violet-500/20 bg-violet-950/50 backdrop-blur-sm p-6 mb-6"
          >
            <h2 className="text-2xl font-bold text-violet-50 mb-4">AI Analysis</h2>
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-400"></div>
                <span className="ml-2 text-violet-200">Analyzing your entries...</span>
              </div>
            ) : analysis ? (
              <div className="space-y-6">
                <div className="rounded-lg border border-violet-500/20 bg-violet-900/50 p-4">
                  <h3 className="text-lg font-semibold text-violet-200 mb-2">Overall Mood</h3>
                  <p className="text-violet-100">{analysis.overallMood}</p>
                </div>
                
                <div className="rounded-lg border border-violet-500/20 bg-violet-900/50 p-4">
                  <h3 className="text-lg font-semibold text-violet-200 mb-2">Common Themes</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.commonThemes.map((theme, index) => (
                      <li key={index} className="text-violet-100">{theme}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="rounded-lg border border-violet-500/20 bg-violet-900/50 p-4">
                  <h3 className="text-lg font-semibold text-violet-200 mb-2">Personalized Suggestions</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-violet-100">{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-violet-200 text-center py-4">
                No analysis available yet. Add some entries to get insights!
              </p>
            )}
          </motion.div>

          {/* AI Insights */}
          {insights && (
            <div className="rounded-lg border border-violet-500/20 bg-violet-950/50 backdrop-blur-sm p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-violet-500/20">
                  <Brain className="h-5 w-5 text-violet-400" />
                </div>
                <h2 className="text-lg font-semibold text-violet-100">AI Insights</h2>
                <span className="text-xs text-violet-300/60 ml-auto">
                  Last updated: {new Date(insights.lastUpdated).toLocaleString()}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium text-violet-100 mb-2">Overall Mood</h3>
                  <p className="text-violet-200/90">{insights.overallMood}</p>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-violet-100 mb-2">Common Themes</h3>
                  <ul className="list-disc list-inside text-violet-200/90">
                    {insights.commonThemes.map((theme, index) => (
                      <li key={index}>{theme}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                  <h3 className="text-md font-medium text-violet-100">Suggestions</h3>
                </div>
                <ul className="list-disc list-inside text-violet-200/90">
                  {insights.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Mood Distribution Chart */}
          <div className="rounded-lg border border-violet-500/20 bg-violet-950/50 backdrop-blur-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-violet-100 mb-4">Mood Distribution</h2>
            <div className="h-[300px]">
              <Pie options={pieChartOptions} data={moodPieData} />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg border border-violet-500/20 bg-violet-950/50 backdrop-blur-sm p-6">
            <h2 className="text-lg font-semibold text-violet-100 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <div className="text-center text-violet-300/60 py-4">
                  No recent activity
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-violet-500/5"
                  >
                    {activity.activity_type === 'created' ? (
                      <Plus className="h-4 w-4 text-emerald-400" />
                    ) : activity.activity_type === 'deleted' ? (
                      <Trash2 className="h-4 w-4 text-red-400" />
                    ) : (
                      <Book className="h-4 w-4 text-violet-400" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-violet-100">
                        {activity.activity_type} entry: {activity.entry_title}
                        {activity.entry_mood && ` (${activity.entry_mood})`}
                      </p>
                      <p className="text-xs text-violet-300/60">
                        {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                        {` • ${activity.word_count} words`}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}