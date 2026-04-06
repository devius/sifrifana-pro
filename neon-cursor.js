/**
 * Neon 3D Tubes cursor trail — customized for Sifrifana Pro
 * Based on threejs-toys neonCursor by soju22 / klevron (MIT)
 * Original: https://github.com/klevron/threejs-toys
 *
 * Modifications from original:
 * - Transparent canvas with alpha blending (tubes render over page bg)
 * - Navy-blue-based color cycling (blue ↔ cyan) instead of magenta ↔ blue
 * - Touch + scroll support for mobile/iPad
 * - Idle animation orbits around section content areas
 * - Click-to-randomize disabled
 * - De-minified and self-contained (no external threejs-toys dependency)
 */

import {
  Vector2, WebGLRenderer, OrthographicCamera, Scene,
  SplineCurve, Vector3, Color, PlaneGeometry, ShaderMaterial, Mesh
} from './three.module.js';

/* ── Pointer + touch helper ── */
function setupInput({ domElement, onMove, onLeave }) {
  const position = new Vector2();
  const nPosition = new Vector2();
  const lastPosition = new Vector2();
  const delta = new Vector2();
  const state = { position, nPosition, active: false };

  function updateFromClient(clientX, clientY) {
    const rect = domElement.getBoundingClientRect();
    position.x = clientX - rect.left;
    position.y = clientY - rect.top;
    nPosition.x = (position.x / rect.width) * 2 - 1;
    nPosition.y = -(position.y / rect.height) * 2 + 1;
  }

  function handleMove(clientX, clientY) {
    updateFromClient(clientX, clientY);
    delta.copy(position).sub(lastPosition);
    state.active = true;
    onMove({ position, nPosition, delta });
    lastPosition.copy(position);
  }

  /* Pointer events (desktop) */
  domElement.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return; // handled by touch events
    handleMove(e.clientX, e.clientY);
  });

  domElement.addEventListener('pointerleave', e => {
    if (e.pointerType === 'touch') return;
    state.active = false;
    onLeave();
  });

  /* Touch events (iPad / mobile) */
  domElement.addEventListener('touchstart', e => {
    const t = e.touches[0];
    lastPosition.set(t.clientX - domElement.getBoundingClientRect().left,
                     t.clientY - domElement.getBoundingClientRect().top);
    handleMove(t.clientX, t.clientY);
  }, { passive: true });

  domElement.addEventListener('touchmove', e => {
    const t = e.touches[0];
    handleMove(t.clientX, t.clientY);
  }, { passive: true });

  domElement.addEventListener('touchend', () => {
    state.active = false;
    onLeave();
  }, { passive: true });

  /* Also track scroll as movement (makes idle tube react to scroll) */
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    const dy = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;
    if (!state.active && Math.abs(dy) > 2) {
      // Nudge the trail head based on scroll direction
      const rect = domElement.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      updateFromClient(cx, cy - dy * 2);
      delta.set(0, -dy * 2);
      state.active = true;
      onMove({ position, nPosition, delta });
      lastPosition.copy(position);
      // Return to idle after a short pause
      clearTimeout(state._scrollTimer);
      state._scrollTimer = setTimeout(() => {
        state.active = false;
        onLeave();
      }, 300);
    }
  }, { passive: true });

  return state;
}

/* ── Shader sources ── */
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

function fragmentShader(shaderPoints) {
  return `
    // Signed distance to a quadratic bezier
    // https://www.shadertoy.com/view/wdy3DD
    float sdBezier(vec2 pos, vec2 A, vec2 B, vec2 C) {
      vec2 a = B - A;
      vec2 b = A - 2.0*B + C;
      vec2 c = a * 2.0;
      vec2 d = A - pos;
      float kk = 1.0 / dot(b,b);
      float kx = kk * dot(a,b);
      float ky = kk * (2.0*dot(a,a)+dot(d,b)) / 3.0;
      float kz = kk * dot(d,a);
      float res = 0.0;
      float p = ky - kx*kx;
      float p3 = p*p*p;
      float q = kx*(2.0*kx*kx - 3.0*ky) + kz;
      float h = q*q + 4.0*p3;
      if (h >= 0.0) {
        h = sqrt(h);
        vec2 x = (vec2(h, -h) - q) / 2.0;
        vec2 uv = sign(x)*pow(abs(x), vec2(1.0/3.0));
        float t = clamp(uv.x + uv.y - kx, 0.0, 1.0);
        vec2 qos = d + (c + b*t)*t;
        res = length(qos);
      } else {
        float z = sqrt(-p);
        float v = acos(q/(p*z*2.0)) / 3.0;
        float m = cos(v);
        float n = sin(v)*1.732050808;
        vec3 t = clamp(vec3(m+m, -n-m, n-m)*z - kx, 0.0, 1.0);
        vec2 qos = d + (c + b*t.x)*t.x;
        float dis = dot(qos,qos);
        res = dis;
        qos = d + (c + b*t.y)*t.y;
        dis = dot(qos,qos);
        res = min(res, dis);
        qos = d + (c + b*t.z)*t.z;
        dis = dot(qos,qos);
        res = min(res, dis);
        res = sqrt(res);
      }
      return res;
    }

    uniform vec2 uRatio;
    uniform vec2 uSize;
    uniform vec2 uPoints[${shaderPoints}];
    uniform vec3 uColor;
    varying vec2 vUv;

    void main() {
      float intensity = 1.0;
      vec2 pos = (vUv - 0.5) * uRatio;

      vec2 c = (uPoints[0] + uPoints[1]) / 2.0;
      vec2 c_prev;
      float dist = 10000.0;
      for (int i = 0; i < ${shaderPoints} - 1; i++) {
        c_prev = c;
        c = (uPoints[i] + uPoints[i + 1]) / 2.0;
        dist = min(dist, sdBezier(pos, c_prev, uPoints[i], c));
      }
      dist = max(0.0, dist);

      float glow = pow(uSize.y / dist, intensity);
      vec3 col = vec3(0.0);
      col += 10.0 * vec3(smoothstep(uSize.x, 0.0, dist));
      col += glow * uColor;

      // Cut off faint glow that would tint the whole background
      float brightness = max(col.r, max(col.g, col.b));
      col *= smoothstep(0.08, 0.3, brightness);

      // Tone mapping
      col = 1.0 - exp(-col);
      col = pow(col, vec3(0.4545));

      // Alpha from brightness — fully transparent where there is no tube
      float alpha = max(col.r, max(col.g, col.b));
      alpha = smoothstep(0.05, 0.25, alpha);
      gl_FragColor = vec4(col, alpha);
    }
  `;
}

