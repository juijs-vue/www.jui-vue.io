<script setup lang="ts">
// Minimal render-only host for now (Phase 2a: validate that converted .vue
// demos render correctly) - the full toolbar/code-editor/live-preview chrome
// (replacing templates/play/ui/index.html's CodeMirror + loader.php iframe)
// is a separate follow-up once @vue/repl is wired in.
import { computed, defineAsyncComponent, type Component } from "vue"
import { useRoute } from "vue-router"
import menu from "../../../play/ui/menu.json"
import { useBodyClass } from "../composables/useBodyClass"
import { useStylesheet } from "../composables/useStylesheet"
import playUiStyleHref from "../styles/play-ui.css?url"

// loader.html's editor defaults to the "jennifer" theme (changeTheme("jennifer")
// on load) - jui-ui-vue's .jui.jennifer-scoped rules (heading colors, the boxed
// table "well" background these demos rely on, etc.) don't apply without it.
useBodyClass("jui jennifer")
// play/ui/style.css (demo-content presentation: h2 headings, the boxed
// "well" table, etc.) - has bare-tag selectors, so it's loaded/unloaded with
// this page rather than bundled globally (would otherwise bleed into the
// shell's own pages).
useStylesheet(playUiStyleHref)

const demos = import.meta.glob<{ default: Component }>("../demos/ui/*.vue")

// The nav's "Components" link (and production's own /play/ui/) has no ?p= at
// all - defaults to the menu's first entry, matching app.py's
// play_ui_index(): `data = flat_list[0] if flat_list else None`.
const defaultCode = menu.list[0]?.code ?? ""

const route = useRoute()
const code = computed(() => (typeof route.query.p === "string" ? route.query.p : defaultCode))
const loader = computed(() => demos[`../demos/ui/${code.value}.vue`])
const component = computed(() => (loader.value ? defineAsyncComponent(loader.value) : null))
</script>

<template>
    <div v-if="!code">Pick a demo via ?p=&lt;code&gt;</div>
    <div v-else-if="!component">Unknown demo: {{ code }}</div>
    <component v-else :is="component" />
</template>
