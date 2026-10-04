/**
 * A tiny wireframe 3D renderer on <canvas>: rotate → perspective-project → draw.
 * No dependencies. Every model is built from line segments and dots, so it matches the
 * site's line-art style and uses only the theme's text + accent colours.
 */

export type V3 = [number, number, number];
export interface Seg { a: V3; b: V3; accent?: boolean }
export interface Dot { p: V3; r?: number; accent?: boolean }
export interface Frame { lines: Seg[]; dots: Dot[] }
/** A model is a function of time (seconds) returning what to draw. */
export type Model = (t: number) => Frame;

const TAU = Math.PI * 2;
const rad = (d: number) => (d * Math.PI) / 180;

// ---------- Geometry helpers ----------

function polyline(points: V3[], accent = false, closed = false): Seg[] {
  const out: Seg[] = [];
  for (let i = 0; i < points.length - 1; i++) out.push({ a: points[i], b: points[i + 1], accent });
  if (closed && points.length > 2) out.push({ a: points[points.length - 1], b: points[0], accent });
  return out;
}

function box(cx: number, cy: number, cz: number, w: number, h: number, d: number, accent = false): Seg[] {
  const x = w / 2, y = h / 2, z = d / 2;
  const v: V3[] = [
    [cx - x, cy - y, cz - z], [cx + x, cy - y, cz - z], [cx + x, cy + y, cz - z], [cx - x, cy + y, cz - z],
    [cx - x, cy - y, cz + z], [cx + x, cy - y, cz + z], [cx + x, cy + y, cz + z], [cx - x, cy + y, cz + z],
  ];
  const e = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  return e.map(([a, b]) => ({ a: v[a], b: v[b], accent }));
}

/** Circle in the plane perpendicular to `axis`. */
function ring(c: V3, r: number, axis: 'x' | 'y' | 'z', n = 32, from = 0, to = TAU): V3[] {
  const pts: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const a = from + ((to - from) * i) / n;
    const u = Math.cos(a) * r, w = Math.sin(a) * r;
    pts.push(axis === 'y' ? [c[0] + u, c[1], c[2] + w] : axis === 'x' ? [c[0], c[1] + u, c[2] + w] : [c[0] + u, c[1] + w, c[2]]);
  }
  return pts;
}

const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

function latLon(lat: number, lon: number, r = 1): V3 {
  const la = rad(lat), lo = rad(lon);
  return [Math.cos(la) * Math.sin(lo) * r, Math.sin(la) * r, Math.cos(la) * Math.cos(lo) * r];
}

/** Great-circle arc between two unit vectors, lifted off the surface. */
function arc(a: V3, b: V3, n = 28, lift = 0.28): V3[] {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const om = Math.acos(dot);
  const pts: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const s1 = Math.sin((1 - t) * om) / Math.sin(om), s2 = Math.sin(t * om) / Math.sin(om);
    const h = 1 + lift * Math.sin(Math.PI * t);
    pts.push([(a[0] * s1 + b[0] * s2) * h, (a[1] * s1 + b[1] * s2) * h, (a[2] * s1 + b[2] * s2) * h]);
  }
  return pts;
}

const along = (pts: V3[], t: number): V3 => {
  const f = t * (pts.length - 1);
  const i = Math.min(pts.length - 2, Math.floor(f));
  return lerp3(pts[i], pts[i + 1], f - i);
};

// ---------- Models (each relevant to Silas's work) ----------

/** Networking: a globe with links from Eldoret to places that shaped his work. */
export const ELDORET = { lat: 0.51, lon: 35.27 };
function globe(): Model {
  const lines: Seg[] = [];
  for (let lat = -60; lat <= 60; lat += 30) {
    lines.push(...polyline(ring([0, Math.sin(rad(lat)), 0], Math.cos(rad(lat)), 'y', 64)));
  }
  for (let lon = 0; lon < 180; lon += 30) {
    const pts: V3[] = [];
    for (let i = 0; i <= 64; i++) pts.push(latLon(-90 + (360 * i) / 64, lon));
    lines.push(...polyline(pts));
  }
  const home = latLon(ELDORET.lat, ELDORET.lon);
  const places: [number, number][] = [
    [60.17, 24.94], // Helsinki (Full Stack Open)
    [37.77, -122.42], // San Francisco (AfterQuery, YC)
    [51.5, -0.12], // London
    [-1.29, 36.82], // Nairobi
    [12.97, 77.59], // Bangalore
    [40.71, -74.0], // New York
    [-33.92, 18.42], // Cape Town
  ];
  const arcs = places.map(([la, lo]) => arc(home, latLon(la, lo), 32, 0.12 + 0.18 * Math.random()));
  arcs.forEach((a) => lines.push(...polyline(a, true)));
  const cities: Dot[] = places.map(([la, lo]) => ({ p: latLon(la, lo, 1.002), r: 2 }));

  return (t) => ({
    lines,
    dots: [
      { p: home, r: 4.5, accent: true },
      ...cities,
      // Packets travelling along each link.
      ...arcs.map((a, i) => ({ p: along(a, (t * 0.22 + i * 0.137) % 1), r: 2.2, accent: true })),
    ],
  });
}

