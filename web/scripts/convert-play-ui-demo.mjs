// Converts one play/ui/html/<code>.html + play/ui/json/<code>.js pair (the
// current runtime-compiled Vue.createApp({template, setup(){...}}) demo
// format) into a single .vue SFC with <script setup lang="ts">.
//
// The json file is a plain object-expression `{ setup() { ...; return {...} } }`
// meant to be eval()'d, not a module - this parses just enough of it (via
// acorn, as an expression) to find setup()'s body and its final `return {...}`,
// then keeps everything else as a verbatim source slice (preserving comments/
// formatting exactly) rather than reconstructing from the AST, since that's
// both simpler and lower-risk than re-printing.
import fs from "node:fs"
import path from "node:path"
import * as acorn from "acorn"
import * as walk from "acorn-walk"

// setup()'s body statements sit 8 spaces deep in the original (nested inside
// `{ setup() { ... } }`) - strip the common leading indent from every
// non-blank line after the first (whose own indent was already eaten by
// acorn's node.start) so the extracted script isn't visibly mis-indented.
function dedent(text) {
    const lines = text.split("\n")
    const indents = lines.slice(1).filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length)
    const common = indents.length ? Math.min(...indents) : 0
    return lines.map((l, i) => (i === 0 || !l.trim() ? l : l.slice(common))).join("\n")
}

// Collects every real variable-reference position (not object-literal keys,
// not non-computed member-expression properties) for `name` within `node`.
// NOT scope-aware: a nested function whose OWN parameter happens to share
// `name` (shadowing it) still has its internal references renamed here, same
// as the outer binding, since acorn-walk's base visitor dispatches params as
// "Pattern" (so a plain `Identifier` visitor never sees the parameter
// declaration itself, only leaves the body's now-dangling references to it
// looking like they refer to the *outer*, renamed variable). Callers should
// use `hasShadowingParam` to detect this and review the result by hand.
function findIdentifierRefs(node, name) {
    const refs = []
    walk.ancestor(node, {
        Identifier(n, _state, ancestors) {
            if (n.name !== name) return
            const parent = ancestors[ancestors.length - 2]
            if (parent) {
                if (parent.type === "Property" && parent.key === n && !parent.computed) return
                if (parent.type === "MemberExpression" && parent.property === n && !parent.computed) return
            }
            refs.push(n)
        }
    })
    return refs
}

function hasShadowingParam(node, name) {
    let found = false
    walk.simple(node, {
        Function(n) {
            if (n.params.some((p) => p.type === "Identifier" && p.name === name)) found = true
        }
    })
    return found
}

// Applies a set of {start,end,text} replacements (absolute offsets into
// `src`) to `slice` (a substring of src starting at `sliceStart`), used to
// rename an identifier throughout a body before it's extracted/dedented.
function applyReplacements(src, replacements) {
    let out = src
    for (const { start, end, text } of [...replacements].sort((a, b) => b.start - a.start)) {
        out = out.slice(0, start) + text + out.slice(end)
    }
    return out
}

const ROOT = path.resolve(import.meta.dirname, "../..")
const HTML_DIR = path.join(ROOT, "play/ui/html")
const JSON_DIR = path.join(ROOT, "play/ui/json")

