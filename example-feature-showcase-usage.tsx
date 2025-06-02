/**
 * Example Usage of FeatureShowcase Component
 * 
 * This file demonstrates how to use the extracted FeatureShowcase component
 * in different scenarios. This is for documentation purposes and can be
 * integrated into other pages as needed.
 */

import FeatureShowcase from './app/components/FeatureShowcase'

// Example 1: Basic usage (same as original FeatureCards)
function BasicUsage() {
  return (
    <div>
      <h1>About GitThatFlow</h1>
      <FeatureShowcase />
    </div>
  )
}

// Example 2: With custom title and subtitle
function WithCustomHeader() {
  return (
    <div>
      <FeatureShowcase 
        title="Powerful Features"
        subtitle="Discover what makes GitThatFlow the best tool for analyzing React applications and website flows"
      />
    </div>
  )
}

// Example 3: Without tech badges
function WithoutTechBadges() {
  return (
    <div>
      <FeatureShowcase 
        title="Core Capabilities"
        showTechBadges={false}
      />
    </div>
  )
}

// Example 4: With custom styling
function WithCustomStyling() {
  return (
    <div>
      <FeatureShowcase 
        className="bg-gray-900/50 rounded-xl"
        title="Enhanced Features"
        subtitle="Experience the power of modern web development tools"
      />
    </div>
  )
}

// Example 5: In a landing page context
function LandingPageExample() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to GitThatFlow
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            The ultimate tool for visualizing React applications and website flows
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <FeatureShowcase 
          title="Why Choose GitThatFlow?"
          subtitle="Powerful features designed for modern developers"
        />
      </section>

      {/* Additional content... */}
    </div>
  )
}

// Example 6: In a documentation page
function DocumentationExample() {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="prose prose-invert max-w-none">
        <h1>GitThatFlow Documentation</h1>
        <p>
          GitThatFlow is a comprehensive tool for analyzing and visualizing 
          React applications and website navigation flows.
        </p>
        
        <h2>Features Overview</h2>
        <p>
          Below are the key features that make GitThatFlow powerful:
        </p>
      </div>

      <FeatureShowcase 
        showTechBadges={false}
        className="my-12"
      />

      <div className="prose prose-invert max-w-none">
        <h2>Getting Started</h2>
        <p>To get started with GitThatFlow...</p>
      </div>
    </div>
  )
}

export {
  BasicUsage,
  WithCustomHeader,
  WithoutTechBadges,
  WithCustomStyling,
  LandingPageExample,
  DocumentationExample
}
