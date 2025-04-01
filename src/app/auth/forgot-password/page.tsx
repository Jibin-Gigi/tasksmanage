'use client'

import { useState, useEffect } from 'react'
import { Shield } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from '@/lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' 
          ? `${window.location.origin}/auth/reset-password`
          : '/auth/reset-password',
      })

      if (resetError) throw resetError

      setSuccess(true)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to send reset password email')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return null // or a loading spinner
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
          <h2 className="text-3xl font-bold text-violet-100 mb-2">Forgot Password</h2>
          <p className="text-violet-300/80">
            Enter your email to receive a password reset link
          </p>
        </div>

        <div className="bg-[#0E0529]/50 p-8 rounded-lg border border-violet-500/20 backdrop-blur-sm">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded p-4 mb-6 text-red-200">
              {error}
            </div>
          )}

          {success ? (
            <div className="bg-green-500/10 border border-green-500/50 rounded p-4 text-green-200">
              Check your email for the password reset link
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-violet-200 mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-violet-950/50 border-violet-500/30 text-violet-100"
                  placeholder="Enter your email"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white"
              >
                {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}