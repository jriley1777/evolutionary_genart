// Matrix structure: project roots (y-axis) x generations (x-axis)
export const projects = {
  // Project root concepts - each can have multiple generations
  projectRoots: [
    {
      id: "particle-flow",
      name: "Particle Flow",
      baseDescription: "Interactive particle systems with flowing patterns",
      generations: {
        gen1: {
          slug: "flow-field-trails",
          title: "Flow Field Trails",
          description: "Flow field particle system with mouse-responsive forces and HSB color gradients",
          sketch: "FlowFieldTrails",
          tags: ["p5.js", "generative", "interactive", "particles", "flow-field", "hsb"],
          date: "2025-06-07",
          blog: "blog/flow-field-trails.md",
          showPhotoMode: false
        },
        gen2: {
          slug: "evolving-particle-life",
          title: "Evolving Particle Life",
          description: "Advanced particle system with attractors, audio reactivity, and particle evolution",
          sketch: "EvolvingParticleLife",
          tags: ["p5.js", "generative", "interactive", "particles", "audio", "evolution"],
          date: "2025-01-15",
          blog: "blog/evolving-particle-life.md",
          showPhotoMode: false
        },
        gen3: {
          slug: "magnetic-particle-connections",
          title: "Magnetic Particle Connections",
          description: "Magnetic field system with attractors, repellers, and electromagnetic particle interactions",
          sketch: "MagneticParticleConnections",
          tags: ["p5.js", "generative", "interactive", "particles", "magnetic", "electromagnetic", "clustering"],
          date: "2025-01-23",
          blog: "blog/magnetic-particle-connections.md",
          showPhotoMode: false
        },
        gen4: {
          slug: "flowing-word-chains",
          title: "Flowing Word Chains",
          description: "Text-based particle system with word chains, letter evolution, and flow field forces",
          sketch: "FlowingWordChains",
          tags: ["p5.js", "generative", "interactive", "particles", "text", "typography", "word-chains"],
          date: "2025-01-29",
          blog: "blog/flowing-word-chains.md",
          showPhotoMode: false
        },
        gen5: {
          slug: "genetic-particle-traits",
          title: "Genetic Particle Traits",
          description: "Evolutionary particle system with visual DNA, genetic mutations, and behavioral diversity",
          sketch: "GeneticParticleTraits",
          tags: ["p5.js", "generative", "interactive", "particles", "evolution", "dna", "genetics"],
          date: "2025-01-30",
          blog: "blog/genetic-particle-traits.md",
          showPhotoMode: false
        },
        gen6: {
          slug: "synthwave-hex-glow",
          title: "Synthwave Hex Glow",
          description: "Synthwave hexagonal grid with particle illumination, neon glow effects, and color transitions",
          sketch: "SynthwaveHexGlow",
          tags: ["p5.js", "generative", "interactive", "particles", "hexagonal", "synthwave", "neon", "illumination"],
          date: "2025-01-31",
          blog: "blog/synthwave-hex-glow.md",
          showPhotoMode: false
        },
        gen7: {
          slug: "triangle-mesh-flow",
          title: "Triangle Mesh Flow",
          description: "Triangular mesh with invisible particles affecting triangle colors through flow field",
          sketch: "TriangleMeshFlow",
          tags: ["p5.js", "generative", "interactive", "particles", "triangular", "mesh", "invisible"],
          date: "2025-02-01",
          blog: "blog/triangle-mesh-flow.md",
          showPhotoMode: false
        },
        gen8: {
          slug: "rectangle-pack-flow",
          title: "Rectangle Pack Flow",
          description: "Rectangle packing with particle-driven pattern changes and synthwave color transitions",
          sketch: "RectanglePackFlow",
          tags: ["p5.js", "generative", "interactive", "particles", "rectangle", "packing", "synthwave", "patterns"],
          date: "2025-02-01",
          blog: "blog/rectangle-pack-flow.md",
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