/* ── Main setup ── */
export function initNeonCursor(el, opts = {}) {
  const config = {
    shaderPoints: 16,
    curvePoints: 80,
    curveLerp: 0.5,
    radius1: 3,
    radius2: 15,
    velocityTreshold: 10,
    sleepRadiusX: 200,
    sleepRadiusY: 200,
    sleepTimeCoefX: 0.002,
    sleepTimeCoefY: 0.0015,
    ...opts,
  };

  /* Curve points for the trail */
  const curvePointsArr = new Array(config.curvePoints).fill(0).map(() => new Vector2());
  const spline = new SplineCurve(curvePointsArr);

  /* Velocity tracking */
  const velocity = new Vector3();
  const targetVelocity = new Vector3();
  let pointerActive = false;

  /* Shader uniforms */
  const uRatio = { value: new Vector2() };
  const uSize = { value: new Vector2() };
  const uPoints = { value: new Array(config.shaderPoints).fill(0).map(() => new Vector2()) };
  const uColor = { value: new Color(0x2D628C) };

  /* Renderer (with alpha for transparency) */
  const canvas = document.createElement('canvas');
  el.appendChild(canvas);

  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true });
  renderer.setClearColor(0x000000, 0);

  /* Camera & scene */
  const camera = new OrthographicCamera();
  const scene = new Scene();

  const geometry = new PlaneGeometry(2, 2);
  const material = new ShaderMaterial({
    uniforms: { uRatio, uSize, uPoints, uColor },
    vertexShader,
    fragmentShader: fragmentShader(config.shaderPoints),
    transparent: true,
  });
  scene.add(new Mesh(geometry, material));

  /* Sizing */
  let width = 0, height = 0;

  function resize() {
    width = el.clientWidth;
    height = el.clientHeight;
    renderer.setSize(width, height);
    camera.updateProjectionMatrix();
    uSize.value.set(config.radius1, config.radius2);
    if (width >= height) {
      uRatio.value.set(1, height / width);
      uSize.value.multiplyScalar(1 / width);
    } else {
      uRatio.value.set(width / height, 1);
      uSize.value.multiplyScalar(1 / height);
    }
  }
  resize();
  window.addEventListener('resize', resize);

  /* Input — listen on document so touch/pointer works through content layers */
  setupInput({
    domElement: document.documentElement,
    onMove({ nPosition, delta }) {
      pointerActive = true;
      const px = 0.5 * nPosition.x * uRatio.value.x;
      const py = 0.5 * nPosition.y * uRatio.value.y;
      spline.points[0].set(px, py);
      targetVelocity.x = Math.min(velocity.x + Math.abs(delta.x) / config.velocityTreshold, 1);
      targetVelocity.y = Math.min(velocity.y + Math.abs(delta.y) / config.velocityTreshold, 1);
      targetVelocity.z = Math.sqrt(targetVelocity.x ** 2 + targetVelocity.y ** 2);
      velocity.lerp(targetVelocity, 0.05);
    },
    onLeave() {
      pointerActive = false;
    },
  });

  /* Render loop */
  const startTime = performance.now();

  function render() {
    const time = performance.now() - startTime;

    /* Lerp trail points toward the head */
    for (let i = 1; i < config.curvePoints; i++) {
      curvePointsArr[i].lerp(curvePointsArr[i - 1], config.curveLerp);
    }

    /* Sample spline into shader uniform points */
    for (let i = 0; i < config.shaderPoints; i++) {
      spline.getPoint(i / (config.shaderPoints - 1), uPoints.value[i]);
    }

    /* Idle animation: gentle orbit when pointer is away */
    if (!pointerActive) {
      const cx = time * config.sleepTimeCoefX;
      const cy = time * config.sleepTimeCoefY;
      const rx = config.sleepRadiusX * (uRatio.value.x > 1 ? 1 : uRatio.value.x) / width * uRatio.value.x;
      const ry = config.sleepRadiusY * (uRatio.value.y > 1 ? 1 : uRatio.value.y) / height * uRatio.value.y;
      spline.points[0].set(rx * Math.cos(cx), ry * Math.sin(cy));

      /* Slow color cycle in idle: navy blue ↔ cyan */
      const t = time * 0.0008;
      const r = 0.10 + 0.08 * Math.cos(t);
      const g = 0.35 + 0.15 * Math.sin(t * 0.7);
      const b = 0.55 + 0.15 * Math.cos(t * 0.5);
      uColor.value.setRGB(r, g, b);
    }

    /* Active: velocity-based color intensity (brighter when moving fast) */
    if (pointerActive) {
      const v = velocity.z;
      const r = 0.10 + 0.15 * v;
      const g = 0.35 + 0.20 * v;
      const b = 0.55 + 0.25 * v;
      uColor.value.setRGB(r, g, b);
      velocity.multiplyScalar(0.95);
    }

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
