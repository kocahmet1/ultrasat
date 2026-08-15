"""
Figure generator for ULTRASAT Practice Test 3 Math (modules 3 & 4).

House style is copied exactly from the shipped PT5 assets:
  ~380px wide, Georgia serif, italic variables, axes arrowed at both ends with
  italic x/y at the tips, origin O, fine #cccccc gridlines, black curves/dots,
  roman axis titles with units in parentheses, and a centered 12px
  "Note: Figure not drawn to scale." caption inside geometry figures only
  (coordinate grids never carry the note).

Every builder returns an SVG string. No <script>, no external refs, no raster.
"""

ARROW = ('  <defs>\n'
         '    <marker id="ah{k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" '
         'markerHeight="8" orient="auto-start-reverse">\n'
         '      <path d="M0,0 L10,5 L0,10 z" fill="#000000"/>\n'
         '    </marker>\n'
         '  </defs>\n')

HEAD = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" '
        'height="{h}" font-family="Georgia, serif">\n')

NOTE = '  <text x="{cx}" y="{y}" text-anchor="middle" font-size="12" fill="#000000">Note: Figure not drawn to scale.</text>\n'


def _f(v):
    """Trim floats so the SVG source stays readable."""
    return f'{v:.1f}'.rstrip('0').rstrip('.') if isinstance(v, float) else str(v)


