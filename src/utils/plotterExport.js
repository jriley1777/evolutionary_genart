/** Shared helpers for pen-plotter SVG export. See context/plotter-context.md. */

export const PLOTTER_A4 = {
  widthMm: 210,
  heightMm: 297,
  marginMm: 10,
};

const escapeXml = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Sample cubic Bezier; seg has p0–p3 with { x, y }. */
export const sampleCubicBezier = (seg, numSamples = 32) => {
  const pts = [];
  const { p0, p1, p2, p3 } = seg;
  for (let i = 0; i <= numSamples; i++) {
    const t = i / numSamples;
    const u = 1 - t;
    pts.push({
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
    });
  }
  return pts;
};

export const polylineToPathD = (points) => {
  if (!points.length) return "";
  const [first, ...rest] = points;
  let d = `M ${first.x} ${first.y}`;
  for (const p of rest) d += ` L ${p.x} ${p.y}`;
  return d;
};

export const rgbToHex = (r, g, b) => {
  const h = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
};

/** Map light-on-dark preview RGB to dark ink for paper / white SVG viewers. */
export const previewLightOnDarkToInkStroke = (r, g, b) => {
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  if (spread < 40) {
    const lum = (r + g + b) / 3;
    const ink = Math.max(20, Math.min(120, Math.round(255 - lum)));
    return rgbToHex(ink, ink, ink);
  }
  if (r > g + 40 && r > b + 40) {
    return rgbToHex(Math.round(r * 0.55), Math.round(g * 0.9), Math.round(b * 0.9));
  }
  return rgbToHex(r, g, b);
};

/**
 * @param {Array<{ id?: string, stroke: string, paths?: Array<{ points: Array<{x,y}>, strokeWidthPx?: number }>, polylines?: Array<Array<{x,y}>> }>} layers
 * @param {{ sourceWidth: number, sourceHeight: number, fit?: 'canvas' | 'paper', widthMm?: number, heightMm?: number, marginMm?: number, flipY?: boolean, paperBackground?: boolean, defaultStrokeWidthMm?: number, defaultStrokeWidthPx?: number }} opts
 */
export const layersToSvg = (layers, opts) => {
  const {
    sourceWidth,
    sourceHeight,
    fit = "paper",
    widthMm = PLOTTER_A4.widthMm,
    heightMm = PLOTTER_A4.heightMm,
    marginMm = PLOTTER_A4.marginMm,
    flipY = false,
    paperBackground = true,
    defaultStrokeWidthMm = 0.35,
    defaultStrokeWidthPx = 1,
  } = opts;

  const useCanvasCoords = fit === "canvas";
  const viewW = useCanvasCoords ? sourceWidth : widthMm;
  const viewH = useCanvasCoords ? sourceHeight : heightMm;

  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;

  if (!useCanvasCoords) {
    const drawW = widthMm - marginMm * 2;
    const drawH = heightMm - marginMm * 2;
    scale = Math.min(drawW / sourceWidth, drawH / sourceHeight);
    offsetX = marginMm + (drawW - sourceWidth * scale) / 2;
    offsetY = marginMm + (drawH - sourceHeight * scale) / 2;
  }

  const mapPoint = (x, y) => {
    const sx = offsetX + x * scale;
    const sy = flipY
      ? offsetY + (sourceHeight - y) * scale
      : offsetY + y * scale;
    return { x: sx, y: sy };
  };

  const groups = layers
    .filter((layer) => layer.paths?.length || layer.polylines?.length)
    .map((layer, i) => {
      const id = escapeXml(layer.id ?? `layer-${i}`);
      const stroke = layer.stroke ?? "#000000";
      const pathEntries = layer.paths?.length
        ? layer.paths
        : (layer.polylines ?? []).map((points) => ({ points, strokeWidthPx: null }));

      const paths = pathEntries
        .map((entry) => {
          const mapped = entry.points.map((p) => mapPoint(p.x, p.y));
          const d = polylineToPathD(mapped);
          if (!d) return "";
          const strokeWidthAttr = useCanvasCoords
            ? (entry.strokeWidthPx ?? defaultStrokeWidthPx).toFixed(3)
            : `${Math.max(
                0.08,
                (entry.strokeWidthPx != null ? entry.strokeWidthPx * scale : defaultStrokeWidthMm)
              ).toFixed(3)}mm`;
          return `    <path d="${d}" fill="none" stroke="${stroke}" stroke-width="${strokeWidthAttr}" stroke-linecap="round" stroke-linejoin="round"/>`;
        })
        .filter(Boolean)
        .join("\n");
      if (!paths) return "";
      return `  <g id="${id}" stroke="${stroke}">\n${paths}\n  </g>`;
    })
    .filter(Boolean)
    .join("\n");

  const bg = paperBackground
    ? `  <rect width="${viewW}" height="${viewH}" fill="#ffffff"/>\n`
    : "";

  const sizeAttrs = useCanvasCoords
    ? `width="${viewW}" height="${viewH}"`
    : `width="${widthMm}mm" height="${heightMm}mm"`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" ${sizeAttrs} viewBox="0 0 ${viewW} ${viewH}">
${bg}${groups}
</svg>`;
};

export const downloadSvgString = (svgString, filename = "plot.svg") => {
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".svg") ? filename : `${filename}.svg`;
  a.click();
  URL.revokeObjectURL(url);
};