/** Security: a padlock whose shackle periodically unlocks. */
function padlock(): Model {
  const body = box(0, -0.45, 0, 1.3, 1.0, 0.55);
  const keyhole = [...polyline(ring([0, -0.33, 0.28], 0.1, 'z', 16), true), { a: [0, -0.43, 0.28] as V3, b: [0, -0.68, 0.28] as V3, accent: true }];
  return (t) => {
    const cycle = (t * 0.35) % 1;
    const lift = cycle > 0.7 ? Math.sin(((cycle - 0.7) / 0.3) * Math.PI) * 0.32 : 0;
    const lines: Seg[] = [...body, ...keyhole];
    for (const z of [-0.12, 0.12]) {
      const top = ring([0, 0.15 + lift, z], 0.42, 'z', 20, 0, Math.PI);
      lines.push(...polyline(top));
      lines.push({ a: [0.42, 0.15 + lift, z], b: [0.42, 0.05, z] }, { a: [-0.42, 0.15 + lift, z], b: [-0.42, 0.05 + lift * 1.6, z] });
    }
    for (let i = 0; i <= 20; i += 4) {
      const a = (Math.PI * i) / 20;
      const x = Math.cos(a) * 0.42, y = Math.sin(a) * 0.42 + 0.15 + lift;
      lines.push({ a: [x, y, -0.12], b: [x, y, 0.12] });
    }
    return { lines, dots: [{ p: [0, -0.33, 0.28], r: 2.5, accent: lift > 0.02 }] };
  };
}

/** AI: a small neural network with signals flowing forward. */
function neural(): Model {
  const layers = [3, 5, 5, 2];
  const nodes: V3[][] = layers.map((n, li) => {
    const x = -1.2 + (2.4 * li) / (layers.length - 1);
    return Array.from({ length: n }, (_, i) => {
      const a = (TAU * i) / n + li * 0.4;
      const r = n === 1 ? 0 : 0.35 + n * 0.08;
      return [x, Math.cos(a) * r, Math.sin(a) * r] as V3;
    });
  });
  const edges: Seg[] = [];
  for (let l = 0; l < nodes.length - 1; l++) for (const a of nodes[l]) for (const b of nodes[l + 1]) edges.push({ a, b });
  const pulses = Array.from({ length: 10 }, (_, i) => ({ e: (i * 7) % edges.length, o: i / 10 }));
  return (t) => ({
    lines: edges,
    dots: [
      ...nodes.flatMap((layer, li) => layer.map((p) => ({ p, r: 3.2, accent: li === nodes.length - 1 }))),
      ...pulses.map(({ e, o }) => {
        const phase = (t * 0.5 + o) % 1;
        const edge = edges[(e + Math.floor(t * 0.5 + o) * 11) % edges.length];
        return { p: lerp3(edge.a, edge.b, phase), r: 2, accent: true };
      }),
    ],
  });
}

/** Full-stack / cloud: a server stack with blinking status LEDs. */
function servers(): Model {
  const units = [0.62, 0, -0.62];
  const lines: Seg[] = [];
  for (const y of units) {
    lines.push(...box(0, y, 0, 2.0, 0.46, 1.3));
    for (let i = 0; i < 4; i++) lines.push({ a: [-0.15 + i * 0.18, y - 0.12, 0.65], b: [-0.15 + i * 0.18, y + 0.12, 0.65] });
  }
  return (t) => ({
    lines,
    dots: units.flatMap((y, u) => [0, 1].map((k) => ({ p: [-0.8 + k * 0.18, y, 0.65] as V3, r: 2.6, accent: Math.sin(t * (3 + u) + k * 2 + u) > 0.2 }))),
  });
}

