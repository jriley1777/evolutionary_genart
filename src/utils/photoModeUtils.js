/**
 * Photo Mode Utilities
 * 
 * Provides centralized functionality for creating photo booth effects
 * that can be applied to any sketch with minimal integration.
 */

export class PhotoModeManager {
  constructor(options = {}) {
    this.maxPanels = options.maxPanels || 12;
    this.captureInterval = options.captureInterval || 150; // Time in milliseconds
    this.gridCols = options.gridCols || 4;
    this.gridRows = options.gridRows || 3;
    this.panelGap = options.panelGap || 15;
    
    this.panelSketches = [];
    this.lastCaptureTime = 0;
    this.panelsCreated = 0;
    this.isCapturing = true;
    this.isPhotoMode = false;
  }

  /**
   * Initialize photo mode
   */
  initPhotoMode() {
    this.isPhotoMode = true;
    this.isCapturing = true;
    this.panelsCreated = 0;
    this.lastCaptureTime = 0;
    this.panelSketches = [];
  }

  /**
   * Exit photo mode
   */
  exitPhotoMode() {
    this.isPhotoMode = false;
    this.isCapturing = false;
  }

  /**
   * Create a panel sketch with unique parameters
   * @param {p5} p5 - p5 instance
   * @param {Function} sketchDrawFunction - Function that draws the sketch
   * @param {Object} panelParams - Parameters for this specific panel
   */
  createPanelSketch(p5, sketchDrawFunction, panelParams = {}) {
    if (this.panelsCreated >= this.maxPanels) return;
    
    // Create a new graphics buffer for this panel
    let panelBuffer = p5.createGraphics(p5.width, p5.height);
    
    // Draw the sketch to the panel buffer without any transformations
    sketchDrawFunction(panelBuffer, panelParams);
    
    // Store the panel sketch with metadata
    this.panelSketches.push({
      buffer: panelBuffer,
      timestamp: p5.millis(),
      panelIndex: this.panelsCreated,
      params: panelParams
    });
    
    this.panelsCreated++;
  }

  /**
   * Generate unique parameters for a panel
   * @param {number} panelIndex - Index of the panel
   * @returns {Object} Parameters for this panel
   */
  generatePanelParams(panelIndex) {
    return {
      // No rotation, scale, or extra effects - just pure sketch captures
      panelIndex: panelIndex,
      timestamp: Date.now()
    };
  }

  /**
   * Update photo mode (call this in the main draw loop)
   * @param {p5} p5 - p5 instance
   * @param {Function} sketchDrawFunction - Function that draws the sketch
   * @param {boolean} isReady - Whether the sketch is ready to capture (e.g., camera loaded)
   */
  update(p5, sketchDrawFunction, isReady = true) {
    if (!this.isPhotoMode) {
      return;
    }
    
    // Only capture if the sketch is ready (e.g., camera loaded)
    if (!isReady) {
      return;
    }
    
    if (this.isCapturing && this.panelsCreated < this.maxPanels) {
      const currentTime = p5.millis();
      
      // Check if enough time has passed since last capture
      if (currentTime - this.lastCaptureTime >= this.captureInterval) {
        const panelParams = this.generatePanelParams(this.panelsCreated);
        this.createPanelSketch(p5, sketchDrawFunction, panelParams);
        
        this.lastCaptureTime = currentTime;
        
        if (this.panelsCreated >= this.maxPanels) {
          this.isCapturing = false;
        }
      }
    }
  }

  /**
   * Draw the photo grid
   * @param {p5} p5 - p5 instance
   */
  drawPhotoGrid(p5) {
    const panelWidth = (p5.width - (this.panelGap * (this.gridCols + 1))) / this.gridCols;
    const panelHeight = (p5.height - (this.panelGap * (this.gridRows + 1))) / this.gridRows;
    
    p5.background(50);
    
    // Draw grid of panel sketches
    for (let i = 0; i < this.panelSketches.length; i++) {
      const col = i % this.gridCols;
      const row = Math.floor(i / this.gridCols);
      const x = this.panelGap + col * (panelWidth + this.panelGap);
      const y = this.panelGap + row * (panelHeight + this.panelGap);
      
      // Draw panel sketch directly without colored background
      if (this.panelSketches[i] && this.panelSketches[i].buffer) {
        p5.image(this.panelSketches[i].buffer, x, y, panelWidth, panelHeight);
      }
      
      // Draw panel info
      p5.fill(255);
      p5.noStroke();
      p5.textAlign(p5.CENTER, p5.TOP);
    }
    
    // Draw UI
    this.drawPhotoModeUI(p5);
  }

  /**
   * Draw photo mode UI
   * @param {p5} p5 - p5 instance
   */
  drawPhotoModeUI(p5) {
    p5.fill(255);
    p5.noStroke();
    p5.textAlign(p5.LEFT, p5.TOP);
  }

  /**
   * Draw capture progress
   * @param {p5} p5 - p5 instance
   */
  drawCaptureProgress(p5) {
    p5.fill(255);
    p5.noStroke();
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textSize(24);
    p5.text(`Creating Panels: ${this.panelsCreated}/${this.maxPanels}`, p5.width / 2, p5.height - 50);
  }

  /**
   * Check if photo mode is active
   * @returns {boolean}
   */
  isActive() {
    return this.isPhotoMode;
  }

  /**
   * Check if currently capturing
   * @returns {boolean}
   */
  isCapturingActive() {
    return this.isCapturing && this.panelsCreated < this.maxPanels;
  }

  /**
   * Get current state
   * @returns {Object}
   */
  getState() {
    return {
      isPhotoMode: this.isPhotoMode,
      isCapturing: this.isCapturing,
      panelsCreated: this.panelsCreated,
      maxPanels: this.maxPanels,
      lastCaptureTime: this.lastCaptureTime
    };
  }
}

/**
 * Create a photo mode manager with default settings
 * @param {Object} options - Configuration options
 * @returns {PhotoModeManager}
 */
export const createPhotoModeManager = (options = {}) => {
  return new PhotoModeManager(options);
};

/**
 * Default photo mode configuration
 */
export const DEFAULT_PHOTO_MODE_CONFIG = {
  maxPanels: 12,
  captureInterval: 150,
  gridCols: 4,
  gridRows: 3,
  panelGap: 15
}; 