class Plane:
    """A coordinate plane with fine gridlines, arrowed axes, O, and tick labels."""

    def __init__(self, key, xmin, xmax, ymin, ymax, w=380, h=380,
                 pad=40, xstep=1, ystep=1, xlabels=None, ylabels=None,
                 xtitle=None, ytitle=None, grid=True, arrows=True, varlabels=True):
        self.arrows, self.varlabels = arrows, varlabels
        self.key, self.w, self.h = key, w, h
        self.xmin, self.xmax, self.ymin, self.ymax = xmin, xmax, ymin, ymax
        self.xstep, self.ystep = xstep, ystep
        self.xlabels = xlabels if xlabels is not None else None
        self.ylabels = ylabels if ylabels is not None else None
        self.xtitle, self.ytitle, self.grid = xtitle, ytitle, grid
        self.left = pad + (18 if ytitle else 0)
        self.right = w - pad + 10
        self.top = pad - 15
        self.bottom = h - pad - (14 if xtitle else 0)
        self.body = []

    # -- coordinate transforms -------------------------------------------------
    def X(self, x):
        return self.left + (x - self.xmin) / (self.xmax - self.xmin) * (self.right - self.left)

    def Y(self, y):
        return self.bottom - (y - self.ymin) / (self.ymax - self.ymin) * (self.bottom - self.top)

    # -- marks -----------------------------------------------------------------
    def polyline(self, pts, width=2):
        s = ' '.join(f'{self.X(x):.1f},{self.Y(y):.1f}' for x, y in pts)
        self.body.append(f'  <polyline fill="none" stroke="#000000" stroke-width="{width}" points="{s}"/>\n')

    def func(self, f, x0, x1, n=140, width=2):
        self.polyline([(x0 + (x1 - x0) * i / n, f(x0 + (x1 - x0) * i / n)) for i in range(n + 1)], width)

    def segment(self, p, q, width=2, dash=None):
        d = f' stroke-dasharray="{dash}"' if dash else ''
        self.body.append(f'  <line x1="{self.X(p[0]):.1f}" y1="{self.Y(p[1]):.1f}" '
                         f'x2="{self.X(q[0]):.1f}" y2="{self.Y(q[1]):.1f}" stroke="#000000" '
                         f'stroke-width="{width}"{d}/>\n')

    def shade(self, pts, fill='#bbbbbb', opacity=0.35):
        s = ' '.join(f'{self.X(x):.1f},{self.Y(y):.1f}' for x, y in pts)
        self.body.append(f'  <polygon points="{s}" fill="{fill}" fill-opacity="{opacity}" stroke="none"/>\n')

    def dots(self, pts, r=3.5):
        self.body.append('  <g fill="#000000">\n')
        for x, y in pts:
            self.body.append(f'    <circle cx="{self.X(x):.1f}" cy="{self.Y(y):.1f}" r="{r}"/>\n')
        self.body.append('  </g>\n')

    def open_dot(self, x, y, r=4):
        self.body.append(f'  <circle cx="{self.X(x):.1f}" cy="{self.Y(y):.1f}" r="{r}" '
                         f'fill="#ffffff" stroke="#000000" stroke-width="1.6"/>\n')

    def label(self, x, y, text, dx=6, dy=-6, size=12, anchor='start', italic=False):
        st = ' font-style="italic"' if italic else ''
        self.body.append(f'  <text x="{self.X(x) + dx:.1f}" y="{self.Y(y) + dy:.1f}" font-size="{size}" '
                         f'text-anchor="{anchor}"{st} fill="#000000">{text}</text>\n')

    # -- render ----------------------------------------------------------------
    def render(self):
        out = [HEAD.format(w=self.w, h=self.h), ARROW.format(k=self.key)]

        if self.grid:
            out.append('  <g stroke="#cccccc" stroke-width="1">\n')
            x = self.xmin
            while x <= self.xmax + 1e-9:
                out.append(f'    <line x1="{self.X(x):.1f}" y1="{self.top}" x2="{self.X(x):.1f}" y2="{self.bottom}"/>\n')
                x += self.xstep
            y = self.ymin
            while y <= self.ymax + 1e-9:
                out.append(f'    <line x1="{self.left}" y1="{self.Y(y):.1f}" x2="{self.right}" y2="{self.Y(y):.1f}"/>\n')
                y += self.ystep
            out.append('  </g>\n')

        ax_y = self.Y(0) if self.ymin <= 0 <= self.ymax else self.bottom
        ax_x = self.X(0) if self.xmin <= 0 <= self.xmax else self.left
        mk = (f' marker-start="url(#ah{self.key})" marker-end="url(#ah{self.key})"' if self.arrows else '')
        ext = 10 if self.arrows else 0
        out.append('  <g stroke="#000000" stroke-width="1.4">\n')
        out.append(f'    <line x1="{self.left - ext}" y1="{ax_y:.1f}" x2="{self.right + ext}" y2="{ax_y:.1f}"{mk}/>\n')
        out.append(f'    <line x1="{ax_x:.1f}" y1="{self.bottom + ext}" x2="{ax_x:.1f}" y2="{self.top - ext}"{mk}/>\n')
        out.append('  </g>\n')

        out.extend(self.body)

        out.append('  <g font-size="10" fill="#000000">\n')
        xs = self.xlabels if self.xlabels is not None else [
            v for v in _srange(self.xmin, self.xmax, self.xstep) if abs(v) > 1e-9]
        for v in xs:
            out.append(f'    <text x="{self.X(v):.1f}" y="{ax_y + 13:.1f}" text-anchor="middle">{_num(v)}</text>\n')
        ys = self.ylabels if self.ylabels is not None else [
            v for v in _srange(self.ymin, self.ymax, self.ystep) if abs(v) > 1e-9]
        for v in ys:
            out.append(f'    <text x="{ax_x - 7:.1f}" y="{self.Y(v) + 4:.1f}" text-anchor="end">{_num(v)}</text>\n')
        out.append('  </g>\n')

        out.append('  <g font-size="13" font-style="italic" fill="#000000">\n')
        if self.varlabels:
            out.append(f'    <text x="{self.right + 16:.1f}" y="{ax_y + 4:.1f}">x</text>\n')
            out.append(f'    <text x="{ax_x + 6:.1f}" y="{self.top - 14:.1f}">y</text>\n')
        if self.xmin <= 0 <= self.xmax and self.ymin <= 0 <= self.ymax:
            out.append(f'    <text x="{ax_x - 5:.1f}" y="{ax_y + 14:.1f}" text-anchor="end">O</text>\n')
        out.append('  </g>\n')

        if self.xtitle:
            out.append(f'  <text x="{(self.left + self.right) / 2:.1f}" y="{self.h - 6}" text-anchor="middle" '
                       f'font-size="12" fill="#000000">{self.xtitle}</text>\n')
        if self.ytitle:
            cy = (self.top + self.bottom) / 2
            out.append(f'  <text x="14" y="{cy:.1f}" text-anchor="middle" font-size="12" fill="#000000" '
                       f'transform="rotate(-90 14 {cy:.1f})">{self.ytitle}</text>\n')
        out.append('</svg>\n')
        return ''.join(out)


def _srange(a, b, s):
    out, v = [], a
    while v <= b + 1e-9:
        out.append(round(v, 6))
        v += s
    return out


def _num(v):
    return str(int(v)) if abs(v - round(v)) < 1e-9 else _f(v)


