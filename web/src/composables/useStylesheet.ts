import { onMounted, onBeforeUnmount } from "vue"

// Injects a <link rel="stylesheet"> while the calling page is mounted, then
// removes it - for CSS that must NOT apply globally (unlike the plain SFC
// <style> blocks Vite always bundles into the one global stylesheet
// regardless of which component is active). play/ui/style.css has selectors
// like a bare `h2 {...}` that would otherwise bleed into the shell's own
// pages, matching production only ever loading it within play/ui's own
// index.html.
export function useStylesheet(href: string) {
    let el: HTMLLinkElement | null = null
    onMounted(() => {
        el = document.createElement("link")
        el.rel = "stylesheet"
        el.href = href
        document.head.appendChild(el)
    })
    onBeforeUnmount(() => {
        el?.remove()
    })
}
