<script setup lang="ts">
// Full page chrome (header/sidebar/result panel), matching
// templates/play/ui/index.html's layout - the code panel is still
// read-only (shows the converted .vue SFC's own source) rather than a live
// editor; @vue/repl-based live editing is the next increment.
import { computed, defineAsyncComponent, nextTick, onMounted, ref, watch, type Component } from "vue"
import { useRoute } from "vue-router"
import menu from "../../../play/ui/menu.json"
import { useBodyClass } from "../composables/useBodyClass"
import { useStylesheet } from "../composables/useStylesheet"
import PlayUiMenu from "../components/PlayUiMenu.vue"
import { Tab } from "jui-ui-vue"
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
const shellCss = useStylesheet(playShellStyleHref)
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
const codeEl = ref<HTMLElement | null>(null)
watch(
    sourceLoader,
    async (load) => {
        source.value = load ? await load() : ""
        await nextTick()
        // @ts-expect-error - Prism is a global from lib/prism.js (index.html)
        if (codeEl.value && window.Prism) window.Prism.highlightElement(codeEl.value)
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

// 원본 component.js의 setFunctions() 포팅 - .chart_view를 전체 너비로 넓혔다 되돌렸다.
const fullscreen = ref(false)

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
            <div class="menu" ref="menuEl">
                <PlayUiMenu :code="code" />
            </div>
            <div class="content">
                <div class="chart_data">
                    <div class="chart_data_main">
                        <!-- 원본은 Code/HTML 두 탭(jQuery.table() 등록 코드 vs 대상 마크업)인데,
                             이 포팅의 데모는 둘이 분리된 파일이 아니라 하나의 .vue SFC라 별도
                             HTML 탭을 만들 대상 자체가 없다 - Code 탭 하나만 제공. -->
                        <Tab :items="[{ text: 'Code', value: 'code' }]" content-style="height: calc(100% - 33px); overflow: auto;">
                            <template #panel-code>
                                <pre class="source-view"><code ref="codeEl" class="language-markup">{{ source }}</code></pre>
                            </template>
                        </Tab>
                    </div>
                </div>
                <div class="splitter splitter-2"></div>
                <div class="chart_view" :class="{ fullscreen }" :style="{ left: fullscreen ? '0%' : undefined }">
                    <div class="chart-main">
                        <div id="chart-content-title">
                            <h2>
                                Result
                                <div class="group">
                                    <a class="btn btn-api" title="Chart API" href="http://api.jui.io/" target="_blank">API</a>
                                    <a class="btn btn-fullscreen" title="Full Screen" @click="fullscreen = !fullscreen"
                                        ><i class="icon-new-window"></i
                                    ></a>
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

.toolbar span {
    margin-right: 20px;
}

.chart_view {
    transition: left 0.4s;
}
</style>
