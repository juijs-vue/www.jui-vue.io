// Copies the legacy static directories `vite build` doesn't know about into
// dist/, so the published site is a single self-contained static tree -
// index.html and its bundled assets reference these at runtime (lib/ for
// jui-ui-vue/jui-grid-vue UMD + legacy jquery/jui, res/img + res/chart.js for
// the untouched-by-design home banner charts, gallery/ and play/chart/ for
// the not-yet-ported legacy demos this phase doesn't touch).
import fs from "node:fs"
import path from "node:path"

const ROOT = path.resolve(import.meta.dirname, "../..")
const DIST = path.resolve(import.meta.dirname, "../dist")

const ENTRIES = [
    { from: "lib", to: "lib" },
    { from: "gallery", to: "gallery" },
    { from: "play/chart", to: "play/chart" },
    { from: "res/chart.js", to: "res/chart.js" },
    { from: "res/img", to: "res/img" }
]

for (const { from, to } of ENTRIES) {
    const src = path.join(ROOT, from)
    const dest = path.join(DIST, to)
    fs.cpSync(src, dest, { recursive: true })
    console.log(`copied ${from} -> dist/${to}`)
}
