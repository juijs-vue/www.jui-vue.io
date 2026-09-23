<script setup lang="ts">
// Full page chrome (header/sidebar/result panel), matching
// templates/play/ui/index.html's layout - the code panel is still
// read-only (shows the converted .vue SFC's own source) rather than a live
// editor; @vue/repl-based live editing is the next increment.
import { computed, defineAsyncComponent, ref, watch, type Component } from "vue"
import { useRoute } from "vue-router"
import menu from "../../../play/ui/menu.json"
import { useBodyClass } from "../composables/useBodyClass"
import { useStylesheet } from "../composables/useStylesheet"
import PlayUiMenu from "../components/PlayUiMenu.vue"
import playUiStyleHref from "../styles/play-ui.css?url"
import playShellStyleHref from "../styles/play-shell.css?url"
import playUiComponentStyleHref from "../styles/play-ui-component.css?url"

// loader.html's editor defaults to the "jennifer" theme (changeTheme("jennifer")
// on load) - jui-ui-vue's .jui.jennifer-scoped rules (heading colors, the boxed
// table "well" background these demos rely on, etc.) don't apply without it.
useBodyClass("jui jennifer")
// Bare-tag selectors (h2, table, body>.header, ...) - loaded/unloaded with
// this page rather than bundled globally (would otherwise bleed into the
// shell's own pages). Order matters: play-ui-component.css's 50/50 split
// overrides play-shell.css's 45/55 one, same cascade order as the original
// <link>s in templates/play/ui/index.html.
useStylesheet(playShellStyleHref)
useStylesheet(playUiComponentStyleHref)
useStylesheet(playUiStyleHref)

const demos = import.meta.glob<{ default: Component }>("../demos/ui/*.vue")
const demoSources = import.meta.glob<string>("../demos/ui/*.vue", { query: "?raw", import: "default" })

// The nav's "Components" link (and production's own /play/ui/) has no ?p= at
// all - defaults to the menu's first entry, matching app.py's
// play_ui_index(): `data = flat_list[0] if flat_list else None`.
const defaultCode = menu.list[0]?.code ?? ""

const route = useRoute()
const code = computed(() => (typeof route.query.p === "string" ? route.query.p : defaultCode))
const demoPath = computed(() => `../demos/ui/${code.value}.vue`)
const loader = computed(() => demos[demoPath.value])
const component = computed(() => (loader.value ? defineAsyncComponent(loader.value) : null))

const sourceLoader = computed(() => demoSources[demoPath.value])
const source = ref<string>("")
watch(
    sourceLoader,
    async (load) => {
        source.value = load ? await load() : ""
    },
    { immediate: true }
)

const base = import.meta.env.BASE_URL
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
                <span class="jui-ui-vue-badge">jui-ui-vue</span>
                <i class="icon-menu"></i>
            </div>
        </div>
        <div class="container">
            <div class="menu">
                <PlayUiMenu :code="code" />
            </div>
            <div class="content">
                <div class="chart_data">
                    <div class="chart_data_main">
                        <pre class="source-view">{{ source }}</pre>
                    </div>
                </div>
                <div class="splitter splitter-2"></div>
                <div class="chart_view">
                    <div class="chart-main">
                        <div id="chart-content-title">
                            <h2>
                                Result
                                <div class="group">
                                    <a class="btn btn-api" title="Chart API" href="http://api.jui.io/" target="_blank">API</a>
                                </div>
                            </h2>
                        </div>
                        <div id="chart-content">
                            <div v-if="!code">Pick a demo via ?p=&lt;code&gt;</div>
                            <div v-else-if="!component">Unknown demo: {{ code }}</div>
                            <component v-else :is="component" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.source-view {
    margin: 0;
    padding: 12px;
    font-size: 12px;
    white-space: pre-wrap;
    word-break: break-word;
}
</style>
