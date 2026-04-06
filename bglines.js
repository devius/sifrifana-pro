/**
 * Background Lines — scroll-reactive wavy lines
 * Based on Cuberto bglines (MIT) — https://github.com/Cuberto/bglines
 *
 * Ported to BufferGeometry (Three.js v0.140+), removed displacement texture,
 * simplified scroll binding (no GSAP), customized for Sifrifana Pro.
 */

import {
  WebGLRenderer, OrthographicCamera, Scene, Clock,
  ShaderMaterial, Vector4, BufferGeometry, Float32BufferAttribute, Line
} from './three.module.js';

const vertexShader = `
  uniform float time;
  uniform float scroll;
  uniform float speed;
  uniform float segments;
  uniform float intensity;
  void main() {
    vec4 pos = modelMatrix * vec4(position, 1.0);
    float phase = pos.y - scroll * 0.002;
    float func1 = cos(phase * segments * 0.001) * (1.0 + intensity * cos(time * speed));
    float func2 = sin(phase * segments * 0.001) * (1.0 + intensity * sin(time * speed));
    pos.x += mix(func1, func2, (pos.x + 10.0) / 20.0 * sin(time * speed));
    gl_Position = projectionMatrix * viewMatrix * pos;
  }
`;

const fragmentShader = `
  uniform vec4 color;
  void main() {
    gl_FragColor = color;
  }
`;

export default class BgLines {
  constructor(canvas, options) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.options = Object.assign({}, {
      color: [0.176, 0.384, 0.549, 0.25],
      speed: 0.7,
      density: 30,
      lines: 20,
      scale: 15,
      position: 0,
      segments: 2,
      intensity: 10,
    }, options);

    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 0);

    const posOffset = width * this.options.position / 10;
    this.camera = new OrthographicCamera(
      -width / this.options.scale - posOffset,
       width / this.options.scale - posOffset,
       1000, -1000, 1, 100
    );

    this.scene = new Scene();
    this.clock = new Clock();
    this.time = 0;

    this.material = new ShaderMaterial({
      uniforms: {
        time:      { value: 0 },
        scroll:    { value: 0 },
        color:     { value: new Vector4(...this.options.color) },
        speed:     { value: this.options.speed },
        segments:  { value: this.options.segments },
        intensity: { value: this.options.intensity },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
    });

    /* Create line meshes using BufferGeometry */
    const half = this.options.lines / 2;
    for (let y = -half; y < half; y += 1) {
      const positions = [];
      const yPos = y * this.options.density;
      for (let x = -200; x <= 200; x++) {
        positions.push(x, yPos, -30);
      }

      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
      this.scene.add(new Line(geometry, this.material));
    }

    /* Scroll binding */
    this.scrollTarget = 0;
    this.scrollCurrent = 0;
    window.addEventListener('scroll', () => {
      this.scrollTarget = window.scrollY;
    }, { passive: true });

    window.addEventListener('resize', () => this.setSizes(), false);
    this.render();
  }

  setSizes() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const posOffset = width * this.options.position / 10;

    this.camera.left  = -width / this.options.scale - posOffset;
    this.camera.right =  width / this.options.scale - posOffset;
    this.renderer.setSize(width, height);
    this.camera.updateProjectionMatrix();
  }

  render() {
    /* Smooth scroll lerp */
    this.scrollCurrent += (this.scrollTarget - this.scrollCurrent) * 0.08;

    this.time += this.clock.getDelta();
    this.material.uniforms.time.value = this.time;
    this.material.uniforms.scroll.value = this.scrollCurrent;
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.render());
  }
}
