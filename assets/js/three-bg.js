export function initBackground() {
      const canvas = document.getElementById('webgl-bg');
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x00020a, 0.0012); // Deep navy fog

      const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 3000);
      camera.position.z = 0;

      // Particle texture (Soft glowing circle)
      function createParticleTexture() {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
        grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
        return new THREE.CanvasTexture(canvas);
      }

      const pTexture = createParticleTexture();

      // "Light painting" logic: Fewer moving heads, but each leaves a long fading tail.
      const headCount = 40; // Drastically fewer particles!
      const tailLength = 45; // Length of the light painting trail
      const particleCount = headCount * tailLength; // Total vertices 

      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      const color1 = new THREE.Color(0xff0066); // Neon pink
      const color2 = new THREE.Color(0x00ccff); // Neon cyan
      const color3 = new THREE.Color(0x9900ff); // Purple

      const tunnelLength = 2000;
      const tunnelRadius = 500; // Wide tunnel to keep content far from center

      const heads = [];

      for (let i = 0; i < headCount; i++) {
        const z = -Math.random() * tunnelLength;
        const angle = Math.random() * Math.PI * 2;
        const r = tunnelRadius + (Math.random() - 0.5) * 300; // Wider edge distribution

        // Store logical head parameters
        heads.push({
          z: z,
          angle: angle,
          r: r,
          offsetPhase: Math.random() * 1000,
          speedMultiplier: Math.random() * 0.4 + 0.8 // slightly varied speeds
        });

        const mixRatio = Math.abs(z / tunnelLength);
        let finalColor = new THREE.Color().copy(color1).lerp(color2, mixRatio);
        if (Math.random() > 0.8) finalColor = color3;

        // Initialize tail vertices
        for (let t = 0; t < tailLength; t++) {
          const idx = i * tailLength + t;

          // Initial setup groups all tail particles at the head (they will sprawl out as it moves)
          positions[idx * 3] = 0;
          positions[idx * 3 + 1] = 0;
          positions[idx * 3 + 2] = 0;

          // Fade tail colors for light painting trails
          const fade = 1.0 - (t / tailLength); // 1.0 at front, 0.0 at end
          colors[idx * 3] = finalColor.r * fade;
          colors[idx * 3 + 1] = finalColor.g * fade;
          colors[idx * 3 + 2] = finalColor.b * fade;
        }
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 20,
        map: pTexture,
        transparent: true,
        opacity: 0.4,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const particleSystem = new THREE.Points(geometry, material);
      scene.add(particleSystem);

      // Mouse interactivity (Parallax)
      let targetX = 0;
      let targetY = 0;
      window.addEventListener('mousemove', (e) => {
        targetX = (e.clientX - window.innerWidth / 2) * 0.0003;
        targetY = (e.clientY - window.innerHeight / 2) * 0.0003;
      });

      // Scroll interactivity (Warp Speed)
      let scrollSpeed = 0;
      let lastScrollY = window.scrollY;
      window.addEventListener('scroll', () => {
        const delta = window.scrollY - lastScrollY;
        scrollSpeed = delta * 0.6;
        lastScrollY = window.scrollY;
      }, { passive: true });

      const clock = new THREE.Clock();

      function animateBg() {
        requestAnimationFrame(animateBg);
        const dt = clock.getDelta();

        // Smooth camera rotation
        camera.rotation.y += 0.05 * (-targetX - camera.rotation.y);
        camera.rotation.x += 0.05 * (-targetY - camera.rotation.x);

        // Dynamic movement speed
        const baseSpeed = 120 * dt; // slightly faster base speed looks good for trails
        const currentSpeed = baseSpeed + (scrollSpeed * dt * 50);
        scrollSpeed *= 0.9; // Friction

        const pos = particleSystem.geometry.attributes.position.array;

        for (let i = 0; i < headCount; i++) {
          const head = heads[i];

          // Move head
          head.z += currentSpeed * head.speedMultiplier;

          const baseIdx = i * tailLength * 3;

          // Wrap-around safely behind camera so they don't pop or glitter
          if (head.z > 50) {
            head.z -= tunnelLength;
            head.angle = Math.random() * Math.PI * 2;
            head.r = tunnelRadius + (Math.random() - 0.5) * 300;

            // Hide entire tail momentarily to prevent stretching artifacts
            for (let t = 0; t < tailLength; t++) {
              const idx = baseIdx + (t * 3);
              pos[idx] = 9999;
              pos[idx + 1] = 9999;
              pos[idx + 2] = 9999;
            }
          } else if (head.z < -tunnelLength) {
            head.z += tunnelLength;
          }

          // Calculate current head physics position
          const pathOffsetX = Math.sin(head.z * 0.002 + head.offsetPhase) * 150;
          const pathOffsetY = Math.cos(head.z * 0.0015 + head.offsetPhase) * 150;
          const currentX = Math.cos(head.angle) * head.r + pathOffsetX;
          const currentY = Math.sin(head.angle) * head.r + pathOffsetY;

          // Shift the tail (each point takes the place of the one before it)
          for (let t = tailLength - 1; t > 0; t--) {
            const currentIdx = baseIdx + (t * 3);
            const prevIdx = baseIdx + ((t - 1) * 3);

            pos[currentIdx] = pos[prevIdx];
            pos[currentIdx + 1] = pos[prevIdx + 1];
            pos[currentIdx + 2] = pos[prevIdx + 2];
          }

          // Set new head position
          pos[baseIdx] = currentX;
          pos[baseIdx + 1] = currentY;
          pos[baseIdx + 2] = head.z;
        }

        particleSystem.geometry.attributes.position.needsUpdate = true;
        particleSystem.rotation.z += 0.0005;

        renderer.render(scene, camera);
      }
      animateBg();

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });

}