/** Software engineering: extruded </> brackets. */
function codeBrackets(): Model {
  const shapes: [V3[], boolean][] = [
    [[[-0.35, 0.6, 0], [-1.05, 0, 0], [-0.35, -0.6, 0]], false],
    [[[0.25, 0.78, 0], [-0.25, -0.78, 0]], true],
    [[[0.35, 0.6, 0], [1.05, 0, 0], [0.35, -0.6, 0]], false],
  ];
  const lines: Seg[] = [];
  for (const [pts, accent] of shapes) {
    const f = pts.map((p) => [p[0], p[1], 0.16] as V3), b = pts.map((p) => [p[0], p[1], -0.16] as V3);
    lines.push(...polyline(f, accent), ...polyline(b, accent));
    pts.forEach((_, i) => lines.push({ a: f[i], b: b[i], accent }));
  }
  return () => ({ lines, dots: [] });
}

/** Hardware / toolbox: a CPU with pins and a glowing die. */
function chip(): Model {
  const lines: Seg[] = [...box(0, 0, 0, 1.6, 0.18, 1.6), ...box(0, 0.13, 0, 0.75, 0.06, 0.75, true)];
  const pins: [V3, V3][] = [];
  for (let i = 0; i < 6; i++) {
    const o = -0.6 + i * 0.24;
    pins.push([[o, 0, 0.8], [o, 0, 1.08]], [[o, 0, -0.8], [o, 0, -1.08]], [[0.8, 0, o], [1.08, 0, o]], [[-0.8, 0, o], [-1.08, 0, o]]);
  }
  pins.forEach(([a, b]) => lines.push({ a, b }));
  return (t) => ({ lines, dots: pins.filter((_, i) => (i + Math.floor(t * 4)) % 7 === 0).map(([, b]) => ({ p: b, r: 2, accent: true })) });
}

/** Education: a graduation cap with a swinging tassel. */
function mortarboard(): Model {
  const corners: V3[] = [[1.25, 0.35, 0], [0, 0.35, 1.25], [-1.25, 0.35, 0], [0, 0.35, -1.25]];
  const lines: Seg[] = [
    ...polyline(corners, false, true),
    ...polyline(corners.map(([x, , z]) => [x, 0.29, z] as V3), false, true),
    ...corners.map((c) => ({ a: c, b: [c[0], 0.29, c[2]] as V3 })),
    ...polyline(ring([0, 0.29, 0], 0.55, 'y', 28)),
    ...polyline(ring([0, -0.25, 0], 0.6, 'y', 28)),
  ];
  for (let i = 0; i < 8; i++) {
    const a = (TAU * i) / 8;
    lines.push({ a: [Math.cos(a) * 0.55, 0.29, Math.sin(a) * 0.55], b: [Math.cos(a) * 0.6, -0.25, Math.sin(a) * 0.6] });
  }
  return (t) => {
    const swing = Math.sin(t * 1.6) * 0.12;
    const end: V3 = [1.25 + swing, -0.35, swing * 0.5];
    return {
      lines: [...lines, { a: [0, 0.36, 0], b: [1.25, 0.36, 0], accent: true }, { a: [1.25, 0.36, 0], b: end, accent: true }],
      dots: [{ p: [0, 0.37, 0], r: 3, accent: true }, { p: end, r: 3.4, accent: true }],
    };
  };
}

/** Contact: an envelope with a letter sliding out. */
function envelope(): Model {
  const base = box(0, 0, 0, 2.0, 1.3, 0.12);
  const flap: Seg[] = [{ a: [-1, 0.65, 0.06], b: [0, -0.05, 0.06], accent: true }, { a: [1, 0.65, 0.06], b: [0, -0.05, 0.06], accent: true }];
  return (t) => {
    const up = Math.max(0, Math.sin(t * 0.9)) * 0.7;
    const letter = polyline([[-0.8, 0.55 + up, 0], [0.8, 0.55 + up, 0], [0.8, -0.4 + up, 0], [-0.8, -0.4 + up, 0]], false, true);
    const text = [0.35, 0.2, 0.05].map((y) => ({ a: [-0.6, y + up, 0] as V3, b: [0.6 - (y === 0.05 ? 0.4 : 0), y + up, 0] as V3 }));
    return { lines: [...base, ...flap, ...(up > 0.05 ? [...letter, ...text] : [])], dots: [] };
  };
}

export const models = { globe, padlock, neural, servers, code: codeBrackets, chip, mortarboard, envelope } as const;
export type ModelName = keyof typeof models;

/** Initial orientation per model (radians). */
const startPose: Partial<Record<ModelName, { y: number; x: number }>> = {
  globe: { y: -rad(ELDORET.lon), x: 0.2 },
  chip: { y: 0.6, x: 0.55 },
  mortarboard: { y: 0.4, x: 0.35 },
  servers: { y: -0.5, x: 0.25 },
};

