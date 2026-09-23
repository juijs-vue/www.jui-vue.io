import { createRouter, createWebHistory } from "vue-router"
import Shell from "./pages/Shell.vue"
import PlayUi from "./pages/PlayUi.vue"

// The shell lives on a single path and branches on the `p`/`lang` query
// params (matching the original's `/?p=<page>&lang=<lang>` scheme exactly, so
// external links/bookmarks keep working) - see Shell.vue for the branching.
// play/ui keeps its own separate `/play/ui/?p=<code>` prefix the same way.
export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: "/", name: "shell", component: Shell },
        { path: "/play/ui/", name: "play-ui", component: PlayUi }
    ]
})
