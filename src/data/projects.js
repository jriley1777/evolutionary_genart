/**
 * Sketch catalog — single source of truth for the gallery UI.
 *
 * Maintenance: on every commit (or before one), review this file against
 * src/sketches/sketches.js and public/blog/*.md. See project-core.mdc § Catalog review.
 *
 * Sketch entry fields:
 *   slug, title, description — gallery + routing (slug must match public/blog/{slug}.md)
 *   sketch — key in src/sketches/sketches.js
 *   sketchType — "p5" | "three"
 *   tags — string[]
 *   created — YYYY-MM-DD (canonical sort key; newest first in UI)
 *   blog — optional path note (e.g. blog/my-sketch.md)
 *   showPhotoMode — boolean, default false
 *   showPlotterExport — boolean, pen-plotter root only; enables Export SVG
 *
 * Array order: newest `created` at the top of each root (UI also sorts by `created`).
 */
export const projects = {
  projectRoots: [
    {
      id: "particle-flow",
      name: "Particle Flow",
      baseDescription: "Interactive particle systems with flowing patterns",
      sketches: [
        {
          slug: "flow-field-trails-3d",
          title: "Flow Field Trails 3D",
          description: "Flow field particle trails in 3D space with a slow flying camera moving through the trails",
          sketch: "FlowFieldTrails3D",
          sketchType: "three",
          tags: ["three.js", "generative", "flow-field", "particles", "3d", "trails"],
          created: "2026-02-16",
          blog: "blog/flow-field-trails-3d.md",
          showPhotoMode: false,
        },
        {
          slug: "flow-field-voronoi",
          title: "Flow Field Voronoi",
          description: "Flow field with Voronoi cells: 50 sites, arrows and balls per cell, red ball and entrance counters",
          sketch: "FlowFieldVoronoi",
          sketchType: "p5",
          tags: ["p5.js", "generative", "interactive", "flow-field", "voronoi", "visualization"],
          created: "2026-02-14",
          blog: "blog/flow-field-voronoi.md",
          showPhotoMode: false,
        },
        {
          slug: "flow-field-grid",
          title: "Flow Field Grid",
          description: "Visualizes the flow field grid and direction with arrows at each cell center",
          sketch: "FlowFieldGrid",
          sketchType: "p5",
          tags: ["p5.js", "generative", "interactive", "flow-field", "visualization", "grid"],
          created: "2026-02-14",
          blog: "blog/flow-field-grid.md",
          showPhotoMode: false,
        },
        {
          slug: "slow-flow-trails",
          title: "Slow Flow Trails",
          description: "Flow field trails with slower motion and longer, softer trails; same structure as Flow Field Trails",
          sketch: "SlowFlowTrails",
          sketchType: "p5",
          tags: ["p5.js", "generative", "interactive", "particles", "flow-field", "slow", "trails"],
          created: "2026-02-14",
          blog: "blog/slow-flow-trails.md",
          showPhotoMode: false,
        },
        {
          slug: "flow-field-trails",
          title: "Flow Field Trails",
          description: "Flow field particle system with mouse-responsive forces and HSB color gradients",
          sketch: "FlowFieldTrails",
          sketchType: "p5",
          tags: ["p5.js", "generative", "interactive", "particles", "flow-field", "hsb"],
          created: "2026-02-07",
          blog: "blog/flow-field-trails.md",
          showPhotoMode: false,
        },
        {
          slug: "triangle-mesh-flow",
          title: "Triangle Mesh Flow",
          description: "Triangular mesh with invisible particles affecting triangle colors through flow field",
          sketch: "TriangleMeshFlow",
          sketchType: "p5",
          tags: ["p5.js", "generative", "interactive", "particles", "triangular", "mesh", "invisible"],
          created: "2026-02-01",
          blog: "blog/triangle-mesh-flow.md",
          showPhotoMode: false,
        },
        {
          slug: "rectangle-pack-flow",
          title: "Rectangle Pack Flow",
          description: "Rectangle packing with particle-driven pattern changes and synthwave color transitions",
          sketch: "RectanglePackFlow",
          sketchType: "p5",
          tags: ["p5.js", "generative", "interactive", "particles", "rectangle", "packing", "synthwave", "patterns"],
          created: "2026-02-01",
          blog: "blog/rectangle-pack-flow.md",
          showPhotoMode: false,
        },
        {
          slug: "synthwave-hex-glow",
          title: "Synthwave Hex Glow",
          description: "Synthwave hexagonal grid with particle illumination, neon glow effects, and color transitions",
          sketch: "SynthwaveHexGlow",
          sketchType: "p5",
          tags: ["p5.js", "generative", "interactive", "particles", "hexagonal", "synthwave", "neon", "illumination"],
          created: "2026-01-31",
          blog: "blog/synthwave-hex-glow.md",
          showPhotoMode: false,
        },
        {
          slug: "magnetic-particle-connections",
          title: "Magnetic Particle Connections",
          description: "Magnetic field system with attractors, repellers, and electromagnetic particle interactions",
          sketch: "MagneticParticleConnections",
          sketchType: "p5",
          tags: ["p5.js", "generative", "interactive", "particles", "magnetic", "electromagnetic", "clustering"],
          created: "2026-01-23",
          blog: "blog/magnetic-particle-connections.md",
          showPhotoMode: false,
        },
        {
          slug: "evolving-particle-life",
          title: "Evolving Particle Life",
          description: "Advanced particle system with attractors, audio reactivity, and particle evolution",
          sketch: "EvolvingParticleLife",
          sketchType: "p5",
          tags: ["p5.js", "generative", "interactive", "particles", "audio", "evolution"],
          created: "2026-01-15",
          blog: "blog/evolving-particle-life.md",
          showPhotoMode: false,
        },
      ],
    },
    {
      id: "pen-plotter",
      name: "Pen Plotter",
      baseDescription: "Vector sketches for pen plotters — preview in browser, export SVG for plotting",
      sketches: [
        {
          slug: "plotter-flow-path",
          title: "Plotter Flow Path",
          description: "Grid of flowing Bezier curves in grey ink with one red accent cell; 16:9 canvas-matched SVG export",
          sketch: "PlotterFlowPath",
          sketchType: "p5",
          tags: ["p5.js", "generative", "plotter", "bezier", "grid", "svg-export"],
          created: "2026-02-20",
          blog: "blog/plotter-flow-path.md",
          showPhotoMode: false,
          showPlotterExport: true,
        },
      ],
    },
  ],

  getProjectRoots() {
    return this.projectRoots.map((root) => ({
      id: root.id,
      name: root.name,
      baseDescription: root.baseDescription,
      sketches: [...root.sketches]
        .sort((a, b) => (b.created || "").localeCompare(a.created || ""))
        .map((sketch) => ({
          ...sketch,
          rootId: root.id,
          rootName: root.name,
        })),
    }));
  },

  getAllProjects() {
    const allProjects = [];
    this.projectRoots.forEach((root) => {
      root.sketches.forEach((project) => {
        allProjects.push({
          ...project,
          rootId: root.id,
          rootName: root.name,
        });
      });
    });
    allProjects.sort((a, b) => (b.created || "").localeCompare(a.created || ""));
    return allProjects;
  },

  findProjectBySlug(slug) {
    for (const root of this.projectRoots) {
      const project = root.sketches.find((p) => p.slug === slug);
      if (project) {
        return {
          ...project,
          rootId: root.id,
          rootName: root.name,
        };
      }
    }
    return null;
  },
};
