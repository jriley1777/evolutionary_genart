// Sketch catalog: each root has an array of sketches (slug, title, description, sketch component key, etc.).
export const projects = {
  projectRoots: [
    {
      id: "particle-flow",
      name: "Particle Flow",
      baseDescription: "Interactive particle systems with flowing patterns",
      sketches: [
        {
          slug: "flow-field-voronoi",
          title: "Flow Field Voronoi",
          description: "Flow field with Voronoi cells: 50 sites, arrows and balls per cell, red ball and entrance counters",
          sketch: "FlowFieldVoronoi",
          sketchType: "p5",
          tags: ["p5.js", "generative", "interactive", "flow-field", "voronoi", "visualization"],
          date: "2026-02-14",
          created: "2026-02-14",
          blog: "blog/flow-field-voronoi.md",
          showPhotoMode: false
        },
        {
          slug: "flow-field-grid",
          title: "Flow Field Grid",
          description: "Visualizes the flow field grid and direction with arrows at each cell center",
          sketch: "FlowFieldGrid",
          sketchType: "p5",
          tags: ["p5.js", "generative", "interactive", "flow-field", "visualization", "grid"],
          date: "2026-02-14",
          created: "2026-02-14",
          blog: "blog/flow-field-grid.md",
          showPhotoMode: false
        },
        {
          slug: "slow-flow-trails",
          title: "Slow Flow Trails",
          description: "Flow field trails with slower motion and longer, softer trails; same structure as Flow Field Trails",
          sketch: "SlowFlowTrails",
          sketchType: "p5",
          tags: ["p5.js", "generative", "interactive", "particles", "flow-field", "slow", "trails"],
          date: "2026-02-14",
          created: "2026-02-14",
          blog: "blog/slow-flow-trails.md",
          showPhotoMode: false
        },
        {
          slug: "flow-field-trails",
          title: "Flow Field Trails",
          description: "Flow field particle system with mouse-responsive forces and HSB color gradients",
          sketch: "FlowFieldTrails",
          sketchType: "p5",
          tags: ["p5.js", "generative", "interactive", "particles", "flow-field", "hsb"],
          date: "2026-02-07",
          created: "2026-02-07",
          blog: "blog/flow-field-trails.md",
          showPhotoMode: false
        },
        {
          slug: "evolving-particle-life",
          title: "Evolving Particle Life",
          description: "Advanced particle system with attractors, audio reactivity, and particle evolution",
          sketch: "EvolvingParticleLife",
          sketchType: "p5",
          tags: ["p5.js", "generative", "interactive", "particles", "audio", "evolution"],
          date: "2026-01-15",
          created: "2026-01-15",
          blog: "blog/evolving-particle-life.md",
          showPhotoMode: false
        },
        {
          slug: "magnetic-particle-connections",
          title: "Magnetic Particle Connections",
          description: "Magnetic field system with attractors, repellers, and electromagnetic particle interactions",
          sketch: "MagneticParticleConnections",
          sketchType: "p5",
          tags: ["p5.js", "generative", "interactive", "particles", "magnetic", "electromagnetic", "clustering"],
          date: "2026-01-23",
          created: "2026-01-23",
          blog: "blog/magnetic-particle-connections.md",
          showPhotoMode: false
        },
        {
          slug: "synthwave-hex-glow",
          title: "Synthwave Hex Glow",
          description: "Synthwave hexagonal grid with particle illumination, neon glow effects, and color transitions",
          sketch: "SynthwaveHexGlow",
          sketchType: "p5",
          tags: ["p5.js", "generative", "interactive", "particles", "hexagonal", "synthwave", "neon", "illumination"],
          date: "2026-01-31",
          created: "2026-01-31",
          blog: "blog/synthwave-hex-glow.md",
          showPhotoMode: false
        },
        {
          slug: "triangle-mesh-flow",
          title: "Triangle Mesh Flow",
          description: "Triangular mesh with invisible particles affecting triangle colors through flow field",
          sketch: "TriangleMeshFlow",
          sketchType: "p5",
          tags: ["p5.js", "generative", "interactive", "particles", "triangular", "mesh", "invisible"],
          date: "2026-02-01",
          created: "2026-02-01",
          blog: "blog/triangle-mesh-flow.md",
          showPhotoMode: false
        },
        {
          slug: "rectangle-pack-flow",
          title: "Rectangle Pack Flow",
          description: "Rectangle packing with particle-driven pattern changes and synthwave color transitions",
          sketch: "RectanglePackFlow",
          sketchType: "p5",
          tags: ["p5.js", "generative", "interactive", "particles", "rectangle", "packing", "synthwave", "patterns"],
          date: "2026-02-01",
          created: "2026-02-01",
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
