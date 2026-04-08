import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Increase default `.software-box-three` size just in case padding needs it globally
html = html.replace('width: 140px; height: 140px;', 'width: 160px; height: 160px;')

# For each box, we have specific rotation starts
boxes = [
    ('Pr', 'premiere-box', 'Math.PI / 6', '-Math.PI / 6', '0'),
    ('Lr', 'lr-box', '-Math.PI / 8', 'Math.PI / 5', '100'),
    ('Ps', 'ps-box', 'Math.PI / 8', 'Math.PI / 8', '200'),
    ('Cc', 'cc-box', 'Math.PI / 6', 'Math.PI / 6', '300')
]

for var, dom_id, rotX, rotY, t in boxes:
    # First change camera z to 4.8
    html = re.sub(f"const {var.lower()}Camera = new THREE.PerspectiveCamera\\(45, 1, 0.1, 100\\);\n\\s+{var.lower()}Camera.position.z = 4.2;", f"const {var.lower()}Camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);\n    {var.lower()}Camera.position.z = 4.8;", html)
    
    # Change resize
    html = re.sub(fr"const w = isMobile \? 100 : 140;\s+{var.lower()}Container\.style\.width = w \+ 'px';\s+{var.lower()}Container\.style\.height = w \+ 'px';\s+{var.lower()}Renderer\.setSize\(w, w\);", f"const w = isMobile ? 120 : 160;\n      {var.lower()}Container.style.width = w + 'px';\n      {var.lower()}Container.style.height = w + 'px';\n      {var.lower()}Renderer.setSize(w, w);", html)
    
    # Now replace the hover code block with drag code block
    # We find the block starting with "let {var.lower()}Hovered = false;" down to "function resize{var}()"
    
    old_block_pattern = f"let {var.lower()}Hovered = false;.*?function resize{var}\\(\\)"
    
    new_block = f"""let {var.lower()}IsDragging = false;
    let {var.lower()}TargetRotationX = {rotX};
    let {var.lower()}TargetRotationY = {rotY};
    let {var.lower()}Time = {t};
    let {var.lower()}PrevPosition = {{ x: 0, y: 0 }};

    function onPointerDown{var}(e) {{
      {var.lower()}IsDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      {var.lower()}PrevPosition = {{ x: clientX, y: clientY }};
    }}
    function onPointerUp{var}() {{ {var.lower()}IsDragging = false; }}
    function onPointerMove{var}(e) {{
      if (!{var.lower()}IsDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - {var.lower()}PrevPosition.x;
      const deltaY = clientY - {var.lower()}PrevPosition.y;
      {var.lower()}TargetRotationY += deltaX * 0.02;
      {var.lower()}TargetRotationX += deltaY * 0.02;
      {var.lower()}PrevPosition = {{ x: clientX, y: clientY }};
    }}

    {var.lower()}Container.addEventListener('mousedown', onPointerDown{var});
    window.addEventListener('mouseup', onPointerUp{var});
    window.addEventListener('mousemove', onPointerMove{var});
    {var.lower()}Container.addEventListener('touchstart', onPointerDown{var}, {{passive: true}});
    window.addEventListener('touchend', onPointerUp{var});
    window.addEventListener('touchmove', onPointerMove{var}, {{passive: true}});

    function animate{var}() {{
      requestAnimationFrame(animate{var});
      {var.lower()}Time += 0.02;
      let idleOffsetX = 0;
      let idleOffsetY = 0;
      if (!{var.lower()}IsDragging) {{
        idleOffsetY = Math.sin({var.lower()}Time * 1.1) * 0.15;
        idleOffsetX = Math.cos({var.lower()}Time * 0.9) * 0.1;
      }}
      {var.lower()}Cube.rotation.x += (({var.lower()}TargetRotationX + idleOffsetX) - {var.lower()}Cube.rotation.x) * 0.12;
      {var.lower()}Cube.rotation.y += (({var.lower()}TargetRotationY + idleOffsetY) - {var.lower()}Cube.rotation.y) * 0.12;

      {var.lower()}Renderer.render({var.lower()}Scene, {var.lower()}Camera);
    }}
    animate{var}();

    function resize{var}()"""
    
    html = re.sub(old_block_pattern, new_block, html, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
