export function initSoftwareCubes() {
  // --- Premiere Pro 3D Box ---
      const prContainer = document.getElementById('premiere-box-container');
      if (prContainer) {
        const prScene = new THREE.Scene();
        const prCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        prCamera.position.z = 4.8;

        const prRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        prRenderer.setSize(140, 140);
        prRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        prContainer.appendChild(prRenderer.domElement);

        const prLight = new THREE.DirectionalLight(0xffffff, 1.2);
        prLight.position.set(2, 3, 5);
        prScene.add(prLight);
        prScene.add(new THREE.AmbientLight(0xffffff, 0.6));

        const prTexture = new THREE.TextureLoader().load('assets/img/software/premiere.png');
        prTexture.anisotropy = prRenderer.capabilities.getMaxAnisotropy();

        // Create a cube and map texture to all 6 sides
        const prGeometry = new THREE.BoxGeometry(2, 2, 2);
        const prMaterial = new THREE.MeshStandardMaterial({
          map: prTexture,
          roughness: 0.3,
          metalness: 0.2
        });

        const prCube = new THREE.Mesh(prGeometry, prMaterial);
        prScene.add(prCube);

        let prIsDragging = false;
        let prTargetRotationX = Math.PI / 6;
        let prTargetRotationY = -Math.PI / 6;
        let prTime = 0;
        let prPrevPos = { x: 0, y: 0 };

        function onPointerDownPr(e) {
          prIsDragging = true;
          const clientX = e.touches ? e.touches[0].clientX : e.clientX;
          const clientY = e.touches ? e.touches[0].clientY : e.clientY;
          prPrevPos = { x: clientX, y: clientY };
        }
        function onPointerUpPr() { prIsDragging = false; }
        function onPointerMovePr(e) {
          if (!prIsDragging) return;
          const clientX = e.touches ? e.touches[0].clientX : e.clientX;
          const clientY = e.touches ? e.touches[0].clientY : e.clientY;
          const deltaX = clientX - prPrevPos.x;
          const deltaY = clientY - prPrevPos.y;
          prTargetRotationY += deltaX * 0.015;
          prTargetRotationX += deltaY * 0.015;
          prPrevPos = { x: clientX, y: clientY };
        }

        prContainer.addEventListener('mousedown', onPointerDownPr);
        window.addEventListener('mouseup', onPointerUpPr);
        window.addEventListener('mousemove', onPointerMovePr);
        prContainer.addEventListener('touchstart', onPointerDownPr, { passive: true });
        window.addEventListener('touchend', onPointerUpPr);
        window.addEventListener('touchmove', onPointerMovePr, { passive: true });

        function animatePr() {
          requestAnimationFrame(animatePr);
          prTime += 0.02;
          let idleOffsetX = 0;
          let idleOffsetY = 0;
          if (!prIsDragging) {
            idleOffsetY = Math.sin(prTime * 1.1) * 0.15;
            idleOffsetX = Math.cos(prTime * 0.9) * 0.1;
          }
          prCube.rotation.x += ((prTargetRotationX + idleOffsetX) - prCube.rotation.x) * 0.12;
          prCube.rotation.y += ((prTargetRotationY + idleOffsetY) - prCube.rotation.y) * 0.12;

          prRenderer.render(prScene, prCamera);
        }
        animatePr();

        function resizePr() {
          const isMobile = window.innerWidth <= 600;
          const w = isMobile ? 120 : 160;
          prContainer.style.width = w + 'px';
          prContainer.style.height = w + 'px';
          prRenderer.setSize(w, w);
        }
        window.addEventListener('resize', resizePr);
        resizePr();
      }

      // --- Lightroom 3D Box ---
      const lrContainer = document.getElementById('lr-box-container');
      if (lrContainer) {
        const lrScene = new THREE.Scene();
        const lrCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        lrCamera.position.z = 4.8;

        const lrRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        lrRenderer.setSize(140, 140);
        lrRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        lrContainer.appendChild(lrRenderer.domElement);

        const lrLight = new THREE.DirectionalLight(0xffffff, 1.2);
        lrLight.position.set(-2, 3, 5); // Angle light from the top-left
        lrScene.add(lrLight);
        lrScene.add(new THREE.AmbientLight(0xffffff, 0.6));

        const lrTexture = new THREE.TextureLoader().load('assets/img/software/lightroom.png');
        lrTexture.anisotropy = lrRenderer.capabilities.getMaxAnisotropy();

        // Create a cube and map texture to all 6 sides
        const lrGeometry = new THREE.BoxGeometry(2, 2, 2);
        const lrMaterial = new THREE.MeshStandardMaterial({
          map: lrTexture,
          roughness: 0.3,
          metalness: 0.2
        });

        const lrCube = new THREE.Mesh(lrGeometry, lrMaterial);
        lrScene.add(lrCube);

        let lrIsDragging = false;
        let lrTargetRotationX = -Math.PI / 8;
        let lrTargetRotationY = Math.PI / 5;
        let lrTime = 100;
        let lrPrevPos = { x: 0, y: 0 };

        function onPointerDownLr(e) {
          lrIsDragging = true;
          const clientX = e.touches ? e.touches[0].clientX : e.clientX;
          const clientY = e.touches ? e.touches[0].clientY : e.clientY;
          lrPrevPos = { x: clientX, y: clientY };
        }
        function onPointerUpLr() { lrIsDragging = false; }
        function onPointerMoveLr(e) {
          if (!lrIsDragging) return;
          const clientX = e.touches ? e.touches[0].clientX : e.clientX;
          const clientY = e.touches ? e.touches[0].clientY : e.clientY;
          const deltaX = clientX - lrPrevPos.x;
          const deltaY = clientY - lrPrevPos.y;
          lrTargetRotationY += deltaX * 0.015;
          lrTargetRotationX += deltaY * 0.015;
          lrPrevPos = { x: clientX, y: clientY };
        }

        lrContainer.addEventListener('mousedown', onPointerDownLr);
        window.addEventListener('mouseup', onPointerUpLr);
        window.addEventListener('mousemove', onPointerMoveLr);
        lrContainer.addEventListener('touchstart', onPointerDownLr, { passive: true });
        window.addEventListener('touchend', onPointerUpLr);
        window.addEventListener('touchmove', onPointerMoveLr, { passive: true });

        function animateLr() {
          requestAnimationFrame(animateLr);
          lrTime += 0.02;
          let idleOffsetX = 0;
          let idleOffsetY = 0;
          if (!lrIsDragging) {
            idleOffsetY = Math.sin(lrTime * 1.1) * 0.15;
            idleOffsetX = Math.cos(lrTime * 0.9) * 0.1;
          }
          lrCube.rotation.x += ((lrTargetRotationX + idleOffsetX) - lrCube.rotation.x) * 0.12;
          lrCube.rotation.y += ((lrTargetRotationY + idleOffsetY) - lrCube.rotation.y) * 0.12;

          lrRenderer.render(lrScene, lrCamera);
        }
        animateLr();

        function resizeLr() {
          const isMobile = window.innerWidth <= 600;
          const w = isMobile ? 120 : 160;
          lrContainer.style.width = w + 'px';
          lrContainer.style.height = w + 'px';
          lrRenderer.setSize(w, w);
        }
        window.addEventListener('resize', resizeLr);
        resizeLr();
      }

      // --- Photoshop 3D Box ---
      const psContainer = document.getElementById('ps-box-container');
      if (psContainer) {
        const psScene = new THREE.Scene();
        const psCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        psCamera.position.z = 4.8;

        const psRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        psRenderer.setSize(140, 140);
        psRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        psContainer.appendChild(psRenderer.domElement);

        const psLight = new THREE.DirectionalLight(0xffffff, 1.2);
        psLight.position.set(0, 3, 5); // Angle light from top-center
        psScene.add(psLight);
        psScene.add(new THREE.AmbientLight(0xffffff, 0.6));

        const psTexture = new THREE.TextureLoader().load('assets/img/software/photoshop.png');
        psTexture.anisotropy = psRenderer.capabilities.getMaxAnisotropy();

        // Create a cube and map texture to all 6 sides
        const psGeometry = new THREE.BoxGeometry(2, 2, 2);
        const psMaterial = new THREE.MeshStandardMaterial({
          map: psTexture,
          roughness: 0.3,
          metalness: 0.2
        });

        const psCube = new THREE.Mesh(psGeometry, psMaterial);
        psScene.add(psCube);

        let psIsDragging = false;
        let psTargetRotationX = Math.PI / 8;
        let psTargetRotationY = Math.PI / 8;
        let psTime = 200;
        let psPrevPos = { x: 0, y: 0 };

        function onPointerDownPs(e) {
          psIsDragging = true;
          const clientX = e.touches ? e.touches[0].clientX : e.clientX;
          const clientY = e.touches ? e.touches[0].clientY : e.clientY;
          psPrevPos = { x: clientX, y: clientY };
        }
        function onPointerUpPs() { psIsDragging = false; }
        function onPointerMovePs(e) {
          if (!psIsDragging) return;
          const clientX = e.touches ? e.touches[0].clientX : e.clientX;
          const clientY = e.touches ? e.touches[0].clientY : e.clientY;
          const deltaX = clientX - psPrevPos.x;
          const deltaY = clientY - psPrevPos.y;
          psTargetRotationY += deltaX * 0.015;
          psTargetRotationX += deltaY * 0.015;
          psPrevPos = { x: clientX, y: clientY };
        }

        psContainer.addEventListener('mousedown', onPointerDownPs);
        window.addEventListener('mouseup', onPointerUpPs);
        window.addEventListener('mousemove', onPointerMovePs);
        psContainer.addEventListener('touchstart', onPointerDownPs, { passive: true });
        window.addEventListener('touchend', onPointerUpPs);
        window.addEventListener('touchmove', onPointerMovePs, { passive: true });

        function animatePs() {
          requestAnimationFrame(animatePs);
          psTime += 0.02;
          let idleOffsetX = 0;
          let idleOffsetY = 0;
          if (!psIsDragging) {
            idleOffsetY = Math.sin(psTime * 1.1) * 0.15;
            idleOffsetX = Math.cos(psTime * 0.9) * 0.1;
          }
          psCube.rotation.x += ((psTargetRotationX + idleOffsetX) - psCube.rotation.x) * 0.12;
          psCube.rotation.y += ((psTargetRotationY + idleOffsetY) - psCube.rotation.y) * 0.12;

          psRenderer.render(psScene, psCamera);
        }
        animatePs();

        function resizePs() {
          const isMobile = window.innerWidth <= 600;
          const w = isMobile ? 120 : 160;
          psContainer.style.width = w + 'px';
          psContainer.style.height = w + 'px';
          psRenderer.setSize(w, w);
        }
        window.addEventListener('resize', resizePs);
        resizePs();
      }

      // --- CapCut 3D Box ---
      const ccContainer = document.getElementById('cc-box-container');
      if (ccContainer) {
        const ccScene = new THREE.Scene();
        const ccCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        ccCamera.position.z = 4.8;

        const ccRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        ccRenderer.setSize(140, 140);
        ccRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        ccContainer.appendChild(ccRenderer.domElement);

        const ccLight = new THREE.DirectionalLight(0xffffff, 1.2);
        ccLight.position.set(0, -3, 5); // Light from bottom-center
        ccScene.add(ccLight);
        ccScene.add(new THREE.AmbientLight(0xffffff, 0.6));

        const ccTexture = new THREE.TextureLoader().load('assets/img/software/capcut.png');
        ccTexture.anisotropy = ccRenderer.capabilities.getMaxAnisotropy();

        const ccGeometry = new THREE.BoxGeometry(2, 2, 2);
        const ccMaterial = new THREE.MeshStandardMaterial({
          map: ccTexture,
          roughness: 0.3,
          metalness: 0.2
        });

        const ccCube = new THREE.Mesh(ccGeometry, ccMaterial);
        ccScene.add(ccCube);

        let ccIsDragging = false;
        let ccTargetRotationX = Math.PI / 6;
        let ccTargetRotationY = Math.PI / 6;
        let ccTime = 300;
        let ccPrevPos = { x: 0, y: 0 };

        function onPointerDownCc(e) {
          ccIsDragging = true;
          const clientX = e.touches ? e.touches[0].clientX : e.clientX;
          const clientY = e.touches ? e.touches[0].clientY : e.clientY;
          ccPrevPos = { x: clientX, y: clientY };
        }
        function onPointerUpCc() { ccIsDragging = false; }
        function onPointerMoveCc(e) {
          if (!ccIsDragging) return;
          const clientX = e.touches ? e.touches[0].clientX : e.clientX;
          const clientY = e.touches ? e.touches[0].clientY : e.clientY;
          const deltaX = clientX - ccPrevPos.x;
          const deltaY = clientY - ccPrevPos.y;
          ccTargetRotationY += deltaX * 0.015;
          ccTargetRotationX += deltaY * 0.015;
          ccPrevPos = { x: clientX, y: clientY };
        }

        ccContainer.addEventListener('mousedown', onPointerDownCc);
        window.addEventListener('mouseup', onPointerUpCc);
        window.addEventListener('mousemove', onPointerMoveCc);
        ccContainer.addEventListener('touchstart', onPointerDownCc, { passive: true });
        window.addEventListener('touchend', onPointerUpCc);
        window.addEventListener('touchmove', onPointerMoveCc, { passive: true });

        function animateCc() {
          requestAnimationFrame(animateCc);
          ccTime += 0.02;
          let idleOffsetX = 0;
          let idleOffsetY = 0;
          if (!ccIsDragging) {
            idleOffsetY = Math.sin(ccTime * 1.1) * 0.15;
            idleOffsetX = Math.cos(ccTime * 0.9) * 0.1;
          }
          ccCube.rotation.x += ((ccTargetRotationX + idleOffsetX) - ccCube.rotation.x) * 0.12;
          ccCube.rotation.y += ((ccTargetRotationY + idleOffsetY) - ccCube.rotation.y) * 0.12;

          ccRenderer.render(ccScene, ccCamera);
        }
        animateCc();

        function resizeCc() {
          const isMobile = window.innerWidth <= 600;
          const w = isMobile ? 120 : 160;
          ccContainer.style.width = w + 'px';
          ccContainer.style.height = w + 'px';
          ccRenderer.setSize(w, w);
        }
        window.addEventListener('resize', resizeCc);
        resizeCc();
      }



}