export function convertOne(code) {
    const htmlPath = path.join(HTML_DIR, `${code}.html`)
    const jsonPath = path.join(JSON_DIR, `${code}.js`)
    const html = fs.readFileSync(htmlPath, "utf-8").replace(/\s+$/, "")
    const js = fs.existsSync(jsonPath) ? fs.readFileSync(jsonPath, "utf-8") : ""

    if (!js.trim()) {
        return `<template>\n${html}\n</template>\n`
    }

    function parseSetup(source) {
        const expr = acorn.parseExpressionAt(source, 0, { ecmaVersion: 2022 })
        if (expr.type !== "ObjectExpression") {
            throw new Error(`${code}: top-level expression is not an object literal`)
        }
        const setupProp = expr.properties.find((p) => p.key?.name === "setup")
        if (!setupProp) {
            throw new Error(`${code}: no setup() method found`)
        }
        const body = setupProp.value.body // BlockStatement
        let returnStmt = null
        const keptStmts = []
        for (const s of body.body) {
            if (s.type === "ReturnStatement") returnStmt = s
            else keptStmts.push(s)
        }
        return { body, keptStmts, returnStmt }
    }

    let src = js.trim()
    let { body, keptStmts, returnStmt } = parseSetup(src)
    if (returnStmt && returnStmt.argument?.type !== "ObjectExpression") {
        throw new Error(`${code}: return value is not an object literal`)
    }

    // `return { rows: flatRows }` exposes a computed under a name that's
    // *also* already used locally for something else (e.g. table_17's raw
    // nested `rows` vs. the flattened `flatRows` it exposes as `rows`) -
    // <script setup>'s top-level bindings ARE the template's bindings, so
    // both can't keep the name `rows`. Rename the conflicting local out of
    // the way and rename the aliased value onto the exposed name instead,
    // eliminating the collision (and the alias line) entirely.
    if (returnStmt) {
        const declaredNames = new Set()
        for (const s of keptStmts) {
            if (s.type === "VariableDeclaration") {
                for (const d of s.declarations) if (d.id.type === "Identifier") declaredNames.add(d.id.name)
            } else if (s.type === "FunctionDeclaration" && s.id) {
                declaredNames.add(s.id.name)
            }
        }
        const renames = [] // [oldName, newName]
        for (const p of returnStmt.argument.properties) {
            const exposedName = p.key.name
            if (p.shorthand || p.value.type !== "Identifier") continue
            const valueName = p.value.name
            if (valueName === exposedName) continue
            if (declaredNames.has(exposedName) && exposedName !== valueName) {
                renames.push([exposedName, `${exposedName}Source`])
                renames.push([valueName, exposedName])
            }
        }
        if (renames.length) {
            for (const [oldName] of renames) {
                if (hasShadowingParam(body, oldName)) {
                    console.warn(
                        `  ⚠ ${code}: a nested function's own parameter also happens to be named "${oldName}" - ` +
                            `renaming isn't scope-aware, review this file by hand.`
                    )
                }
            }
            // acorn-walk's base visitor dispatches every declaration target (a plain
            // `const x = ...`'s id, same as a function param) as type "Pattern", not
            // "Identifier" - a plain `Identifier` walker never sees it, so the
            // top-level declaration site itself has to be renamed separately here.
            function topLevelDeclId(name) {
                for (const s of keptStmts) {
                    if (s.type === "VariableDeclaration") {
                        for (const d of s.declarations) {
                            if (d.id.type === "Identifier" && d.id.name === name) return d.id
                        }
                    } else if (s.type === "FunctionDeclaration" && s.id?.name === name) {
                        return s.id
                    }
                }
                return null
            }
            const replacements = []
            for (const [oldName, newName] of renames) {
                const declId = topLevelDeclId(oldName)
                if (declId) replacements.push({ start: declId.start, end: declId.end, text: newName })
                for (const ref of findIdentifierRefs(body, oldName)) {
                    replacements.push({ start: ref.start, end: ref.end, text: newName })
                }
            }
            src = applyReplacements(src, replacements)
            ;({ body, keptStmts, returnStmt } = parseSetup(src))
            console.log(`  (renamed in ${code}: ${renames.map(([a, b]) => `${a}->${b}`).join(", ")})`)
        }
    }

    const bodyStart = keptStmts.length ? keptStmts[0].start : body.start + 1
    const bodyEnd = keptStmts.length ? keptStmts[keptStmts.length - 1].end : bodyStart
    let bodyText = keptStmts.length ? dedent(src.slice(bodyStart, bodyEnd)) : ""

    // Vue.x(...) / JuiGridVue.x(...) -> bare x(...), collecting names for imports.
    const vueNames = new Set()
    const gridNames = new Set()
    function stripNamespaces(text) {
        return text
            .replace(/\bVue\.([a-zA-Z_$][\w$]*)/g, (_, name) => {
                vueNames.add(name)
                return name
            })
            .replace(/\bJuiGridVue\.([a-zA-Z_$][\w$]*)/g, (_, name) => {
                gridNames.add(name)
                return name
            })
    }
    // Some demos destructure the whole namespace instead of calling through it
    // (`const { ref, onMounted } = Vue`) rather than `Vue.ref(...)` - the names
    // are already bare identifiers afterward, so there's nothing to rewrite in
    // the body, just the declaration line itself to drop (its names still need
    // to end up imported).
    function stripDestructuring(text, ns, namesSet) {
        return text.replace(
            new RegExp(`^[ \\t]*(?:const|let|var)\\s*\\{\\s*([^}]+)\\}\\s*=\\s*${ns}\\s*\\n?`, "gm"),
            (_, names) => {
                for (const n of names.split(",").map((s) => s.trim()).filter(Boolean)) namesSet.add(n)
                return ""
            }
        )
    }
    bodyText = stripDestructuring(bodyText, "Vue", vueNames)
    bodyText = stripDestructuring(bodyText, "JuiGridVue", gridNames)
    bodyText = stripNamespaces(bodyText)

    // Alias lines for returned names that don't match their local binding
    // (e.g. `return { rows: flatRows }` - the template uses `rows`).
    const aliasLines = []
    if (returnStmt) {
        for (const p of returnStmt.argument.properties) {
            const exposedName = p.key.name
            const valueSrc = stripNamespaces(src.slice(p.value.start, p.value.end))
            if (p.shorthand || valueSrc === exposedName) continue
            aliasLines.push(`const ${exposedName} = ${valueSrc}`)
        }
    }

    const importLines = []
    if (vueNames.size) importLines.push(`import { ${[...vueNames].sort().join(", ")} } from "vue"`)
    if (gridNames.size) importLines.push(`import { ${[...gridNames].sort().join(", ")} } from "jui-grid-vue"`)

    const scriptParts = [...importLines]
    if (importLines.length) scriptParts.push("")
    if (bodyText.trim()) scriptParts.push(bodyText.trimEnd())
    if (aliasLines.length) {
        if (bodyText.trim()) scriptParts.push("")
        scriptParts.push(...aliasLines)
    }

    const script = scriptParts.join("\n")
    if (!script.trim()) {
        return `<template>\n${html}\n</template>\n`
    }
    // Mechanically converted from plain (untyped) JS - runtime-correctness was
    // already established for the original play/ui/json/*.js this came from;
    // full type-safety here (annotating every parameter, disambiguating
    // `reactive([])`'s inferred `never[]`, etc. across 100+ files) isn't worth
    // the effort for demo scripts nobody imports as a library.
    const tsNocheck = "// @ts-nocheck"
    return `<script setup lang="ts">\n${tsNocheck}\n${script}\n</script>\n\n<template>\n${html}\n</template>\n`
}

// CLI: node convert-play-ui-demo.mjs <code> [<code> ...]
if (import.meta.url === `file://${process.argv[1]}`) {
    const codes = process.argv.slice(2)
    const outDir = path.join(import.meta.dirname, "../src/demos/ui")
    fs.mkdirSync(outDir, { recursive: true })
    for (const code of codes) {
        try {
            const out = convertOne(code)
            fs.writeFileSync(path.join(outDir, `${code}.vue`), out)
            console.log("ok:", code)
        } catch (e) {
            console.error("FAIL:", code, e.message)
        }
    }
}
