import re, base64

def get_b64(fname):
    with open(fname, 'rb') as f:
        return 'data:image/png;base64,' + base64.b64encode(f.read()).decode('utf-8')

with open('index.html', 'r') as f:
    html = f.read()

html = re.sub(r"const ccTexture = new THREE\.TextureLoader\(\)\.load\('[^']+'\);",
              f"const ccTexture = new THREE.TextureLoader().load('{get_b64('capcut.png')}');", html)

with open('index.html', 'w') as f:
    f.write(html)