// ---------- Renderer ----------

let colors = { fg: '236 235 228', accent: '255 91 20' };
const hexToRgb = (hex: string) => {
  const h = hex.trim().replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};
function readColors() {
  const cs = getComputedStyle(document.documentElement);
  colors = { fg: hexToRgb(cs.getPropertyValue('--text')), accent: hexToRgb(cs.getPropertyValue('--accent')) };
}

let themeObserved = false;
const redrawers = new Set<() => void>();

export function mountWireframe(canvas: HTMLCanvasElement, name: ModelName, opts: { speed?: number; zoom?: number } = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const model = models[name]();
  const speed = opts.speed ?? 0.25;
  const zoom = opts.zoom ?? 1;
  const pose = startPose[name] ?? { y: 0.5, x: 0.3 };

  if (!themeObserved) {
    themeObserved = true;
    readColors();
    new MutationObserver(() => {
      readColors();
      redrawers.forEach((r) => r());
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  let rotY = pose.y, rotX = pose.x;
  let tiltX = 0, tiltY = 0, targetTiltX = 0, targetTiltY = 0;
  let spin = speed; // radians per second, eases back after drags
  let t = 0;
  let w = 0, h = 0, dpr = 1;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    draw();
  };

  const project = (p: V3): [number, number, number] => {
    const ay = rotY + tiltY, ax = rotX + tiltX;
    const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
    const x1 = p[0] * cy + p[2] * sy;
    const z1 = -p[0] * sy + p[2] * cy;
    const y2 = p[1] * cx - z1 * sx;
    const z2 = p[1] * sx + z1 * cx;
    const D = 4.2;
    const s = (D / (D - z2)) * Math.min(w, h) * 0.34 * zoom;
    return [w / 2 + x1 * s, h / 2 - y2 * s, z2];
  };

  // Nearer geometry is drawn brighter, which sells the depth.
  const alphaFor = (z: number) => Math.max(0.12, Math.min(1, 0.55 + z * 0.35));

  function draw() {
    if (!w || !h) return;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, w, h);
    const frame = model(t);
    ctx!.lineWidth = 1;
    ctx!.lineCap = 'round';
    for (const seg of frame.lines) {
      const a = project(seg.a), b = project(seg.b);
      const alpha = alphaFor((a[2] + b[2]) / 2) * (seg.accent ? 0.95 : 0.55);
      ctx!.strokeStyle = `rgb(${seg.accent ? colors.accent : colors.fg} / ${alpha})`;
      ctx!.beginPath();
      ctx!.moveTo(a[0], a[1]);
      ctx!.lineTo(b[0], b[1]);
      ctx!.stroke();
    }
    for (const d of frame.dots) {
      const p = project(d.p);
      ctx!.fillStyle = `rgb(${d.accent ? colors.accent : colors.fg} / ${alphaFor(p[2])})`;
      ctx!.beginPath();
      ctx!.arc(p[0], p[1], d.r ?? 2, 0, TAU);
      ctx!.fill();
    }
  }
  redrawers.add(draw);

  new ResizeObserver(resize).observe(canvas);
  resize();

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ---- Animation, only while visible ----
  let raf = 0, last = 0, visible = false;
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    t += dt;
    rotY += spin * dt;
    spin += (speed - spin) * 0.02;
    tiltX += (targetTiltX - tiltX) * 0.08;
    tiltY += (targetTiltY - tiltY) * 0.08;
    draw();
  };
  const sync = () => {
    cancelAnimationFrame(raf);
    last = 0;
    if (visible && !document.hidden) raf = requestAnimationFrame(loop);
  };
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    sync();
  }).observe(canvas);
  document.addEventListener('visibilitychange', sync);

  // ---- Interaction: hover tilts, drag spins ----
  const host = canvas.parentElement ?? canvas;
  let dragging = false, px = 0;
  host.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    targetTiltY = ((e.clientX - r.left) / r.width - 0.5) * 0.5;
    targetTiltX = ((e.clientY - r.top) / r.height - 0.5) * 0.4;
    if (dragging) {
      spin = (e.clientX - px) * 0.25;
      px = e.clientX;
    }
  });
  host.addEventListener('pointerleave', () => (targetTiltX = targetTiltY = 0));
  host.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return; // let touch scroll the page
    dragging = true;
    px = e.clientX;
  });
  window.addEventListener('pointerup', () => (dragging = false));
}
