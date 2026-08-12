# -*- coding: utf-8 -*-
"""Render College Board-style bar/line charts for the CoE quantitative items.

Outputs one PNG per graph item into assets/ and a graph-images.json map of
data URIs (same shape as scripts/output/qc_images.json) for direct import.
"""
import json, glob, os, base64, io, textwrap
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.ticker import MaxNLocator

plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "font.size": 11,
    "axes.edgecolor": "#222222",
    "axes.linewidth": 1.0,
    "figure.facecolor": "white",
    "axes.facecolor": "white",
})

# Grayscale-safe, print-safe palette in CB's register
FILL   = ["#2f4b6e", "#a8c0d8", "#6d8ea8", "#d6e2ec"]
HATCH  = ["", "///", "", "..."]
LINE   = ["#2f4b6e", "#9a3d3d", "#4f7a4f", "#7a5c9a"]
MARKER = ["o", "s", "^", "D"]

def wrap(s, n): return "\n".join(textwrap.wrap(s, n))

def render(fig_spec, out_png):
    kind = fig_spec["kind"]
    cats = fig_spec["categories"]
    series = fig_spec["series"]
    fig, ax = plt.subplots(figsize=(7.2, 4.5), dpi=170)

    if kind in ("bar", "grouped-bar"):
        n = len(series)
        width = 0.8 / n
        for i, s in enumerate(series):
            xs = [j - 0.4 + width * (i + 0.5) for j in range(len(cats))]
            ax.bar(xs, s["values"], width=width * 0.92, label=s["name"],
                   color=FILL[i % len(FILL)], edgecolor="#222222", linewidth=0.8,
                   hatch=HATCH[i % len(HATCH)], zorder=3)
        ax.set_xticks(range(len(cats)))
        ax.set_xticklabels([wrap(str(c), 14) for c in cats])
        ax.set_xlim(-0.6, len(cats) - 0.4)
    elif kind == "line":
        for i, s in enumerate(series):
            ax.plot(range(len(cats)), s["values"], label=s["name"],
                    color=LINE[i % len(LINE)], marker=MARKER[i % len(MARKER)],
                    markersize=5.5, linewidth=1.9, zorder=3,
                    markerfacecolor="white", markeredgewidth=1.6)
        ax.set_xticks(range(len(cats)))
        ax.set_xticklabels([str(c) for c in cats])
        ax.set_xlim(-0.35, len(cats) - 0.65)
    else:
        raise ValueError(kind)

    ax.set_title(wrap(fig_spec["title"], 62), fontsize=12.5, fontweight="bold",
                 pad=14, color="#111111")
    if fig_spec.get("xLabel"):
        ax.set_xlabel(fig_spec["xLabel"], fontsize=11, labelpad=8)
    ax.set_ylabel(wrap(fig_spec["yLabel"], 34), fontsize=11, labelpad=8)

    ax.yaxis.grid(True, color="#cfcfcf", linewidth=0.8, zorder=0)
    ax.set_axisbelow(True)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.yaxis.set_major_locator(MaxNLocator(nbins=7))

    lo = min(v for s in series for v in s["values"])
    hi = max(v for s in series for v in s["values"])
    if lo >= 0:
        ax.set_ylim(0, hi * 1.14)
    else:
        pad = (hi - lo) * 0.16
        ax.set_ylim(lo - pad, hi + pad)

    if len(series) > 1:
        ax.legend(loc="upper center", bbox_to_anchor=(0.5, -0.17),
                  ncol=min(len(series), 3), frameon=False, fontsize=10.5)
    fig.tight_layout()
    fig.savefig(out_png, bbox_inches="tight", facecolor="white")
    plt.close(fig)

os.makedirs("assets", exist_ok=True)
uris, made = {}, []
for f in sorted(glob.glob("src/*.json")):
    d = json.load(open(f)); changed = False
    for it in d:
        fig = it.get("figure")
        if not fig or fig["kind"] == "table":
            continue
        png = "assets/%s.png" % it["id"]
        render(fig, png)
        it["graphUrl"] = png
        it["graphDescription"] = fig["title"]
        uris[it["id"]] = "data:image/png;base64," + base64.b64encode(open(png, "rb").read()).decode()
        made.append(it["id"]); changed = True
    if changed:
        json.dump(d, open(f, "w"), indent=1, ensure_ascii=False)

json.dump(uris, open("graph-images.json", "w"))
print("rendered", len(made), "graphs:", ", ".join(made))
