'use client'

import { useState, useEffect } from 'react'
import { CheckSquare, Plus, Trash2, Check, BarChart2, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
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
  BarElement,
} from 'chart.js'
import { Line, Pie, Bar } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
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

const barChartOptions = {
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

interface ChecklistItem {
  id: string
  user_id: string
  text: string
  completed: boolean
  created_at: string
  completed_at: string | null
  category: string | null
  priority: number
  time_spent: number
}

interface AnalyticsData {
  totalItems: number
  completedItems: number
  completionRate: number
  itemsByDay: { date: string; count: number }[]
  recentActivity: {
    event_type: string
    created_at: string
    metadata: any
  }[]
  activityByType: { [key: string]: number }
  dailyActivity: { date: string; created: number; completed: number }[]
}

export default function ChecklistPage() {
  const router = useRouter()
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [newItem, setNewItem] = useState('')
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalItems: 0,
    completedItems: 0,
    completionRate: 0,
    itemsByDay: [],
    recentActivity: [],
    activityByType: {},
    dailyActivity: []
  })

  useEffect(() => {
    checkAuth()
    loadItems()
    trackPageView()
    loadAnalytics()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
    }
  }

  const trackAnalytics = async (eventType: string, metadata: any = {}) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      await supabase
        .from('user_analytics')
        .insert([{
          user_id: session.user.id,
          event_type: eventType,
          metadata
        }])
    } catch (error) {
      console.error('Error tracking analytics:', error)
    }
  }

  const trackPageView = async () => {
    await trackAnalytics('checklist_page_view', {
      timestamp: new Date().toISOString()
    })
  }

  const loadAnalytics = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Get analytics for the last 7 days
      const sevenDaysAgo = subDays(new Date(), 7)
      const today = new Date()

      // Get recent activity
      const { data: activityData } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(10)

      // Calculate completion rate
      const completedItems = items.filter(item => item.completed).length
      const totalItems = items.length
      const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

      // Get items by day
      const itemsByDay = items.reduce((acc: { date: string; count: number }[], item) => {
        const date = format(new Date(item.created_at), 'yyyy-MM-dd')
        const existingDay = acc.find(d => d.date === date)
        if (existingDay) {
          existingDay.count++
        } else {
          acc.push({ date, count: 1 })
        }
        return acc
      }, [])

      // Calculate activity by type
      const activityByType = activityData?.reduce((acc: { [key: string]: number }, activity) => {
        acc[activity.event_type] = (acc[activity.event_type] || 0) + 1
        return acc
      }, {}) || {}

      // Calculate daily activity
      const dailyActivity = eachDayOfInterval({ start: sevenDaysAgo, end: today }).map(date => {
        const dateStr = format(date, 'yyyy-MM-dd')
        const dayActivities = activityData?.filter(activity => 
          isSameDay(new Date(activity.created_at), date)
        ) || []

        return {
          date: dateStr,
          created: dayActivities.filter(a => a.event_type === 'checklist_item_created').length,
          completed: dayActivities.filter(a => a.event_type === 'checklist_item_completed').length
        }
      })

      setAnalytics({
        totalItems,
        completedItems,
        completionRate,
        itemsByDay,
        recentActivity: activityData || [],
        activityByType,
        dailyActivity
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  const loadItems = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data, error } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error loading items:', error)
      toast.error('Failed to load items')
    } finally {
      setLoading(false)
    }
  }

  const addItem = async () => {
    if (!newItem.trim()) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data, error } = await supabase
        .from('checklist_items')
        .insert([{
          user_id: session.user.id,
          text: newItem.trim(),
          completed: false,
          priority: 1,
          time_spent: 0
        }])
        .select()
        .single()

      if (error) throw error

      setItems(prev => [data, ...prev])
      setNewItem('')
      toast.success('Item added successfully')

      // Track item creation
      await trackAnalytics('checklist_item_created', {
        item_id: data.id,
        text: data.text,
        priority: data.priority
      })

      // Reload analytics
      loadAnalytics()
    } catch (error) {
      console.error('Error adding item:', error)
      toast.error('Failed to add item')
    }
  }

  const toggleItem = async (id: string) => {
    try {
      const item = items.find(i => i.id === id)
      if (!item) return

      const completed = !item.completed
      const completed_at = completed ? new Date().toISOString() : null

      const { error } = await supabase
        .from('checklist_items')
        .update({ completed, completed_at })
        .eq('id', id)

      if (error) throw error

      setItems(prev => prev.map(item =>
        item.id === id ? { ...item, completed, completed_at } : item
      ))

      // Track item completion status change
      await trackAnalytics(completed ? 'checklist_item_completed' : 'checklist_item_uncompleted', {
        item_id: id,
        text: item.text,
        completed_at
      })

      // Reload analytics
      loadAnalytics()
    } catch (error) {
      console.error('Error toggling item:', error)
      toast.error('Failed to update item')
    }
  }

  const removeItem = async (id: string) => {
    try {
      const item = items.find(i => i.id === id)
      if (!item) return

      const { error } = await supabase
        .from('checklist_items')
        .delete()
        .eq('id', id)

      if (error) throw error

      setItems(prev => prev.filter(item => item.id !== id))
      toast.success('Item removed successfully')

      // Track item deletion
      await trackAnalytics('checklist_item_deleted', {
        item_id: id,
        text: item.text,
        was_completed: item.completed,
        time_spent: item.time_spent
      })

      // Reload analytics
      loadAnalytics()
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error('Failed to remove item')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addItem()
    }
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'checklist_item_created':
        return <Plus className="h-4 w-4 text-violet-400" />
      case 'checklist_item_completed':
        return <CheckCircle className="h-4 w-4 text-emerald-400" />
      case 'checklist_item_uncompleted':
        return <XCircle className="h-4 w-4 text-amber-400" />
      case 'checklist_item_deleted':
        return <Trash2 className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-violet-400" />
    }
  }

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <div className="min-h-screen bg-[#030014] text-white p-8 md:pl-20">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const lineChartData = {
    labels: analytics.dailyActivity.map(d => format(new Date(d.date), 'MMM d')),
    datasets: [
      {
        label: 'Created',
        data: analytics.dailyActivity.map(d => d.created),
        borderColor: '#A855F7',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Completed',
        data: analytics.dailyActivity.map(d => d.completed),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  }

  const pieChartData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [analytics.completedItems, analytics.totalItems - analytics.completedItems],
        backgroundColor: ['#10B981', '#A855F7'],
        borderColor: ['#059669', '#9333EA'],
        borderWidth: 1,
      },
    ],
  }

  const barChartData = {
    labels: Object.keys(analytics.activityByType).map(type => 
      type.replace('checklist_item_', '').replace('_', ' ')
    ),
    datasets: [
      {
        data: Object.values(analytics.activityByType),
        backgroundColor: [
          'rgba(168, 85, 247, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
      },
    ],
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <div className="min-h-screen bg-[#030014] text-white p-8 md:pl-20">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-violet-100 flex items-center gap-3">
                  <div className="p-2 md:p-3 rounded-xl bg-violet-500/20">
                    <CheckSquare className="h-6 w-6 md:h-8 md:w-8 text-violet-400" />
                  </div>
                  Checklist
                </h1>
                <p className="text-violet-300/80 mt-2 text-base md:text-lg">Keep track of your tasks</p>
              </div>
            </div>

            {/* Add Item */}
            <Card className="p-4 md:p-6 bg-[#0E0529]/50 border-violet-500/20 mb-8">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a new item..."
                    className="w-full bg-violet-950/50 border-violet-500/30 rounded-lg px-4 py-2.5 text-sm focus:border-violet-500/50 text-violet-100 placeholder-violet-500/50"
                  />
                </div>
                <Button
                  onClick={addItem}
                  className="bg-violet-600 hover:bg-violet-500 text-white px-4 md:px-6"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add
                </Button>
              </div>
            </Card>

            {/* Checklist Items */}
            <Card className="p-4 md:p-6 bg-[#0E0529]/50 border-violet-500/20 mb-8">
              <div className="space-y-2">
                {items.length === 0 ? (
                  <div className="text-center text-violet-300/60 py-8">
                    No items in your checklist yet
                  </div>
                ) : (
                  items.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-violet-500/10 transition-colors group"
                    >
                      <button
                        onClick={() => toggleItem(item.id)}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          item.completed
                            ? 'bg-violet-600 border-violet-600'
                            : 'border-violet-500/30 hover:border-violet-500/50'
                        }`}
                      >
                        {item.completed && <Check className="h-3 w-3 text-white" />}
                      </button>
                      <span className={`flex-1 text-sm ${
                        item.completed
                          ? 'text-violet-300/50 line-through'
                          : 'text-violet-100'
                      }`}>
                        {item.text}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-violet-300/50 hover:text-red-400 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="p-4 bg-[#0E0529]/50 border-violet-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-500/20">
                    <BarChart2 className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm text-violet-300/60">Total Items</p>
                    <p className="text-2xl font-bold text-violet-100">{analytics.totalItems}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-[#0E0529]/50 border-violet-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-violet-300/60">Completed</p>
                    <p className="text-2xl font-bold text-violet-100">{analytics.completedItems}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-[#0E0529]/50 border-violet-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <Clock className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-violet-300/60">Completion Rate</p>
                    <p className="text-2xl font-bold text-violet-100">{analytics.completionRate.toFixed(1)}%</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card className="p-4 bg-[#0E0529]/50 border-violet-500/20">
                <h2 className="text-lg font-semibold text-violet-100 mb-4">Daily Activity</h2>
                <div className="h-[300px]">
                  <Line options={lineChartOptions} data={lineChartData} />
                </div>
              </Card>
              <Card className="p-4 bg-[#0E0529]/50 border-violet-500/20">
                <h2 className="text-lg font-semibold text-violet-100 mb-4">Completion Status</h2>
                <div className="h-[300px]">
                  <Pie options={pieChartOptions} data={pieChartData} />
                </div>
              </Card>
            </div>

            <Card className="p-4 bg-[#0E0529]/50 border-violet-500/20 mb-8">
              <h2 className="text-lg font-semibold text-violet-100 mb-4">Activity Distribution</h2>
              <div className="h-[200px]">
                <Bar options={barChartOptions} data={barChartData} />
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-4 md:p-6 bg-[#0E0529]/50 border-violet-500/20">
              <h2 className="text-lg font-semibold text-violet-100 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {analytics.recentActivity.length === 0 ? (
                  <div className="text-center text-violet-300/60 py-4">
                    No recent activity
                  </div>
                ) : (
                  analytics.recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-violet-500/5"
                    >
                      {getEventIcon(activity.event_type)}
                      <div className="flex-1">
                        <p className="text-sm text-violet-100">
                          {activity.event_type.replace('checklist_item_', '').replace('_', ' ')}
                          {activity.metadata?.text && `: ${activity.metadata.text}`}
                        </p>
                        <p className="text-xs text-violet-300/60">
                          {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 