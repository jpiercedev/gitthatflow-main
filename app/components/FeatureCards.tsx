/**
 * FeatureCards Component (Legacy)
 *
 * This component has been refactored and moved to FeatureShowcase.tsx for better reusability.
 * This file now serves as a compatibility layer and can be safely removed in future versions.
 *
 * @deprecated Use FeatureShowcase component instead
 * @see ./FeatureShowcase.tsx
 */

import FeatureShowcase from './FeatureShowcase'

/**
 * Legacy FeatureCards component that redirects to the new FeatureShowcase
 *
 * @deprecated Use FeatureShowcase directly instead
 */
export default function FeatureCards() {
  return <FeatureShowcase />
}

// Re-export the new component and its types for convenience
export { default as FeatureShowcase } from './FeatureShowcase'
export type { FeatureShowcaseProps } from './FeatureShowcase'
