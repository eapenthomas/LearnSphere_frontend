/**
 * AI Feature Status Checker
 * Utility functions to check if AI features are enabled
 */

let aiFeatureCache = {
  notes_summarizer: true,
  ai_quiz_generation: true,
  ai_tutor: true,
  lastUpdated: null,
  cacheExpiry: 5 * 60 * 1000 // 5 minutes
};

/**
 * Fetch AI feature status from backend
 */
export const fetchAIFeatureStatus = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/admin/settings/ai-features`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      aiFeatureCache = {
        ...data,
        lastUpdated: Date.now()
      };
      return data;
    } else {
      console.warn('Failed to fetch AI feature status, using cached values');
      return aiFeatureCache;
    }
  } catch (error) {
    console.warn('Error fetching AI feature status:', error);
    return aiFeatureCache;
  }
};

/**
 * Check if a specific AI feature is enabled
 */
export const isAIFeatureEnabled = async (featureName) => {
  const now = Date.now();
  
  // Check if cache is expired
  if (!aiFeatureCache.lastUpdated || (now - aiFeatureCache.lastUpdated) > aiFeatureCache.cacheExpiry) {
    await fetchAIFeatureStatus();
  }
  
  return aiFeatureCache[featureName] || false;
};

/**
 * Get AI feature status with user-friendly message
 */
export const getAIFeatureMessage = (featureName) => {
  const featureNames = {
    'notes_summarizer': 'Notes Summarizer',
    'ai_quiz_generation': 'AI Quiz Generation',
    'ai_tutor': 'AI Tutor'
  };
  
  return {
    enabled: aiFeatureCache[featureName] || false,
    message: `The ${featureNames[featureName] || featureName} feature has been temporarily disabled by the administrator. Please contact support if you need assistance.`,
    featureName: featureNames[featureName] || featureName
  };
};

/**
 * Clear AI feature cache (useful for testing or when settings change)
 */
export const clearAIFeatureCache = () => {
  aiFeatureCache.lastUpdated = null;
};

/**
 * Hook for React components to use AI feature status
 */
export const useAIFeatureStatus = () => {
  const [status, setStatus] = React.useState(aiFeatureCache);
  const [loading, setLoading] = React.useState(false);

  const refreshStatus = async () => {
    setLoading(true);
    try {
      const newStatus = await fetchAIFeatureStatus();
      setStatus(newStatus);
    } catch (error) {
      console.error('Error refreshing AI feature status:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    refreshStatus();
  }, []);

  return {
    status,
    loading,
    refreshStatus,
    isEnabled: (featureName) => status[featureName] || false,
    getMessage: (featureName) => getAIFeatureMessage(featureName)
  };
};
