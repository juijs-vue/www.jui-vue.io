import { createRouter, createWebHistory } from "vue-router"
import Shell from "./pages/Shell.vue"

// The whole shell lives on a single path and branches on the `p`/`lang` query
// params (matching the original's `/?p=<page>&lang=<lang>` scheme exactly, so
// external links/bookmarks keep working) - see Shell.vue for the branching.
// Phase 2 adds `/play/ui` as a sibling route here.
export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [{ path: "/", name: "shell", component: Shell }]
})
