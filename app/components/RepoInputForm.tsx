'use client'

import { useState } from 'react'
import { MagicCard } from './magicui/magic-card'
import { ShimmerButton } from './magicui/shimmer-button'
import { BorderBeam } from './magicui/border-beam'
import { motion } from 'framer-motion'

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <MagicCard className="relative overflow-hidden" gradientColor="#1a1a2e" gradientOpacity={0.8}>
        <BorderBeam size={200} duration={10} delay={1} />
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="repo-url" className="block text-sm font-semibold text-white mb-2">
                🔗 GitHub Repository URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  id="repo-url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/vercel/next.js"
                  className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm"
                  disabled={isLoading}
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
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

            <ShimmerButton
              type="submit"
              disabled={isLoading}
              className="w-full py-4 text-lg font-semibold"
              background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              shimmerColor="#ffffff"
              shimmerDuration="2s"
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
                '🚀 Analyze Repository'
              )}
            </ShimmerButton>
          </form>

          <div className="mt-6 p-4 bg-black/30 rounded-lg border border-gray-700/50">
            <p className="font-semibold mb-3 text-white flex items-center">
              <span className="mr-2">🛠️</span>
              Supported Frameworks
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="flex items-center text-sm text-gray-300">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                React Router
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Next.js Pages
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Next.js App
              </div>
            </div>
          </div>
        </div>
      </MagicCard>
    </motion.div>
  )
}
