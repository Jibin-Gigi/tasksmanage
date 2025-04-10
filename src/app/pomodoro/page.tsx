'use client'

import { useState, useEffect, useRef } from 'react'
import { Clock, Play, Pause, RotateCcw, Settings, X, BarChart2, Calendar, Timer, CheckCircle, AlertCircle } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Sidebar from '@/components/Sidebar'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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

interface Settings {
  workTime: number
  breakTime: number
  longBreakTime: number
  sessionsUntilLongBreak: number
}

interface PomodoroSession {
  id: string
  sessionType: 'work' | 'break' | 'long_break'
  durationSeconds: number
  completed: boolean
  interrupted: boolean
  interruptionCount: number
  startTime: Date
  endTime?: Date
  workTimeSetting: number
  breakTimeSetting: number
  longBreakTimeSetting: number
  sessionsUntilLongBreak: number
  sessionNumber: number
}

interface PomodoroAnalytics {
  totalSessions: number
  completedSessions: number
  totalWorkTime: number
  totalBreakTime: number
  averageSessionLength: number
  completionRate: number
  sessionsByDay: { [key: string]: number }
  sessionsByType: { [key: string]: number }
  dailyActivity: { date: string; count: number }[]
  recentSessions: PomodoroSession[]
}

export default function PomodoroPage() {
  const workerRef = useRef<Worker | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<Settings>({
    workTime: 25,
    breakTime: 5,
    longBreakTime: 15,
    sessionsUntilLongBreak: 4
  })
  const [analytics, setAnalytics] = useState<PomodoroAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(null)
  const [interruptionCount, setInterruptionCount] = useState(0)
  const [showAnalytics, setShowAnalytics] = useState(false)
  
  const supabase = createClientComponentClient()
  const router = useRouter()

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      }
    }
    
    checkAuth()
  }, [supabase, router])

  // Load saved state from localStorage after mount
  useEffect(() => {
    const savedTimeLeft = localStorage.getItem('pomodoroTimeLeft')
    const savedIsRunning = localStorage.getItem('pomodoroIsRunning')
    const savedIsBreak = localStorage.getItem('pomodoroIsBreak')
    const savedSessionCount = localStorage.getItem('pomodoroSessionCount')
    const savedSettings = localStorage.getItem('pomodoroSettings')

    if (savedTimeLeft) setTimeLeft(parseInt(savedTimeLeft))
    if (savedIsRunning) setIsRunning(savedIsRunning === 'true')
    if (savedIsBreak) setIsBreak(savedIsBreak === 'true')
    if (savedSessionCount) setSessionCount(parseInt(savedSessionCount))
    if (savedSettings) setSettings(JSON.parse(savedSettings))
  }, [])

  // Initialize Web Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('@/workers/timer.worker.ts', import.meta.url))
    
    workerRef.current.onmessage = (e) => {
      const { type, timeLeft } = e.data
      
      if (type === 'TICK') {
        setTimeLeft(timeLeft)
      } else if (type === 'COMPLETE') {
        // Play notification sound
        const audio = new Audio('/notification.mp3')
        audio.play()

        // Complete the current session
        if (currentSession) {
          completeSession(currentSession.id, true)
        }

        if (isBreak) {
          // Break is over, start work session
          setTimeLeft(settings.workTime * 60)
          setIsBreak(false)
          setSessionCount(prev => prev + 1)
          startNewSession('work')
        } else {
          // Work session is over, check if it's time for a long break
          if (sessionCount % settings.sessionsUntilLongBreak === 0) {
            setTimeLeft(settings.longBreakTime * 60)
            setSessionCount(0)
            startNewSession('long_break')
          } else {
            setTimeLeft(settings.breakTime * 60)
            startNewSession('break')
          }
          setIsBreak(true)
        }
        setIsRunning(false)
      }
    }

    return () => {
      workerRef.current?.terminate()
    }
  }, [isBreak, settings, sessionCount, currentSession])

  // Handle timer state changes
  useEffect(() => {
    if (workerRef.current) {
      if (isRunning) {
        workerRef.current.postMessage({ type: 'START', data: { timeLeft } })
      } else {
        workerRef.current.postMessage({ type: 'PAUSE' })
        
        // Track interruption if session is paused
        if (currentSession && !currentSession.completed) {
          setInterruptionCount(prev => prev + 1)
          updateSessionInterruption(currentSession.id, interruptionCount + 1)
        }
      }
    }
  }, [isRunning, timeLeft, currentSession, interruptionCount])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pomodoroTimeLeft', timeLeft.toString())
    localStorage.setItem('pomodoroIsRunning', isRunning.toString())
    localStorage.setItem('pomodoroIsBreak', isBreak.toString())
    localStorage.setItem('pomodoroSessionCount', sessionCount.toString())
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings))
  }, [timeLeft, isRunning, isBreak, sessionCount, settings])

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        // First check if the table exists
        const { data: tableExists, error: tableCheckError } = await supabase
          .from('pomodoro_analytics')
          .select('id')
          .limit(1)
        
        if (tableCheckError) {
          console.error('Error checking table existence:', tableCheckError)
          if (tableCheckError.code === '42P01') {
            console.error('Table pomodoro_analytics does not exist')
            setAnalytics(null)
            return
          }
          if (tableCheckError.code === '42501') {
            console.error('Permission denied: You do not have access to the pomodoro_analytics table')
            setAnalytics(null)
            return
          }
          throw tableCheckError
        }

        const { data: { session }, error: authError } = await supabase.auth.getSession()
        if (authError) {
          console.error('Auth error:', authError)
          setAnalytics(null)
          return
        }
        if (!session) {
          console.log('No active session')
          setAnalytics(null)
          return
        }

        // Get all sessions for the user
        const { data: sessions, error: fetchError } = await supabase
          .from('pomodoro_analytics')
          .select('*')
          .eq('user_id', session.user.id)
          .order('start_time', { ascending: false })

        if (fetchError) {
          console.error('Error fetching sessions:', fetchError)
          if (fetchError.code === '42501') {
            console.error('Permission denied: You do not have access to view pomodoro_analytics')
          }
          setAnalytics(null)
          return
        }

        if (!sessions) {
          console.log('No sessions found')
          setAnalytics(null)
          return
        }

        if (sessions.length > 0) {
          // Process analytics data
          const totalSessions = sessions.length
          const completedSessions = sessions.filter(s => s.completed).length
          const totalWorkTime = sessions
            .filter(s => s.session_type === 'work')
            .reduce((sum, s) => sum + s.duration_seconds, 0)
          const totalBreakTime = sessions
            .filter(s => s.session_type === 'break' || s.session_type === 'long_break')
            .reduce((sum, s) => sum + s.duration_seconds, 0)
          const averageSessionLength = sessions.reduce((sum, s) => sum + s.duration_seconds, 0) / totalSessions
          const completionRate = (completedSessions / totalSessions) * 100

          // Group sessions by day
          const sessionsByDay: { [key: string]: number } = {}
          sessions.forEach(session => {
            const date = format(new Date(session.start_time), 'yyyy-MM-dd')
            sessionsByDay[date] = (sessionsByDay[date] || 0) + 1
          })

          // Group sessions by type
          const sessionsByType: { [key: string]: number } = {
            work: sessions.filter(s => s.session_type === 'work').length,
            break: sessions.filter(s => s.session_type === 'break').length,
            long_break: sessions.filter(s => s.session_type === 'long_break').length
          }

          // Get daily activity for the last 7 days
          const today = new Date()
          const sevenDaysAgo = subDays(today, 6)
          const dateRange = eachDayOfInterval({ start: sevenDaysAgo, end: today })
          
          const dailyActivity = dateRange.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd')
            return {
              date: format(date, 'MMM d'),
              count: sessionsByDay[dateStr] || 0
            }
          })

          // Get recent sessions
          const recentSessions = sessions.slice(0, 5).map(session => ({
            id: session.id,
            sessionType: session.session_type as 'work' | 'break' | 'long_break',
            durationSeconds: session.duration_seconds,
            completed: session.completed,
            interrupted: session.interrupted,
            interruptionCount: session.interruption_count,
            startTime: new Date(session.start_time),
            endTime: session.end_time ? new Date(session.end_time) : undefined,
            workTimeSetting: session.work_time_setting,
            breakTimeSetting: session.break_time_setting,
            longBreakTimeSetting: session.long_break_time_setting,
            sessionsUntilLongBreak: session.sessions_until_long_break,
            sessionNumber: session.session_number
          }))

          setAnalytics({
            totalSessions,
            completedSessions,
            totalWorkTime,
            totalBreakTime,
            averageSessionLength,
            completionRate,
            sessionsByDay,
            sessionsByType,
            dailyActivity,
            recentSessions
          })
        } else {
          setAnalytics(null)
        }
      } catch (error) {
        console.error('Error loading analytics:', error)
        setAnalytics(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()
  }, [supabase])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleSaveSettings = () => {
    setTimeLeft(settings.workTime * 60)
    setIsBreak(false)
    setSessionCount(0)
    setShowSettings(false)
  }

  const startNewSession = async (sessionType: 'work' | 'break' | 'long_break') => {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      if (authError) {
        console.error('Auth error:', authError)
        return
      }
      if (!session) {
        console.log('No active session')
        return
      }

      const durationSeconds = sessionType === 'work' 
        ? settings.workTime * 60 
        : sessionType === 'break' 
          ? settings.breakTime * 60 
          : settings.longBreakTime * 60

      const newSession: PomodoroSession = {
        id: crypto.randomUUID(),
        sessionType,
        durationSeconds,
        completed: false,
        interrupted: false,
        interruptionCount: 0,
        startTime: new Date(),
        workTimeSetting: settings.workTime,
        breakTimeSetting: settings.breakTime,
        longBreakTimeSetting: settings.longBreakTime,
        sessionsUntilLongBreak: settings.sessionsUntilLongBreak,
        sessionNumber: sessionType === 'work' ? sessionCount + 1 : 0
      }

      // Insert into Supabase
      const { error } = await supabase
        .from('pomodoro_analytics')
        .insert({
          id: newSession.id,
          user_id: session.user.id,
          session_id: newSession.id,
          session_type: newSession.sessionType,
          duration_seconds: newSession.durationSeconds,
          completed: newSession.completed,
          interrupted: newSession.interrupted,
          interruption_count: newSession.interruptionCount,
          start_time: newSession.startTime.toISOString(),
          work_time_setting: newSession.workTimeSetting,
          break_time_setting: newSession.breakTimeSetting,
          long_break_time_setting: newSession.longBreakTimeSetting,
          sessions_until_long_break: newSession.sessionsUntilLongBreak,
          session_number: newSession.sessionNumber
        })

      if (error) {
        console.error('Error starting session:', error)
        if (error.code === '42501') {
          console.error('Permission denied: You do not have access to insert into pomodoro_analytics')
        }
        return
      }

      setCurrentSession(newSession)
      setInterruptionCount(0)
    } catch (error) {
      console.error('Error starting session:', error)
    }
  }

  const completeSession = async (sessionId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('pomodoro_analytics')
        .update({
          completed,
          interrupted: !completed,
          end_time: new Date().toISOString()
        })
        .eq('id', sessionId)

      if (error) {
        console.error('Error completing session:', error)
        if (error.code === '42501') {
          console.error('Permission denied: You do not have access to update pomodoro_analytics')
        }
        return
      }

      // Refresh analytics
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      if (authError) {
        console.error('Auth error:', authError)
        return
      }
      if (!session) {
        console.log('No active session')
        return
      }

      const { data: sessions, error: fetchError } = await supabase
        .from('pomodoro_analytics')
        .select('*')
        .eq('user_id', session.user.id)
        .order('start_time', { ascending: false })

      if (fetchError) {
        console.error('Error fetching sessions:', fetchError)
        if (fetchError.code === '42501') {
          console.error('Permission denied: You do not have access to view pomodoro_analytics')
        }
        return
      }

      if (sessions && sessions.length > 0) {
        // Process analytics data (same as in the useEffect)
        // ... (reuse the analytics processing code)
      }
    } catch (error) {
      console.error('Error completing session:', error)
    }
  }

  const updateSessionInterruption = async (sessionId: string, count: number) => {
    try {
      const { error } = await supabase
        .from('pomodoro_analytics')
        .update({
          interrupted: true,
          interruption_count: count
        })
        .eq('id', sessionId)

      if (error) {
        console.error('Error updating session interruption:', error)
        if (error.code === '42501') {
          console.error('Permission denied: You do not have access to update pomodoro_analytics')
        }
      }
    } catch (error) {
      console.error('Error updating session interruption:', error)
    }
  }

  // Prepare chart data
  const dailyActivityData = {
    labels: analytics?.dailyActivity.map(item => item.date) || [],
    datasets: [
      {
        label: 'Sessions',
        data: analytics?.dailyActivity.map(item => item.count) || [],
        borderColor: '#A855F7',
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        tension: 0.3,
      },
    ],
  }

  const sessionTypeData = {
    labels: ['Work', 'Break', 'Long Break'],
    datasets: [
      {
        data: [
          analytics?.sessionsByType.work || 0,
          analytics?.sessionsByType.break || 0,
          analytics?.sessionsByType.long_break || 0,
        ],
        backgroundColor: [
          'rgba(168, 85, 247, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderColor: [
          'rgba(168, 85, 247, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <div className="min-h-screen bg-[#030014] text-white p-8 md:pl-20">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-violet-100 flex items-center gap-2">
                  <Clock className="h-8 w-8 text-violet-400" />
                  Pomodoro Timer
                </h1>
                <p className="text-violet-300/80 mt-2">Stay focused and productive</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="bg-violet-600 hover:bg-violet-500 text-white"
                >
                  <BarChart2 className="h-5 w-5 mr-2" />
                  {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                </Button>
                <Button
                  onClick={() => setShowSettings(true)}
                  className="bg-violet-600 hover:bg-violet-500 text-white"
                >
                  <Settings className="h-5 w-5 mr-2" />
                  Settings
                </Button>
              </div>
            </div>

            {/* Timer */}
            <Card className="p-6 bg-[#0E0529]/80 border-violet-500/30 overflow-hidden hover:border-violet-500/50 transition-all duration-300 shadow-lg shadow-violet-500/10">
              <div className="flex flex-col items-center space-y-6">
                <div className="text-7xl font-bold text-violet-100 font-mono">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-lg text-violet-200/90">
                  {isBreak ? 'Break Time' : 'Focus Time'}
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => {
                      if (!isRunning && !currentSession) {
                        startNewSession(isBreak ? 'break' : 'work')
                      }
                      setIsRunning(!isRunning)
                    }}
                    className="bg-violet-600 hover:bg-violet-500 text-white"
                  >
                    {isRunning ? (
                      <>
                        <Pause className="h-5 w-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      if (currentSession) {
                        completeSession(currentSession.id, false)
                        setCurrentSession(null)
                      }
                      setTimeLeft(settings.workTime * 60)
                      setIsBreak(false)
                      setIsRunning(false)
                      setSessionCount(0)
                    }}
                    variant="outline"
                    className="border-violet-500/50 text-violet-300 hover:bg-violet-500/10"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Reset
                  </Button>
                </div>
                <div className="text-sm text-violet-300/60">
                  Session {sessionCount + 1} of {settings.sessionsUntilLongBreak}
                </div>
              </div>
            </Card>

            {/* Analytics Section */}
            {showAnalytics && (
              <Card className="mt-8 p-6 bg-[#0E0529]/80 border-violet-500/30 overflow-hidden hover:border-violet-500/50 transition-all duration-300 shadow-lg shadow-violet-500/10">
                <h2 className="text-2xl font-bold text-violet-100 mb-6">Your Pomodoro Analytics</h2>
                
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-400"></div>
                  </div>
                ) : analytics ? (
                  <div className="space-y-8">
                    {/* Analytics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="rounded-lg border border-violet-500/20 bg-violet-900/50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Timer className="h-5 w-5 text-violet-400" />
                          <h3 className="text-lg font-semibold text-violet-200">Total Sessions</h3>
                        </div>
                        <p className="text-3xl font-bold text-violet-100">{analytics.totalSessions}</p>
                      </div>
                      <div className="rounded-lg border border-violet-500/20 bg-violet-900/50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-emerald-400" />
                          <h3 className="text-lg font-semibold text-violet-200">Completed</h3>
                        </div>
                        <p className="text-3xl font-bold text-violet-100">{analytics.completedSessions}</p>
                      </div>
                      <div className="rounded-lg border border-violet-500/20 bg-violet-900/50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-5 w-5 text-amber-400" />
                          <h3 className="text-lg font-semibold text-violet-200">Total Work Time</h3>
                        </div>
                        <p className="text-3xl font-bold text-violet-100">
                          {Math.round(analytics.totalWorkTime / 60)} min
                        </p>
                      </div>
                      <div className="rounded-lg border border-violet-500/20 bg-violet-900/50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-5 w-5 text-blue-400" />
                          <h3 className="text-lg font-semibold text-violet-200">Completion Rate</h3>
                        </div>
                        <p className="text-3xl font-bold text-violet-100">
                          {Math.round(analytics.completionRate)}%
                        </p>
                      </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="rounded-lg border border-violet-500/20 bg-violet-900/50 p-4">
                        <h3 className="text-lg font-semibold text-violet-200 mb-4">Daily Activity</h3>
                        <div className="h-[250px]">
                          <Line options={lineChartOptions} data={dailyActivityData} />
                        </div>
                      </div>
                      <div className="rounded-lg border border-violet-500/20 bg-violet-900/50 p-4">
                        <h3 className="text-lg font-semibold text-violet-200 mb-4">Session Types</h3>
                        <div className="h-[250px]">
                          <Pie options={pieChartOptions} data={sessionTypeData} />
                        </div>
                      </div>
                    </div>

                    {/* Recent Sessions */}
                    <div className="rounded-lg border border-violet-500/20 bg-violet-900/50 p-4">
                      <h3 className="text-lg font-semibold text-violet-200 mb-4">Recent Sessions</h3>
                      <div className="space-y-3">
                        {analytics.recentSessions.map((session) => (
                          <div
                            key={session.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-violet-500/5"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                session.sessionType === 'work' 
                                  ? 'bg-violet-500/20' 
                                  : session.sessionType === 'break'
                                    ? 'bg-emerald-500/20'
                                    : 'bg-amber-500/20'
                              }`}>
                                <Timer className={`h-4 w-4 ${
                                  session.sessionType === 'work' 
                                    ? 'text-violet-400' 
                                    : session.sessionType === 'break'
                                      ? 'text-emerald-400'
                                      : 'text-amber-400'
                                }`} />
                              </div>
                              <div>
                                <p className="text-sm text-violet-100">
                                  {session.sessionType === 'work' 
                                    ? 'Work Session' 
                                    : session.sessionType === 'break'
                                      ? 'Break'
                                      : 'Long Break'}
                                </p>
                                <p className="text-xs text-violet-300/60">
                                  {format(session.startTime, 'MMM d, yyyy h:mm a')}
                                  {` • ${Math.round(session.durationSeconds / 60)} min`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {session.completed ? (
                                <CheckCircle className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-amber-400" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-violet-200">
                    No analytics data available yet. Start using the Pomodoro timer to collect data.
                  </div>
                )}
              </Card>
            )}

            {/* About the Pomodoro Technique */}
            <Card className="mt-8 p-6 bg-[#0E0529]/80 border-violet-500/30 overflow-hidden hover:border-violet-500/50 transition-all duration-300 shadow-lg shadow-violet-500/10">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-violet-100 mb-3">About the Pomodoro Technique</h2>
                  <p className="text-violet-200/90">
                    The Pomodoro Technique is a time management method that uses timed intervals of focused work followed by short breaks to improve productivity and maintain mental freshness.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-violet-100 mb-2">How to Use</h3>
                  <ol className="space-y-2 text-violet-200/90">
                    <li className="flex gap-2">
                      <span className="text-violet-400">1.</span>
                      <span>Choose a task you want to complete</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-violet-400">2.</span>
                      <span>Work on the task for 25 minutes (one Pomodoro)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-violet-400">3.</span>
                      <span>Take a 5-minute break when the timer rings</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-violet-400">4.</span>
                      <span>After 4 Pomodoros, take a longer 15-minute break</span>
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-violet-100 mb-2">Benefits</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <li className="flex items-start gap-3 bg-violet-500/10 p-4 rounded-lg">
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-violet-400" />
                      <div>
                        <h4 className="font-medium text-violet-100">Improved Focus</h4>
                        <p className="text-sm text-violet-200/80">Minimize distractions and maintain concentration for better productivity</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 bg-violet-500/10 p-4 rounded-lg">
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-violet-400" />
                      <div>
                        <h4 className="font-medium text-violet-100">Reduced Mental Fatigue</h4>
                        <p className="text-sm text-violet-200/80">Regular breaks help prevent burnout and maintain mental freshness</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 bg-violet-500/10 p-4 rounded-lg">
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-violet-400" />
                      <div>
                        <h4 className="font-medium text-violet-100">Better Time Management</h4>
                        <p className="text-sm text-violet-200/80">Track and optimize how you spend your time on tasks</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 bg-violet-500/10 p-4 rounded-lg">
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-violet-400" />
                      <div>
                        <h4 className="font-medium text-violet-100">Increased Accountability</h4>
                        <p className="text-sm text-violet-200/80">Monitor your progress and maintain a consistent work rhythm</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-violet-100 mb-2">Tips for Success</h3>
                  <ul className="text-violet-200/90 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-violet-400" />
                      <span>Choose a quiet workspace with minimal distractions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-violet-400" />
                      <span>Use your breaks to stretch, move around, or have a quick snack</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-violet-400" />
                      <span>Keep a task list to track what you want to accomplish</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-violet-400" />
                      <span>Adjust the timer intervals to find what works best for you</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Settings Modal */}
            {showSettings && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <Card className="w-full max-w-md p-6 bg-[#0E0529]/80 border-violet-500/30 shadow-lg shadow-violet-500/10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-violet-100">Timer Settings</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSettings(false)}
                      className="text-violet-300 hover:text-violet-200 hover:bg-violet-500/10"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-violet-200 mb-2">
                        Work Time (minutes)
                      </label>
                      <Input
                        type="number"
                        value={settings.workTime}
                        onChange={(e) => setSettings(prev => ({ ...prev, workTime: parseInt(e.target.value) }))}
                        className="bg-violet-950/40 border-violet-500/30 text-violet-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-violet-200 mb-2">
                        Break Time (minutes)
                      </label>
                      <Input
                        type="number"
                        value={settings.breakTime}
                        onChange={(e) => setSettings(prev => ({ ...prev, breakTime: parseInt(e.target.value) }))}
                        className="bg-violet-950/40 border-violet-500/30 text-violet-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-violet-200 mb-2">
                        Long Break Time (minutes)
                      </label>
                      <Input
                        type="number"
                        value={settings.longBreakTime}
                        onChange={(e) => setSettings(prev => ({ ...prev, longBreakTime: parseInt(e.target.value) }))}
                        className="bg-violet-950/40 border-violet-500/30 text-violet-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-violet-200 mb-2">
                        Sessions Until Long Break
                      </label>
                      <Input
                        type="number"
                        value={settings.sessionsUntilLongBreak}
                        onChange={(e) => setSettings(prev => ({ ...prev, sessionsUntilLongBreak: parseInt(e.target.value) }))}
                        className="bg-violet-950/40 border-violet-500/30 text-violet-100"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setShowSettings(false)}
                      className="border-violet-500/50 text-violet-300 hover:bg-violet-500/10"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveSettings}
                      className="bg-violet-600 hover:bg-violet-500 text-white"
                    >
                      Save Settings
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 