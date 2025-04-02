"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Book, Plus, Pencil, Trash2, Save } from "lucide-react"
import Sidebar from "@/components/Sidebar"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

interface DiaryEntry {
  id: string
  title: string
  content: string
  mood: string | null
  created_at: string
  updated_at: string
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
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchEntries()
  }, [])

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
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create entry')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', id)

      if (error) throw error

      setEntries(entries.filter(entry => entry.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry')
    }
  }

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
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-violet-50 hover:bg-violet-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Entry
              </button>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
                {error}
              </div>
            )}
          </motion.div>
        </div>

        <div className="flex-1 flex flex-col px-4 sm:px-6 md:px-8 md:pl-20 pb-4 sm:pb-6 md:pb-8">
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

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6"
          >
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
        </div>
      </div>
    </div>
  )
}