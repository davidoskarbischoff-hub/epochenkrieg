#!/usr/bin/env python3
"""GLB-Textur verkleinern (z. B. das Waffen-Paket: jede Datei trägt dieselbe 1024x1024-Farbtabelle von 550 KB; Stahlhelm 3000x3000).
Aufruf: python3 tools/glbtex.py <Zielordner> <Grösse> datei1.glb [datei2.glb ...]
Schreibt je Datei eine Kopie in den Zielordner; eingebettete Bilder, die länger als <Grösse> Pixel sind, werden auf <Grösse> (längste Seite) verkleinert, kleinere bleiben unverändert.
Bilder mit Transparenz und Normalen-Karten bleiben PNG, alle anderen werden JPEG (Qualität 94 ohne Farbunterabtastung).
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
    """Alle eingebetteten Bilder größer als <size> auf <size> (längste Seite) verkleinern, nie vergrößern.
    Format je Bild: PNG bleibt PNG, wenn es echte Transparenz hat (Blätter) oder eine Normalen-Karte ist, sonst JPEG (Qualität 94, keine Farbunterabtastung)."""
    js, binc = read(src)
    if not js.get('images'):
        return write(dst, js, binc)
    views = js['bufferViews']; keep = []; newbin = b''
    img_views = {im['bufferView']: im for im in js['images'] if 'bufferView' in im}
    names = {}
    for t in js.get('textures', []):
        if 'source' in t: names[t['source']] = t.get('name', '')
    for i, bv in enumerate(views):
        data = binc[bv.get('byteOffset', 0): bv.get('byteOffset', 0) + bv['byteLength']]
        if i in img_views:
            im_js = img_views[i]; idx = js['images'].index(im_js)
            src_im = Image.open(io.BytesIO(data))
            has_alpha = src_im.mode in ('RGBA', 'LA', 'PA') and src_im.convert('RGBA').getchannel('A').getextrema()[0] < 255
            is_normal = 'normal' in (names.get(idx, '') + im_js.get('name', '')).lower()
            if max(src_im.size) > size:
                k = size / max(src_im.size)
                src_im = src_im.resize((max(1, round(src_im.width * k)), max(1, round(src_im.height * k))), Image.LANCZOS)
                buf = io.BytesIO()
                if has_alpha or is_normal:
                    src_im.convert('RGBA' if has_alpha else 'RGB').save(buf, 'PNG', optimize=True); im_js['mimeType'] = 'image/png'
                else:
                    src_im.convert('RGB').save(buf, 'JPEG', quality=94, subsampling=0); im_js['mimeType'] = 'image/jpeg'
                data = buf.getvalue()
        nv = dict(bv); nv['byteOffset'] = len(newbin); nv['byteLength'] = len(data)
        newbin += data + b'\0' * ((4 - len(data) % 4) % 4); keep.append(nv)
    js['bufferViews'] = keep
    js['buffers'] = [{'byteLength': len(newbin)}]
    write(dst, js, newbin)

if __name__ == '__main__':
    if len(sys.argv) < 4: sys.exit(__doc__)
    dest, size = sys.argv[1], int(sys.argv[2]); os.makedirs(dest, exist_ok=True)
    for f in sys.argv[3:]:
        d = os.path.join(dest, os.path.basename(f)); shrink(f, d, size)
        print(os.path.basename(f), os.path.getsize(f), '->', os.path.getsize(d))
