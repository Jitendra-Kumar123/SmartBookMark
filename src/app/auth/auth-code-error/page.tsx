'use client'

import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            There was an error during authentication. This might be due to:
          </p>
          <ul className="mt-4 text-left text-sm text-gray-600 list-disc list-inside">
            <li>Google OAuth not properly configured in Supabase</li>
            <li>Incorrect redirect URLs</li>
            <li>Network connectivity issues</li>
          </ul>
        </div>
        <div className="text-center">
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Try signing in again
          </Link>
        </div>
      </div>
    </div>
  )
}
