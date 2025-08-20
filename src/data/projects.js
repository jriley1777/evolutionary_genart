// Matrix structure: project roots (y-axis) x generations (x-axis)
export const projects = {
  // Project root concepts - each can have multiple generations
  projectRoots: [
    {
      id: "sine-wave-puddle",
      name: "Sine Wave Puddle",
      baseDescription: "Polar coordinates, sine waves, and Perlin noise",
      generations: {
        gen1: {
          slug: "sine-wave-puddle",
          title: "Sine Wave Puddle",
          description: "Animated polar wave patterns with moving center, sine wave distortion, and Perlin noise",
          sketch: "SineWavePuddle",
          date: "2025-06-07",
          blog: "sine-wave-puddle.md",
          tags: ["p5.js", "generative", "interactive", "waves", "polar", "animation"],
          showPhotoMode: false
        },
        gen2: {
          slug: "sine-wave-puddle-gen2",
          title: "Sine Wave Puddle Gen2",
          description: "Interactive walker system with organic movement, wave centers, and fractal decomposition",
          sketch: "SineWavePuddleGen2",
          tags: ["p5.js", "generative", "interactive", "waves", "walkers", "fractals", "organic"],
          date: "2025-01-15",
          blog: "sine-wave-puddle-gen2.md",
          showPhotoMode: false
        }
      }
    },
    {
      id: "gen-flower",
      name: "Generative Flower",
      baseDescription: "Evolving flower patterns with dynamic stems and spirals",
      generations: {
        gen1: {
          slug: "gen-flower-1",
          title: "Generative Flower 1",
          description: "An evolving flower pattern with dynamic stems and spirals",
          sketch: "GenFlower1",
          tags: ["p5.js", "generative", "interactive"],
          date: "2025-06-07",
          blog: "blog/gen-flower-1.md",
          showPhotoMode: false
        },

      }
    },
    {
      id: "kaleidoscope",
      name: "Kaleidoscope",
      baseDescription: "Mesmerizing kaleidoscope patterns with light refraction effects",
      generations: {
        gen1: {
          slug: "kaleidoscope-1",
          title: "Kaleidoscope 1",
          description: "8-segment kaleidoscope with light refraction effects, triangular prisms, and particle system",
          sketch: "Kaleidoscope1",
          tags: ["p5.js", "generative", "interactive", "kaleidoscope", "refraction", "prism", "particles"],
          date: "2025-01-15",
          blog: "blog/kaleidoscope-1.md",
          showPhotoMode: false
        },
        gen2: {
          slug: "kaleidoscope-2",
          title: "Kaleidoscope 2",
          description: "Fluid, morphing, and psychedelic kaleidoscope with liquid and fractal effects.",
          sketch: "Kaleidoscope2",
          tags: ["p5.js", "generative", "psychedelic", "fluid", "kaleidoscope"],
          date: "2025-01-16",
          blog: "blog/gen2/kaleidoscope-2.md",
          showPhotoMode: false
        },
        gen3: {
          slug: "kaleidoscope-3",
          title: "Kaleidoscope 3",
          description: "DNA spirals, neural overlays, and intense color cycling in a living kaleidoscope.",
          sketch: "Kaleidoscope3",
          tags: ["p5.js", "generative", "psychedelic", "biological", "kaleidoscope"],
          date: "2025-01-17",
          blog: "blog/gen3/kaleidoscope-3.md",
          showPhotoMode: false
        },
        gen4: {
          slug: "kaleidoscope-4",
          title: "Kaleidoscope 4",
          description: "Extreme reality distortion, cosmic consciousness, and multidimensional overlays.",
          sketch: "Kaleidoscope4",
          tags: ["p5.js", "generative", "psychedelic", "cosmic", "kaleidoscope"],
          date: "2025-01-18",
          blog: "blog/gen4/kaleidoscope-4.md",
          showPhotoMode: false
        },
        gen5: {
          slug: "kaleidoscope-5",
          title: "Kaleidoscope 5",
          description: "Recursive fractals, infinite zoom, liquid glass, and ego dissolution visuals.",
          sketch: "Kaleidoscope5",
          tags: ["p5.js", "generative", "psychedelic", "fractal", "kaleidoscope"],
          date: "2025-01-19",
          blog: "blog/gen5/kaleidoscope-5.md",
          showPhotoMode: false
        },
        gen6: {
          slug: "kaleidoscope-6",
          title: "Kaleidoscope 6",
          description: "Wireframe fractal consciousness with colored lines revealing geometric structure.",
          sketch: "Kaleidoscope6",
          tags: ["p5.js", "generative", "psychedelic", "wireframe", "kaleidoscope"],
          date: "2025-01-20",
          blog: "blog/gen6/kaleidoscope-6.md",
          showPhotoMode: false
        },
        gen7: {
          slug: "kaleidoscope-7",
          title: "Kaleidoscope 7",
          description: "Image-based kaleidoscope featuring Shrek's face with color distortion and recursive patterns.",
          sketch: "Kaleidoscope7",
          tags: ["p5.js", "generative", "psychedelic", "image", "kaleidoscope", "shrek"],
          date: "2025-01-21",
          blog: "blog/gen7/kaleidoscope-7.md",
          showPhotoMode: false
        },
        gen8: {
          slug: "kaleidoscope-8",
          title: "Kaleidoscope 8",
          description: "Real-time camera feed integration with live kaleidoscope effects and environmental interaction.",
          sketch: "Kaleidoscope8",
          tags: ["p5.js", "generative", "interactive", "camera", "kaleidoscope", "real-time", "video"],
          date: "2025-01-22",
          blog: "blog/gen8/kaleidoscope8.md",
          showPhotoMode: false
        }
      }
    },
    {
      id: "static-line-art",
      name: "Static Line Art",
      baseDescription: "Static line art with columns and complementary colors",
      generations: {
        gen1: {
          slug: "static-line-art-1",
          title: "Static Line Art 1",
          description: "Static line art with columns split into 4 pieces, using complementary colors and Perlin noise for variation",
          sketch: "StaticLineArt1",
          tags: ["p5.js", "generative", "static", "columns", "complementary-colors", "perlin-noise"],
          date: "2025-01-25",
          blog: "blog/static-line-art-1.md",
          showPhotoMode: false
        },
        gen2: {
          slug: "static-line-art-2",
          title: "Static Line Art 2",
          description: "Crescent-shaped columns with curved panels, evolving the static line art concept with organic flow",
          sketch: "StaticLineArt2",
          tags: ["p5.js", "generative", "static", "columns", "crescent", "curved", "organic"],
          date: "2025-01-25",
          blog: "blog/static-line-art-2.md",
          showPhotoMode: false
        },
        gen3: {
          slug: "static-line-art-3",
          title: "Static Line Art 3",
          description: "Polar coordinate S-curves radiating from upper left, transforming the linear pattern into radial distortion",
          sketch: "StaticLineArt3",
          tags: ["p5.js", "generative", "static", "columns", "polar", "radial", "distortion"],
          date: "2025-01-25",
          blog: "blog/static-line-art-3.md",
          showPhotoMode: false
        },
        gen4: {
          slug: "static-line-art-4",
          title: "Static Line Art 4",
          description: "Layered depth with multiple color palettes (forest, desert, ocean) and subtle transparency effects",
          sketch: "StaticLineArt4",
          tags: ["p5.js", "generative", "static", "layers", "transparency", "depth", "palettes"],
          date: "2025-01-25",
          blog: "blog/static-line-art-4.md",
          showPhotoMode: false
        },
        gen5: {
          slug: "static-line-art-5",
          title: "Static Line Art 5",
          description: "Diagonal flow from bottom-left to upper-right with varied row heights and multiple color palettes",
          sketch: "StaticLineArt5",
          tags: ["p5.js", "generative", "static", "diagonal", "flow", "varied-heights", "palettes"],
          date: "2025-01-25",
          blog: "blog/static-line-art-5.md",
          showPhotoMode: false
        },
        gen6: {
          slug: "static-line-art-6",
          title: "Static Line Art 6",
          description: "Systematic progression with random variation - fixed row heights, colors at start, increasing panels",
          sketch: "StaticLineArt6",
          tags: ["p5.js", "generative", "static", "systematic", "random", "progression", "fixed-grid"],
          date: "2025-01-25",
          blog: "blog/static-line-art-6.md",
          showPhotoMode: false
        }
      }
    },
    {
      id: "particle-flow",
      name: "Particle Flow",
      baseDescription: "Interactive particle systems with flowing patterns",
      generations: {
        gen1: {
          slug: "particle-flow",
          title: "Particle Flow",
          description: "Flow field particle system with mouse-responsive forces and HSB color gradients",
          sketch: "ParticleFlow",
          tags: ["p5.js", "generative", "interactive", "particles", "flow-field", "hsb"],
          date: "2025-06-07",
          blog: "blog/particle-flow.md",
          showPhotoMode: false
        },
        gen2: {
          slug: "particle-flow-gen2",
          title: "Particle Flow Gen2",
          description: "Advanced particle system with attractors, audio reactivity, and particle evolution",
          sketch: "ParticleFlowGen2",
          tags: ["p5.js", "generative", "interactive", "particles", "audio", "evolution"],
          date: "2025-01-15",
          blog: "blog/particle-flow-gen2.md",
          showPhotoMode: false
        },
        gen3: {
          slug: "particle-flow-gen3",
          title: "Particle Flow Gen3",
          description: "Magnetic field system with attractors, repellers, and electromagnetic particle interactions",
          sketch: "ParticleFlowGen3",
          tags: ["p5.js", "generative", "interactive", "particles", "magnetic", "electromagnetic", "clustering"],
          date: "2025-01-23",
          blog: "blog/gen3/particle-flow-gen3.md",
          showPhotoMode: false
        },
        gen4: {
          slug: "particle-flow-gen4",
          title: "Particle Flow Gen4",
          description: "Text-based particle system with word chains, letter evolution, and flow field forces",
          sketch: "ParticleFlowGen4",
          tags: ["p5.js", "generative", "interactive", "particles", "text", "typography", "word-chains"],
          date: "2025-01-29",
          blog: "blog/gen4/particle-flow-gen4.md",
          showPhotoMode: false
        },
        gen5: {
          slug: "particle-flow-gen5",
          title: "Particle Flow Gen5",
          description: "Evolutionary particle system with visual DNA, genetic mutations, and behavioral diversity",
          sketch: "ParticleFlowGen5",
          tags: ["p5.js", "generative", "interactive", "particles", "evolution", "dna", "genetics"],
          date: "2025-01-30",
          blog: "blog/gen5/particle-flow-gen5.md",
          showPhotoMode: false
        },
        gen6: {
          slug: "particle-flow-gen6",
          title: "Particle Flow Gen6",
          description: "Synthwave hexagonal grid with particle illumination, neon glow effects, and color transitions",
          sketch: "ParticleFlowGen6",
          tags: ["p5.js", "generative", "interactive", "particles", "hexagonal", "synthwave", "neon", "illumination"],
          date: "2025-01-31",
          blog: "blog/gen6/particle-flow-gen6.md",
          showPhotoMode: false
        },
        gen7: {
          slug: "particle-flow-gen7",
          title: "Particle Flow Gen7",
          description: "Triangular mesh with invisible particles affecting triangle colors through flow field",
          sketch: "ParticleFlowGen7",
          tags: ["p5.js", "generative", "interactive", "particles", "triangular", "mesh", "invisible"],
          date: "2025-02-01",
          blog: "blog/gen7/particle-flow-gen7.md",
          showPhotoMode: false
        },
        gen8: {
          slug: "particle-flow-gen8",
          title: "Particle Flow Gen8",
          description: "Rectangle packing with particle-driven pattern changes and synthwave color transitions",
          sketch: "ParticleFlowGen8",
          tags: ["p5.js", "generative", "interactive", "particles", "rectangle", "packing", "synthwave", "patterns"],
          date: "2025-02-01",
          blog: "blog/gen8/particle-flow-gen8.md",
          showPhotoMode: false
        }
      }
    },
    {
      id: "smoke-trails",
      name: "Smoke Trails",
      baseDescription: "Interactive smoke simulation with drifting, expanding particles",
      generations: {
        gen1: {
          slug: "smoke-trails",
          title: "Smoke Trails",
          description: "Interactive smoke simulation with growing particles, turbulence, and starter smoke",
          sketch: "SmokeTrails",
          tags: ["p5.js", "generative", "interactive", "particles", "smoke", "turbulence"],
          date: "2025-06-07",
          blog: "blog/smoke-trails.md",
          showPhotoMode: false
        },
        gen2: {
          slug: "smoke-trails-gen2",
          title: "Smoke Trails Gen2",
          description: "Multi-particle system with fire, steam, and environmental conditions",
          sketch: "SmokeTrailsGen2",
          tags: ["p5.js", "generative", "interactive", "particles", "smoke", "fire", "steam", "environment"],
          date: "2025-01-15",
          blog: "blog/smoke-trails-gen2.md",
          showPhotoMode: false
        },
        gen3: {
          slug: "smoke-trails-gen3",
          title: "Smoke Trails Gen3",
          description: "Particle interactions, flocking behavior, and chemical reactions",
          sketch: "SmokeTrailsGen3",
          tags: ["p5.js", "generative", "interactive", "particles", "flocking", "chemistry", "plasma", "ash"],
          date: "2025-01-15",
          blog: "blog/smoke-trails-gen3.md",
          showPhotoMode: false
        },
        gen4: {
          slug: "smoke-trails-gen4",
          title: "Smoke Trails Gen4",
          description: "3D space, narrative storytelling, and environmental drama",
          sketch: "SmokeTrailsGen4",
          tags: ["p5.js", "generative", "interactive", "particles", "3D", "narrative", "storytelling", "light", "void"],
          date: "2025-01-15",
          blog: "blog/smoke-trails-gen4.md",
          showPhotoMode: false
        },
        gen5: {
          slug: "smoke-trails-gen5",
          title: "Smoke Trails Gen5",
          description: "Street art aerosol techniques, stencils, and urban art aesthetics",
          sketch: "SmokeTrailsGen5",
          tags: ["p5.js", "generative", "interactive", "particles", "street-art", "aerosol", "stencil", "graffiti"],
          date: "2025-01-15",
          blog: "blog/smoke-trails-gen5.md",
          showPhotoMode: false
        },
        gen6: {
          slug: "smoke-trails-gen6",
          title: "Smoke Trails Gen6",
          description: "Large-scale murals, collaborative art spaces, and urban installations",
          sketch: "SmokeTrailsGen6",
          tags: ["p5.js", "generative", "interactive", "particles", "mural", "collaborative", "installation", "urban-art"],
          date: "2025-01-15",
          blog: "blog/smoke-trails-gen6.md",
          showPhotoMode: false
        },
        gen7: {
          slug: "smoke-trails-gen7",
          title: "Smoke Trails Gen7",
          description: "Digital ecosystems, cellular automata, and emergent life behaviors",
          sketch: "SmokeTrailsGen7",
          tags: ["p5.js", "generative", "interactive", "particles", "ecosystem", "digital-life", "evolution", "cellular-automata"],
          date: "2025-01-15",
          blog: "blog/smoke-trails-gen7.md",
          showPhotoMode: false
        },
        gen8: {
          slug: "smoke-trails-gen8",
          title: "Smoke Trails Gen8",
          description: "Quantum fields, wave functions, and particle physics simulation",
          sketch: "SmokeTrailsGen8",
          tags: ["p5.js", "generative", "interactive", "particles", "quantum", "wave-function", "entanglement", "superposition"],
          date: "2025-01-15",
          blog: "blog/smoke-trails-gen8.md",
          showPhotoMode: false
        }
      }
    },
    {
      id: "synth-spirograph",
      name: "SynthSpirograph",
      baseDescription: "Animated stencil spirograph with synthwave aesthetics",
      generations: {
        gen1: {
          slug: "synth-spirograph",
          title: "SynthSpirograph",
          description: "Animated stencil spirograph with synthwave aesthetics and real-time drawing",
          sketch: "SynthSpirograph",
          tags: ["p5.js", "generative", "interactive", "spirograph", "synthwave", "mathematical"],
          date: "2025-01-24",
          blog: "blog/gen1/synth-spirograph.md",
          showPhotoMode: false
        },
        gen2: {
          slug: "synth-spirograph-2",
          title: "SynthSpirograph2",
          description: "Multi-layered spirograph with depth effects and harmonic complexity",
          sketch: "SynthSpirograph2",
          tags: ["p5.js", "generative", "interactive", "spirograph", "synthwave", "layered", "depth"],
          date: "2025-01-25",
          blog: "blog/gen2/synth-spirograph-2.md",
          showPhotoMode: false
        },
        gen3: {
          slug: "synth-spirograph-3",
          title: "SynthSpirograph3",
          description: "Interactive physics-based spirograph with dynamic user-responsive behavior",
          sketch: "SynthSpirograph3",
          tags: ["p5.js", "generative", "interactive", "spirograph", "synthwave", "physics", "dynamic"],
          date: "2025-01-26",
          blog: "blog/gen3/synth-spirograph-3.md",
          showPhotoMode: false
        }
      }
    },
    {
      id: "split-flap",
      name: "Split Flap",
      baseDescription: "A split flap display with user input",
      generations: {
        gen1: {
          slug: "split-flap",
          title: "Split Flap", 
          description: "A split flap display with user input",
          sketch: "SplitFlap",
          tags: ["generative", "split flap", "user input"],
          date: "2025-06-07",
          blog: "blog/split-flap.md",
          showPhotoMode: false
        }
      }
    },
    {
      id: "hiroshi",
      name: "Hiroshi",
      baseDescription: "A static art piece inspired by Hiroshi Nagai",
      generations: {
        gen1: {
          slug: "hiroshi-1",
          title: "Hiroshi 1",
          description: "A static art piece inspired by Hiroshi Nagai",
          sketch: "Hiroshi1",
          tags: ["generative", "house", "palm tree"],
          date: "2025-06-12",
          blog: "blog/hiroshi-1.md",
          showPhotoMode: false
        },
        gen2: {
          slug: "hiroshi-2",
          title: "Hiroshi 2",
          description: "Spiral-based masking shapes revealing background through irregular spiral patterns",
          sketch: "Hiroshi2",
          tags: ["generative", "masking", "spiral", "irregular", "gradient"],
          date: "2025-01-31",
          blog: "blog/hiroshi-2.md",
          showPhotoMode: false
        },
        gen3: {
          slug: "hiroshi-3",
          title: "Hiroshi 3",
          description: "Double pendulum-inspired chaotic masking with organic, irregular shapes",
          sketch: "Hiroshi3",
          tags: ["generative", "masking", "pendulum", "chaotic", "organic"],
          date: "2025-01-31",
          blog: "blog/hiroshi-3.md",
          showPhotoMode: false
        },
        gen4: {
          slug: "hiroshi-4",
          title: "Hiroshi 4",
          description: "Fractal-like masking shapes using color burn blend mode for dramatic effects",
          sketch: "Hiroshi4",
          tags: ["generative", "masking", "fractal", "color-burn", "blend-mode"],
          date: "2025-01-31",
          blog: "blog/hiroshi-4.md",
          showPhotoMode: false
        }
      }
    },
    {
      id: "trickshot",
      name: "Trickshot",
      baseDescription: "A trickshot game",
      generations: {
        gen1: {
          slug: "trickshot",
          title: "Trickshot",
          description: "A trickshot game",
          sketch: "Trickshot",
          tags: ["trickshot", "game"],
          date: "2025-06-14",
          blog: "blog/trickshot.md",
          showPhotoMode: false
        }
      }
    },
    {
      id: "fun-with-cameras",
      name: "Fun With Cameras",
      baseDescription: "Camera-based interactive effects and visual processing",
      generations: {
        gen1: {
          slug: "fun-with-cameras",
          title: "Fun With Cameras",
          description: "Real-time camera capture with trail effects, blend modes, and temporal layering",
          sketch: "FunWithCameras",
          tags: ["p5.js", "generative", "interactive", "camera", "video", "trail", "blend-modes"],
          date: "2025-01-31",
          blog: "blog/fun-with-cameras.md",
          showPhotoMode: true
        },
        gen2: {
          slug: "fun-with-cameras-2",
          title: "Fun With Cameras 2",
          description: "Camera feed sliced into 30 vertical strips with mathematical width variation and barcode aesthetic",
          sketch: "FunWithCameras2",
          tags: ["p5.js", "generative", "interactive", "camera", "video", "barcode", "slices", "mathematical"],
          date: "2025-01-31",
          blog: "blog/fun-with-cameras-2.md",
          showPhotoMode: true
        },
        gen3: {
          slug: "fun-with-cameras-3",
          title: "Fun With Cameras 3",
          description: "Real-time fisheye lens effect with barrel distortion and high-resolution camera processing",
          sketch: "FunWithCameras3",
          tags: ["p5.js", "generative", "interactive", "camera", "video", "fisheye", "distortion"],
          date: "2025-01-31",
          blog: "blog/fun-with-cameras-3.md",
          showPhotoMode: true
        },
        gen4: {
          slug: "fun-with-cameras-4",
          title: "Fun With Cameras 4",
          description: "Double fisheye effect creating 'eyes' at eye level with dual distortion zones and retro CRT overlay",
          sketch: "FunWithCameras4",
          tags: ["p5.js", "generative", "interactive", "camera", "video", "fisheye", "double-distortion", "eyes", "crt"],
          date: "2025-01-31",
          blog: "blog/fun-with-cameras-4.md",
          showPhotoMode: true
        },
        gen5: {
          slug: "fun-with-cameras-5",
          title: "Fun With Cameras 5",
          description: "Rotoscoping edge detection with adjustable threshold",
          sketch: "FunWithCameras5",
          tags: ["p5.js", "generative", "interactive", "camera", "video", "rotoscoping", "edge-detection", "threshold"],
          date: "2025-01-31",
          blog: "blog/fun-with-cameras-5.md",
          showPhotoMode: true
        },
        gen6: {
          slug: "fun-with-cameras-6",
          title: "Fun With Cameras 6",
          description: "Vertex-based edge detection with smooth tweening animation",
          sketch: "FunWithCameras6",
          tags: ["p5.js", "generative", "interactive", "camera", "video", "vertex-detection", "tweening", "performance"],
          date: "2025-01-31",
          blog: "blog/fun-with-cameras-6.md",
          showPhotoMode: true
        }
      }
    },
    {
      id: "fun-with-sounds",
      name: "Fun With Sounds",
      baseDescription: "Audio-reactive interactive shapes and rhythmically synchronized art",
      generations: {
        gen1: {
          slug: "fun-with-sounds",
          title: "Fun With Sounds",
          description: "Interactive shapes that emit sounds when approached or clicked, with rhythmic beat synchronization",
          sketch: "FunWithSounds",
          tags: ["p5.js", "generative", "interactive", "audio", "sound", "rhythm", "p5.sound"],
          date: "2025-01-31",
          blog: "blog/fun-with-sounds.md",
          showPhotoMode: false
        }
      }
    },
    {
      id: "grid-system",
      name: "Grid System",
      baseDescription: "Modular grid-based generative art with systematic patterns and geometric foundations",
      generations: {
        gen1: {
          slug: "grid-system-1",
          title: "Grid System 1",
          description: "A foundational square grid system with 50 squares in height that adapts to fill the canvas width",
          sketch: "GridSystem1",
          tags: ["p5.js", "generative", "grid", "geometric", "systematic", "foundation"],
          date: "2025-02-01",
          blog: "blog/grid-system-1.md",
          showPhotoMode: false
        }
      }
    }
  ],

  // Available generations for the matrix
  generations: [
    { id: 'gen1', label: 'Gen1', emoji: '⚡' },
    { id: 'gen2', label: 'Gen2', emoji: '🎯' },
    { id: 'gen3', label: 'Gen3', emoji: '🌟' },
    { id: 'gen4', label: 'Gen4', emoji: '🌌' },
    { id: 'gen5', label: 'Gen5', emoji: '🎨' },
    { id: 'gen6', label: 'Gen6', emoji: '🏙️' },
    { id: 'gen7', label: 'Gen7', emoji: '🌱' },
    { id: 'gen8', label: 'Gen8', emoji: '⚛️' }
  ],

  // Helper function to get all projects in flat array format (for backward compatibility)
  getAllProjects() {
    const allProjects = [];
    this.projectRoots.forEach(root => {
      Object.entries(root.generations).forEach(([genType, project]) => {
        allProjects.push({
          ...project,
          type: genType,
          rootId: root.id,
          rootName: root.name
        });
      });
    });
    return allProjects;
  },

  // Helper function to find project by slug
  findProjectBySlug(slug) {
    for (const root of this.projectRoots) {
      for (const [genType, project] of Object.entries(root.generations)) {
        if (project.slug === slug) {
          return {
            ...project,
            type: genType,
            rootId: root.id,
            rootName: root.name
          };
        }
      }
    }
    return null;
  },

  // Helper function to get projects by generation
  getProjectsByGeneration(generation) {
    const projectsInGen = [];
    this.projectRoots.forEach(root => {
      if (root.generations[generation]) {
        projectsInGen.push({
          ...root.generations[generation],
          type: generation,
          rootId: root.id,
          rootName: root.name
        });
      }
    });
    return projectsInGen;
  }
};