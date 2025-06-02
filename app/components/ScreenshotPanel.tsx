'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Download, Monitor, Smartphone, Loader2, ExternalLink } from 'lucide-react'
import { WebsiteScreenshot, WebsiteScreenshotSession } from '@/lib/supabase'

interface ScreenshotPanelProps {
  websiteUrl: string
  isVisible: boolean
  onToggle: () => void
}

export default function ScreenshotPanel({ websiteUrl, isVisible, onToggle }: ScreenshotPanelProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [screenshots, setScreenshots] = useState<WebsiteScreenshot[]>([])
  const [error, setError] = useState('')
  const [captureTime, setCaptureTime] = useState<number | null>(null)

  const handleCaptureScreenshots = async () => {
    setIsCapturing(true)
    setError('')
    setScreenshots([])
    setCaptureTime(null)

    try {
      const response = await fetch('/api/take-screenshots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteUrl,
          maxPages: 5, // Limit to 5 pages for performance
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to capture screenshots')
      }

      if (result.success && result.data) {
        setScreenshots(result.data.screenshots)
        setCaptureTime(result.data.metadata.captureTime)
      } else {
        throw new Error(result.error || 'No screenshots captured')
      }

    } catch (error: unknown) {
      console.error('Screenshot capture error:', error)
      setError(error instanceof Error ? error.message : 'Failed to capture screenshots')
    } finally {
      setIsCapturing(false)
    }
  }

  const handleDownloadScreenshot = (screenshot: WebsiteScreenshot) => {
    if (screenshot.base64Data) {
      // Create a blob from base64 data and download it
      const byteCharacters = atob(screenshot.base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/png' })

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = screenshot.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up the object URL
      URL.revokeObjectURL(link.href)
    }
  }

  const handleDownloadAll = () => {
    screenshots.forEach((screenshot, index) => {
      setTimeout(() => {
        handleDownloadScreenshot(screenshot)
      }, index * 500) // Stagger downloads to avoid overwhelming the browser
    })
  }

  const getViewportIcon = (viewport: string) => {
    return viewport === 'mobile' ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />
  }

  return (
    <div className="bg-card border border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-3">
          <Camera className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold text-white">Website Screenshots</h3>
          {screenshots.length > 0 && (
            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">
              {screenshots.length} captured
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isVisible ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Capture Button */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Capture high-quality screenshots of this website
                </p>
                <button
                  onClick={handleCaptureScreenshots}
                  disabled={isCapturing}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {isCapturing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Capturing...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      <span>Capture Screenshots</span>
                    </>
                  )}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Screenshots Grid */}
              {screenshots.length > 0 && (
                <div className="space-y-4">
                  {/* Download All Button */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      {screenshots.length} screenshots captured
                      {captureTime && (
                        <span className="ml-2">
                          in {(captureTime / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleDownloadAll}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download All</span>
                    </button>
                  </div>

                  {/* Screenshots List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {screenshots.map((screenshot, index) => (
                      <div
                        key={screenshot.id}
                        className="flex items-center justify-between p-3 bg-muted/10 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {getViewportIcon(screenshot.viewport)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {screenshot.title}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {screenshot.viewport} • {screenshot.url}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {screenshot.base64Data && (
                            <button
                              onClick={() => {
                                const byteCharacters = atob(screenshot.base64Data!)
                                const byteNumbers = new Array(byteCharacters.length)
                                for (let i = 0; i < byteCharacters.length; i++) {
                                  byteNumbers[i] = byteCharacters.charCodeAt(i)
                                }
                                const byteArray = new Uint8Array(byteNumbers)
                                const blob = new Blob([byteArray], { type: 'image/png' })
                                const url = URL.createObjectURL(blob)
                                window.open(url, '_blank')
                                // Clean up after a delay
                                setTimeout(() => URL.revokeObjectURL(url), 1000)
                              }}
                              className="p-1.5 text-gray-400 hover:text-white transition-colors"
                              title="View screenshot"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadScreenshot(screenshot)}
                            className="p-1.5 text-gray-400 hover:text-white transition-colors"
                            title="Download screenshot"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="text-xs text-gray-500 bg-muted/10 rounded-lg p-3">
                <p>• Screenshots are captured in both desktop (1366x768) and mobile (375x812) viewports</p>
                <p>• Up to 5 pages will be captured based on your website analysis</p>
                <p>• High-resolution PNG format with full page capture</p>
                <p>• Screenshots are generated on-demand and downloaded directly (no storage required)</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
