"""Render the five PT3 SVG figures in the shipped PT4/PT5 house style."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svglib import Plane, geom, HEAD, NOTE  # noqa: E402

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets')
os.makedirs(OUT, exist_ok=True)


def write(name, svg):
    with open(os.path.join(OUT, name), 'w', encoding='utf-8') as fh:
        fh.write(svg)
    print('wrote', name, len(svg), 'bytes')


# --------------------------------------------------------------------------
# M3 Q8 — shaded half-plane, y >= (1/2)x + 2
# --------------------------------------------------------------------------
def m3q08():
    p = Plane('a08', -6, 6, -6, 6, w=380, h=380, pad=42, xstep=1, ystep=1,
              xlabels=[-6, -4, -2, 2, 4, 6], ylabels=[-6, -4, -2, 2, 4, 6])
    p.shade([(-6, -1), (6, 5), (6, 6), (-6, 6)])
    p.segment((-6, -1), (6, 5), width=2)
    return p.render()


# --------------------------------------------------------------------------
# M3 Q11 — scatterplot with a line of best fit (data exhibit: no arrows, no x/y)
# --------------------------------------------------------------------------
def m3q11():
    pts = [(2, 13.4), (4, 12.0), (7, 11.6), (9, 10.0), (12, 9.6), (15, 8.2),
           (18, 6.4), (21, 5.8), (24, 4.2), (27, 3.4), (29, 2.2)]
    p = Plane('a11', 0, 30, 0, 14, w=380, h=330, pad=46, xstep=5, ystep=2,
              xtitle='Water temperature (°C)', ytitle='Dissolved oxygen (mg/L)',
              arrows=False, varlabels=False)
    p.segment((0, 14), (30, 2), width=1.3)
    p.dots(pts, r=3.2)
    return p.render()


# --------------------------------------------------------------------------
# M4 Q4 — parabola y = x^2 - 8x + 12
# --------------------------------------------------------------------------
def m4q04():
    # y = x^2 - 10x + 16: y-intercept (0, 16), x-intercepts (2, 0) and (8, 0), vertex (5, -9)
    p = Plane('b04', -1, 10, -12, 20, w=380, h=380, pad=42, xstep=1, ystep=2,
              xlabels=[-1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
              ylabels=[-12, -10, -8, -6, -4, -2, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20])
    p.func(lambda x: x * x - 10 * x + 16, -0.32, 10.32, n=180)
    return p.render()


# --------------------------------------------------------------------------
# M3 Q16 — triangle RST with UV parallel to ST (labels per the fix round)
# --------------------------------------------------------------------------
def m3q16(apex='R', left='S', right='T', on_left='U', on_right='V',
          a='6', b='9', base='30'):
    A, B, C = (150.0, 30.0), (32.0, 216.0), (352.0, 216.0)
    t = 0.4
    D = (A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1]))
    E = (A[0] + t * (C[0] - A[0]), A[1] + t * (C[1] - A[1]))
    body = [
        '  <g stroke="#000000" stroke-width="1.5" fill="none">\n',
        f'    <path d="M {A[0]} {A[1]} L {B[0]} {B[1]} L {C[0]} {C[1]} Z"/>\n',
        f'    <line x1="{D[0]:.1f}" y1="{D[1]:.1f}" x2="{E[0]:.1f}" y2="{E[1]:.1f}"/>\n',
        '  </g>\n',
        '  <g fill="#000000">\n',
        f'    <circle cx="{D[0]:.1f}" cy="{D[1]:.1f}" r="3"/>\n',
        f'    <circle cx="{E[0]:.1f}" cy="{E[1]:.1f}" r="3"/>\n',
        '  </g>\n',
        '  <g font-size="14" font-style="italic" fill="#000000">\n',
        f'    <text x="{A[0]}" y="{A[1] - 10}" text-anchor="middle">{apex}</text>\n',
        f'    <text x="{B[0] - 14}" y="{B[1] + 12}" text-anchor="middle">{left}</text>\n',
        f'    <text x="{C[0] + 14}" y="{C[1] + 12}" text-anchor="middle">{right}</text>\n',
        f'    <text x="{D[0] - 16}" y="{D[1] + 5}" text-anchor="middle">{on_left}</text>\n',
        f'    <text x="{E[0] + 16}" y="{E[1] + 5}" text-anchor="middle">{on_right}</text>\n',
        '  </g>\n',
        '  <g font-size="13" fill="#000000">\n',
        f'    <text x="{(A[0] + D[0]) / 2 - 14:.1f}" y="{(A[1] + D[1]) / 2 + 4:.1f}" text-anchor="middle">{a}</text>\n',
        f'    <text x="{(D[0] + B[0]) / 2 - 14:.1f}" y="{(D[1] + B[1]) / 2 + 4:.1f}" text-anchor="middle">{b}</text>\n',
        f'    <text x="{(B[0] + C[0]) / 2:.1f}" y="{B[1] + 20}" text-anchor="middle">{base}</text>\n',
        '  </g>\n',
    ]
    return geom(380, 278, ''.join(body))


# --------------------------------------------------------------------------
# M4 Q11 — right triangle LMN, legs 9 and 40, right angle at M
# --------------------------------------------------------------------------
def m4q11(top='L', corner='M', far='N', vleg='9', hyp='41'):
    M = (52.0, 130.0)
    N = (340.0, 130.0)
    L = (52.0, 62.0)
    body = [
        '  <g stroke="#000000" stroke-width="1.5" fill="none">\n',
        f'    <path d="M {L[0]} {L[1]} L {M[0]} {M[1]} L {N[0]} {N[1]} Z"/>\n',
        f'    <path d="M {M[0]} {M[1] - 11} L {M[0] + 11} {M[1] - 11} L {M[0] + 11} {M[1]}"/>\n',
        '  </g>\n',
        '  <g font-size="14" font-style="italic" fill="#000000">\n',
        f'    <text x="{L[0]}" y="{L[1] - 10}" text-anchor="middle">{top}</text>\n',
        f'    <text x="{M[0] - 14}" y="{M[1] + 16}" text-anchor="middle">{corner}</text>\n',
        f'    <text x="{N[0] + 12}" y="{N[1] + 16}" text-anchor="middle">{far}</text>\n',
        '  </g>\n',
        '  <g font-size="13" fill="#000000">\n',
        f'    <text x="{M[0] - 13}" y="{(L[1] + M[1]) / 2 + 4:.1f}" text-anchor="middle">{vleg}</text>\n',
        f'    <text x="{(L[0] + N[0]) / 2 + 6:.1f}" y="{(L[1] + N[1]) / 2 - 8:.1f}" text-anchor="middle">{hyp}</text>\n',
        '  </g>\n',
    ]
    return geom(380, 190, ''.join(body))


if __name__ == '__main__':
    write('PT3-M3-Q08.svg', m3q08())
    write('PT3-M3-Q11.svg', m3q11())
    write('PT3-M3-Q16.svg', m3q16())
    write('PT3-M4-Q04.svg', m4q04())
    write('PT3-M4-Q11.svg', m4q11())
