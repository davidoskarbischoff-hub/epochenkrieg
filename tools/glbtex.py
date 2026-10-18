#!/usr/bin/env python3
"""GLB-Textur verkleinern (z. B. das Waffen-Paket: jede Datei trägt dieselbe 1024x1024-Farbtabelle von 550 KB).
Aufruf: python3 tools/glbtex.py <Zielordner> <Grösse> datei1.glb [datei2.glb ...]
Schreibt je Datei eine Kopie in den Zielordner; die eingebettete Textur wird auf <Grösse> x <Grösse> verkleinert (JPEG, Qualität 94 ohne Farbunterabtastung).
Geometrie und Materialien bleiben unverändert. Braucht Python 3 mit Pillow."""
import sys, os, json, struct, io
from PIL import Image

def read(p):
    b = open(p, 'rb').read()
    assert b[:4] == b'glTF'
    off, js, binc = 12, None, b''
    while off < len(b):
        ln, tp = struct.unpack('<II', b[off:off+8]); d = b[off+8:off+8+ln]
        if tp == 0x4E4F534A: js = json.loads(d)
        elif tp == 0x004E4942: binc = d
        off += 8 + ln
    return js, binc

def write(p, js, binc):
    jb = json.dumps(js, separators=(',', ':')).encode()
    jb += b' ' * ((4 - len(jb) % 4) % 4); binc += b'\0' * ((4 - len(binc) % 4) % 4)
    out = b'glTF' + struct.pack('<II', 2, 12 + 8 + len(jb) + 8 + len(binc))
    out += struct.pack('<II', len(jb), 0x4E4F534A) + jb + struct.pack('<II', len(binc), 0x004E4942) + binc
    open(p, 'wb').write(out)

def shrink(src, dst, size):
    js, binc = read(src)
    if not js.get('images'):
        return write(dst, js, binc)
    views = js['bufferViews']; keep = []; newbin = b''; remap = {}
    img_views = {im['bufferView'] for im in js['images'] if 'bufferView' in im}
    for i, bv in enumerate(views):
        data = binc[bv.get('byteOffset', 0): bv.get('byteOffset', 0) + bv['byteLength']]
        if i in img_views:
            im = Image.open(io.BytesIO(data)).convert('RGB').resize((size, size), Image.LANCZOS)
            buf = io.BytesIO(); im.save(buf, 'JPEG', quality=94, subsampling=0); data = buf.getvalue()
        nv = dict(bv); nv['byteOffset'] = len(newbin); nv['byteLength'] = len(data)
        newbin += data + b'\0' * ((4 - len(data) % 4) % 4); keep.append(nv)
    js['bufferViews'] = keep
    for im in js['images']:
        if 'bufferView' in im: im['mimeType'] = 'image/jpeg'
    js['buffers'] = [{'byteLength': len(newbin)}]
    write(dst, js, newbin)

if __name__ == '__main__':
    if len(sys.argv) < 4: sys.exit(__doc__)
    dest, size = sys.argv[1], int(sys.argv[2]); os.makedirs(dest, exist_ok=True)
    for f in sys.argv[3:]:
        d = os.path.join(dest, os.path.basename(f)); shrink(f, d, size)
        print(os.path.basename(f), os.path.getsize(f), '->', os.path.getsize(d))
