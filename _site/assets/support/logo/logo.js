const SVG_FILE = "monointerferenz_logo_export.svg";
const VIEWBOX = { x: 0, y: 0, w: 486.37, h: 452.93 };

let logoLayers = [];
let loadError = "";
let paletteIndex = 0;
let stillMode = false;

window.monointerferenzSketch = {
  get layers() { return logoLayers.length; },
  get loadError() { return loadError; },
  get paletteIndex() { return paletteIndex; },
};

const palettes = [
  {
    paper: [255, 255, 255],
    ink: [28, 25, 22],
    light: [212, 211, 205],
    mid: [104, 102, 96],
  },
];

function setup() {
  const cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent("stage");
  pixelDensity(1);
  noFill();
  strokeCap(SQUARE);
  strokeJoin(MITER);
  loadLogo();
}

async function loadLogo() {
  try {
    const response = await fetch(SVG_FILE);
    if (!response.ok) throw new Error(`Could not load ${SVG_FILE}`);
    const svgText = await response.text();
    logoLayers = parseSvg(svgText);
  } catch (error) {
    loadError = error.message;
  }
}

function draw() {
  const palette = palettes[paletteIndex];
  background(...palette.paper);

  if (loadError) {
    drawStatus(loadError);
    return;
  }

  if (!logoLayers.length) {
    drawStatus("loading");
    return;
  }

  const t = stillMode ? 0 : millis() * 0.001;
  const mx = 0;
  const my = 0;
  const logoScale = min(width * 0.94 / VIEWBOX.w, height * 0.94 / VIEWBOX.h);

  push();
  translate(width * 0.5, height * 0.5);
  scale(logoScale);
  translate(-VIEWBOX.w * 0.5, -VIEWBOX.h * 0.5);

  drawEchoField(t, mx, my, palette);
  drawLogoLayers(t, mx, my, palette);
  drawScanLine(t, palette);
  pop();
}

function drawLogoLayers(t, mx, my, palette) {
  const total = max(logoLayers.length - 1, 1);

  for (let i = 0; i < logoLayers.length; i++) {
    const layer = logoLayers[i];
    const n = i / total;
    const wave = sin(t * 1.7 + i * 0.19);
    const slow = cos(t * 0.8 + i * 0.07);
    const reveal = constrain(map((t * 0.18 + n * 0.64) % 1, 0.02, 0.82, 0, 1), 0, 1);
    const jitter = (1 - abs(0.5 - n) * 2) * 5.5;
    const driftX = wave * jitter + mx * (6 + n * 8);
    const driftY = slow * jitter * 0.55 + my * (3 - n * 3);
    const turn = radians(wave * (0.75 + n * 1.1));
    const alpha = 255 * layer.opacity * (0.22 + reveal * 0.78);
    const tone = constrain(lerp(34, 8, n) + sin(t * 1.3 + n * TAU) * 28, 0, 170);
    const edge = colorFromTone(tone, palette);

    push();
    translate(layer.cx, layer.cy);
    rotate(turn);
    translate(-layer.cx + driftX, -layer.cy + driftY);
    stroke(edge[0], edge[1], edge[2], alpha);
    strokeWeight(layer.strokeWidth * (0.78 + reveal * 0.36));
    drawVertices(layer.points, reveal);
    pop();
  }
}

function drawEchoField(t, mx, my, palette) {
  push();
  blendMode(MULTIPLY);
  for (let ring = 0; ring < 3; ring++) {
    const offset = 12 + ring * 18 + sin(t * 1.2 + ring) * 8;
    const alpha = 16 - ring * 3;
    const echoTone = 162 - ring * 34;
    stroke(...colorFromTone(echoTone, palette), alpha);
    strokeWeight(1.05);
    for (let i = ring; i < logoLayers.length; i += 9) {
      const layer = logoLayers[i];
      push();
      translate(mx * offset, my * -offset);
      drawVertices(layer.points, 1);
      pop();
    }
  }
  pop();
}

function drawScanLine(t, palette) {
  const sweep = (sin(t * 0.9) * 0.5 + 0.5) * VIEWBOX.h;
  stroke(...palette.mid, 42);
  strokeWeight(1.2);
  line(-30, sweep, VIEWBOX.w + 30, sweep - 38);
}