# ---------------------------------------------------------------------------
def dot_plot(key, title, low, high, counts, axis_title, w=380):
    """counts: {value: n}. Mirrors PT5-M3-Q07 exactly."""
    n = high - low + 1
    x0, x1, base = 60, 60 + 36 * (n - 1), 170
    hmax = max(counts.values())
    h = max(220, 60 + 15 * hmax + 70)
    base = h - 50
    out = [HEAD.format(w=w, h=h), ARROW.format(k=key)]
    out.append(f'  <text x="{w / 2:.0f}" y="22" text-anchor="middle" font-size="13" fill="#000000">{title}</text>\n')
    out.append(f'  <line x1="{x0 - 12}" y1="{base}" x2="{x1 + 12}" y2="{base}" stroke="#000000" '
               f'stroke-width="1.4" marker-start="url(#ah{key})" marker-end="url(#ah{key})"/>\n')
    out.append('  <g stroke="#000000" stroke-width="1.2">\n')
    for i in range(n):
        out.append(f'    <line x1="{x0 + 36 * i}" y1="{base}" x2="{x0 + 36 * i}" y2="{base + 6}"/>\n')
    out.append('  </g>\n  <g fill="#000000">\n')
    for i in range(n):
        v = low + i
        for j in range(counts.get(v, 0)):
            out.append(f'    <circle cx="{x0 + 36 * i}" cy="{base - 14 - 15 * j}" r="4.5"/>\n')
    out.append('  </g>\n  <g font-size="11" fill="#000000">\n')
    for i in range(n):
        out.append(f'    <text x="{x0 + 36 * i}" y="{base + 20}" text-anchor="middle">{low + i}</text>\n')
    out.append('  </g>\n')
    out.append(f'  <text x="{(x0 + x1) / 2:.0f}" y="{base + 40}" text-anchor="middle" font-size="12" '
               f'fill="#000000">{axis_title}</text>\n</svg>\n')
    return ''.join(out)


def bar_graph(key, title, labels, values, xtitle, ytitle, ymax, ystep, w=380, h=280):
    """Vertical bars, light gray fill with a black outline — the official look."""
    left, right, top, base = 62, w - 24, 46, h - 56
    n = len(labels)
    slot = (right - left) / n
    bw = slot * 0.58
    out = [HEAD.format(w=w, h=h)]
    if title:
        out.append(f'  <text x="{w / 2:.0f}" y="22" text-anchor="middle" font-size="13" fill="#000000">{title}</text>\n')
    out.append('  <g stroke="#cccccc" stroke-width="1">\n')
    v = 0
    while v <= ymax + 1e-9:
        y = base - (v / ymax) * (base - top)
        out.append(f'    <line x1="{left}" y1="{y:.1f}" x2="{right}" y2="{y:.1f}"/>\n')
        v += ystep
    out.append('  </g>\n')
    out.append(f'  <g stroke="#000000" stroke-width="1.4">\n    <line x1="{left}" y1="{top - 8}" x2="{left}" y2="{base}"/>\n'
               f'    <line x1="{left}" y1="{base}" x2="{right}" y2="{base}"/>\n  </g>\n')
    out.append('  <g fill="#cccccc" stroke="#000000" stroke-width="1.2">\n')
    for i, val in enumerate(values):
        cx = left + slot * (i + 0.5)
        y = base - (val / ymax) * (base - top)
        out.append(f'    <rect x="{cx - bw / 2:.1f}" y="{y:.1f}" width="{bw:.1f}" height="{base - y:.1f}"/>\n')
    out.append('  </g>\n  <g font-size="10" fill="#000000">\n')
    v = 0
    while v <= ymax + 1e-9:
        y = base - (v / ymax) * (base - top)
        out.append(f'    <text x="{left - 7}" y="{y + 4:.1f}" text-anchor="end">{_num(v)}</text>\n')
        v += ystep
    out.append('  </g>\n  <g font-size="11" fill="#000000">\n')
    for i, lab in enumerate(labels):
        out.append(f'    <text x="{left + slot * (i + 0.5):.1f}" y="{base + 16}" text-anchor="middle">{lab}</text>\n')
    out.append('  </g>\n')
    out.append(f'  <text x="{(left + right) / 2:.0f}" y="{h - 8}" text-anchor="middle" font-size="12" '
               f'fill="#000000">{xtitle}</text>\n')
    cy = (top + base) / 2
    out.append(f'  <text x="14" y="{cy:.0f}" text-anchor="middle" font-size="12" fill="#000000" '
               f'transform="rotate(-90 14 {cy:.0f})">{ytitle}</text>\n</svg>\n')
    return ''.join(out)


def geom(w, h, body, note=True):
    """Minimal geometry line art + the mandatory scale note."""
    out = [HEAD.format(w=w, h=h), body]
    if note:
        out.append(NOTE.format(cx=w // 2, y=h - 12))
    out.append('</svg>\n')
    return ''.join(out)
