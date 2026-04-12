export function initGlobe() {
  const container = document.getElementById('globe-container');
  if (!container) return;

  const size = Math.min(500, Math.floor(window.innerWidth * 0.9));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(25, 1, 0.1, 100);
  camera.position.z = 12;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(size, size);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const texture = new THREE.TextureLoader().load('assets/img/earth-night.jpg');
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const geometry = new THREE.SphereGeometry(2, 64, 64);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    emissiveMap: texture,
    emissive: new THREE.Color(0xffddaa),
    emissiveIntensity: 0.6,
    roughness: 1,
    metalness: 0
  });
  const earth = new THREE.Mesh(geometry, material);
  earth.rotation.x = 0.25;
  scene.add(earth);

  const keyLight = new THREE.DirectionalLight(0x8fd3ff, 1.4);
  keyLight.position.set(-5, 2, 3);
  scene.add(keyLight);
  scene.add(new THREE.AmbientLight(0x223355, 0.4));

  let scrollBoost = 0;
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    const delta = Math.abs(window.scrollY - lastScrollY);
    lastScrollY = window.scrollY;
    scrollBoost = Math.min(scrollBoost + delta * 0.0015, 0.15);
  }, { passive: true });

  function onResize() {
    const s = Math.min(500, Math.floor(window.innerWidth * 0.9));
    renderer.setSize(s, s);
  }
  window.addEventListener('resize', onResize);

  function animate() {
    requestAnimationFrame(animate);
    earth.rotation.y += 0.0015 + scrollBoost;
    scrollBoost *= 0.52;
    renderer.render(scene, camera);
  }
  animate();
}
