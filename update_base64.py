import re, base64

def get_b64(fname):
    with open(fname, 'rb') as f:
        return 'data:image/png;base64,' + base64.b64encode(f.read()).decode('utf-8')

with open('index.html', 'r') as f:
    html = f.read()

html = re.sub(r"const prTexture = new THREE\.TextureLoader\(\)\.load\('[^']+'\);",
              f"const prTexture = new THREE.TextureLoader().load('{get_b64('premiere.png')}');", html)

html = re.sub(r"const lrTexture = new THREE\.TextureLoader\(\)\.load\('[^']+'\);",
              f"const lrTexture = new THREE.TextureLoader().load('{get_b64('lightroom.png')}');", html)

html = re.sub(r"const psTexture = new THREE\.TextureLoader\(\)\.load\('[^']+'\);",
              f"const psTexture = new THREE.TextureLoader().load('{get_b64('photoshop.png')}');", html)

html = re.sub(r"const ccTexture = new THREE\.TextureLoader\(\)\.load\('[^']+'\);",
              f"const ccTexture = new THREE.TextureLoader().load('{get_b64('capcut.png')}');", html)

with open('index.html', 'w') as f:
    f.write(html)
