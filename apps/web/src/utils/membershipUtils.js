// Membership utility functions and constants

// Membership tier constants
export const MEMBERSHIP_TIERS = {
  FREE: 'free',
  PLUS: 'plus',
  MAX: 'max'
};

// Membership tier hierarchy for access control
export const TIER_HIERARCHY = {
  [MEMBERSHIP_TIERS.FREE]: 0,
  [MEMBERSHIP_TIERS.PLUS]: 1,
  [MEMBERSHIP_TIERS.MAX]: 2
};

// Membership tier display information
export const TIER_INFO = {
  [MEMBERSHIP_TIERS.FREE]: {
    name: 'Free',
    displayName: 'Free Tier',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    features: [
      'Basic practice questions',
      'Limited exam attempts',
      'Basic progress tracking'
    ],
    price: 'Free',
    description: 'Get started with basic SAT preparation'
  },
  [MEMBERSHIP_TIERS.PLUS]: {
    name: 'Plus',
    displayName: 'Plus Tier',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    features: [
      'Unlimited practice questions',
      'Detailed analytics',
      'Progress tracking',
      'Flashcard system',
      'Email support'
    ],
    price: '$9.99/month',
    description: 'Enhanced features for serious SAT prep'
  },
  [MEMBERSHIP_TIERS.MAX]: {
    name: 'Max',
    displayName: 'Max Tier',
    color: '#7C3AED',
    bgColor: '#F3E8FF',
    features: [
      'Everything in Plus',
      'AI-powered recommendations',
      'Priority support',
      'Advanced analytics',
      'Custom study plans',
      'Exclusive content'
    ],
    price: '$19.99/month',
    description: 'Premium experience with all features'
  }
};

// Check if a user has access to a feature based on their tier
export function hasAccess(userTier, requiredTier) {
  const userLevel = TIER_HIERARCHY[userTier] || 0;
  const requiredLevel = TIER_HIERARCHY[requiredTier] || 0;
  return userLevel >= requiredLevel;
}

// Get tier information
export function getTierInfo(tier) {
  return TIER_INFO[tier] || TIER_INFO[MEMBERSHIP_TIERS.FREE];
}

// Get all available tiers for upgrade options
export function getAvailableUpgrades(currentTier) {
  const currentLevel = TIER_HIERARCHY[currentTier] || 0;
  return Object.keys(TIER_HIERARCHY)
    .filter(tier => TIER_HIERARCHY[tier] > currentLevel)
    .map(tier => ({
      tier,
      ...TIER_INFO[tier]
    }));
}

// Check if membership is expired
export function isMembershipExpired(endDate) {
  if (!endDate) return false;
  return new Date() > new Date(endDate);
}

// Calculate days remaining in membership
export function getDaysRemaining(endDate) {
  if (!endDate) return null;
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

// Format membership end date
export function formatMembershipDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Feature access definitions - define which features require which tiers
export const FEATURE_ACCESS = {
  // Practice and Exams
  UNLIMITED_PRACTICE: MEMBERSHIP_TIERS.PLUS,
  FULL_LENGTH_EXAMS: MEMBERSHIP_TIERS.FREE,
  ADVANCED_ANALYTICS: MEMBERSHIP_TIERS.PLUS,
  DETAILED_EXPLANATIONS: MEMBERSHIP_TIERS.PLUS,
  
  // Progress and Analytics
  BASIC_PROGRESS: MEMBERSHIP_TIERS.FREE,
  DETAILED_PROGRESS: MEMBERSHIP_TIERS.PLUS,
  PERFORMANCE_INSIGHTS: MEMBERSHIP_TIERS.MAX,
  CUSTOM_REPORTS: MEMBERSHIP_TIERS.MAX,
  
  // Study Tools
  FLASHCARDS: MEMBERSHIP_TIERS.PLUS,
  STUDY_PLANS: MEMBERSHIP_TIERS.MAX,
  AI_RECOMMENDATIONS: MEMBERSHIP_TIERS.MAX,
  
  // Support and Content
  BASIC_SUPPORT: MEMBERSHIP_TIERS.FREE,
  PRIORITY_SUPPORT: MEMBERSHIP_TIERS.MAX,
  EXCLUSIVE_CONTENT: MEMBERSHIP_TIERS.MAX
};

// Check specific feature access
export function hasFeatureAccess(userTier, feature) {
  const requiredTier = FEATURE_ACCESS[feature];
  if (!requiredTier) return true; // Feature doesn't require specific tier
  return hasAccess(userTier, requiredTier);
}
