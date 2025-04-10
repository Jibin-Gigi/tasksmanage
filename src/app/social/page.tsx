"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Image as ImageIcon, Trophy, Heart, MessageSquare, Share2, MoreVertical, Loader2, Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Toaster, toast } from "sonner"
import Sidebar from "@/components/Sidebar"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User as SupabaseUser } from '@supabase/supabase-js'
import Image from 'next/image'

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  type: string;
  created_at: Date;
  likes: number;
  comments: number;
  user: {
    email: string;
    avatar_url?: string;
  };
  liked_by_user?: boolean;
}

interface Achievement {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  icon: string;
  created_at?: string | Date;
  likes: number;
  user: {
    email: string;
    avatar_url?: string;
  };
  liked_by_user?: boolean;
}

interface SupabaseAchievement {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  icon: string;
  created_at?: string;
}

interface Thread {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: Date;
  replies_count: number;
  likes: number;
  user: {
    email: string;
    avatar_url?: string;
  };
  liked_by_user?: boolean;
}

interface ThreadReply {
  id: string;
  thread_id: string;
  user_id: string;
  content: string;
  created_at: Date;
  user: {
    email: string;
    avatar_url?: string;
  };
}

interface PostReply {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: Date;
  user: {
    email: string;
    avatar_url?: string;
  };
}