function drawVertices(points, amount) {
  if (amount >= 0.999) {
    beginShape();
    for (const p of points) vertex(p.x, p.y);
    endShape(CLOSE);
    return;
  }

  const segmentLengths = [];
  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const length = dist(a.x, a.y, b.x, b.y);
    segmentLengths.push(length);
    perimeter += length;
  }

  let remaining = perimeter * easeOutCubic(amount);
  beginShape();
  vertex(points[0].x, points[0].y);
  for (let i = 0; i < points.length && remaining > 0; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const length = segmentLengths[i];
    if (remaining >= length) {
      vertex(b.x, b.y);
    } else {
      const amt = remaining / length;
      vertex(lerp(a.x, b.x, amt), lerp(a.y, b.y, amt));
    }
    remaining -= length;
  }
  endShape();
}

function parseSvg(svgText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  const styleText = doc.querySelector("style")?.textContent || "";
  const classStyles = parseClassStyles(styleText);
  const elements = [...doc.querySelectorAll("polygon, rect")];

  return elements.map((el, index) => {
    const cls = el.getAttribute("class") || "";
    const style = classStyles[cls] || {};
    const points = el.tagName.toLowerCase() === "polygon"
      ? parsePolygon(el)
      : parseRect(el);
    const center = getCenter(points);

    return {
      index,
      points,
      cx: center.x,
      cy: center.y,
      opacity: Number(style.opacity ?? 0.86),
      strokeWidth: Number(style.strokeWidth ?? 1.6),
    };
  }).filter((layer) => layer.points.length > 2);
}

function parseClassStyles(styleText) {
  const styles = {};
  const blocks = styleText.matchAll(/\.([\w-]+)\s*\{([^}]*)\}/g);
  for (const block of blocks) {
    const className = block[1];
    const body = block[2];
    styles[className] = styles[className] || {};
    const opacity = body.match(/opacity:\s*([.\d]+)/);
    const strokeWidth = body.match(/stroke-width:\s*([.\d]+)px/);
    if (opacity) styles[className].opacity = Number(opacity[1]);
    if (strokeWidth) styles[className].strokeWidth = Number(strokeWidth[1]);
  }
  return styles;
}

function parsePolygon(el) {
  const values = (el.getAttribute("points") || "")
    .match(/-?\d*\.?\d+/g)
    ?.map(Number) || [];
  const points = [];

  for (let i = 0; i < values.length - 1; i += 2) {
    points.push({ x: values[i], y: values[i + 1] });
  }

  return points;
}

function parseRect(el) {
  const x = Number(el.getAttribute("x") || 0);
  const y = Number(el.getAttribute("y") || 0);
  const w = Number(el.getAttribute("width") || 0);
  const h = Number(el.getAttribute("height") || 0);
  const corners = [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x, y: y + h },
  ];
  const matrix = svgTransformToMatrix(el.getAttribute("transform") || "");
  return corners.map((point) => transformPoint(point, matrix));
}

function svgTransformToMatrix(transform) {
  let matrix = new DOMMatrix();
  const commands = transform.match(/[a-z]+\([^)]*\)/gi) || [];

  for (const command of commands) {
    const name = command.match(/^[a-z]+/i)?.[0] || "";
    const values = (command.match(/-?\d*\.?\d+/g) || []).map(Number);
    if (name === "translate") {
      matrix = matrix.translate(values[0] || 0, values[1] || 0);
    }
    if (name === "rotate") {
      matrix = matrix.rotate(values[0] || 0);
    }
  }

  return matrix;
}

function transformPoint(point, matrix) {
  const transformed = new DOMPoint(point.x, point.y).matrixTransform(matrix);
  return { x: transformed.x, y: transformed.y };
}

function getCenter(points) {
  const sum = points.reduce((acc, p) => {
    acc.x += p.x;
    acc.y += p.y;
    return acc;
  }, { x: 0, y: 0 });
  return {
    x: sum.x / points.length,
    y: sum.y / points.length,
  };
}

function drawStatus(message) {
  push();
  fill(23, 21, 18, 130);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(13);
  text(message, width * 0.5, height * 0.5);
  pop();
}

function easeOutCubic(x) {
  return 1 - pow(1 - x, 3);
}

function colorFromTone(tone, palette) {
  return [
    constrain(palette.ink[0] + tone, 0, 255),
    constrain(palette.ink[1] + tone, 0, 255),
    constrain(palette.ink[2] + tone, 0, 255),
  ];
}

// function keyPressed() {
//   if (key === " ") stillMode = !stillMode;
//   if (key === "c" || key === "C") paletteIndex = (paletteIndex + 1) % palettes.length;
//   if (key === "s" || key === "S") saveCanvas("monointerferenz-frame", "png");
// }

// function mousePressed() {
//   paletteIndex = (paletteIndex + 1) % palettes.length;
// }

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
