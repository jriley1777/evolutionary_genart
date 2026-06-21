# Plotter Flow Path

A grid of flowing Bezier curves in varied greys, with one accent cell in warm red. Preview animates in the browser; export SVG for a pen plotter.

## Concept

- Each grid cell holds several independent curves that grow along smooth Bezier segments between random waypoints.
- Greys span a wide range on black; one cell is picked at random for a red accent layer (separate pen when plotting).
- Vertical column guides are preview-only and are not included in SVG export.
- Click to regenerate the full composition; export captures all curve segments currently built.

## Technical notes

- Curves stored as cubic Bezier chains per cell; export samples Beziers to polylines and groups by stroke color.
- Registered under the **Pen Plotter** project root with **Export SVG** via `plotterExport.js` (A4 mm coordinates).
- Uses shared `plotterExportRef` pattern for download from the sketch toolbar.