export default function SocialPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [posts, setPosts] = useState<Post[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [threads, setThreads] = useState<Thread[]>([])
  const [threadReplies, setThreadReplies] = useState<Record<string, ThreadReply[]>>({})
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showThreadForm, setShowThreadForm] = useState(false)
  const [threadTitle, setThreadTitle] = useState("")
  const [threadContent, setThreadContent] = useState("")
  const [selectedThread, setSelectedThread] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isLoadingReplies, setIsLoadingReplies] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [shareTimeout, setShareTimeout] = useState<NodeJS.Timeout | null>(null)
  const [postReplies, setPostReplies] = useState<Record<string, PostReply[]>>({})
  const [selectedPost, setSelectedPost] = useState<string | null>(null)

  useEffect(() => {
    if (currentUser) {
      setIsLoadingUser(false)
    }
  }, [currentUser])

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          router.push('/login')
          return
        }

        if (!session) {
          console.log('No session found, redirecting to login')
          router.push('/login')
          return
        }

        setCurrentUser(session.user)

        // Check if posts table exists
        console.log('Checking posts table...')
        const { data: tableInfo, error: tableError } = await supabase
          .from('posts')
          .select('*')
          .limit(1)
        
        if (tableError) {
          console.error('Error checking posts table:', tableError)
          console.error('Error details:', JSON.stringify(tableError, null, 2))
          
          // Try to create the posts table if it doesn't exist
          console.log('Attempting to create posts table...')
          const { error: createError } = await supabase.rpc('create_posts_table_if_not_exists')
          
          if (createError) {
            console.error('Error creating posts table:', createError)
            console.error('Error details:', JSON.stringify(createError, null, 2))
          } else {
            console.log('Posts table created successfully')
          }
        } else {
          console.log('Posts table exists')
        }

        // Check if achievements table exists
        console.log('Checking achievements table...')
        const { data: achievementsTableInfo, error: achievementsTableError } = await supabase
          .from('achievements')
          .select('*')
          .limit(1)
        
        if (achievementsTableError) {
          console.error('Error checking achievements table:', achievementsTableError)
          console.error('Error details:', JSON.stringify(achievementsTableError, null, 2))
          
          // Try to create the achievements table if it doesn't exist
          console.log('Attempting to create achievements table...')
          const { error: createAchievementsError } = await supabase.rpc('create_achievements_table_if_not_exists')
          
          if (createAchievementsError) {
            console.error('Error creating achievements table:', createAchievementsError)
            console.error('Error details:', JSON.stringify(createAchievementsError, null, 2))
          } else {
            console.log('Achievements table created successfully')
          }
        } else {
          console.log('Achievements table exists')
        }

        // Check if threads table exists
        console.log('Checking threads table...')
        const { data: threadsTableInfo, error: threadsTableError } = await supabase
          .from('threads')
          .select('*')
          .limit(1)
        
        if (threadsTableError) {
          console.error('Error checking threads table:', threadsTableError)
          console.error('Error details:', JSON.stringify(threadsTableError, null, 2))
          
          // Try to create the threads table if it doesn't exist
          console.log('Attempting to create threads table...')
          const { error: createThreadsError } = await supabase.rpc('create_threads_table_if_not_exists')
          
          if (createThreadsError) {
            console.error('Error creating threads table:', createThreadsError)
            console.error('Error details:', JSON.stringify(createThreadsError, null, 2))
          } else {
            console.log('Threads table created successfully')
          }
        } else {
          console.log('Threads table exists')
        }

        // Check if liked_by_user column exists in posts table
        console.log('Checking liked_by_user column in posts table...')
        const { data: postsColumns, error: postsColumnsError } = await supabase
          .from('posts')
          .select('liked_by_user')
          .limit(1)
        
        if (postsColumnsError && postsColumnsError.code === '42703') { // PostgreSQL error code for undefined_column
          console.error('liked_by_user column does not exist in posts table:', postsColumnsError)
          
          // Try to add the column
          console.log('Attempting to add liked_by_user column to posts table...')
          const { error: addColumnError } = await supabase.rpc('add_liked_by_user_to_posts')
          
          if (addColumnError) {
            console.error('Error adding liked_by_user column to posts table:', addColumnError)
          } else {
            console.log('liked_by_user column added to posts table successfully')
          }
        } else {
          console.log('liked_by_user column exists in posts table')
        }

        // Check if liked_by_user column exists in achievements table
        console.log('Checking liked_by_user column in achievements table...')
        const { data: achievementsColumns, error: achievementsColumnsError } = await supabase
          .from('achievements')
          .select('liked_by_user')
          .limit(1)
        
        if (achievementsColumnsError && achievementsColumnsError.code === '42703') { // PostgreSQL error code for undefined_column
          console.error('liked_by_user column does not exist in achievements table:', achievementsColumnsError)
          
          // Try to add the column
          console.log('Attempting to add liked_by_user column to achievements table...')
          const { error: addColumnError } = await supabase.rpc('add_liked_by_user_to_achievements')
          
          if (addColumnError) {
            console.error('Error adding liked_by_user column to achievements table:', addColumnError)
          } else {
            console.log('liked_by_user column added to achievements table successfully')
          }
        } else {
          console.log('liked_by_user column exists in achievements table')
        }

        // Check if liked_by_user column exists in threads table
        console.log('Checking liked_by_user column in threads table...')
        const { data: threadsColumns, error: threadsColumnsError } = await supabase
          .from('threads')
          .select('liked_by_user')
          .limit(1)
        
        if (threadsColumnsError && threadsColumnsError.code === '42703') { // PostgreSQL error code for undefined_column
          console.error('liked_by_user column does not exist in threads table:', threadsColumnsError)
          
          // Try to add the column
          console.log('Attempting to add liked_by_user column to threads table...')
          const { error: addColumnError } = await supabase.rpc('add_liked_by_user_to_threads')
          
          if (addColumnError) {
            console.error('Error adding liked_by_user column to threads table:', addColumnError)
          } else {
            console.log('liked_by_user column added to threads table successfully')
          }
        } else {
          console.log('liked_by_user column exists in threads table')
        }

        // Fetch initial posts
        console.log('Fetching posts...')
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20)

        if (postsError) {
          console.error('Error fetching posts:', postsError)
          console.error('Error details:', JSON.stringify(postsError, null, 2))
          return
        }

        console.log('Posts fetched successfully:', postsData?.length || 0)
        
        // Fetch user data for each post
        if (postsData && postsData.length > 0) {
          // Add user data directly from the current session
          const postsWithUsers = postsData.map(post => ({
            ...post,
            user: {
              id: post.user_id,
              email: currentUser && post.user_id === currentUser.id ? currentUser.email : 'Anonymous User'
            },
            // Ensure liked_by_user is a boolean
            liked_by_user: post.liked_by_user === true
          }))
          setPosts(postsWithUsers)
        } else {
          setPosts([])
        }

        // Fetch initial achievements
        console.log('Fetching achievements...')
        const { data: achievementsData, error: achievementsError } = await supabase
          .from('achievements')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20)

        if (achievementsError) {
          console.error('Error fetching achievements:', achievementsError)
          console.error('Error details:', JSON.stringify(achievementsError, null, 2))
          return
        }

        console.log('Achievements fetched successfully:', achievementsData?.length || 0)
        
        // Add user data to achievements
        if (achievementsData && achievementsData.length > 0) {
          const achievementsWithUsers = achievementsData.map(achievement => ({
            ...achievement,
            user: {
              id: achievement.user_id || '',
              email: currentUser && achievement.user_id === currentUser.id ? currentUser.email : 'Anonymous User'
            },
            // Ensure liked_by_user is a boolean
            liked_by_user: achievement.liked_by_user === true
          }))
          setAchievements(achievementsWithUsers)
        } else {
          setAchievements([])
        }

        // Fetch initial threads
        console.log('Fetching threads...')
        const { data: threadsData, error: threadsError } = await supabase
          .from('threads')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20)

        if (threadsError) {
          console.error('Error fetching threads:', threadsError)
          console.error('Error details:', JSON.stringify(threadsError, null, 2))
        } else {
          console.log('Threads fetched successfully:', threadsData?.length || 0)
          
          // Add user data to threads
          if (threadsData && threadsData.length > 0) {
            const threadsWithUsers = threadsData.map(thread => ({
              ...thread,
              user: {
                id: thread.user_id,
                email: currentUser && thread.user_id === currentUser.id ? currentUser.email : 'Anonymous User'
              },
              // Ensure liked_by_user is a boolean
              liked_by_user: thread.liked_by_user === true
            }))
            setThreads(threadsWithUsers)
          } else {
            setThreads([])
          }
        }

        // Subscribe to auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (!session) {
            console.log('Auth state changed: no session, redirecting to login')
            router.push('/login')
            return
          }
          setCurrentUser(session.user)
        })

        // Subscribe to new posts
        const postsSubscription = supabase
          .channel('posts')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, payload => {
            setPosts(prev => [payload.new as Post, ...prev])
          })
          .subscribe()

        // Subscribe to new achievements
        const achievementsSubscription = supabase
          .channel('achievements')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'achievements' }, payload => {
            setAchievements(prev => [payload.new as Achievement, ...prev])
          })
          .subscribe()

        // Subscribe to new threads
        const threadsSubscription = supabase
          .channel('threads')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'threads' }, payload => {
            setThreads(prev => [payload.new as Thread, ...prev])
          })
          .subscribe()

        // Subscribe to new thread replies
        const threadRepliesSubscription = supabase
          .channel('thread_replies')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'thread_replies' }, payload => {
            const newReply = payload.new as ThreadReply
            setThreadReplies(prev => ({
              ...prev,
              [newReply.thread_id]: [...(prev[newReply.thread_id] || []), {
                ...newReply,
                user: {
                  id: newReply.user_id,
                  email: currentUser && newReply.user_id === currentUser.id ? currentUser.email || 'Anonymous User' : 'Anonymous User'
                }
              }]
            }))
            
            // Update the threads state to increment the replies_count
            setThreads(prev => prev.map(thread => 
              thread.id === newReply.thread_id 
                ? { ...thread, replies_count: thread.replies_count + 1 } 
                : thread
            ))
          })
          .subscribe()

        return () => {
          subscription.unsubscribe()
          postsSubscription.unsubscribe()
          achievementsSubscription.unsubscribe()
          threadsSubscription.unsubscribe()
          threadRepliesSubscription.unsubscribe()
        }
      } catch (error) {
        console.error('Unexpected error in getUser:', error)
      }
    }

    getUser()
  }, [supabase, router])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [posts, achievements])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const createPost = async () => {
    if (!input.trim() && !selectedImage) return

    try {
      setIsLoading(true)

      // Check if user is authenticated
      if (!currentUser?.id) {
        throw new Error('User not authenticated')
      }

      let imageUrl = null

      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${currentUser.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filePath, selectedImage)

        if (uploadError) {
          console.error('Error uploading image:', uploadError)
          throw new Error('Failed to upload image: ' + uploadError.message)
        }

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(filePath)
        imageUrl = publicUrl
      }

      // Add the required 'type' field
      const { data, error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: currentUser.id,
          content: input.trim(),
          image_url: imageUrl,
          type: imageUrl ? 'image' : 'text', // Use lowercase values to match the check constraint
          likes: 0,
          comments: 0
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error inserting post:', insertError)
        throw new Error('Failed to create post: ' + insertError.message)
      }

      if (!data) {
        throw new Error('No data returned from post creation')
      }

      // Add the user data to the post
      const newPost = {
        ...data,
        user: {
          id: currentUser.id,
          email: currentUser.email
        }
      }

      // Update the posts state with the new post
      setPosts(prev => [newPost, ...prev])

      setInput("")
      setSelectedImage(null)
      setImagePreview(null)
      toast.success("Post created successfully!")
    } catch (error) {
      console.error('Error in createPost:', error)
      toast.error(error instanceof Error ? error.message : "Failed to create post")
    } finally {
      setIsLoading(false)
    }
  }

  const createAchievement = async () => {
    if (!input.trim()) return

    try {
      setIsLoading(true)
      const { error } = await supabase
        .from('achievements')
        .insert([
          {
            user_id: currentUser?.id,
            title: "New Achievement",
            description: input.trim(),
            icon: "🏆"
          }
        ])

      if (error) throw error

      setInput("")
      toast.success("Achievement shared!")
    } catch (error) {
      console.error('Error creating achievement:', error)
      toast.error("Failed to share achievement")
    } finally {
      setIsLoading(false)
    }
  }

  const createThread = async () => {
    if (!threadTitle.trim() || !threadContent.trim()) return

    try {
      setIsLoading(true)

      // Check if user is authenticated
      if (!currentUser?.id) {
        throw new Error('User not authenticated')
      }

      // First check if the threads table exists
      const { error: tableCheckError } = await supabase
        .from('threads')
        .select('id')
        .limit(1)

      if (tableCheckError) {
        console.error('Error checking threads table:', tableCheckError)
        
        // If the table doesn't exist, show a more helpful error message
        if (tableCheckError.code === '42P01') { // PostgreSQL error code for undefined_table
          toast.error("Threads feature is not set up yet. Please contact the administrator.")
          return
        }
        
        throw new Error('Failed to create thread: ' + tableCheckError.message)
      }

      // Insert the thread
      const { data, error: insertError } = await supabase
        .from('threads')
        .insert({
          user_id: currentUser.id,
          title: threadTitle.trim(),
          content: threadContent.trim(),
          replies_count: 0
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error inserting thread:', insertError)
        throw new Error('Failed to create thread: ' + insertError.message)
      }

      if (!data) {
        throw new Error('No data returned from thread creation')
      }

      // Add the user data to the thread
      const newThread = {
        ...data,
        user: {
          id: currentUser.id,
          email: currentUser.email
        }
      }

      // Update the threads state with the new thread
      setThreads(prev => [newThread, ...prev])

      // Reset form
      setThreadTitle("")
      setThreadContent("")
      setShowThreadForm(false)
      toast.success("Thread created successfully!")
    } catch (error) {
      console.error('Error in createThread:', error)
      toast.error(error instanceof Error ? error.message : "Failed to create thread")
    } finally {
      setIsLoading(false)
    }
  }

  const loadThreadReplies = async (threadId: string) => {
    try {
      setIsLoadingReplies(true)
      
      // Check if the thread_replies table exists
      const { error: tableCheckError } = await supabase
        .from('thread_replies')
        .select('id')
        .limit(1)

      if (tableCheckError) {
        console.error('Error checking thread_replies table:', tableCheckError)
        
        // If the table doesn't exist, show a more helpful error message
        if (tableCheckError.code === '42P01') { // PostgreSQL error code for undefined_table
          toast.error("Thread replies feature is not set up yet. Please contact the administrator.")
          return
        }
        
        throw new Error('Failed to load replies: ' + tableCheckError.message)
      }

      // Fetch replies for the thread
      const { data, error } = await supabase
        .from('thread_replies')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching thread replies:', error)
        toast.error('Failed to load replies: ' + error.message)
        return
      }

      // Add user data to replies
      const repliesWithUsers = data.map(reply => ({
        ...reply,
        user: {
          id: reply.user_id,
          email: currentUser && reply.user_id === currentUser.id ? currentUser.email : 'Anonymous User'
        }
      }))

      // Update the threadReplies state
      setThreadReplies(prev => ({
        ...prev,
        [threadId]: repliesWithUsers
      }))
    } catch (error) {
      console.error('Error in loadThreadReplies:', error)
      toast.error(error instanceof Error ? error.message : "Failed to load replies")
    } finally {
      setIsLoadingReplies(false)
    }
  }

  const createThreadReply = async (threadId: string) => {
    if (!replyContent.trim()) return

    try {
      setIsLoading(true)

      // Check if user is authenticated
      if (!currentUser?.id) {
        throw new Error('User not authenticated')
      }

      // Check if the thread_replies table exists
      const { error: tableCheckError } = await supabase
        .from('thread_replies')
        .select('id')
        .limit(1)

      if (tableCheckError) {
        console.error('Error checking thread_replies table:', tableCheckError)
        
        // If the table doesn't exist, show a more helpful error message
        if (tableCheckError.code === '42P01') { // PostgreSQL error code for undefined_table
          toast.error("Thread replies feature is not set up yet. Please contact the administrator.")
          return
        }
        
        throw new Error('Failed to create reply: ' + tableCheckError.message)
      }

      // Insert the reply
      const { data, error: insertError } = await supabase
        .from('thread_replies')
        .insert({
          thread_id: threadId,
          user_id: currentUser.id,
          content: replyContent.trim()
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error inserting reply:', insertError)
        throw new Error('Failed to create reply: ' + insertError.message)
      }

      if (!data) {
        throw new Error('No data returned from reply creation')
      }

      // Add the user data to the reply
      const newReply = {
        ...data,
        user: {
          id: currentUser.id,
          email: currentUser.email
        }
      }

      // Update the threadReplies state with the new reply
      setThreadReplies(prev => ({
        ...prev,
        [threadId]: [...(prev[threadId] || []), newReply]
      }))

      // Update the threads state to increment the replies_count
      setThreads(prev => prev.map(thread => 
        thread.id === threadId 
          ? { ...thread, replies_count: thread.replies_count + 1 } 
          : thread
      ))

      // Reset form
      setReplyContent("")
      toast.success("Reply posted successfully!")
    } catch (error) {
      console.error('Error in createThreadReply:', error)
      toast.error(error instanceof Error ? error.message : "Failed to create reply")
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = (item: Post | Achievement | Thread) => {
    // Clear any existing timeout
    if (shareTimeout) {
      clearTimeout(shareTimeout)
    }
    
    // Generate a shareable URL based on the item type
    let url = window.location.origin
    
    if ('type' in item) {
      // It's a post
      url += `/social?post=${item.id}`
    } else if ('icon' in item) {
      // It's an achievement
      url += `/social?achievement=${item.id}`
    } else {
      // It's a thread
      url += `/social?thread=${item.id}`
    }
    
    // Copy to clipboard
    navigator.clipboard.writeText(url)
      .then(() => {
        setShareUrl(url)
        
        // Set a timeout to clear the share URL after 3 seconds
        const timeout = setTimeout(() => {
          setShareUrl(null)
        }, 3000)
        
        setShareTimeout(timeout)
        
        toast.success("Link copied to clipboard!")
      })
      .catch(err => {
        console.error("Failed to copy: ", err)
        toast.error("Failed to copy link to clipboard")
      })
  }

  // Add useEffect to handle URL parameters for shared content
  useEffect(() => {
    // Check if there are URL parameters for shared content
    const urlParams = new URLSearchParams(window.location.search)
    const postId = urlParams.get('post')
    const achievementId = urlParams.get('achievement')
    const threadId = urlParams.get('thread')
    
    if (postId) {
      // Scroll to the post
      const postElement = document.getElementById(`post-${postId}`)
      if (postElement) {
        postElement.scrollIntoView({ behavior: 'smooth' })
        postElement.classList.add('highlight-shared')
        setTimeout(() => {
          postElement.classList.remove('highlight-shared')
        }, 3000)
      }
    } else if (achievementId) {
      // Scroll to the achievement
      const achievementElement = document.getElementById(`achievement-${achievementId}`)
      if (achievementElement) {
        achievementElement.scrollIntoView({ behavior: 'smooth' })
        achievementElement.classList.add('highlight-shared')
        setTimeout(() => {
          achievementElement.classList.remove('highlight-shared')
        }, 3000)
      }
    } else if (threadId) {
      // Scroll to the thread and expand it
      const threadElement = document.getElementById(`thread-${threadId}`)
      if (threadElement) {
        threadElement.scrollIntoView({ behavior: 'smooth' })
        threadElement.classList.add('highlight-shared')
        setTimeout(() => {
          threadElement.classList.remove('highlight-shared')
        }, 3000)
        
        // Set the selected thread to expand it
        setSelectedThread(threadId)
        if (!threadReplies[threadId]) {
          loadThreadReplies(threadId)
        }
      }
    }
  }, [posts, achievements, threads, threadReplies])

  // Add function to handle likes
  const handleLike = async (item: Post | Achievement | Thread) => {
    if (!currentUser) {
      toast.error("You need to be logged in to like content")
      return
    }

    try {
      setIsLoading(true)
      
      // Determine which table to update based on the item type
      let tableName = ''
      
      if ('type' in item) {
        // It's a post
        tableName = 'posts'
      } else if ('icon' in item) {
        // It's an achievement
        tableName = 'achievements'
      } else {
        // It's a thread
        tableName = 'threads'
      }
      
      // Toggle the liked_by_user state
      const newLikedState = !item.liked_by_user
      const newLikeCount = newLikedState ? (item.likes + 1) : (item.likes - 1)
      
      // Update the item's like count in the database
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ 
          likes: newLikeCount,
          liked_by_user: newLikedState
        })
        .eq('id', item.id)
      
      if (updateError) {
        console.error('Error updating like count:', updateError)
        throw new Error('Failed to update like count')
      }
      
      // Update the local state
      if ('type' in item) {
        setPosts(prev => prev.map(post => 
          post.id === item.id 
            ? { ...post, likes: newLikeCount, liked_by_user: newLikedState } 
            : post
        ))
      } else if ('icon' in item) {
        setAchievements(prev => prev.map(achievement => 
          achievement.id === item.id 
            ? { ...achievement, likes: newLikeCount, liked_by_user: newLikedState } 
            : achievement
        ))
      } else {
        setThreads(prev => prev.map(thread => 
          thread.id === item.id 
            ? { ...thread, likes: newLikeCount, liked_by_user: newLikedState } 
            : thread
        ))
      }
      
      toast.success(newLikedState ? "Item liked" : "Item unliked")
    } catch (error) {
      console.error('Error in handleLike:', error)
      toast.error(error instanceof Error ? error.message : "Failed to like/unlike item")
      
      // Even if there's an error, try to update the UI state for a better user experience
      if ('type' in item) {
        setPosts(prev => prev.map(post => 
          post.id === item.id 
            ? { ...post, likes: post.liked_by_user ? post.likes - 1 : post.likes + 1, liked_by_user: !post.liked_by_user } 
            : post
        ))
      } else if ('icon' in item) {
        setAchievements(prev => prev.map(achievement => 
          achievement.id === item.id 
            ? { ...achievement, likes: achievement.liked_by_user ? achievement.likes - 1 : achievement.likes + 1, liked_by_user: !achievement.liked_by_user } 
            : achievement
        ))
      } else {
        setThreads(prev => prev.map(thread => 
          thread.id === item.id 
            ? { ...thread, likes: thread.liked_by_user ? thread.likes - 1 : thread.likes + 1, liked_by_user: !thread.liked_by_user } 
            : thread
        ))
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  // Add function to load post replies
  const loadPostReplies = async (postId: string) => {
    try {
      setIsLoadingReplies(true)
      
      // Check if the post_replies table exists
      const { error: tableCheckError } = await supabase
        .from('post_replies')
        .select('id')
        .limit(1)
      
      if (tableCheckError) {
        console.error('Error checking post_replies table:', tableCheckError)
        
        // If the table doesn't exist, show a more helpful error message
        if (tableCheckError.code === '42P01') { // PostgreSQL error code for undefined_table
          toast.error("Post replies feature is not set up yet. Please contact the administrator.")
          return
        }
        
        throw new Error('Failed to load replies: ' + tableCheckError.message)
      }
      
      // Fetch replies for the post
      const { data, error } = await supabase
        .from('post_replies')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Error fetching post replies:', error)
        toast.error('Failed to load replies: ' + error.message)
        return
      }
      
      // Add user data to replies
      const repliesWithUsers = data.map(reply => ({
        ...reply,
        user: {
          id: reply.user_id,
          email: currentUser && reply.user_id === currentUser.id ? currentUser.email : 'Anonymous User'
        }
      }))
      
      // Update the postReplies state
      setPostReplies(prev => ({
        ...prev,
        [postId]: repliesWithUsers
      }))
    } catch (error) {
      console.error('Error in loadPostReplies:', error)
      toast.error(error instanceof Error ? error.message : "Failed to load replies")
    } finally {
      setIsLoadingReplies(false)
    }
  }
  
  // Add function to create post reply
  const createPostReply = async (postId: string) => {
    if (!replyContent.trim()) return
    
    try {
      setIsLoading(true)
      
      // Check if user is authenticated
      if (!currentUser?.id) {
        throw new Error('User not authenticated')
      }
      
      // Check if the post_replies table exists
      const { error: tableCheckError } = await supabase
        .from('post_replies')
        .select('id')
        .limit(1)
      
      if (tableCheckError) {
        console.error('Error checking post_replies table:', tableCheckError)
        
        // If the table doesn't exist, show a more helpful error message
        if (tableCheckError.code === '42P01') { // PostgreSQL error code for undefined_table
          toast.error("Post replies feature is not set up yet. Please contact the administrator.")
          return
        }
        
        throw new Error('Failed to create reply: ' + tableCheckError.message)
      }
      
      // Insert the reply
      const { data, error: insertError } = await supabase
        .from('post_replies')
        .insert({
          post_id: postId,
          user_id: currentUser.id,
          content: replyContent.trim()
        })
        .select()
        .single()
      
      if (insertError) {
        console.error('Error inserting reply:', insertError)
        throw new Error('Failed to create reply: ' + insertError.message)
      }
      
      if (!data) {
        throw new Error('No data returned from reply creation')
      }
      
      // Add the user data to the reply
      const newReply = {
        ...data,
        user: {
          id: currentUser.id,
          email: currentUser.email
        }
      }
      
      // Update the postReplies state with the new reply
      setPostReplies(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newReply]
      }))
      
      // Update the posts state to increment the comments_count
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, comments: post.comments + 1 } 
          : post
      ))
      
      // Reset form
      setReplyContent("")
      toast.success("Reply posted successfully!")
    } catch (error) {
      console.error('Error in createPostReply:', error)
      toast.error(error instanceof Error ? error.message : "Failed to create reply")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen bg-[#030014] overflow-x-hidden">
        <div className="p-2 sm:p-4 md:p-8 md:pl-20">
          <Toaster richColors position="top-center" />

          <div className="mb-2 sm:mb-4 md:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-violet-50">
              Social Feed
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-violet-200/90 mt-1 sm:mt-2">
              Share your thoughts, achievements, and moments with the community
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col px-2 sm:px-4 md:px-8 md:pl-20 pb-2 sm:pb-4 md:pb-8">
          <div className="flex-1">
            <Card className="bg-violet-950/50 backdrop-blur-sm border-violet-500/20 shadow-xl h-full">
              <CardContent className="p-0">
                <div className="space-y-2 sm:space-y-4">
                  <ScrollArea 
                    className="h-[calc(100vh-200px)] sm:h-[calc(100vh-250px)] md:h-[600px] p-2 sm:p-4 md:p-6" 
                    ref={scrollAreaRef}
                  >
                    <div className="space-y-4">
                      {isLoadingUser ? (
                        <div className="flex items-center justify-center h-32">
                          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
                        </div>
                      ) : (
                        <>
                          {/* Create Post */}
                          <Card className="bg-violet-900/20 border-violet-500/20">
                            <CardContent className="p-4">
                              <div className="flex gap-2">
                                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border bg-violet-500/20 border-violet-500/30">
                                  <span className="text-sm text-violet-400">
                                    {currentUser?.email?.[0].toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <Textarea
                                    placeholder="What's on your mind?"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="bg-violet-900/20 border-violet-500/20 min-h-[80px] resize-none text-violet-50 placeholder:text-violet-300/50"
                                  />
                                  {imagePreview && (
                                    <div className="relative mt-2 h-48 w-full">
                                      <Image
                                        src={imagePreview}
                                        alt="Preview"
                                        fill
                                        className="object-cover rounded-lg"
                                      />
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 bg-violet-900/80 hover:bg-violet-800/80"
                                        onClick={() => {
                                          setSelectedImage(null)
                                          setImagePreview(null)
                                        }}
                                      >
                                        <span className="text-violet-200">×</span>
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-4">
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-violet-300 hover:text-violet-100 hover:bg-violet-500/20"
                                    onClick={() => document.getElementById('image-upload')?.click()}
                                  >
                                    <ImageIcon className="h-4 w-4 mr-2" />
                                    Image
                                  </Button>
                                  <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageSelect}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-violet-300 hover:text-violet-100 hover:bg-violet-500/20"
                                    onClick={createAchievement}
                                    disabled={isLoading || !input.trim()}
                                  >
                                    <Trophy className="h-4 w-4 mr-2" />
                                    Achievement
                                  </Button>
                                </div>
                                <Button
                                  onClick={createPost}
                                  disabled={isLoading || (!input.trim() && !selectedImage)}
                                  className="bg-violet-500 hover:bg-violet-600"
                                >
                                  {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Send className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Posts and Achievements */}
                          {[...posts, ...achievements].sort((a, b) => {
                            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                            return dateB - dateA;
                          }).map((item) => (
                            <Card key={item.id} id={`${'type' in item ? 'post' : 'achievement'}-${item.id}`} className="bg-violet-900/20 border-violet-500/20">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border bg-violet-500/20 border-violet-500/30">
                                    <span className="text-sm text-violet-400">
                                      {item.user.email[0].toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-violet-200">
                                        {item.user.email}
                                      </span>
                                      <span className="text-xs text-violet-300/70">
                                        {item.created_at ? new Date(item.created_at).toLocaleString() : 'No date'}
                                      </span>
                                    </div>
                                    {'image_url' in item && item.image_url && (
                                      <div className="relative mt-2 h-64 w-full">
                                        <Image
                                          src={item.image_url}
                                          alt="Post image"
                                          fill
                                          className="object-cover rounded-lg"
                                        />
                                      </div>
                                    )}
                                    <p className="mt-2 text-sm text-violet-100">
                                      {'content' in item ? item.content : item.description}
                                    </p>
                                    <div className="flex items-center gap-4 mt-4">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`text-violet-300 hover:text-violet-100 hover:bg-violet-500/20 ${('type' in item && item.liked_by_user) ? 'text-violet-400' : ''}`}
                                        onClick={() => handleLike(item)}
                                        disabled={isLoading}
                                      >
                                        <Heart className={`h-4 w-4 mr-2 ${('type' in item && item.liked_by_user) ? 'fill-violet-400' : ''}`} />
                                        {('likes' in item) ? item.likes : 0}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-violet-300 hover:text-violet-100 hover:bg-violet-500/20"
                                        onClick={() => {
                                          setSelectedPost(selectedPost === item.id ? null : item.id)
                                          if (selectedPost !== item.id && !postReplies[item.id]) {
                                            loadPostReplies(item.id)
                                          }
                                        }}
                                      >
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        {('comments' in item) ? item.comments : 0}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-violet-300 hover:text-violet-100 hover:bg-violet-500/20"
                                        onClick={() => handleShare(item)}
                                      >
                                        {shareUrl && (('type' in item && item.id === shareUrl.split('=')[1]) || 
                                                     ('icon' in item && item.id === shareUrl.split('=')[1]) ||
                                                     ('title' in item && item.id === shareUrl.split('=')[1])) ? (
                                          <Check className="h-4 w-4 mr-2" />
                                        ) : (
                                          <Share2 className="h-4 w-4 mr-2" />
                                        )}
                                        Share
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}

                          {/* Threads Section */}
                          <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                              <h2 className="text-xl font-semibold text-violet-100">Discussion Threads</h2>
                              <Button 
                                onClick={() => setShowThreadForm(!showThreadForm)}
                                className="bg-violet-600 hover:bg-violet-700"
                              >
                                {showThreadForm ? 'Cancel' : 'Start a Thread'}
                              </Button>
                            </div>

                            {showThreadForm && (
                              <Card className="mb-4 bg-violet-900/20 border-violet-500/20">
                                <CardContent className="p-4">
                                  <div className="space-y-4">
                                    <div>
                                      <label htmlFor="thread-title" className="block text-sm font-medium text-violet-200 mb-1">
                                        Thread Title
                                      </label>
                                      <input
                                        id="thread-title"
                                        type="text"
                                        value={threadTitle}
                                        onChange={(e) => setThreadTitle(e.target.value)}
                                        className="w-full px-3 py-2 bg-violet-900/20 border border-violet-500/20 rounded-md text-violet-100 placeholder:text-violet-300/50"
                                        placeholder="Enter a title for your thread"
                                      />
                                    </div>
                                    <div>
                                      <label htmlFor="thread-content" className="block text-sm font-medium text-violet-200 mb-1">
                                        Thread Content
                                      </label>
                                      <Textarea
                                        id="thread-content"
                                        value={threadContent}
                                        onChange={(e) => setThreadContent(e.target.value)}
                                        className="bg-violet-900/20 border-violet-500/20 min-h-[120px] resize-none text-violet-50 placeholder:text-violet-300/50"
                                        placeholder="What would you like to discuss?"
                                      />
                                    </div>
                                    <div className="flex justify-end">
                                      <Button
                                        onClick={createThread}
                                        disabled={isLoading || !threadTitle.trim() || !threadContent.trim()}
                                        className="bg-violet-500 hover:bg-violet-600"
                                      >
                                        {isLoading ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          'Create Thread'
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            <div className="space-y-4">
                              {threads.length === 0 ? (
                                <Card className="bg-violet-900/20 border-violet-500/20">
                                  <CardContent className="p-4 text-center text-violet-300">
                                    No threads yet. Be the first to start a discussion!
                                  </CardContent>
                                </Card>
                              ) : (
                                threads.map((thread) => (
                                  <Card key={thread.id} id={`thread-${thread.id}`} className="bg-violet-900/20 border-violet-500/20">
                                    <CardContent className="p-4">
                                      <div className="flex items-start gap-3">
                                        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border bg-violet-500/20 border-violet-500/30">
                                          <span className="text-sm text-violet-400">
                                            {thread.user.email[0].toUpperCase()}
                                          </span>
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-violet-200">
                                              {thread.user.email}
                                            </span>
                                            <span className="text-xs text-violet-300/70">
                                              {new Date(thread.created_at).toLocaleString()}
                                            </span>
                                          </div>
                                          <h3 className="mt-1 text-lg font-semibold text-violet-100">
                                            {thread.title}
                                          </h3>
                                          <p className="mt-2 text-sm text-violet-100">
                                            {thread.content}
                                          </p>
                                          <div className="flex items-center gap-4 mt-4">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="text-violet-300 hover:text-violet-100 hover:bg-violet-500/20"
                                              onClick={() => {
                                                setSelectedThread(selectedThread === thread.id ? null : thread.id)
                                                if (selectedThread !== thread.id && !threadReplies[thread.id]) {
                                                  loadThreadReplies(thread.id)
                                                }
                                              }}
                                            >
                                              <MessageSquare className="h-4 w-4 mr-2" />
                                              {thread.replies_count} Replies
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="text-violet-300 hover:text-violet-100 hover:bg-violet-500/20"
                                              onClick={() => handleShare(thread)}
                                            >
                                              {shareUrl && thread.id === shareUrl.split('=')[1] ? (
                                                <Check className="h-4 w-4 mr-2" />
                                              ) : (
                                                <Share2 className="h-4 w-4 mr-2" />
                                              )}
                                              Share
                                            </Button>
                                          </div>
                                          
                                          {/* Thread Replies */}
                                          {selectedThread === thread.id && (
                                            <div className="mt-4 border-t border-violet-500/20 pt-4">
                                              <h4 className="text-sm font-medium text-violet-200 mb-3">Replies</h4>
                                              
                                              {/* Reply Form */}
                                              <div className="mb-4">
                                                <Textarea
                                                  value={replyContent}
                                                  onChange={(e) => setReplyContent(e.target.value)}
                                                  className="bg-violet-900/20 border-violet-500/20 min-h-[80px] resize-none text-violet-50 placeholder:text-violet-300/50 mb-2"
                                                  placeholder="Write a reply..."
                                                />
                                                <div className="flex justify-end">
                                                  <Button
                                                    onClick={() => createThreadReply(thread.id)}
                                                    disabled={isLoading || !replyContent.trim()}
                                                    className="bg-violet-500 hover:bg-violet-600"
                                                  >
                                                    {isLoading ? (
                                                      <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                      'Post Reply'
                                                    )}
                                                  </Button>
                                                </div>
                                              </div>
                                              
                                              {/* Replies List */}
                                              {isLoadingReplies ? (
                                                <div className="flex justify-center py-4">
                                                  <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
                                                </div>
                                              ) : threadReplies[thread.id]?.length === 0 ? (
                                                <p className="text-sm text-violet-300/70 text-center py-4">
                                                  No replies yet. Be the first to reply!
                                                </p>
                                              ) : (
                                                <div className="space-y-4">
                                                  {threadReplies[thread.id]?.map((reply) => (
                                                    <div key={reply.id} className="flex items-start gap-3">
                                                      <div className="flex h-6 w-6 shrink-0 select-none items-center justify-center rounded-full border bg-violet-500/20 border-violet-500/30">
                                                        <span className="text-xs text-violet-400">
                                                          {reply.user.email[0].toUpperCase()}
                                                        </span>
                                                      </div>
                                                      <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                          <span className="text-xs font-medium text-violet-200">
                                                            {reply.user.email}
                                                          </span>
                                                          <span className="text-xs text-violet-300/70">
                                                            {new Date(reply.created_at).toLocaleString()}
                                                          </span>
                                                        </div>
                                                        <p className="mt-1 text-sm text-violet-100">
                                                          {reply.content}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .highlight-shared {
          animation: highlight 3s ease-in-out;
        }
        
        @keyframes highlight {
          0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.5); }
          50% { box-shadow: 0 0 0 10px rgba(139, 92, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
        }
      `}</style>
    </div>
  )
} 