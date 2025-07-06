/**
 * Simple Camera Manager
 * 
 * Maintains a single camera connection that can be shared across sketches
 */

class SimpleCameraManager {
  constructor() {
    this.video = null;
    this.isInitialized = false;
    this.isLoading = false;
    this.error = null;
    this.listeners = [];
  }

  /**
   * Initialize camera if not already done
   * @param {p5} p5 - p5 instance
   * @returns {Promise<boolean>} - Whether camera was successfully initialized
   */
  async initialize(p5) {
    console.log('SimpleCameraManager: initialize called');
    
    // If already initialized, return the existing video
    if (this.isInitialized && this.video) {
      console.log('SimpleCameraManager: already initialized, returning existing video');
      return true;
    }

    // If already loading, wait
    if (this.isLoading) {
      console.log('SimpleCameraManager: already loading, waiting...');
      return new Promise((resolve) => {
        this.listeners.push(resolve);
      });
    }

    this.isLoading = true;
    this.error = null;
    console.log('SimpleCameraManager: starting camera initialization');

    try {
      // Create camera capture
      this.video = p5.createCapture(p5.VIDEO);
      this.video.size(640, 480);
      this.video.hide();
      
      console.log('SimpleCameraManager: video element created');

      // Set up event listeners
      this.video.elt.addEventListener('loadeddata', () => {
        console.log('SimpleCameraManager: loadeddata event fired');
        this.isInitialized = true;
        this.isLoading = false;
        this.error = null;
        console.log('SimpleCameraManager: camera feed loaded successfully!');
        
        // Explicitly start playing the video stream
        this.video.elt.play().then(() => {
          console.log('SimpleCameraManager: video stream started playing');
        }).catch(err => {
          console.log('SimpleCameraManager: failed to start video stream:', err);
        });
        
        // Resolve all waiting promises
        this.listeners.forEach(resolve => resolve(true));
        this.listeners = [];
      });

      this.video.elt.addEventListener('error', () => {
        console.log('SimpleCameraManager: error event fired');
        this.error = 'Camera feed error';
        this.isInitialized = false;
        this.isLoading = false;
        console.log('SimpleCameraManager: camera feed error!');
        
        // Resolve all waiting promises
        this.listeners.forEach(resolve => resolve(false));
        this.listeners = [];
      });

      // Also listen for play event to ensure stream is active
      this.video.elt.addEventListener('play', () => {
        console.log('SimpleCameraManager: play event fired');
        if (!this.isInitialized) {
          this.isInitialized = true;
          this.isLoading = false;
          this.error = null;
          console.log('SimpleCameraManager: camera stream started playing');
        }
      });

      return true;
    } catch (error) {
      console.log('SimpleCameraManager: camera initialization failed:', error);
      this.error = error.message;
      this.isLoading = false;
      
      // Resolve all waiting promises
      this.listeners.forEach(resolve => resolve(false));
      this.listeners = [];
      
      return false;
    }
  }

  /**
   * Get the video object
   * @returns {p5.Element|null}
   */
  getVideo() {
    console.log('SimpleCameraManager: getVideo called, video exists:', !!this.video);
    return this.video;
  }

  /**
   * Check if camera is ready
   * @returns {boolean}
   */
  isReady() {
    const ready = this.isInitialized && this.video && !this.error;
    console.log('SimpleCameraManager: isReady called, result:', ready);
    console.log('  - isInitialized:', this.isInitialized);
    console.log('  - video exists:', !!this.video);
    console.log('  - error:', this.error);
    return ready;
  }

  /**
   * Get camera state
   * @returns {Object}
   */
  getState() {
    return {
      video: this.video,
      isInitialized: this.isInitialized,
      isLoading: this.isLoading,
      error: this.error
    };
  }

  /**
   * Clean up camera resources
   */
  cleanup() {
    if (this.video) {
      this.video.remove();
      this.video = null;
    }
    this.isInitialized = false;
    this.isLoading = false;
    this.error = null;
    this.listeners = [];
  }
}

// Create a singleton instance
const simpleCameraManager = new SimpleCameraManager();

export default simpleCameraManager; 