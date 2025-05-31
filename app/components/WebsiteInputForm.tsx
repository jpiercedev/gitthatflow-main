'use client'

import { useState } from 'react'

interface WebsiteInputFormProps {
  onSubmit: (websiteUrl: string, options: { maxPages: number; maxDepth: number }) => void
  isLoading: boolean
}

export default function WebsiteInputForm({ onSubmit, isLoading }: WebsiteInputFormProps) {
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [maxPages, setMaxPages] = useState(20)
  const [maxDepth, setMaxDepth] = useState(3)
  const [error, setError] = useState('')

  const validateWebsiteUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      return ['http:', 'https:'].includes(urlObj.protocol)
    } catch {
      return false
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!websiteUrl.trim()) {
      setError('Please enter a website URL')
      return
    }

    if (!validateWebsiteUrl(websiteUrl.trim())) {
      setError('Please enter a valid website URL (e.g., https://example.com)')
      return
    }

    onSubmit(websiteUrl.trim(), { maxPages, maxDepth })
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="website-url" className="block text-sm font-medium text-foreground mb-2">
            Website URL
          </label>
          <input
            type="url"
            id="website-url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-2 bg-input border border-gray-700 rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            disabled={isLoading}
          />
          {error && (
            <p className="mt-1 text-sm text-red-400">{error}</p>
          )}
        </div>

        {/* Advanced Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="max-pages" className="block text-sm font-medium text-foreground mb-2">
              Max Pages (1-30)
            </label>
            <input
              type="number"
              id="max-pages"
              min="1"
              max="30"
              value={maxPages}
              onChange={(e) => setMaxPages(Math.min(30, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-full px-3 py-2 bg-input border border-gray-700 rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="max-depth" className="block text-sm font-medium text-foreground mb-2">
              Max Depth (1-5)
            </label>
            <input
              type="number"
              id="max-depth"
              min="1"
              max="5"
              value={maxDepth}
              onChange={(e) => setMaxDepth(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-full px-3 py-2 bg-input border border-gray-700 rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              disabled={isLoading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-3 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing Website...
            </span>
          ) : (
            'Analyze Website Flow'
          )}
        </button>
      </form>

      <div className="mt-4 text-sm text-muted-foreground">
        <p className="font-medium mb-2 text-foreground">Analysis features:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Discovers navigation paths between pages</li>
          <li>Maps user journey flows and entry points</li>
          <li>Respects robots.txt and rate limits</li>
          <li>Limited to {maxPages} pages for optimal performance</li>
        </ul>
        
        <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-800 rounded-md">
          <p className="text-yellow-200 text-xs">
            <strong>Note:</strong> This tool crawls public pages only and respects website policies. 
            Analysis time depends on website size and response speed.
          </p>
        </div>
      </div>
    </div>
  )
}
