'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from '@/lib/supabase'

export default function ResetPassword() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if we have a session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
      }
    }
    checkSession()
  }, [router])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) throw updateError

      router.push('/auth/login?reset=success')
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to reset password')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030014]">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-violet-400" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-purple-400">
              QuestLife
            </span>
          </div>
          <h2 className="text-3xl font-bold text-violet-100 mb-2">Create New Password</h2>
          <p className="text-violet-300/80">
            Enter your new password
          </p>
        </div>

        <div className="bg-[#0E0529]/50 p-8 rounded-lg border border-violet-500/20 backdrop-blur-sm">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded p-4 mb-6 text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-violet-200 mb-2">
                New Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-violet-950/50 border-violet-500/30 text-violet-100"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-violet-200 mb-2">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-violet-950/50 border-violet-500/30 text-violet-100"
                placeholder="Confirm new password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}