/**
 * Camera Manager
 * 
 * Manages camera connections persistently across component re-renders
 * and mode changes to avoid unnecessary camera reloading.
 */

class CameraManager {
  constructor() {
    this.video = null;
    this.videoLoaded = false;
    this.videoError = false;
    this.isInitializing = false;
    this.listeners = [];
  }

  /**
   * Initialize camera if not already loaded
   * @param {p5} p5 - p5 instance
   * @returns {Promise<boolean>} - Whether camera was successfully initialized
   */
  async initializeCamera(p5) {
    // If camera is already loaded and working, return immediately
    if (this.videoLoaded && this.video && !this.videoError) {
      return true;
    }

    // If already initializing, wait
    if (this.isInitializing) {
      return new Promise((resolve) => {
        this.listeners.push(resolve);
      });
    }

    this.isInitializing = true;
    this.videoError = false;

    try {
      // Create camera capture
      this.video = p5.createCapture(p5.VIDEO);
      this.video.size(320, 240);
      this.video.hide();

      // Set up event listeners
      this.video.elt.addEventListener('loadeddata', () => {
        this.videoLoaded = true;
        this.videoError = false;
        this.isInitializing = false;
        console.log('Camera feed loaded successfully!');
        
        // Resolve all waiting promises
        this.listeners.forEach(resolve => resolve(true));
        this.listeners = [];
      });

      this.video.elt.addEventListener('error', () => {
        this.videoError = true;
        this.videoLoaded = false;
        this.isInitializing = false;
        console.log('Camera feed error!');
        
        // Resolve all waiting promises
        this.listeners.forEach(resolve => resolve(false));
        this.listeners = [];
      });

      return true;
    } catch (error) {
      console.log('Camera initialization failed:', error);
      this.videoError = true;
      this.isInitializing = false;
      
      // Resolve all waiting promises
      this.listeners.forEach(resolve => resolve(false));
      this.listeners = [];
      
      return false;
    }
  }

  /**
   * Get current camera state
   * @returns {Object} Camera state
   */
  getState() {
    return {
      video: this.video,
      videoLoaded: this.videoLoaded,
      videoError: this.videoError,
      isInitializing: this.isInitializing
    };
  }

  /**
   * Check if camera is ready
   * @returns {boolean}
   */
  isReady() {
    return this.videoLoaded && this.video && !this.videoError;
  }

  /**
   * Clean up camera resources
   */
  cleanup() {
    if (this.video) {
      this.video.remove();
      this.video = null;
    }
    this.videoLoaded = false;
    this.videoError = false;
    this.isInitializing = false;
    this.listeners = [];
  }
}

// Create a singleton instance
const cameraManager = new CameraManager();

export default cameraManager; 