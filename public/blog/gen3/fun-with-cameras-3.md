# FunWithCameras3: Real-Time Fisheye Lens Effect

*December 2024*

## Artistic Direction

FunWithCameras3 introduces **real-time fisheye lens distortion** to the camera-based generative art series, creating live barrel distortion effects that simulate wide-angle lens photography. This sketch explores how mathematical distortion algorithms can transform ordinary camera input into surreal, curved visual experiences.

The piece uses pixel-level manipulation to create authentic fisheye lens effects, with high-resolution processing for detailed facial recognition and clear distortion patterns.

## Core Techniques

### Fisheye Distortion Algorithm
- **Polar Coordinate Transformation**: Converts Cartesian coordinates to polar for distortion calculation
- **Barrel Distortion**: Uses power function (x^1.5) to create realistic fisheye curvature
- **Pixel-Level Processing**: Direct manipulation of camera pixels for authentic lens simulation
- **High Resolution**: 800x800 pixel processing for detailed facial features

### Real-Time Camera Processing
- **Live Video Capture**: Direct access to webcam feed at high resolution
- **Pixel Manipulation**: Real-time distortion of every pixel in the video stream
- **Performance Optimization**: Efficient algorithms for smooth 30fps processing
- **Camera Integration**: Seamless camera initialization and error handling

### Mathematical Distortion
- **Radius Mapping**: Normalizes distance from center for consistent distortion
- **Power Function Distortion**: Uses x^1.5 curve for realistic fisheye effect
- **Boundary Handling**: Proper edge detection and pixel bounds checking
- **Coordinate Transformation**: Accurate mapping from source to destination pixels

### Photo Mode Integration
- **Grid Capture**: 4x3 grid of captured fisheye moments
- **500ms Intervals**: Balanced capture timing for dynamic effects
- **Static Display**: Captured frames remain as permanent fisheye compositions
- **Camera Loading**: Handles camera initialization gracefully

## Evolution from FunWithCameras2

**Building Upon**: The camera capture and mathematical processing from gen2
**New Elements**: 
- Real-time fisheye lens simulation
- High-resolution pixel-level processing
- Mathematical barrel distortion algorithms
- Photo mode for capturing fisheye moments

**Maintained**: The camera-based interaction and photo mode functionality

## Technical Implementation

The sketch uses a sophisticated fisheye algorithm that:
- Captures high-resolution video (800x800 pixels)
- Transforms coordinates using polar mathematics
- Applies power function distortion for realistic fisheye effect
- Processes every pixel in real-time for smooth performance
- Integrates with photo mode for static capture

## Artistic Philosophy

FunWithCameras3 explores how **mathematical distortion** can create new perspectives on familiar visual information. The fisheye effect transforms ordinary camera input into surreal, curved compositions that challenge our perception of space and form.

The real-time processing suggests that even the most complex mathematical transformations can be applied instantly, creating a bridge between computational photography and generative art. This creates a balance between the technical precision of the distortion algorithm and the organic, live nature of camera input. 