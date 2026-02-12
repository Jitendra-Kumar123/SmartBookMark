'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Bookmark } from '@/types/bookmark'

export default function Dashboard() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    getUser()
    getBookmarks()
  }, [])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUser(user)
  }

  const getBookmarks = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bookmarks:', error)
    } else {
      setBookmarks(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    const channel = supabase
      .channel('bookmarks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
        },
        (payload) => {
          console.log('Change received!', payload)
          getBookmarks() // Refresh bookmarks on any change
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-sans text-gray-700 tracking-tighter">My Bookmarks</h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-gray-900">Welcome, {user?.email}</span>
              <button
                onClick={signOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <AddBookmarkForm onBookmarkAdded={getBookmarks} />
          <BookmarkList bookmarks={bookmarks} onBookmarkDeleted={getBookmarks} />
        </div>
      </main>
    </div>
  )
}

function AddBookmarkForm({ onBookmarkAdded }: { onBookmarkAdded: () => void }) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  const addBookmark = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim() || !title.trim()) return

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('bookmarks')
      .insert([
        {
          url: url.trim(),
          title: title.trim(),
          user_id: user.id,
        },
      ])

    if (error) {
      console.error('Error adding bookmark:', error)
      alert('Error adding bookmark')
    } else {
      setUrl('')
      setTitle('')
      onBookmarkAdded()
    }
    setLoading(false)
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-3xl font-sans flex justify-around text-gray-900 mb-3 tracking-tighter">Add New BookMark</h2>
      <form onSubmit={addBookmark} className="space-y-4">
        <div>
          <label htmlFor="title" className="block font-medium text-gray-900 text-2xl">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full border-blue-900 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black p-2"
            placeholder="Enter bookmark title"
            required
          />
        </div>
        <div>
          <label htmlFor="url" className="block text-2xl font-medium text-gray-900">
            URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black p-2"
            placeholder="https://example.com"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Bookmark'}
        </button>
      </form>
    </div>
  )
}

function BookmarkList({ bookmarks, onBookmarkDeleted }: { bookmarks: Bookmark[], onBookmarkDeleted: () => void }) {
  const deleteBookmark = async (id: string) => {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting bookmark:', error)
      alert('Error deleting bookmark')
    } else {
      onBookmarkDeleted()
    }
  }

  if (bookmarks.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500 text-center">No bookmarks yet. Add your first bookmark above!</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <ul className="divide-y divide-gray-200">
        {bookmarks.map((bookmark) => (
          <li key={bookmark.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{bookmark.title}</h3>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {bookmark.url}
                </a>
                <p className="text-xs text-gray-500 mt-1">
                  Added {new Date(bookmark.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => deleteBookmark(bookmark.id)}
                className="ml-4 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
