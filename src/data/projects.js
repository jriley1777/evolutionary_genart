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
          description: "Polar coordinates, sine waves, and Perlin noise.",
          sketch: "SineWavePuddle",
          date: "2025-06-07",
          blog: "sine-wave-puddle.md",
          tags: ["p5.js", "generative", "interactive", "waves", "polar"]
        },
        gen2: {
          slug: "sine-wave-puddle-gen2",
          title: "Sine Wave Puddle Gen2",
          description: "Multi-center wave interference with fractal decomposition and interactive sources",
          sketch: "SineWavePuddleGen2",
          tags: ["p5.js", "generative", "interactive", "waves", "interference", "fractals"],
          date: "2025-01-15",
          blog: "sine-wave-puddle-gen2.md"
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
          blog: "blog/gen-flower-1.md"
        },
        gen2: {
          slug: "gen-flower-2",
          title: "Generative Flower 2",
          description: "Tropical rainforest canopy with hanging vines, floating pollen, and bioluminescent elements",
          sketch: "GenFlower2",
          tags: ["p5.js", "generative", "interactive", "rainforest", "vines", "pollen", "bioluminescent"],
          date: "2025-01-15",
          blog: "blog/gen-flower-2.md"
        },
        gen3: {
          slug: "gen-flower-3",
          title: "Generative Flower 3",
          description: "3D terrain travel with flying camera perspective over rolling hills and dynamic lighting",
          sketch: "GenFlower3",
          tags: ["p5.js", "generative", "interactive", "3D", "terrain", "camera", "flight"],
          date: "2025-01-15",
          blog: "blog/gen-flower-3.md"
        },
        gen4: {
          slug: "gen-flower-4",
          title: "Generative Flower 4",
          description: "Magical night scene with glowing fireflies, stars, and atmospheric lighting effects",
          sketch: "GenFlower4",
          tags: ["p5.js", "generative", "interactive", "fireflies", "night", "stars", "lighting"],
          date: "2025-01-15",
          blog: "blog/gen-flower-4.md"
        }
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
          description: "A mesmerizing kaleidoscope pattern with light refraction effects and triangular prism designs",
          sketch: "Kaleidoscope1",
          tags: ["p5.js", "generative", "interactive", "kaleidoscope", "refraction", "prism"],
          date: "2025-01-15",
          blog: "blog/kaleidoscope-1.md"
        },
        gen2: {
          slug: "kaleidoscope-2",
          title: "Kaleidoscope 2",
          description: "Fluid, morphing, and psychedelic kaleidoscope with liquid and fractal effects.",
          sketch: "Kaleidoscope2",
          tags: ["p5.js", "generative", "psychedelic", "fluid", "kaleidoscope"],
          date: "2025-01-16",
          blog: "blog/gen2/kaleidoscope-2.md"
        },
        gen3: {
          slug: "kaleidoscope-3",
          title: "Kaleidoscope 3",
          description: "DNA spirals, neural overlays, and intense color cycling in a living kaleidoscope.",
          sketch: "Kaleidoscope3",
          tags: ["p5.js", "generative", "psychedelic", "biological", "kaleidoscope"],
          date: "2025-01-17",
          blog: "blog/gen3/kaleidoscope-3.md"
        },
        gen4: {
          slug: "kaleidoscope-4",
          title: "Kaleidoscope 4",
          description: "Extreme reality distortion, cosmic consciousness, and multidimensional overlays.",
          sketch: "Kaleidoscope4",
          tags: ["p5.js", "generative", "psychedelic", "cosmic", "kaleidoscope"],
          date: "2025-01-18",
          blog: "blog/gen4/kaleidoscope-4.md"
        },
        gen5: {
          slug: "kaleidoscope-5",
          title: "Kaleidoscope 5",
          description: "Recursive fractals, infinite zoom, liquid glass, and ego dissolution visuals.",
          sketch: "Kaleidoscope5",
          tags: ["p5.js", "generative", "psychedelic", "fractal", "kaleidoscope"],
          date: "2025-01-19",
          blog: "blog/gen5/kaleidoscope-5.md"
        },
        gen6: {
          slug: "kaleidoscope-6",
          title: "Kaleidoscope 6",
          description: "Wireframe fractal consciousness with colored lines revealing geometric structure.",
          sketch: "Kaleidoscope6",
          tags: ["p5.js", "generative", "psychedelic", "wireframe", "kaleidoscope"],
          date: "2025-01-20",
          blog: "blog/gen6/kaleidoscope-6.md"
        },
        gen7: {
          slug: "kaleidoscope-7",
          title: "Kaleidoscope 7",
          description: "Image-based kaleidoscope featuring Shrek's face with color distortion and recursive patterns.",
          sketch: "Kaleidoscope7",
          tags: ["p5.js", "generative", "psychedelic", "image", "kaleidoscope", "shrek"],
          date: "2025-01-21",
          blog: "blog/gen7/kaleidoscope-7.md"
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
          description: "Interactive particle system that responds to mouse movement with flowing patterns",
          sketch: "ParticleFlow",
          tags: ["p5.js", "generative", "interactive", "particles"],
          date: "2025-06-07",
          blog: "blog/particle-flow.md"
        },
        gen2: {
          slug: "particle-flow-gen2",
          title: "Particle Flow Gen2",
          description: "Advanced particle system with attractors, audio reactivity, and particle evolution",
          sketch: "ParticleFlowGen2",
          tags: ["p5.js", "generative", "interactive", "particles", "audio", "evolution"],
          date: "2025-01-15",
          blog: "blog/particle-flow-gen2.md"
        },
        gen3: {
          slug: "particle-flow-gen3",
          title: "Particle Flow Gen3",
          description: "Magnetic field system with attractors, repellers, and electromagnetic particle interactions",
          sketch: "ParticleFlowGen3",
          tags: ["p5.js", "generative", "interactive", "particles", "magnetic", "electromagnetic", "clustering"],
          date: "2025-01-23",
          blog: "blog/gen3/particle-flow-gen3.md"
        },
        gen4: {
          slug: "particle-flow-gen4",
          title: "Particle Flow Gen4",
          description: "Text-based animation with letters as particles and dynamic typography",
          sketch: "ParticleFlowGen4",
          tags: ["p5.js", "generative", "interactive", "particles", "text", "typography", "animation"],
          date: "2025-01-29",
          blog: "blog/gen4/particle-flow-gen4.md"
        },
        gen5: {
          slug: "particle-flow-gen5",
          title: "Particle Flow Gen5",
          description: "Opacity layering with multiple small lines and depth effects",
          sketch: "ParticleFlowGen5",
          tags: ["p5.js", "generative", "interactive", "particles", "layering", "opacity", "depth"],
          date: "2025-01-30",
          blog: "blog/gen5/particle-flow-gen5.md"
        },
        gen6: {
          slug: "particle-flow-gen6",
          title: "Particle Flow Gen6",
          description: "Non-square grids with hexagonal, triangular, and circular patterns",
          sketch: "ParticleFlowGen6",
          tags: ["p5.js", "generative", "interactive", "particles", "grid", "hexagonal", "triangular", "circular"],
          date: "2025-01-31",
          blog: "blog/gen6/particle-flow-gen6.md"
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
          description: "Interactive smoke simulation with drifting, expanding particles",
          sketch: "SmokeTrails",
          tags: ["p5.js", "generative", "interactive", "particles", "smoke"],
          date: "2025-06-07",
          blog: "blog/smoke-trails.md"
        },
        gen2: {
          slug: "smoke-trails-gen2",
          title: "Smoke Trails Gen2",
          description: "Multi-particle system with fire, steam, and environmental conditions",
          sketch: "SmokeTrailsGen2",
          tags: ["p5.js", "generative", "interactive", "particles", "smoke", "fire", "steam", "environment"],
          date: "2025-01-15",
          blog: "blog/smoke-trails-gen2.md"
        },
        gen3: {
          slug: "smoke-trails-gen3",
          title: "Smoke Trails Gen3",
          description: "Particle interactions, flocking behavior, and chemical reactions",
          sketch: "SmokeTrailsGen3",
          tags: ["p5.js", "generative", "interactive", "particles", "flocking", "chemistry", "plasma", "ash"],
          date: "2025-01-15",
          blog: "blog/smoke-trails-gen3.md"
        },
        gen4: {
          slug: "smoke-trails-gen4",
          title: "Smoke Trails Gen4",
          description: "3D space, narrative storytelling, and environmental drama",
          sketch: "SmokeTrailsGen4",
          tags: ["p5.js", "generative", "interactive", "particles", "3D", "narrative", "storytelling", "light", "void"],
          date: "2025-01-15",
          blog: "blog/smoke-trails-gen4.md"
        },
        gen5: {
          slug: "smoke-trails-gen5",
          title: "Smoke Trails Gen5",
          description: "Street art aerosol techniques, stencils, and urban art aesthetics",
          sketch: "SmokeTrailsGen5",
          tags: ["p5.js", "generative", "interactive", "particles", "street-art", "aerosol", "stencil", "graffiti"],
          date: "2025-01-15",
          blog: "blog/smoke-trails-gen5.md"
        },
        gen6: {
          slug: "smoke-trails-gen6",
          title: "Smoke Trails Gen6",
          description: "Large-scale murals, collaborative art spaces, and urban installations",
          sketch: "SmokeTrailsGen6",
          tags: ["p5.js", "generative", "interactive", "particles", "mural", "collaborative", "installation", "urban-art"],
          date: "2025-01-15",
          blog: "blog/smoke-trails-gen6.md"
        },
        gen7: {
          slug: "smoke-trails-gen7",
          title: "Smoke Trails Gen7",
          description: "Digital ecosystems, cellular automata, and emergent life behaviors",
          sketch: "SmokeTrailsGen7",
          tags: ["p5.js", "generative", "interactive", "particles", "ecosystem", "digital-life", "evolution", "cellular-automata"],
          date: "2025-01-15",
          blog: "blog/smoke-trails-gen7.md"
        },
        gen8: {
          slug: "smoke-trails-gen8",
          title: "Smoke Trails Gen8",
          description: "Quantum fields, wave functions, and particle physics simulation",
          sketch: "SmokeTrailsGen8",
          tags: ["p5.js", "generative", "interactive", "particles", "quantum", "wave-function", "entanglement", "superposition"],
          date: "2025-01-15",
          blog: "blog/smoke-trails-gen8.md"
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
          blog: "blog/gen1/synth-spirograph.md"
        },
        gen2: {
          slug: "synth-spirograph-2",
          title: "SynthSpirograph2",
          description: "Multi-layered spirograph with depth effects and harmonic complexity",
          sketch: "SynthSpirograph2",
          tags: ["p5.js", "generative", "interactive", "spirograph", "synthwave", "layered", "depth"],
          date: "2025-01-25",
          blog: "blog/gen2/synth-spirograph-2.md"
        },
        gen3: {
          slug: "synth-spirograph-3",
          title: "SynthSpirograph3",
          description: "Interactive physics-based spirograph with dynamic user-responsive behavior",
          sketch: "SynthSpirograph3",
          tags: ["p5.js", "generative", "interactive", "spirograph", "synthwave", "physics", "dynamic"],
          date: "2025-01-26",
          blog: "blog/gen3/synth-spirograph-3.md"
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
          blog: "blog/split-flap.md"
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
          blog: "blog/hiroshi-1.md"
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
          blog: "blog/trickshot.md"
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