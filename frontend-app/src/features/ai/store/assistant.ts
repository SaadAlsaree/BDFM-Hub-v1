import { Store } from '@tanstack/react-store';

/**
 * Global store for AI Assistant visibility state
 * Uses TanStack Store for reactive state management
 */
export const showAIAssistant = new Store(false);

/**
 * Global store for thinking visibility state
 */
export const showThinking = new Store(false);

/**
 * Helper functions for managing AI Assistant state
 */
export const assistantStore = {
  /**
   * Show the AI Assistant
   */
  show: () => showAIAssistant.setState(() => true),

  /**
   * Hide the AI Assistant
   */
  hide: () => showAIAssistant.setState(() => false),

  /**
   * Toggle the AI Assistant visibility
   */
  toggle: () => showAIAssistant.setState((state) => !state),

  /**
   * Get current visibility state
   */
  isVisible: () => showAIAssistant.state,

  /**
   * Toggle thinking visibility globally
   */
  toggleThinking: () => showThinking.setState((state) => !state),

  /**
   * Get current thinking visibility state
   */
  isThinkingVisible: () => showThinking.state,
};

// Export default store for convenience
export default showAIAssistant;
