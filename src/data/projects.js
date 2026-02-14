// Sketch catalog: each root has an array of sketches (slug, title, description, sketch component key, etc.).
export const projects = {
  projectRoots: [
    {
      id: "particle-flow",
      name: "Particle Flow",
      baseDescription: "Interactive particle systems with flowing patterns",
      sketches: [
        {
          slug: "flow-field-trails",
          title: "Flow Field Trails",
          description: "Flow field particle system with mouse-responsive forces and HSB color gradients",
          sketch: "FlowFieldTrails",
          tags: ["p5.js", "generative", "interactive", "particles", "flow-field", "hsb"],
          date: "2025-06-07",
          created: "2025-06-07",
          blog: "blog/flow-field-trails.md",
          showPhotoMode: false
        },
        {
          slug: "evolving-particle-life",
          title: "Evolving Particle Life",
          description: "Advanced particle system with attractors, audio reactivity, and particle evolution",
          sketch: "EvolvingParticleLife",
          tags: ["p5.js", "generative", "interactive", "particles", "audio", "evolution"],
          date: "2025-01-15",
          created: "2025-01-15",
          blog: "blog/evolving-particle-life.md",
          showPhotoMode: false
        },
        {
          slug: "magnetic-particle-connections",
          title: "Magnetic Particle Connections",
          description: "Magnetic field system with attractors, repellers, and electromagnetic particle interactions",
          sketch: "MagneticParticleConnections",
          tags: ["p5.js", "generative", "interactive", "particles", "magnetic", "electromagnetic", "clustering"],
          date: "2025-01-23",
          created: "2025-01-23",
          blog: "blog/magnetic-particle-connections.md",
          showPhotoMode: false
        },
        {
          slug: "flowing-word-chains",
          title: "Flowing Word Chains",
          description: "Text-based particle system with word chains, letter evolution, and flow field forces",
          sketch: "FlowingWordChains",
          tags: ["p5.js", "generative", "interactive", "particles", "text", "typography", "word-chains"],
          date: "2025-01-29",
          created: "2025-01-29",
          blog: "blog/flowing-word-chains.md",
          showPhotoMode: false
        },
        {
          slug: "genetic-particle-traits",
          title: "Genetic Particle Traits",
          description: "Evolutionary particle system with visual DNA, genetic mutations, and behavioral diversity",
          sketch: "GeneticParticleTraits",
          tags: ["p5.js", "generative", "interactive", "particles", "evolution", "dna", "genetics"],
          date: "2025-01-30",
          created: "2025-01-30",
          blog: "blog/genetic-particle-traits.md",
          showPhotoMode: false
        },
        {
          slug: "synthwave-hex-glow",
          title: "Synthwave Hex Glow",
          description: "Synthwave hexagonal grid with particle illumination, neon glow effects, and color transitions",
          sketch: "SynthwaveHexGlow",
          tags: ["p5.js", "generative", "interactive", "particles", "hexagonal", "synthwave", "neon", "illumination"],
          date: "2025-01-31",
          created: "2025-01-31",
          blog: "blog/synthwave-hex-glow.md",
          showPhotoMode: false
        },
        {
          slug: "triangle-mesh-flow",
          title: "Triangle Mesh Flow",
          description: "Triangular mesh with invisible particles affecting triangle colors through flow field",
          sketch: "TriangleMeshFlow",
          tags: ["p5.js", "generative", "interactive", "particles", "triangular", "mesh", "invisible"],
          date: "2025-02-01",
          created: "2025-02-01",
          blog: "blog/triangle-mesh-flow.md",
          showPhotoMode: false
        },
        {
          slug: "rectangle-pack-flow",
          title: "Rectangle Pack Flow",
          description: "Rectangle packing with particle-driven pattern changes and synthwave color transitions",
          sketch: "RectanglePackFlow",
          tags: ["p5.js", "generative", "interactive", "particles", "rectangle", "packing", "synthwave", "patterns"],
          date: "2025-02-01",
          created: "2025-02-01",
          blog: "blog/rectangle-pack-flow.md",
          showPhotoMode: false
        }
      ]
    }
  ],

  // Helper function to get all projects in flat array format, sorted by created date (newest first)
  getAllProjects() {
    const allProjects = [];
    this.projectRoots.forEach(root => {
      root.sketches.forEach((project) => {
        allProjects.push({
          ...project,
          rootId: root.id,
          rootName: root.name
        });
      });
    });
    allProjects.sort((a, b) => (b.created || "").localeCompare(a.created || ""));
    return allProjects;
  },

  // Helper function to find project by slug
  findProjectBySlug(slug) {
    for (const root of this.projectRoots) {
      const project = root.sketches.find((p) => p.slug === slug);
      if (project) {
        return {
          ...project,
          rootId: root.id,
          rootName: root.name
        };
      }
    }
    return null;
  }
};
