/**
 * Sound Manager
 * 
 * Manages audio connections persistently across component re-renders
 * and mode changes to avoid unnecessary audio reloading.
 */

class SoundManager {
  constructor() {
    this.audioContext = null;
    this.isInitializing = false;
    this.isConnected = false;
    this.hasError = false;
    this.listeners = [];
  }

  /**
   * Initialize audio if not already loaded
   * @param {p5} p5 - p5 instance
   * @returns {Promise<boolean>} - Whether audio was successfully initialized
   */
  async initializeAudio(p5) {
    // If audio is already loaded and working, return immediately
    if (this.isConnected && this.audioContext && !this.hasError) {
      return true;
    }

    // If already initializing, wait
    if (this.isInitializing) {
      return new Promise((resolve) => {
        this.listeners.push(resolve);
      });
    }

    this.isInitializing = true;
    this.hasError = false;

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.isConnected = true;
      this.isInitializing = false;
      console.log('Audio context initialized successfully!');
      
      // Resolve all waiting promises
      this.listeners.forEach(resolve => resolve(true));
      this.listeners = [];

      return true;
    } catch (error) {
      console.log('Audio initialization failed:', error);
      this.hasError = true;
      this.isInitializing = false;
      
      // Resolve all waiting promises
      this.listeners.forEach(resolve => resolve(false));
      this.listeners = [];
      
      return false;
    }
  }

  /**
   * Get current audio state
   * @returns {Object} Audio state
   */
  getState() {
    return {
      audioContext: this.audioContext,
      isConnected: this.isConnected,
      hasError: this.hasError,
      isInitializing: this.isInitializing
    };
  }

  /**
   * Check if audio is ready
   * @returns {boolean}
   */
  isReady() {
    return this.isConnected && this.audioContext && !this.hasError;
  }

  /**
   * Clean up audio resources
   */
  cleanup() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isConnected = false;
    this.hasError = false;
    this.isInitializing = false;
    this.listeners = [];
  }
}

// Create a singleton instance
const soundManager = new SoundManager();

export default soundManager; 