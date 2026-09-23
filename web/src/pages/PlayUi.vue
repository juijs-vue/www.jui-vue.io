<script setup lang="ts">
// Minimal render-only host for now (Phase 2a: validate that converted .vue
// demos render correctly) - the full toolbar/code-editor/live-preview chrome
// (replacing templates/play/ui/index.html's CodeMirror + loader.php iframe)
// is a separate follow-up once @vue/repl is wired in.
import { computed, defineAsyncComponent, type Component } from "vue"
import { useRoute } from "vue-router"

const demos = import.meta.glob<{ default: Component }>("../demos/ui/*.vue")

const route = useRoute()
const code = computed(() => (typeof route.query.p === "string" ? route.query.p : ""))
const loader = computed(() => demos[`../demos/ui/${code.value}.vue`])
const component = computed(() => (loader.value ? defineAsyncComponent(loader.value) : null))
</script>

<template>
    <div v-if="!code">Pick a demo via ?p=&lt;code&gt;</div>
    <div v-else-if="!component">Unknown demo: {{ code }}</div>
    <component v-else :is="component" />
</template>
