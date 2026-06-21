# Pen plotter sketches – creative brief

*Creative brief for the **pen-plotter** project root. Screen previews live in the gallery; the deliverable is vector art for a physical pen plotter (e.g. Uuna Tek).*

## Project goal

Build sketches whose **primary output is plottable**: polylines or curves exported as SVG, one layer per pen color. Flow fields, particles, and noise are fine as **generators** if the exported artifact is paths—not animated particles on screen.

Each sketch should support **Download SVG** when `showPlotterExport: true` in `projects.js`, using `src/utils/plotterExport.js`.

---

## Output constraint

Every sketch under **pen-plotter** must:

1. Store drawable geometry as **paths** (not only `p5.line` with no record).
2. Expose export via `plotterExportRef` (see `PlotterFlowPath.jsx`).
3. Use **discrete stroke colors** per layer (one pen per layer). No gradients in the SVG.
4. Avoid fills in export; prefer strokes. Hatching is OK if intentional.
5. Target a documented paper size (default A4 below); keep margins.

Do not register non-plottable screen-only pieces under this root.

---

## Machine & paper (edit for your setup)

| Setting | Default (placeholder) |
| -------- | ---------------------- |
| Machine | Uuna Tek (or similar pen plotter) |
| Typical bed | A4 landscape or portrait — confirm in your software |
| Default export size | A4: **210 × 297 mm** |
| Margin | **10 mm** each side |
| Pens you use | Black 0.4 mm; add colors you actually own |
| Max plot time (soft target) | Under ~2 hours per piece |

Update this table after your first test plot (scale, Y flip, origin).

---

## Plotter-safe guidelines

- **Path budget**: prefer fewer, longer strokes over thousands of micro-segments.
- **Self-crossings**: minimize if ink buildup matters; not always forbidden.
- **Variable stroke weight on screen**: export uses a single stroke width per layer unless you map pens explicitly.
- **Preview vs export**: animation is optional; export should capture a **complete** or **regenerable** state (seed + regenerate paths).
- **Grid/guide lines**: do not export construction lines unless they are part of the art.

---

## Dimensions of variation

- Single continuous path vs many paths per composition
- Flow-field tracing, self-avoiding curves, L-systems, spirographs
- Multi-pen layers (color per layer)
- Grid compositions (cells with independent curves)
- Hatch fills vs pure line art
- Symmetry, repetition, negative space for paper

---

## References

- [Line-us / plotter art community](https://twitter.com/hashtag/plottertwitter)
- [Generative hut – plotter tips](https://generativehut.com/)
- Flow-field ideas: see `context/context.md` — use as input, not as output genre

---

## Registration

Follow `project-core.mdc`: component in `src/sketches/`, `sketches.js`, entry at top of **pen-plotter** root in `projects.js` with `showPlotterExport: true`, optional blog in `public/blog/`.
