<script setup lang="ts">
// Full page chrome (header/sidebar/live editor), matching
// templates/play/ui/index.html's layout - the code+result panes are now a
// real @vue/repl-based live editor (replaces the old read-only
// Prism-highlighted source view): edits recompile and re-render immediately
// in a sandboxed iframe, same live-preview experience the legacy
// loader.php + CodeMirror setup gave, just via an in-browser SFC compiler
// instead of a server round-trip.
import { computed, onMounted, ref, watch } from "vue"
import { useRoute } from "vue-router"
import { mergeImportMap, Repl, useStore, useVueImportMap } from "@vue/repl"
import CodeMirror from "@vue/repl/codemirror-editor"
import "@vue/repl/style.css"
import menu from "../../../play/ui/menu.json"
import { useBodyClass } from "../composables/useBodyClass"
import { useStylesheet } from "../composables/useStylesheet"
import PlayUiMenu from "../components/PlayUiMenu.vue"
import playUiStyleHref from "../styles/play-ui.css?url"
import playShellStyleHref from "../styles/play-shell.css?url"
import playUiComponentStyleHref from "../styles/play-ui-component.css?url"
// jui-ui-vue/jui-grid-vue aren't on any CDN (unlike Vue itself, which
// useVueImportMap() below resolves from jsdelivr) - self-host their already-
// built ES module + CSS output as ordinary Vite assets and point the
// sandbox's import map at the resulting URLs.
import juiUiVueEsUrl from "jui-ui-vue?url"
import juiUiVueCssUrl from "jui-ui-vue/style.css?url"
import juiGridVueEsUrl from "jui-grid-vue?url"
import juiGridVueCssUrl from "jui-grid-vue/style.css?url"

// loader.html's editor defaults to the "jennifer" theme (changeTheme("jennifer")
// on load) - jui-ui-vue's .jui.jennifer-scoped rules (heading colors, the boxed
// table "well" background these demos rely on, etc.) don't apply without it.
useBodyClass("jui jennifer")
// Bare-tag selectors (h2, table, body>.header, ...) - loaded/unloaded with
// this page rather than bundled globally (would otherwise bleed into the
// shell's own pages). Order matters: play-ui-component.css's 50/50 split
// overrides play-shell.css's 45/55 one, same cascade order as the original
// <link>s in templates/play/ui/index.html.
const shellCss = useStylesheet(playShellStyleHref)
useStylesheet(playUiComponentStyleHref)
useStylesheet(playUiStyleHref)

const base = import.meta.env.BASE_URL

const demoSources = import.meta.glob<string>("../demos/ui/*.vue", { query: "?raw", import: "default" })

// The nav's "Components" link (and production's own /play/ui/) has no ?p= at
// all - defaults to the menu's first entry, matching app.py's
// play_ui_index(): `data = flat_list[0] if flat_list else None`.
const defaultCode = menu.list[0]?.code ?? ""

const route = useRoute()
const code = computed(() => (typeof route.query.p === "string" ? route.query.p : defaultCode))
const demoPath = computed(() => `../demos/ui/${code.value}.vue`)
const sourceLoader = computed(() => demoSources[demoPath.value])

// The sandbox preview is a fully separate iframe document - none of our
// page's globally-loaded stylesheets reach it, so every stylesheet a demo
// might need is injected here instead. The mount point (`<div id="app">`) is
// a hardcoded string baked into @vue/repl's own template, so its class can't
// be set directly - a MutationObserver re-applies the "jui jennifer" class
// onto <body> instead, since @vue/repl replaces body's entire innerHTML (and
// so the class) on every single recompile, not just the first one (a plain
// DOMContentLoaded listener would only catch that first render).
const previewHeadHtml = `
<link rel="stylesheet" href="${base}lib/jui/css/ui.min.css">
<link rel="stylesheet" href="${base}lib/jui/css/ui-jennifer.min.css">
<link rel="stylesheet" href="${base}lib/jui/css/grid.min.css">
<link rel="stylesheet" href="${base}lib/jui/css/grid-jennifer.min.css">
<link rel="stylesheet" href="${juiUiVueCssUrl}">
<link rel="stylesheet" href="${juiGridVueCssUrl}">
<link rel="stylesheet" href="${playUiStyleHref}">
<script>
  new MutationObserver(() => document.body && document.body.classList.add("jui", "jennifer"))
    .observe(document.documentElement, { childList: true, subtree: true })
<\/script>
`

// Demos use <DataGrid>/<Tooltip>/etc without importing them, relying on
// global registration - same as production's loader.html and our own
// main.ts (`app.use(JuiUiVue); app.use(JuiGridVue)`). @vue/repl's generated
// preview entry creates its own separate `app` with neither plugin
// installed by default; customCode splices this in at the exact same two
// points main.ts does it (see @vue/repl's compileModulesForPreview).
const previewCustomCode = {
    importCode: `import JuiUiVue from "jui-ui-vue"\nimport JuiGridVue from "jui-grid-vue"`,
    useCode: `app.use(JuiUiVue)\napp.use(JuiGridVue)`
}

