'use client'

import { useState } from 'react'
import { MagicCard } from './magicui/magic-card'
import { ShimmerButton } from './magicui/shimmer-button'
import { BorderBeam } from './magicui/border-beam'
import { motion } from 'framer-motion'

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
    console.log('Website form submitted:', { websiteUrl, maxPages, maxDepth })
    setError('')

    if (!websiteUrl.trim()) {
      setError('Please enter a website URL')
      return
    }

    if (!validateWebsiteUrl(websiteUrl.trim())) {
      setError('Please enter a valid website URL (e.g., https://example.com)')
      return
    }

    console.log('Calling onSubmit with:', websiteUrl.trim(), { maxPages, maxDepth })
    onSubmit(websiteUrl.trim(), { maxPages, maxDepth })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <MagicCard className="relative overflow-hidden" gradientColor="#1a2e1a" gradientOpacity={0.8}>
        <BorderBeam size={200} duration={12} delay={2} colorFrom="#10b981" colorTo="#06d6a0" />
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="website-url" className="block text-sm font-semibold text-white mb-3">
                🌐 Website URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  id="website-url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 backdrop-blur-sm"
                  disabled={isLoading}
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-500/20 to-teal-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
              {error && (
                <motion.p
                  className="mt-2 text-sm text-red-400 flex items-center"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="mr-2">⚠️</span>
                  {error}
                </motion.p>
              )}
            </div>

            {/* Advanced Options */}
            <div className="bg-black/30 rounded-lg p-4 border border-gray-700/50">
              <p className="text-white font-semibold mb-4 flex items-center">
                <span className="mr-2">⚙️</span>
                Analysis Settings
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="max-pages" className="block text-sm font-medium text-gray-300 mb-2">
                    📄 Max Pages (1-30)
                  </label>
                  <input
                    type="number"
                    id="max-pages"
                    min="1"
                    max="30"
                    value={maxPages}
                    onChange={(e) => setMaxPages(Math.min(30, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-400 mt-1">Recommended: 20 pages</p>
                </div>

                <div>
                  <label htmlFor="max-depth" className="block text-sm font-medium text-gray-300 mb-2">
                    🔍 Max Depth (1-5)
                  </label>
                  <input
                    type="number"
                    id="max-depth"
                    min="1"
                    max="5"
                    value={maxDepth}
                    onChange={(e) => setMaxDepth(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-400 mt-1">How deep to crawl</p>
                </div>
              </div>
            </div>

            <ShimmerButton
              type="submit"
              disabled={isLoading}
              className="w-full py-4 text-lg font-semibold"
              background="linear-gradient(135deg, #10b981 0%, #06d6a0 100%)"
              shimmerColor="#ffffff"
              shimmerDuration="2.5s"
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
                '🌐 Analyze Website Flow'
              )}
            </ShimmerButton>
          </form>

          <div className="mt-6 space-y-4">
            <div className="p-4 bg-black/30 rounded-lg border border-gray-700/50">
              <p className="font-semibold mb-3 text-white flex items-center">
                <span className="mr-2">✨</span>
                Analysis Features
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Navigation Discovery
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  User Journey Mapping
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Respects Robots.txt
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  Up to {maxPages} Pages
                </div>
              </div>
            </div>

            <div className="p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
              <p className="text-yellow-200 text-xs flex items-start">
                <span className="mr-2 mt-0.5">💡</span>
                <span>
                  <strong>Note:</strong> This tool crawls public pages only and respects website policies.
                  Analysis time depends on website size and response speed.
                </span>
              </p>
            </div>
          </div>
        </div>
      </MagicCard>
    </motion.div>
  )
}
