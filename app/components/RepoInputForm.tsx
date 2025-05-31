'use client'

import { useState } from 'react'

interface RepoInputFormProps {
  onSubmit: (repoUrl: string) => void
  isLoading: boolean
}

export default function RepoInputForm({ onSubmit, isLoading }: RepoInputFormProps) {
  const [repoUrl, setRepoUrl] = useState('')
  const [error, setError] = useState('')

  const validateGitHubUrl = (url: string): boolean => {
    const githubPattern = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+(?:\.git)?\/?$/
    return githubPattern.test(url)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL')
      return
    }

    if (!validateGitHubUrl(repoUrl.trim())) {
      setError('Please enter a valid GitHub repository URL (e.g., https://github.com/user/repo)')
      return
    }

    onSubmit(repoUrl.trim())
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="repo-url" className="block text-sm font-medium text-foreground mb-2">
            GitHub Repository URL
          </label>
          <input
            type="url"
            id="repo-url"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/vercel/next.js"
            className="w-full px-3 py-2 bg-input border border-gray-700 rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            disabled={isLoading}
          />
          {error && (
            <p className="mt-1 text-sm text-red-400">{error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing Repository...
            </span>
          ) : (
            'Analyze Repository'
          )}
        </button>
      </form>

      <div className="mt-4 text-sm text-muted-foreground">
        <p className="font-medium mb-2 text-foreground">Supported frameworks:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>React Router (React apps)</li>
          <li>Next.js (pages directory)</li>
          <li>Next.js (app directory)</li>
        </ul>
      </div>
    </div>
  )
}