const { importMap: vueImportMap } = useVueImportMap()
const store = useStore({
    builtinImportMap: ref(
        mergeImportMap(vueImportMap.value, {
            imports: {
                "jui-ui-vue": juiUiVueEsUrl,
                "jui-grid-vue": juiGridVueEsUrl
            }
        })
    )
})

watch(
    sourceLoader,
    async (load) => {
        const src = load ? await load() : `<template>\n  <div>Unknown demo: ${code.value}</div>\n</template>\n`
        await store.setFiles({ "App.vue": src }, "App.vue")
    },
    { immediate: true }
)

// 원본의 $(".menu").scrollTop($target.offset().top - 100) 포팅 - 현재 데모로 스크롤.
// 사이드바 링크는(PlayUiMenu.vue) 일반 <a href> 풀 리로드라 code가 마운트 이후 바뀔 일이
// 없다 - onMounted 한 번이면 충분.
// play-shell.css (loaded via useStylesheet, above) is what gives .menu its
// scrollable height in the first place - until its link's "load" event
// fires, .menu isn't overflowing yet and scrollTop assignment is a no-op.
const menuEl = ref<HTMLElement | null>(null)
onMounted(async () => {
    await shellCss.loaded
    const menu = menuEl.value
    const active = menu?.querySelector("li.active") as HTMLElement | null
    if (active && menu) {
        // active.offsetTop is relative to its nearest positioned ancestor,
        // which isn't necessarily .menu itself (jui-ui-vue's own .vmenu/a
        // rules position some intermediate element) - measure via
        // getBoundingClientRect instead, matching jQuery's document-based
        // $target.offset().top the original used.
        const contentTop = active.getBoundingClientRect().top - menu.getBoundingClientRect().top + menu.scrollTop
        menu.scrollTop = contentTop - 100
    }
})

// 원본 component.js의 setFunctions()의 .btn-fullscreen 포팅 - 원본은 결과창(iframe)만
// 넓혔지만, 여기서는 Repl이 코드+결과를 한 위젯으로 합쳐 렌더링하므로 그 위젯 전체가
// 사이드바를 덮으며 넓어지는 형태로 재해석했다.
const fullscreen = ref(false)

function goHome() {
    location.href = base
}
</script>

<template>
    <div class="play-ui-page">
        <div class="header">
            <div class="logo">
                <img :src="`${base}res/img/play_logo.png`" align="absmiddle" @click="goHome" />
            </div>
            <div class="toolbar">
                <span>
                    Themes
                    <!-- 원본(uiplay.jui.io)엔 Jennifer/Dark 두 옵션이 있지만, 이 포팅은
                         Jennifer만 실제로 지원한다(다른 데모들도 전부 .jui.jennifer 기준으로
                         맞춰져 있음) - Dark 옵션까지 마크업만 흉내 내면 눌러도 아무 일도 안
                         일어나는 죽은 컨트롤이 되므로, 실제로 되는 것만 제공. -->
                    <select disabled title="This port only ships the Jennifer theme">
                        <option value="jennifer">Jennifer</option>
                    </select>
                </span>
                <a class="chart_comments" href="#" title="Comments aren't available in this port yet" @click.prevent>Leave a comment</a>
                <i id="sidemenu" class="icon-menu"></i>
            </div>
        </div>
        <div class="container">
            <div class="menu" ref="menuEl" :class="{ hidden: fullscreen }">
                <PlayUiMenu :code="code" />
            </div>
            <div class="content" :class="{ fullscreen }">
                <div class="repl-toolbar">
                    <a class="btn btn-api" title="Chart API" href="http://api.jui.io/" target="_blank">API</a>
                    <a class="btn btn-fullscreen" title="Full Screen" @click="fullscreen = !fullscreen"><i class="icon-new-window"></i></a>
                </div>
                <div class="repl-wrap">
                    <Repl
                        :store="store"
                        :editor="CodeMirror"
                        :show-compile-output="false"
                        :show-open-source-map="false"
                        :show-import-map="false"
                        :show-ts-config="false"
                        :preview-options="{ headHTML: previewHeadHtml, customCode: previewCustomCode }"
                        layout="horizontal"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.toolbar span {
    margin-right: 20px;
}

.menu.hidden {
    display: none;
}

.content.fullscreen {
    left: 0;
}

.repl-toolbar {
    position: absolute;
    z-index: 4;
    top: 8px;
    right: 8px;
}

.repl-wrap {
    position: absolute;
    inset: 0;
}

.repl-wrap :deep(.vue-repl) {
    height: 100%;
}
</style>
